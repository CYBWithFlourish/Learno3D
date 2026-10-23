import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Sparkles,
  Bot,
  Info,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
  Send,
  HelpCircle,
  Activity,
  Gauge,
  Check
} from 'lucide-react';
import { SimulationLab, SimulationComponent, TutorMessage } from '../types/simulation';

interface BottomDockProps {
  currentLab: SimulationLab;
  selectedComponent: SimulationComponent | null;
  telemetry: {
    timeElapsed: number;
    kineticEnergy: number;
    potentialEnergy: number;
    activeVelocity: number;
    impactCount: number;
  };
  isPaused: boolean;
  onTogglePause: () => void;
  onReset: () => void;
  onSetGravity: (presetName: string, gx: number, gy: number, gz: number) => void;
  currentGravityName: string;
  explodedAmount: number;
  onChangeExploded: (amount: number) => void;
  throttleAmount: number;
  onChangeThrottle: (val: number) => void;
  switchClosed: boolean;
  onToggleSwitch: () => void;
  // Text-to-3D builder
  onGenerateLab: (prompt: string) => void;
  isGeneratingLab: boolean;
  // Avatar mentor
  tutorMessages: TutorMessage[];
  onSendTutorMessage: (message: string) => void;
  isTutorThinking: boolean;
  // Inspector Quiz
  onAnswerQuiz?: (optionIdx: number) => void;
  quizResult?: { selected: number; isCorrect: boolean } | null;
}

type TabType = 'controls' | 'builder' | 'mentor' | 'inspector';

export const BottomDock: React.FC<BottomDockProps> = ({
  currentLab,
  selectedComponent,
  telemetry,
  isPaused,
  onTogglePause,
  onReset,
  onSetGravity,
  currentGravityName,
  explodedAmount,
  onChangeExploded,
  throttleAmount,
  onChangeThrottle,
  switchClosed,
  onToggleSwitch,
  onGenerateLab,
  isGeneratingLab,
  tutorMessages,
  onSendTutorMessage,
  isTutorThinking,
  onAnswerQuiz,
  quizResult,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('controls');
  const [customPrompt, setCustomPrompt] = useState('');
  const [mentorInput, setMentorInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Suggested prompt ideas for Text-to-3D lab builder
  const promptIdeas = [
    'Create a physics lab simulation showing gravity on Mars vs. Earth with two bounceable spheres.',
    'Build an electrical DC circuit with 12V battery, variable resistor, and glowing filament bulb.',
    'Simulate a human heart with ventricular contraction and oxygenated blood cell flow particles.',
    'High-bypass turbofan jet engine with rotating titanium fan blades and combustion flame chamber.',
    'Solar planetary orbit resonance comparing orbital period of Mercury and Earth.',
  ];

  // Speech-to-Text input
  const handleToggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (activeTab === 'builder') {
          setCustomPrompt(transcript);
        } else {
          setMentorInput(transcript);
          onSendTutorMessage(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      onGenerateLab(customPrompt.trim());
    }
  };

  const handleMentorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mentorInput.trim()) {
      onSendTutorMessage(mentorInput.trim());
      setMentorInput('');
    }
  };

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full transition-transform duration-200 ease-out pointer-events-auto ${
        isCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
      }`}
      style={{ maxWidth: 'min(940px, 94vw)' }}
    >
      {/* Collapse / Expand Toggle Button (71UI 32px control) */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center space-x-1.5 h-8 px-3.5 text-[12px] font-medium rounded-t-[10px] bg-[var(--color-surface)] border border-b-0 border-[var(--color-hairline-strong)] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink-strong)] hover:bg-[var(--color-surface-2)] btn-71 focus-71 transition-colors cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Hide Controls</span>
            </>
          )}
        </button>
      </div>

      {/* Main 71UI Glassmorphic Dock Container (concentric 16px radius) */}
      <div className="bg-[var(--color-surface)]/95 border border-[var(--color-hairline-strong)] rounded-[16px] shadow-[var(--shadow-md)] backdrop-blur-xl overflow-hidden flex flex-col max-h-[360px]">
        {/* Navigation Tabs Header */}
        <div className="flex items-center justify-between h-10 px-3 bg-[var(--color-surface-2)]/80 border-b border-[var(--color-hairline)]">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex items-center space-x-1.5 h-7 px-2.5 rounded-[8px] text-[13px] font-medium btn-71 focus-71 transition-colors ${
                activeTab === 'controls'
                  ? 'bg-[var(--color-canvas)] text-[var(--color-ink-strong)] shadow-[var(--shadow-ring)]'
                  : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink-strong)] hover:bg-[var(--color-surface)]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>Controls</span>
            </button>

            <button
              onClick={() => setActiveTab('builder')}
              className={`flex items-center space-x-1.5 h-7 px-2.5 rounded-[8px] text-[13px] font-medium btn-71 focus-71 transition-colors ${
                activeTab === 'builder'
                  ? 'bg-[var(--color-canvas)] text-[var(--color-ink-strong)] shadow-[var(--shadow-ring)]'
                  : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink-strong)] hover:bg-[var(--color-surface)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>Text-to-3D</span>
            </button>

            <button
              onClick={() => setActiveTab('mentor')}
              className={`flex items-center space-x-1.5 h-7 px-2.5 rounded-[8px] text-[13px] font-medium btn-71 focus-71 transition-colors ${
                activeTab === 'mentor'
                  ? 'bg-[var(--color-canvas)] text-[var(--color-ink-strong)] shadow-[var(--shadow-ring)]'
                  : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink-strong)] hover:bg-[var(--color-surface)]'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-[var(--color-on-success)]" />
              <span>AI Mentor</span>
            </button>

            <button
              onClick={() => setActiveTab('inspector')}
              className={`flex items-center space-x-1.5 h-7 px-2.5 rounded-[8px] text-[13px] font-medium btn-71 focus-71 transition-colors ${
                activeTab === 'inspector'
                  ? 'bg-[var(--color-canvas)] text-[var(--color-ink-strong)] shadow-[var(--shadow-ring)]'
                  : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink-strong)] hover:bg-[var(--color-surface)]'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-[var(--color-on-warning)]" />
              <span>Inspector {selectedComponent ? `(${selectedComponent.name.slice(0, 10)}…)` : ''}</span>
            </button>
          </div>

          {/* 71UI 40px Data Row Telemetry Header (tabular numerals) */}
          <div className="hidden md:flex items-center space-x-3 text-[12px] font-tnum text-[var(--color-ink-subtle)]">
            <span>T: <strong className="text-[var(--color-ink-strong)]">{telemetry.timeElapsed.toFixed(1)}</strong>s</span>
            <span>KE: <strong className="text-[var(--color-ink-strong)]">{telemetry.kineticEnergy.toFixed(2)}</strong>J</span>
            <span>PE: <strong className="text-[var(--color-ink-strong)]">{telemetry.potentialEnergy.toFixed(2)}</strong>J</span>
            <span>Hits: <strong className="text-[var(--color-ink-strong)]">{telemetry.impactCount}</strong></span>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 overflow-y-auto">
          {/* TAB 1: LAB CONTROLS */}
          {activeTab === 'controls' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                {/* Simulation Execution Buttons (71UI 32px controls, 10px radius) */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onTogglePause}
                    className={`flex items-center space-x-1.5 h-8 px-3.5 rounded-[10px] text-[13px] font-medium btn-71 focus-71 transition-colors ${
                      isPaused
                        ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white'
                        : 'bg-[var(--color-surface-2)] hover:bg-[var(--color-canvas)] text-[var(--color-ink-strong)] border border-[var(--color-hairline-strong)]'
                    }`}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={onReset}
                    className="flex items-center space-x-1.5 h-8 px-3 rounded-[10px] bg-[var(--color-surface-2)] hover:bg-[var(--color-canvas)] border border-[var(--color-hairline-strong)] text-[var(--color-ink)] text-[13px] font-medium btn-71 focus-71 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Drop / Reset</span>
                  </button>
                </div>

                {/* Planetary Gravity Presets (71UI Segmented Control) */}
                <div className="flex items-center p-0.5 bg-[var(--color-canvas)] rounded-[10px] border border-[var(--color-hairline)]">
                  <span className="text-[11px] font-mono text-[var(--color-ink-subtle)] uppercase tracking-[0.08em] px-2">
                    Gravity
                  </span>
                  {[
                    { name: 'Earth', g: [0, -9.81, 0], label: '9.8m/s²' },
                    { name: 'Mars', g: [0, -3.72, 0], label: '3.7m/s²' },
                    { name: 'Moon', g: [0, -1.62, 0], label: '1.6m/s²' },
                    { name: 'Jupiter', g: [0, -24.79, 0], label: '24.8m/s²' },
                    { name: 'Zero-G', g: [0, 0, 0], label: '0g' },
                  ].map(p => (
                    <button
                      key={p.name}
                      onClick={() => onSetGravity(p.name, p.g[0], p.g[1], p.g[2])}
                      className={`h-7 px-2.5 text-[12px] font-medium rounded-[8px] btn-71 focus-71 transition-colors ${
                        currentGravityName === p.name
                          ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-ring)]'
                          : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink-strong)]'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lab-Specific Custom Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[var(--color-hairline)]">
                {/* Exploded Dissection Slider (71UI Concentric Card) */}
                {currentLab.hasExplodedView && (
                  <div className="bg-[var(--color-surface-2)] p-3 rounded-[12px] border border-[var(--color-hairline)]">
                    <div className="flex items-center justify-between text-[13px] text-[var(--color-ink-strong)] mb-1.5 font-medium">
                      <span className="flex items-center space-x-1.5">
                        <Activity className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        <span>Exploded View & Dissection</span>
                      </span>
                      <span className="font-tnum text-[12px] text-[var(--color-primary)]">
                        {(explodedAmount * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={explodedAmount}
                      onChange={e => onChangeExploded(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[var(--color-canvas)] rounded-[9999px] appearance-none cursor-pointer accent-[var(--color-primary)]"
                    />
                    <div className="flex justify-between text-[11px] text-[var(--color-ink-subtle)] mt-1 font-mono">
                      <span>Assembled</span>
                      <span>Separated</span>
                    </div>
                  </div>
                )}

                {/* Jet Engine Throttle (71UI Concentric Card) */}
                {currentLab.domain === 'aerospace' && (
                  <div className="bg-[var(--color-surface-2)] p-3 rounded-[12px] border border-[var(--color-hairline)]">
                    <div className="flex items-center justify-between text-[13px] text-[var(--color-ink-strong)] mb-1.5 font-medium">
                      <span className="flex items-center space-x-1.5">
                        <Gauge className="w-3.5 h-3.5 text-[var(--color-on-warning)]" />
                        <span>Turbofan Throttle (RPM)</span>
                      </span>
                      <span className="font-tnum text-[12px] text-[var(--color-on-warning)]">
                        {(throttleAmount * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.02"
                      value={throttleAmount}
                      onChange={e => onChangeThrottle(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[var(--color-canvas)] rounded-[9999px] appearance-none cursor-pointer accent-[var(--color-primary)]"
                    />
                    <div className="flex justify-between text-[11px] text-[var(--color-ink-subtle)] mt-1 font-mono">
                      <span>1,200 RPM</span>
                      <span>3,400 RPM</span>
                    </div>
                  </div>
                )}

                {/* Circuit Knife Switch (71UI 24x14px Switch specification) */}
                {currentLab.domain === 'circuits' && (
                  <div className="bg-[var(--color-surface-2)] p-3 rounded-[12px] border border-[var(--color-hairline)] flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-medium text-[var(--color-ink-strong)]">Circuit Knife Switch</div>
                      <div className="text-[11px] text-[var(--color-ink-subtle)]">
                        {switchClosed ? 'Conduction active (electrons flowing)' : 'Circuit open (zero current)'}
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={switchClosed}
                      onClick={onToggleSwitch}
                      className="flex items-center space-x-2.5 p-1 rounded-[10px] btn-71 focus-71 cursor-pointer"
                    >
                      {/* 71UI 24x14 track, 10px thumb, 2px inset */}
                      <div
                        className={`w-6 h-3.5 rounded-full relative transition-colors duration-150 ${
                          switchClosed ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-control-border)]'
                        }`}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full bg-white absolute top-0.5 transition-transform duration-150 ${
                            switchClosed ? 'translate-x-3' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                      <span className="text-[12px] font-medium font-mono text-[var(--color-ink)]">
                        {switchClosed ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Socratic Learning Objectives Card */}
                <div className="bg-[var(--color-surface-2)] p-3 rounded-[12px] border border-[var(--color-hairline)]">
                  <div className="text-[13px] font-medium text-[var(--color-ink-strong)] mb-1 flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-[var(--color-on-success)]" />
                    <span>Learning Objectives</span>
                  </div>
                  <ul className="text-[12px] text-[var(--color-ink-subtle)] space-y-1">
                    {currentLab.learningObjectives.slice(0, 2).map((obj, i) => (
                      <li key={i} className="line-clamp-1">• {obj}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEXT-TO-3D LAB BUILDER */}
          {activeTab === 'builder' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-[14px] font-medium text-[var(--color-ink-strong)] tracking-[-0.01em] flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>Text-to-3D Simulation Builder</span>
                </h3>
                <p className="text-[12px] text-[var(--color-ink-subtle)]">
                  Describe any physical phenomenon, anatomical dissection, or engineering mechanism in plain natural language.
                </p>
              </div>

              {/* 71UI 40px Input Form */}
              <form onSubmit={handlePromptSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={e => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Create a physics lab simulation showing gravity on Mars vs. Earth with two bounceable spheres..."
                    className="w-full h-10 bg-[var(--color-canvas)] border border-[var(--color-hairline-strong)] rounded-[10px] px-3.5 text-[13px] text-[var(--color-ink-strong)] placeholder-[var(--color-ink-subtle)] focus-71 pr-10 transition-colors"
                    disabled={isGeneratingLab}
                  />
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    aria-label="Use microphone for voice prompt"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-[6px] flex items-center justify-center transition ${
                      isListening
                        ? 'text-[var(--color-on-danger)] bg-[var(--color-danger-fill)]'
                        : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink-strong)]'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingLab || !customPrompt.trim()}
                  className="flex items-center space-x-1.5 h-10 px-4 rounded-[10px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-[13px] font-medium btn-71 focus-71 disabled:opacity-50 transition-colors shadow-[var(--shadow-sm)]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingLab ? 'Synthesizing…' : 'Generate 3D Lab'}</span>
                </button>
              </form>

              {/* Preset Prompt Chips (71UI 24px chips) */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="text-[11px] text-[var(--color-ink-subtle)] font-mono self-center uppercase tracking-[0.08em]">
                  Presets:
                </span>
                {promptIdeas.map((idea, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCustomPrompt(idea);
                      onGenerateLab(idea);
                    }}
                    className="h-6 px-2.5 text-[11px] bg-[var(--color-surface-2)] hover:bg-[var(--color-canvas)] text-[var(--color-ink)] border border-[var(--color-hairline)] rounded-[6px] btn-71 focus-71 transition-colors text-left line-clamp-1 max-w-xs"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SPATIAL AI MENTOR (DR. NOVA) */}
          {activeTab === 'mentor' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--color-hairline)] pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-[6px] bg-[var(--color-success-fill)] text-[var(--color-on-success)] flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-medium text-[var(--color-ink-strong)]">Dr. Nova — Socratic Spatial Mentor</h4>
                    <p className="text-[11px] text-[var(--color-ink-subtle)]">Live conversational guidance grounded in 3D telemetry.</p>
                  </div>
                </div>

                {/* Socratic Action Pills */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onSendTutorMessage("Explain the physical mechanism observed in this simulation.")}
                    className="h-7 px-2.5 text-[12px] font-medium bg-[var(--color-surface-2)] hover:bg-[var(--color-canvas)] text-[var(--color-ink)] border border-[var(--color-hairline)] rounded-[8px] btn-71 focus-71 transition-colors"
                  >
                    Explain Mechanics
                  </button>
                  <button
                    onClick={() => onSendTutorMessage("Quiz me on a core principle of this 3D experiment.")}
                    className="h-7 px-2.5 text-[12px] font-medium bg-[var(--color-surface-2)] hover:bg-[var(--color-canvas)] text-[var(--color-ink)] border border-[var(--color-hairline)] rounded-[8px] btn-71 focus-71 transition-colors"
                  >
                    Quiz Me
                  </button>
                </div>
              </div>

              {/* Chat Message Scroll Area */}
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                {tutorMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-[10px] text-[13px] border ${
                      msg.sender === 'mentor'
                        ? 'bg-[var(--color-surface-2)] border-[var(--color-hairline)] text-[var(--color-ink)]'
                        : 'bg-[var(--color-info-fill)] border-[var(--color-hairline)] text-[var(--color-ink-strong)] self-end ml-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[11px] font-mono">
                      <span className="font-medium text-[var(--color-primary)]">
                        {msg.sender === 'mentor' ? 'Dr. Nova [AI Mentor]' : 'Student [WebXR]'}
                      </span>
                      <span className="text-[var(--color-ink-subtle)]">{msg.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}

                {isTutorThinking && (
                  <div className="flex items-center space-x-2 text-[12px] text-[var(--color-ink-subtle)] p-2">
                    <Bot className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>Dr. Nova is analyzing the 3D scene telemetry…</span>
                  </div>
                )}
              </div>

              {/* Chat & Voice Input (71UI 36px control) */}
              <form onSubmit={handleMentorSubmit} className="flex gap-2 pt-0.5">
                <input
                  type="text"
                  value={mentorInput}
                  onChange={e => setMentorInput(e.target.value)}
                  placeholder="Ask Dr. Nova a question about this 3D model…"
                  className="flex-1 h-9 bg-[var(--color-canvas)] border border-[var(--color-hairline-strong)] rounded-[10px] px-3 text-[13px] text-[var(--color-ink-strong)] placeholder-[var(--color-ink-subtle)] focus-71 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  aria-label="Toggle voice input"
                  className={`w-9 h-9 rounded-[10px] flex items-center justify-center border border-[var(--color-hairline-strong)] btn-71 focus-71 transition ${
                    isListening ? 'bg-[var(--color-danger-fill)] text-[var(--color-on-danger)]' : 'bg-[var(--color-surface-2)] text-[var(--color-ink)] hover:bg-[var(--color-canvas)]'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  aria-label="Send message to mentor"
                  className="w-9 h-9 rounded-[10px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white flex items-center justify-center btn-71 focus-71 shadow-[var(--shadow-sm)] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: COMPONENT INSPECTOR */}
          {activeTab === 'inspector' && (
            <div>
              {selectedComponent ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--color-hairline)] pb-2">
                    <div>
                      <span className="text-[11px] font-mono uppercase text-[var(--color-ink-subtle)] tracking-[0.08em]">
                        Inspecting 3D Part
                      </span>
                      <h4 className="text-[14px] font-medium text-[var(--color-ink-strong)]">{selectedComponent.name}</h4>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center h-5 px-2 rounded-[6px] text-[12px] font-mono bg-[var(--color-surface-2)] text-[var(--color-ink-strong)] border border-[var(--color-hairline)]">
                        {selectedComponent.mass > 0 ? `${selectedComponent.mass} kg` : 'Static Mesh'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[13px] text-[var(--color-ink)] leading-relaxed">
                    {selectedComponent.description}
                  </p>

                  {/* Formula & Telemetry Specs (71UI concentric 10px cards) */}
                  {selectedComponent.metadata && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] font-mono">
                      {selectedComponent.metadata.formula && (
                        <div className="bg-[var(--color-surface-2)] p-2.5 rounded-[10px] border border-[var(--color-hairline)] text-[var(--color-primary)]">
                          <span className="text-[10px] text-[var(--color-ink-subtle)] block uppercase tracking-[0.06em]">
                            Governing Formula
                          </span>
                          {selectedComponent.metadata.formula}
                        </div>
                      )}
                      {selectedComponent.metadata.keyMetric && (
                        <div className="bg-[var(--color-surface-2)] p-2.5 rounded-[10px] border border-[var(--color-hairline)] text-[var(--color-on-success)]">
                          <span className="text-[10px] text-[var(--color-ink-subtle)] block uppercase tracking-[0.06em]">
                            Component Spec
                          </span>
                          {selectedComponent.metadata.keyMetric}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interactive Socratic Quiz Question */}
                  {selectedComponent.metadata?.quizQuestion && selectedComponent.metadata.quizOptions && (
                    <div className="bg-[var(--color-surface-2)] p-3 rounded-[12px] border border-[var(--color-hairline)] mt-1">
                      <div className="flex items-center space-x-1.5 text-[12px] font-medium text-[var(--color-ink-strong)] mb-2">
                        <HelpCircle className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        <span>Socratic Check: {selectedComponent.metadata.quizQuestion}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {selectedComponent.metadata.quizOptions.map((opt, oIdx) => {
                          const isSelected = quizResult?.selected === oIdx;
                          const isCorrect = quizResult?.isCorrect;

                          let btnClass = 'bg-[var(--color-canvas)] border-[var(--color-hairline-strong)] text-[var(--color-ink)] hover:bg-[var(--color-surface)]';
                          if (isSelected) {
                            btnClass = isCorrect
                              ? 'bg-[var(--color-success-fill)] border-[var(--color-on-success)] text-[var(--color-on-success)]'
                              : 'bg-[var(--color-danger-fill)] border-[var(--color-on-danger)] text-[var(--color-on-danger)]';
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => onAnswerQuiz && onAnswerQuiz(oIdx)}
                              className={`text-left text-[12px] p-2 rounded-[8px] border btn-71 focus-71 transition-colors ${btnClass}`}
                            >
                              <span className="font-mono text-[var(--color-ink-subtle)] mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {quizResult && (
                        <div className={`text-[12px] mt-2 p-2 rounded-[8px] ${
                          quizResult.isCorrect
                            ? 'bg-[var(--color-success-fill)] text-[var(--color-on-success)]'
                            : 'bg-[var(--color-danger-fill)] text-[var(--color-on-danger)]'
                        }`}>
                          {quizResult.isCorrect ? 'Correct! ' : 'Not quite. '}
                          {selectedComponent.metadata.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-[13px] text-[var(--color-ink-subtle)]">
                  <Info className="w-5 h-5 mx-auto mb-1.5 text-[var(--color-ink-subtle)]" />
                  <p>Click any 3D component in the lab (or aim with your VR laser pointer) to inspect physical properties, formulas, and take a quick quiz.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
