import React from 'react';
import { Volume2, VolumeX, RotateCcw, Glasses, Layers, ChevronDown } from 'lucide-react';
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
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between h-14 px-4 sm:px-6 bg-[var(--color-surface)]/90 border-b border-[var(--color-hairline)] backdrop-blur-md pointer-events-auto select-none">
      {/* Brand & Studio Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-hairline-strong)] text-[var(--color-primary)]">
          <Layers className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className="text-[14px] font-semibold text-[var(--color-ink-strong)] tracking-[-0.01em]">
              Learno3D
            </span>
            <span className="text-[11px] font-mono font-medium text-[var(--color-primary)]">
              (Gemma Spatial XR)
            </span>
          </div>
          <h1 className="text-[12px] font-medium text-[var(--color-ink-subtle)] line-clamp-1">
            {currentLab.title}
          </h1>
        </div>
      </div>

      {/* Preset Lab Segmented Switcher (71UI 32px segmented tabs) */}
      <nav aria-label="Simulation Presets" className="hidden lg:flex items-center p-0.5 bg-[var(--color-canvas)] rounded-[10px] border border-[var(--color-hairline)]">
        {allLabs.map(lab => {
          const isActive = lab.id === currentLab.id;
          return (
            <button
              key={lab.id}
              onClick={() => onSelectLab(lab)}
              className={`h-7 px-3 text-[13px] font-medium rounded-[8px] btn-71 focus-71 transition-colors ${
                isActive
                  ? 'bg-[var(--color-surface-2)] text-[var(--color-ink-strong)] shadow-[var(--shadow-ring)]'
                  : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink-strong)] hover:bg-[var(--color-surface)]'
              }`}
            >
              {lab.title.split(' ')[0]} {lab.domain === 'physics' ? 'Gravity' : lab.domain === 'anatomy' ? 'Heart' : lab.domain === 'circuits' ? 'Circuit' : 'Jet Engine'}
            </button>
          );
        })}
      </nav>

      {/* Right Tool Group: Grade Level, Audio, Reset, VR */}
      <div className="flex items-center space-x-2">
        {/* Grade level dropdown (71UI 32px control) */}
        <div className="relative">
          <select
            value={gradeLevel}
            onChange={e => onGradeLevelChange(e.target.value as GradeLevel)}
            aria-label="Select student curriculum grade level"
            className="h-8 pl-3 pr-7 bg-[var(--color-surface-2)] border border-[var(--color-hairline-strong)] text-[var(--color-ink)] text-[13px] font-medium rounded-[10px] appearance-none focus-71 cursor-pointer transition-colors hover:border-[var(--color-control-border)]"
          >
            <option value="K-5 (Elementary)">Grades K–5 (Elementary)</option>
            <option value="6-8 (Middle School)">Grades 6–8 (Middle)</option>
            <option value="9-12 (High School)">Grades 9–12 (High)</option>
            <option value="College / Higher Ed">College / Research</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--color-ink-subtle)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Audio Toggle (71UI 32px icon button) */}
        <button
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute procedural sound effects' : 'Mute procedural sound effects'}
          title={isMuted ? 'Unmute audio' : 'Mute audio'}
          className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-[var(--color-surface-2)] border border-[var(--color-hairline)] text-[var(--color-ink)] hover:text-[var(--color-ink-strong)] hover:bg-[var(--color-surface)] btn-71 focus-71 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-[var(--color-on-danger)]" />
          ) : (
            <Volume2 className="w-4 h-4 text-[var(--color-primary)]" />
          )}
        </button>

        {/* Reset Simulation Positions */}
        <button
          onClick={onReset}
          aria-label="Reset simulation kinematic positions"
          title="Reset positions"
          className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-[var(--color-surface-2)] border border-[var(--color-hairline)] text-[var(--color-ink)] hover:text-[var(--color-ink-strong)] hover:bg-[var(--color-surface)] btn-71 focus-71 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* WebXR VR Mode Button (71UI 32px primary CTA) */}
        <button
          onClick={onEnterVR}
          className="flex items-center space-x-1.5 h-8 px-3 rounded-[10px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-[13px] font-medium btn-71 focus-71 shadow-[var(--shadow-sm)] transition-colors"
        >
          <Glasses className="w-3.5 h-3.5" />
          <span>{isVRSupported ? 'Enter VR' : 'VR Setup'}</span>
        </button>
      </div>
    </header>
  );
};
