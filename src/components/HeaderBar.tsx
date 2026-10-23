import React from 'react';
import { Sparkles, Glasses, RotateCcw, Volume2, VolumeX, Maximize2, ShieldCheck, Atom } from 'lucide-react';
import { GradeLevel, SimulationLab } from '../types/simulation';

interface HeaderBarProps {
  currentLab: SimulationLab;
  allLabs: SimulationLab[];
  onSelectLab: (lab: SimulationLab) => void;
  gradeLevel: GradeLevel;
  onGradeLevelChange: (level: GradeLevel) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onReset: () => void;
  onEnterVR: () => void;
  isVRSupported: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentLab,
  allLabs,
  onSelectLab,
  gradeLevel,
  onGradeLevelChange,
  isMuted,
  onToggleMute,
  onReset,
  onEnterVR,
  isVRSupported,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-neutral-950/80 border-b border-neutral-800/80 backdrop-blur-md pointer-events-auto">
      {/* Brand & Studio Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-400/30 text-sky-400 shadow-sm shadow-sky-500/20">
          <Atom className="w-5 h-5 animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
              Gemma Spatial XR
            </h1>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
              WebXR Studio
            </span>
          </div>
          <p className="text-xs text-neutral-400 line-clamp-1 max-w-[280px] sm:max-w-md">
            {currentLab.title}
          </p>
        </div>
      </div>

      {/* Preset Lab Switcher */}
      <div className="hidden lg:flex items-center space-x-1.5 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
        {allLabs.map(lab => {
          const isActive = lab.id === currentLab.id;
          return (
            <button
              key={lab.id}
              onClick={() => onSelectLab(lab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              {lab.title.split(' ')[0]} {lab.domain === 'physics' ? 'Gravity' : lab.domain === 'anatomy' ? 'Heart' : lab.domain === 'circuits' ? 'Circuit' : 'Jet Engine'}
            </button>
          );
        })}
      </div>

      {/* Right controls: Grade Level, Audio, Reset, VR */}
      <div className="flex items-center space-x-2">
        {/* Grade level dropdown */}
        <select
          value={gradeLevel}
          onChange={e => onGradeLevelChange(e.target.value as GradeLevel)}
          className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-sky-500 cursor-pointer"
        >
          <option value="K-5 (Elementary)">Grade K-5 (Elementary)</option>
          <option value="6-8 (Middle School)">Grade 6-8 (Middle)</option>
          <option value="9-12 (High School)">Grade 9-12 (High School)</option>
          <option value="College / Higher Ed">College / Professional</option>
        </select>

        {/* Audio Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Procedural Audio' : 'Mute Procedural Audio'}
          className="p-2 rounded-lg bg-neutral-900/90 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
        </button>

        {/* Reset Simulation */}
        <button
          onClick={onReset}
          title="Reset Simulation Positions"
          className="p-2 rounded-lg bg-neutral-900/90 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* WebXR VR Mode Button */}
        <button
          onClick={onEnterVR}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition active:scale-95"
        >
          <Glasses className="w-4 h-4" />
          <span>{isVRSupported ? 'Enter VR' : 'VR / Headset'}</span>
        </button>
      </div>
    </header>
  );
};
