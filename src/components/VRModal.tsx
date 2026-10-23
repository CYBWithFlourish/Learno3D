import React from 'react';
import { Glasses, X, Check, Laptop, Smartphone, HelpCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-neutral-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Glasses className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold">Immersive WebXR & 3D Navigation</h3>
            <p className="text-xs text-neutral-400">Meta Quest, Apple Vision Pro, SteamVR, or Desktop 3D</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-neutral-300">
          <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800 space-y-2">
            <h4 className="font-semibold text-white flex items-center space-x-1.5">
              <Glasses className="w-4 h-4 text-sky-400" />
              <span>VR Headset Controls (WebXR)</span>
            </h4>
            <ul className="space-y-1.5 text-neutral-400">
              <li className="flex items-start space-x-2">
                <span className="text-sky-400 font-bold">•</span>
                <span><strong>Laser Pointer:</strong> Aim your controller at any 3D mesh (heart chamber, sphere, engine blade) to highlight.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-sky-400 font-bold">•</span>
                <span><strong>Trigger (Index Finger):</strong> Click to inspect and select components for Socratic analysis.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-sky-400 font-bold">•</span>
                <span><strong>Thumbstick:</strong> Orbit, translate, or step closer to the experiment table.</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800 space-y-2">
            <h4 className="font-semibold text-white flex items-center space-x-1.5">
              <Laptop className="w-4 h-4 text-purple-400" />
              <span>Desktop / Laptop 6DOF Mode</span>
            </h4>
            <ul className="space-y-1.5 text-neutral-400">
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">•</span>
                <span><strong>Left Click + Drag:</strong> Orbit camera around the simulation.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">•</span>
                <span><strong>Right Click + Drag:</strong> Pan camera horizontally and vertically.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">•</span>
                <span><strong>Scroll Wheel:</strong> Smooth zoom in/out with exponential damping.</span>
              </li>
            </ul>
          </div>

          {isWebXRSupported ? (
            <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>WebXR hardware session detected on your device!</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Running in high-performance Desktop 3D mode. Open this app inside the Meta Quest or Vision Pro browser to experience stereoscopic VR.</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 transition"
          >
            Continue in Desktop 3D
          </button>
          {isWebXRSupported && (
            <button
              onClick={() => {
                onStartWebXR();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow-md shadow-sky-600/30 transition"
            >
              Launch Immersive VR
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
