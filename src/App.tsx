import React, { useEffect, useRef, useState } from 'react';
import { SimulationScene } from './three/SimulationScene';
import { DEFAULT_LABS } from './data/defaultLabs';
import { GradeLevel, SimulationLab, SimulationComponent, TutorMessage } from './types/simulation';
import { HeaderBar } from './components/HeaderBar';
import { BottomDock } from './components/BottomDock';
import { VRModal } from './components/VRModal';
import {
  generateLabWithGemma,
  askTutorMentor,
  fetchGeminiTTS,
  speakSpeech,
  inspectComponentWithGemma,
} from './services/api';
import { soundEngine } from './audio/soundEngine';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SimulationScene | null>(null);

  // Simulation State
  const [allLabs, setAllLabs] = useState<SimulationLab[]>(DEFAULT_LABS);
  const [currentLab, setCurrentLab] = useState<SimulationLab>(DEFAULT_LABS[0]);
  const [selectedComponent, setSelectedComponent] = useState<SimulationComponent | null>(null);
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('9-12 (High School)');
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentGravityName, setCurrentGravityName] = useState('Earth');
  const [explodedAmount, setExplodedAmount] = useState(0);
  const [throttleAmount, setThrottleAmount] = useState(0.5);
  const [switchClosed, setSwitchClosed] = useState(true);

  // Live Telemetry
  const [telemetry, setTelemetry] = useState({
    timeElapsed: 0,
    kineticEnergy: 0,
    potentialEnergy: 0,
    activeVelocity: 0,
    impactCount: 0,
  });

  // Spatial AI Avatar Mentor Chat Log
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'mentor',
      text: 'Greetings, researcher! I am Dr. Nova, your spatial AI lab mentor. I am here to guide your experiments. Click any 3D object to inspect its mechanics, or drop the test spheres to analyze planetary ballistics.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isTutorThinking, setIsTutorThinking] = useState(false);
  const [isGeneratingLab, setIsGeneratingLab] = useState(false);

  // Inspector Quiz State
  const [quizResult, setQuizResult] = useState<{ selected: number; isCorrect: boolean } | null>(null);

  // WebXR State
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isVRModalOpen, setIsVRModalOpen] = useState(false);

  // 1. Initialize WebGL Scene Once
  useEffect(() => {
    if (!mountRef.current) return;

    // Check WebXR hardware support
    if (navigator.xr && 'isSessionSupported' in navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then(supported => {
        setIsVRSupported(supported);
      }).catch(() => {
        setIsVRSupported(false);
      });
    }

    const scene = new SimulationScene(mountRef.current, {
      onSelectComponent: comp => {
        setSelectedComponent(comp);
        setQuizResult(null);
        if (comp) {
          // Trigger Socratic guidance on the selected component
          handleSelectComponentSocratic(comp);
        }
      },
      onTelemetryUpdate: stats => {
        setTelemetry(stats);
      },
      onSimulationEvent: (event, details) => {
        if (event === 'impact' && details?.speed > 4.0) {
          // High speed impact event
        }
      },
    });

    sceneRef.current = scene;
    scene.loadLab(DEFAULT_LABS[0]);

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // 2. Lab Switching
  const handleSelectLab = (lab: SimulationLab) => {
    setCurrentLab(lab);
    setSelectedComponent(null);
    setQuizResult(null);
    setExplodedAmount(0);
    setCurrentGravityName(
      lab.domain === 'physics'
        ? 'Earth'
        : lab.domain === 'aerospace'
        ? 'Aero'
        : 'Zero-G'
    );

    if (sceneRef.current) {
      sceneRef.current.loadLab(lab);
    }

    // Add mentor introduction for the new lab
    const initialPrompt = lab.socraticPrompts?.[0] || `Welcome to ${lab.title}.`;
    const mentorMsg: TutorMessage = {
      id: `lab-switch-${Date.now()}`,
      sender: 'mentor',
      text: initialPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTutorMessages(prev => [...prev.slice(-8), mentorMsg]);
    speakMentorReply(initialPrompt);
  };

  // 3. Component selection Socratic feedback
  const handleSelectComponentSocratic = async (comp: SimulationComponent) => {
    try {
      sceneRef.current?.setAvatarSpeaking(true);
      const res = await inspectComponentWithGemma(comp.name, comp.description, currentLab.domain, gradeLevel);
      if (res.data?.summary) {
        const mentorText = `${comp.name}: ${res.data.summary} ${res.data.quizQuestion || ''}`;
        setTutorMessages(prev => [
          ...prev.slice(-8),
          {
            id: `inspect-${Date.now()}`,
            sender: 'mentor',
            text: mentorText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        speakMentorReply(mentorText);
      }
    } finally {
      sceneRef.current?.setAvatarSpeaking(false);
    }
  };

  // 4. Send Message to AI Mentor (Dr. Nova)
  const handleSendTutorMessage = async (userMessage: string) => {
    const studentMsg: TutorMessage = {
      id: `student-${Date.now()}`,
      sender: 'student',
      text: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTutorMessages(prev => [...prev.slice(-8), studentMsg]);
    setIsTutorThinking(true);

    try {
      const sceneContext = {
        labTitle: currentLab.title,
        domain: currentLab.domain,
        selectedObjectName: selectedComponent?.name,
        stats: {
          time: telemetry.timeElapsed,
          kineticEnergy: telemetry.kineticEnergy,
          impacts: telemetry.impactCount,
          gravity: currentGravityName,
        },
      };

      const res = await askTutorMentor(userMessage, sceneContext, gradeLevel);
      const replyText = res.reply || 'Keep experimenting to verify your hypothesis.';

      const mentorMsg: TutorMessage = {
        id: `mentor-${Date.now()}`,
        sender: 'mentor',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTutorMessages(prev => [...prev.slice(-8), mentorMsg]);

      // Synthesize and play voice
      speakMentorReply(replyText);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTutorThinking(false);
    }
  };

  // Voice playback helper
  const speakMentorReply = async (text: string) => {
    if (isMuted) return;
    try {
      sceneRef.current?.setAvatarSpeaking(true);
      const audioBase64 = await fetchGeminiTTS(text);
      await speakSpeech(text, audioBase64);
    } catch (e) {
      console.warn('Speech playback issue:', e);
    } finally {
      sceneRef.current?.setAvatarSpeaking(false);
    }
  };

  // 5. Generate Dynamic 3D Simulation with Gemma
  const handleGenerateLab = async (promptText: string) => {
    setIsGeneratingLab(true);
    try {
      const res = await generateLabWithGemma(promptText, gradeLevel, currentLab.domain);
      if (res.data) {
        const newLab: SimulationLab = {
          id: `custom-lab-${Date.now()}`,
          title: res.data.title || 'Dynamic Simulation Lab',
          domain: res.data.domain || 'custom',
          description: res.data.description || promptText,
          learningObjectives: res.data.learningObjectives || ['Analyze dynamic 3D interactions'],
          physicsConfig: res.data.physicsConfig || {
            gravity: [0, -9.81, 0],
            restitution: 0.8,
            friction: 0.2,
            airResistance: 0.01,
            timeScale: 1.0,
            damping: 0.99,
          },
          cameraPosition: res.data.cameraPosition || [0, 2.5, 6.0],
          cameraTarget: res.data.cameraTarget || [0, 1.0, 0],
          components: res.data.components as SimulationComponent[] || [],
          socraticPrompts: res.data.socraticPrompts || ['Observe the kinematic behaviors in this generated lab.'],
          hasExplodedView: false,
          hasParticles: true,
        };

        setAllLabs(prev => [newLab, ...prev]);
        handleSelectLab(newLab);

        const announcement = `I have generated your 3D simulation: "${newLab.title}". Ready for exploration!`;
        setTutorMessages(prev => [
          ...prev.slice(-8),
          {
            id: `gen-announce-${Date.now()}`,
            sender: 'mentor',
            text: announcement,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        speakMentorReply(announcement);
      }
    } catch (err: any) {
      alert(`Simulation generation error: ${err.message || 'Please try again'}`);
    } finally {
      setIsGeneratingLab(false);
    }
  };

  // 6. Interactive Quiz Answer Handler
  const handleAnswerQuiz = (selectedIdx: number) => {
    if (!selectedComponent?.metadata?.quizOptions) return;
    const isCorrect = selectedIdx === (selectedComponent.metadata.correctOptionIndex ?? 0);
    setQuizResult({ selected: selectedIdx, isCorrect });

    if (isCorrect) {
      soundEngine.playAvatarChime();
    }
  };

  // Controls Handlers
  const handleTogglePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    sceneRef.current?.setPaused(next);
  };

  const handleReset = () => {
    sceneRef.current?.resetSimulation();
  };

  const handleSetGravity = (presetName: string, gx: number, gy: number, gz: number) => {
    setCurrentGravityName(presetName);
    sceneRef.current?.setGravityMultiplier(gx, gy, gz);
    sceneRef.current?.resetSimulation();
  };

  const handleChangeExploded = (amount: number) => {
    setExplodedAmount(amount);
    sceneRef.current?.setExplodedAmount(amount);
  };

  const handleChangeThrottle = (val: number) => {
    setThrottleAmount(val);
    sceneRef.current?.setThrottle(val);
  };

  const handleToggleSwitch = () => {
    const next = !switchClosed;
    setSwitchClosed(next);
    sceneRef.current?.toggleSwitch(next);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  // Launch WebXR session
  const handleStartWebXR = async () => {
    if (sceneRef.current && navigator.xr) {
      try {
        const session = await navigator.xr.requestSession('immersive-vr', {
          optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
        });
        const renderer = sceneRef.current.getRenderer();
        await renderer.xr.setSession(session as any);
      } catch (e) {
        console.warn('Direct XR session request failed, modal fallback shown', e);
      }
    }
  };

  // Keyboard shortcut: 'H' to toggle dock collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'h' || e.key === 'H') {
        const toggleBtn = document.querySelector('button[aria-label="Toggle Controls"]') as HTMLButtonElement | null;
        if (toggleBtn) toggleBtn.click();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[var(--color-canvas)] font-sans select-none">
      {/* 1. Header Navigation Bar */}
      <HeaderBar
        currentLab={currentLab}
        allLabs={allLabs}
        onSelectLab={handleSelectLab}
        gradeLevel={gradeLevel}
        onGradeLevelChange={setGradeLevel}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onReset={handleReset}
        onEnterVR={() => setIsVRModalOpen(true)}
        isVRSupported={isVRSupported}
      />

      {/* Architectural Blueprint Crosshairs (71UI Architectural Signature Move) */}
      <div className="absolute top-16 left-4 text-[10px] font-mono text-[var(--color-hairline-strong)] pointer-events-none z-10 opacity-70">
        + [DATUM 0,0]
      </div>
      <div className="absolute top-16 right-4 text-[10px] font-mono text-[var(--color-hairline-strong)] pointer-events-none z-10 opacity-70">
        + [XR_6DOF]
      </div>

      {/* 2. Isolated WebGL 3D Canvas Mount (100% Unobstructed Center Viewport) */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing outline-none"
      />

      {/* 3. Collapsible Glassmorphic Bottom Dock */}
      <BottomDock
        currentLab={currentLab}
        selectedComponent={selectedComponent}
        telemetry={telemetry}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        onReset={handleReset}
        onSetGravity={handleSetGravity}
        currentGravityName={currentGravityName}
        explodedAmount={explodedAmount}
        onChangeExploded={handleChangeExploded}
        throttleAmount={throttleAmount}
        onChangeThrottle={handleChangeThrottle}
        switchClosed={switchClosed}
        onToggleSwitch={handleToggleSwitch}
        onGenerateLab={handleGenerateLab}
        isGeneratingLab={isGeneratingLab}
        tutorMessages={tutorMessages}
        onSendTutorMessage={handleSendTutorMessage}
        isTutorThinking={isTutorThinking}
        onAnswerQuiz={handleAnswerQuiz}
        quizResult={quizResult}
      />

      {/* 4. WebXR VR Headset Modal */}
      <VRModal
        isOpen={isVRModalOpen}
        onClose={() => setIsVRModalOpen(false)}
        onStartWebXR={handleStartWebXR}
        isWebXRSupported={isVRSupported}
      />
    </div>
  );
}
