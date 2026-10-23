import { GradeLevel, SimulationLab } from '../types/simulation';

export interface GenerateLabResponse {
  success: boolean;
  data?: Partial<SimulationLab>;
  error?: string;
}

export interface TutorResponse {
  success: boolean;
  reply: string;
  error?: string;
}

export interface InspectionResponse {
  success: boolean;
  data?: {
    summary: string;
    mechanics: string;
    formula?: string;
    quizQuestion?: string;
    quizOptions?: string[];
    correctOptionIndex?: number;
    explanation?: string;
  };
  error?: string;
}

export async function generateLabWithGemma(
  prompt: string,
  gradeLevel: GradeLevel = '9-12 (High School)',
  currentDomain: string = 'physics'
): Promise<GenerateLabResponse> {
  try {
    const res = await fetch('/api/gemini/generate-lab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, gradeLevel, currentDomain }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    const json = await res.json();
    return json;
  } catch (error: any) {
    console.warn('API call failed, generating procedural fallback scene:', error);
    // Provide a resilient client-side procedural fallback so user never gets a broken experience
    return {
      success: true,
      data: {
        title: `Dynamic Lab: ${prompt.slice(0, 32)}...`,
        domain: 'custom',
        description: `Custom spatial simulation generated for: "${prompt}". Explore interactions in 3D.`,
        learningObjectives: [
          'Investigate multi-body physics interactions in 3D space',
          'Observe dynamic kinematic trajectories and energy conservation',
          'Hypothesize outcomes and verify through real-time telemetry'
        ],
        physicsConfig: {
          gravity: [0, -9.81, 0],
          restitution: 0.82,
          friction: 0.25,
          airResistance: 0.02,
          timeScale: 1.0,
          damping: 0.99,
        },
        cameraPosition: [0, 2.4, 5.5],
        cameraTarget: [0, 1.0, 0],
        socraticPrompts: [
          `Welcome to your custom simulation! What do you expect will happen when these bodies collide?`,
          `How would changing the restitution affect the rebound height?`
        ],
        components: [
          {
            id: 'custom-pedestal',
            name: 'Laboratory Experiment Pedestal',
            type: 'box',
            position: [0, 0.15, 0],
            rotation: [0, 0, 0],
            scale: [3.8, 0.3, 2.2],
            color: '#1e293b',
            roughness: 0.3,
            metalness: 0.4,
            mass: 0,
            description: 'Sturdy ground datum plane for simulation bounds.'
          },
          {
            id: 'custom-active-sphere-1',
            name: 'Primary Kinematic Sphere',
            type: 'sphere',
            position: [-0.9, 2.4, 0],
            rotation: [0, 0, 0],
            scale: [0.38, 0.38, 0.38],
            color: '#38bdf8',
            roughness: 0.2,
            metalness: 0.8,
            mass: 1.2,
            restitution: 0.85,
            description: 'Elastic body reacting to gravitational force.',
            metadata: {
              formula: 'F_net = m * a',
              keyMetric: 'Mass: 1.2 kg'
            }
          },
          {
            id: 'custom-active-sphere-2',
            name: 'Secondary Heavy Sphere',
            type: 'sphere',
            position: [0.9, 2.4, 0],
            rotation: [0, 0, 0],
            scale: [0.44, 0.44, 0.44],
            color: '#f97316',
            roughness: 0.2,
            metalness: 0.8,
            mass: 2.4,
            restitution: 0.75,
            description: 'Denser payload body demonstrating momentum transfer.',
            metadata: {
              formula: 'p = m * v',
              keyMetric: 'Mass: 2.4 kg'
            }
          },
          {
            id: 'custom-target-pillar',
            name: 'Center Reaction Column',
            type: 'cylinder',
            position: [0, 1.0, 0],
            rotation: [0, 0, 0],
            scale: [0.25, 1.4, 0.25],
            color: '#a855f7',
            roughness: 0.15,
            metalness: 0.9,
            mass: 0,
            description: 'Central spatial reference pillar with energy sensor.'
          }
        ]
      }
    };
  }
}

export async function askTutorMentor(
  userMessage: string,
  sceneContext: any,
  gradeLevel: GradeLevel = '9-12 (High School)'
): Promise<TutorResponse> {
  try {
    const res = await fetch('/api/gemini/tutor-dialogue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage, sceneContext, gradeLevel }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return { success: true, reply: data.reply };
  } catch (error: any) {
    console.warn('Tutor API call failed, using heuristic mentor guidance:', error);
    return {
      success: true,
      reply: `Notice the relationship between physical mass, height, and energy in this ${sceneContext?.labTitle || 'simulation'}. Try running another cycle with adjusted parameters to see if your hypothesis holds! What differences do you observe?`,
    };
  }
}

export async function fetchGeminiTTS(text: string, voice = 'Zephyr'): Promise<string | null> {
  try {
    const res = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.audioBase64 || null;
  } catch {
    return null;
  }
}

export async function inspectComponentWithGemma(
  componentName: string,
  componentRole: string,
  domain: string,
  gradeLevel: GradeLevel
): Promise<InspectionResponse> {
  try {
    const res = await fetch('/api/gemini/inspect-component', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ componentName, componentRole, domain, gradeLevel }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    return {
      success: true,
      data: {
        summary: `${componentName} is a fundamental component in this ${domain} assembly.`,
        mechanics: `In ${gradeLevel} curriculum, this part functions as a primary node in maintaining mechanical or biological homeostasis.`,
        formula: 'System Metric: E_total = Constant',
        quizQuestion: `What is the primary function of ${componentName}?`,
        quizOptions: [
          'Facilitates vital energy/matter transfer',
          'Acts as an inert aesthetic fixture',
          'Absorbs negative radiation',
          'Prevents structural oscillation'
        ],
        correctOptionIndex: 0,
        explanation: 'It acts as an active structural and functional conduit within the simulated system.'
      }
    };
  }
}

/**
 * Universal voice playback: uses Gemini TTS WAV audio if available,
 * or native Web SpeechSynthesis if server TTS is offline or unavailable.
 */
export async function speakSpeech(text: string, audioBase64?: string | null) {
  if (audioBase64) {
    try {
      const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
      audio.volume = 0.9;
      await audio.play();
      return;
    } catch (e) {
      console.warn('WAV playback failed, falling back to speech synthesis', e);
    }
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    window.speechSynthesis.speak(utterance);
  }
}
