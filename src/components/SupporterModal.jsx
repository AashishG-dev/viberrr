import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coffee, Sparkles, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { isUserSupporter, setUserSupporter } from '../utils/formatters';

export default function SupporterModal({ isOpen, onClose }) {
  const [passcode, setPasscode] = useState('');
  const [isSupporter, setIsSupporter] = useState(isUserSupporter);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleUnlockCode = async (e) => {
    e.preventDefault();
    const clean = passcode.trim().toUpperCase();
    if (!clean) return;

    try {
      const msgBuffer = new TextEncoder().encode(clean);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      // Precomputed SHA-256 hashes of authorized supporter passcodes
      const VALID_HASHES = new Set([
        'c4598d1a1b1bfcb17f694e9f73f271295b9338b50f7572d4ecf01f016fcf7471', // VIBE2026
        '04e6c10972da5dc06b6a37f078d488bb6b3bbcd9b05de7fbf238f906f36bebe4', // VIBERR
        'd6006e864c2d3a39e802319ef4721a36aa9d6bcfbfe583be47ba1e0dd7a6f2cb', // THANKYOU
        '10b91e98d97e88b8fae7ea40d046fbf8c5d8063a563f1f10825316f1c42f0b78', // SUPPORTER2026
        'c7be3cb32d847c234a974b6ca50cfce8a6e87ff27d2c38cc0e6530dd6ec5b849', // VIBE
        '407ca2fbce7b235ad62bc17887340263ea8211516e8b4eefb74d6cff81813dc9'  // KAYI
      ]);

      if (VALID_HASHES.has(hashHex)) {
        setUserSupporter(true);
        setIsSupporter(true);
        setErrorMsg('');
        triggerConfetti();
      } else {
        setErrorMsg('Invalid VIP passcode. Try code: VIBERR or VIBE2026');
      }
    } catch (err) {
      setErrorMsg('Error verifying passcode.');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl pointer-events-auto transition-all"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md rounded-3xl glass-panel-neon border border-white/20 shadow-2xl p-6 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-syne text-white">Support Viberr</h3>
                <p className="text-xs font-mono text-white/50">[ 100% FREE COMMUNITY RADIO ]</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="glass-button p-2 rounded-full text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {isSupporter ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold font-syne text-white flex items-center justify-center gap-1.5">
                <span>VIP Supporter Active</span>
                <Sparkles className="w-4 h-4 text-amber-300 inline" />
              </h4>
              <p className="text-xs font-space text-neutral-300 leading-relaxed max-w-xs mx-auto">
                Thank you for powering Viberr. You have lifetime access to VIP neon themes and lossless streams.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  triggerConfetti();
                }}
                className="mt-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-xs font-mono font-bold text-white transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                [ CELEBRATE WITH CONFETTI ]
              </motion.button>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="text-xs sm:text-sm font-space text-neutral-300 leading-relaxed">
                Viberr is an aesthetic cyberpunk open web radio built for everyone to relax, study, and groove with zero subscription paywalls.
              </p>

              {/* Quick Unlock Passcode */}
              <form onSubmit={handleUnlockCode} className="space-y-2 pt-2">
                <label className="text-xs font-mono font-bold text-white/80 block">
                  ENTER VIP PASSCODE
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. VIBERR)"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="flex-1 bg-white/10 text-white placeholder-white/40 text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-amber-300/50 border border-white/15 uppercase font-mono"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-black transition-all shadow-lg cursor-pointer"
                  >
                    UNLOCK
                  </motion.button>
                </div>
                {errorMsg && (
                  <p className="text-[11px] text-red-400 font-mono font-medium">{errorMsg}</p>
                )}
              </form>

              <div className="pt-2 border-t border-white/10 text-center">
                <p className="text-[11px] font-mono text-white/45">
                  [ Community passcodes: <span className="text-amber-300">VIBERR</span> or <span className="text-amber-300">THANKYOU</span> ]
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
