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
  Zap,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Flame,
  Activity,
  Gauge
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

  // Voice speech-to-text integration using Web Speech API
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
    } catch (e) {
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
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full transition-transform duration-300 ease-out pointer-events-auto ${
        isCollapsed ? 'translate-y-[calc(100%-38px)]' : 'translate-y-0'
      }`}
      style={{ maxWidth: 'min(960px, 94vw)' }}
    >
      {/* Collapse / Expand Toggle Tab */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold rounded-t-xl bg-neutral-900 border border-b-0 border-neutral-700/80 text-neutral-300 hover:text-white hover:bg-neutral-800 shadow-lg cursor-pointer transition-colors"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              <span>Hide Controls</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock Container */}
      <div className="bg-neutral-900/95 border border-neutral-700/80 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-xl overflow-hidden flex flex-col max-h-[380px]">
        {/* Navigation Tabs Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2 bg-neutral-950/60">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'controls'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Lab Controls</span>
            </button>

            <button
              onClick={() => setActiveTab('builder')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'builder'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Text-to-3D Builder</span>
            </button>

            <button
              onClick={() => setActiveTab('mentor')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'mentor'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Mentor (Dr. Nova)</span>
            </button>

            <button
              onClick={() => setActiveTab('inspector')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'inspector'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspector {selectedComponent ? `(${selectedComponent.name.slice(0, 12)}...)` : ''}</span>
            </button>
          </div>

          {/* Quick simulation status readout */}
          <div className="hidden md:flex items-center space-x-3 text-[11px] font-mono text-neutral-400">
            <span>T: {telemetry.timeElapsed.toFixed(1)}s</span>
            <span>KE: {telemetry.kineticEnergy.toFixed(2)}J</span>
            <span>PE: {telemetry.potentialEnergy.toFixed(2)}J</span>
            <span>Impacts: {telemetry.impactCount}</span>
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="p-4 overflow-y-auto">
          {/* TAB 1: CONTROLS */}
          {activeTab === 'controls' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Simulation Execution Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onTogglePause}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isPaused
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-amber-300'
                    }`}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={onReset}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Drop / Reset</span>
                  </button>
                </div>

                {/* Planetary Gravity Presets */}
                <div className="flex items-center space-x-1.5 bg-neutral-950/60 p-1 rounded-xl border border-neutral-800">
                  <span className="text-[10px] uppercase font-mono text-neutral-400 px-2">Gravity:</span>
                  <button
                    onClick={() => onSetGravity('Earth', 0, -9.81, 0)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                      currentGravityName === 'Earth'
                        ? 'bg-sky-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Earth (9.8m/s²)
                  </button>
                  <button
                    onClick={() => onSetGravity('Mars', 0, -3.72, 0)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                      currentGravityName === 'Mars'
                        ? 'bg-amber-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Mars (3.7m/s²)
                  </button>
                  <button
                    onClick={() => onSetGravity('Moon', 0, -1.62, 0)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                      currentGravityName === 'Moon'
                        ? 'bg-neutral-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Moon (1.6m/s²)
                  </button>
                  <button
                    onClick={() => onSetGravity('Jupiter', 0, -24.79, 0)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                      currentGravityName === 'Jupiter'
                        ? 'bg-rose-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Jupiter (24.8m/s²)
                  </button>
                  <button
                    onClick={() => onSetGravity('Zero-G', 0, 0, 0)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                      currentGravityName === 'Zero-G'
                        ? 'bg-indigo-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Zero-G
                  </button>
                </div>
              </div>

              {/* Lab-specific dynamic sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
                {/* Exploded Dissection Slider (Anatomy / Aerospace) */}
                {currentLab.hasExplodedView && (
                  <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-800">
                    <div className="flex items-center justify-between text-xs text-neutral-300 mb-1.5">
                      <span className="font-medium flex items-center space-x-1.5">
                        <Activity className="w-3.5 h-3.5 text-sky-400" />
                        <span>Exploded View & Anatomical Dissection</span>
                      </span>
                      <span className="font-mono text-sky-400">{(explodedAmount * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={explodedAmount}
                      onChange={e => onChangeExploded(parseFloat(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                      <span>Assembled State</span>
                      <span>Full Separation</span>
                    </div>
                  </div>
                )}

                {/* Jet Engine Throttle (Aerospace) */}
                {currentLab.domain === 'aerospace' && (
                  <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-800">
                    <div className="flex items-center justify-between text-xs text-neutral-300 mb-1.5">
                      <span className="font-medium flex items-center space-x-1.5">
                        <Gauge className="w-3.5 h-3.5 text-amber-400" />
                        <span>Turbofan Spool Throttle (RPM)</span>
                      </span>
                      <span className="font-mono text-amber-400">{(throttleAmount * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.02"
                      value={throttleAmount}
                      onChange={e => onChangeThrottle(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                      <span>Flight Idle (1,200 RPM)</span>
                      <span>Takeoff Thrust (3,400 RPM)</span>
                    </div>
                  </div>
                )}

                {/* Circuit Knife Switch (Circuits) */}
                {currentLab.domain === 'circuits' && (
                  <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-neutral-200">Circuit Knife Switch</div>
                      <div className="text-[11px] text-neutral-400">
                        {switchClosed ? 'Closed circuit (Electrons flowing)' : 'Open circuit (Break in conduction)'}
                      </div>
                    </div>
                    <button
                      onClick={onToggleSwitch}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        switchClosed
                          ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      {switchClosed ? 'SWITCH CLOSED (ON)' : 'SWITCH OPEN (OFF)'}
                    </button>
                  </div>
                )}

                {/* Learning Objectives Callout */}
                <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-800">
                  <div className="text-xs font-medium text-neutral-300 mb-1 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Learning Objectives</span>
                  </div>
                  <ul className="text-[11px] text-neutral-400 space-y-1">
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Gemma Spatial Intelligence 3D Builder</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Describe any physics experiment, anatomical organ, mechanical assembly, or vocational lab in natural language.
                  </p>
                </div>
              </div>

              {/* Prompt Input Form */}
              <form onSubmit={handlePromptSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={e => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Create a physics lab simulation showing gravity on Mars vs. Earth with two bounceable spheres..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-purple-500 pr-10"
                    disabled={isGeneratingLab}
                  />
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    title="Speak prompt with microphone"
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition ${
                      isListening ? 'text-red-400 bg-red-500/20 animate-pulse' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingLab || !customPrompt.trim()}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition shadow-md shadow-purple-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingLab ? 'Synthesizing...' : 'Generate 3D Lab'}</span>
                </button>
              </form>

              {/* Instant Prompt Idea Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-neutral-500 font-mono self-center">Preset Prompts:</span>
                {promptIdeas.map((idea, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCustomPrompt(idea);
                      onGenerateLab(idea);
                    }}
                    className="text-[11px] bg-neutral-950/60 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-lg px-2.5 py-1 text-left transition line-clamp-1 max-w-xs"
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
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Dr. Nova — Socratic Spatial Mentor</h4>
                    <p className="text-[10px] text-neutral-400">Ask questions, request verbal guidance, or get live feedback on your experiment.</p>
                  </div>
                </div>

                {/* Quick Socratic Question Buttons */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onSendTutorMessage("Explain what just happened in this simulation.")}
                    className="text-[11px] bg-neutral-800 hover:bg-neutral-700 text-emerald-300 rounded-lg px-2 py-1 transition"
                  >
                    Explain Mechanics
                  </button>
                  <button
                    onClick={() => onSendTutorMessage("Quiz me with a question about this 3D model.")}
                    className="text-[11px] bg-neutral-800 hover:bg-neutral-700 text-sky-300 rounded-lg px-2 py-1 transition"
                  >
                    Quiz Me
                  </button>
                </div>
              </div>

              {/* Messages Log */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {tutorMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col text-xs p-2.5 rounded-xl ${
                      msg.sender === 'mentor'
                        ? 'bg-neutral-950/80 border border-neutral-800 text-neutral-200'
                        : 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-100 self-end ml-10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[10px] text-emerald-400 uppercase tracking-wide">
                        {msg.sender === 'mentor' ? 'Dr. Nova [AI Mentor]' : 'Student [VR]'}
                      </span>
                      <span className="text-[9px] text-neutral-500">{msg.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}

                {isTutorThinking && (
                  <div className="flex items-center space-x-2 text-xs text-neutral-400 p-2">
                    <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
                    <span>Dr. Nova is analyzing the 3D scene state...</span>
                  </div>
                )}
              </div>

              {/* Chat & Voice Input */}
              <form onSubmit={handleMentorSubmit} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={mentorInput}
                  onChange={e => setMentorInput(e.target.value)}
                  placeholder="Ask Dr. Nova a question or describe what you observed..."
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className={`p-2 rounded-xl border border-neutral-800 transition ${
                    isListening ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                  title="Speech-to-Text Voice Input"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
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
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                        Inspecting 3D Mesh
                      </span>
                      <h4 className="text-sm font-bold text-white">{selectedComponent.name}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 block font-mono">Mass</span>
                      <span className="text-xs font-bold text-amber-300 font-mono">
                        {selectedComponent.mass > 0 ? `${selectedComponent.mass} kg` : 'Static Mesh'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {selectedComponent.description}
                  </p>

                  {/* Mathematical Formula / Key Metric */}
                  {selectedComponent.metadata && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      {selectedComponent.metadata.formula && (
                        <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 text-sky-300">
                          <span className="text-[10px] text-neutral-500 block">Governing Equation</span>
                          {selectedComponent.metadata.formula}
                        </div>
                      )}
                      {selectedComponent.metadata.keyMetric && (
                        <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 text-emerald-300">
                          <span className="text-[10px] text-neutral-500 block">Telemetry Spec</span>
                          {selectedComponent.metadata.keyMetric}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interactive Socratic Quiz Question */}
                  {selectedComponent.metadata?.quizQuestion && selectedComponent.metadata.quizOptions && (
                    <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800 mt-2">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 mb-2">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Socratic Check: {selectedComponent.metadata.quizQuestion}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {selectedComponent.metadata.quizOptions.map((opt, oIdx) => {
                          const isSelected = quizResult?.selected === oIdx;
                          const isCorrect = quizResult?.isCorrect;

                          let btnStyle = 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800';
                          if (isSelected) {
                            btnStyle = isCorrect
                              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                              : 'bg-red-950/80 border-red-500 text-red-200';
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => onAnswerQuiz && onAnswerQuiz(oIdx)}
                              className={`text-left text-xs p-2 rounded-lg border transition ${btnStyle}`}
                            >
                              <span className="font-bold mr-1.5 text-neutral-500">{String.fromCharCode(65 + oIdx)}.</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {quizResult && (
                        <div className={`text-xs mt-2 p-2 rounded-lg ${
                          quizResult.isCorrect ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'
                        }`}>
                          {quizResult.isCorrect ? 'Correct! ' : 'Not quite. '}
                          {selectedComponent.metadata.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-neutral-400">
                  <Info className="w-6 h-6 mx-auto mb-2 text-neutral-600" />
                  <p>Click any 3D component in the lab (or point with your VR laser) to inspect physical properties, formulas, and take a quick quiz.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
