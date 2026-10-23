import React from 'react';
import { Glasses, X, Check, Laptop, HelpCircle } from 'lucide-react';

interface VRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWebXR: () => void;
  isWebXRSupported: boolean;
}

export const VRModal: React.FC<VRModalProps> = ({
  isOpen,
  onClose,
  onStartWebXR,
  isWebXRSupported,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vr-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[4px] pointer-events-auto"
    >
      {/* 71UI Modal Container (width 480px, 16px radius, 24px padding, 1px hairline border) */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-hairline-strong)] rounded-[16px] max-w-[480px] w-full p-6 shadow-[var(--shadow-md)] relative text-[var(--color-ink)]">
        {/* Close Button (71UI 28px icon control) */}
        <button
          onClick={onClose}
          aria-label="Close VR modal"
          className="absolute top-4 right-4 w-7 h-7 rounded-[8px] flex items-center justify-center text-[var(--color-ink-subtle)] hover:text-[var(--color-ink-strong)] hover:bg-[var(--color-surface-2)] btn-71 focus-71 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-hairline)] text-[var(--color-primary)] flex items-center justify-center">
            <Glasses className="w-4 h-4" />
          </div>
          <div>
            <h3 id="vr-modal-title" className="text-[16px] font-medium text-[var(--color-ink-strong)] tracking-[-0.01em]">
              WebXR & 3D Navigation Guide
            </h3>
            <p className="text-[12px] text-[var(--color-ink-subtle)]">Meta Quest, Apple Vision Pro, SteamVR, or Desktop</p>
          </div>
        </div>

        <div className="space-y-3 text-[13px]">
          {/* VR Headset Card */}
          <div className="bg-[var(--color-surface-2)] p-3.5 rounded-[12px] border border-[var(--color-hairline)] space-y-1.5">
            <h4 className="text-[13px] font-medium text-[var(--color-ink-strong)] flex items-center space-x-1.5">
              <Glasses className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>VR Headset Controls (WebXR)</span>
            </h4>
            <ul className="space-y-1 text-[12px] text-[var(--color-ink-subtle)]">
              <li className="flex items-start space-x-1.5">
                <span className="text-[var(--color-primary)] font-bold">•</span>
                <span><strong>Laser Pointer:</strong> Aim your controller at any 3D component to highlight.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-[var(--color-primary)] font-bold">•</span>
                <span><strong>Trigger:</strong> Click to inspect component parameters and ask Dr. Nova.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-[var(--color-primary)] font-bold">•</span>
                <span><strong>Thumbstick:</strong> Orbit, translate, or step closer to the experiment table.</span>
              </li>
            </ul>
          </div>

          {/* Desktop 6DOF Card */}
          <div className="bg-[var(--color-surface-2)] p-3.5 rounded-[12px] border border-[var(--color-hairline)] space-y-1.5">
            <h4 className="text-[13px] font-medium text-[var(--color-ink-strong)] flex items-center space-x-1.5">
              <Laptop className="w-3.5 h-3.5 text-[var(--color-ink-strong)]" />
              <span>Desktop / Laptop 6DOF Mode</span>
            </h4>
            <ul className="space-y-1 text-[12px] text-[var(--color-ink-subtle)]">
              <li className="flex items-start space-x-1.5">
                <span className="text-[var(--color-ink-subtle)] font-bold">•</span>
                <span><strong>Left Click + Drag:</strong> Orbit camera around the simulation.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-[var(--color-ink-subtle)] font-bold">•</span>
                <span><strong>Right Click + Drag:</strong> Pan camera horizontally and vertically.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-[var(--color-ink-subtle)] font-bold">•</span>
                <span><strong>Scroll Wheel:</strong> Smooth zoom in and out with physical damping.</span>
              </li>
            </ul>
          </div>

          {/* WebXR Hardware Detection Badge */}
          {isWebXRSupported ? (
            <div className="flex items-center space-x-2 p-2.5 rounded-[8px] bg-[var(--color-success-fill)] text-[var(--color-on-success)] text-[12px]">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>WebXR hardware device detected and ready for immersive launch.</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 p-2.5 rounded-[8px] bg-[var(--color-surface-2)] text-[var(--color-ink-subtle)] text-[12px] border border-[var(--color-hairline)]">
              <HelpCircle className="w-4 h-4 flex-shrink-0 text-[var(--color-primary)]" />
              <span>Desktop 3D mode active. Open in Meta Quest or Vision Pro browser for stereoscopic VR.</span>
            </div>
          )}
        </div>

        {/* Modal Action Buttons (71UI 32px controls, 10px radius) */}
        <div className="mt-5 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="h-8 px-3.5 rounded-[10px] bg-[var(--color-surface-2)] hover:bg-[var(--color-canvas)] text-[13px] font-medium text-[var(--color-ink)] border border-[var(--color-hairline-strong)] btn-71 focus-71 transition-colors"
          >
            Continue in Desktop 3D
          </button>
          {isWebXRSupported && (
            <button
              onClick={() => {
                onStartWebXR();
                onClose();
              }}
              className="h-8 px-3.5 rounded-[10px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[13px] font-medium text-white shadow-[var(--shadow-sm)] btn-71 focus-71 transition-colors"
            >
              Launch Immersive VR
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
