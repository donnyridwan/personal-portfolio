import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { portfolioData } from '../data/portfolioData';

export default function ContactModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [message, setMessage] = useState('');
  const [senderEmail, setSenderEmail] = useState('');

  if (!isOpen) return null;

  const copyEmail = () => {
    navigator.clipboard.writeText(portfolioData.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    confetti({ particleCount: 50, spread: 50, colors: ['#000', '#555', '#ccc'] });
    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setMessage('');
      setSenderEmail('');
      onClose();
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md font-sans"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-[12px] max-w-[480px] w-full p-6 shadow-2xl border border-neutral-100 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-black transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
            <img src="./assets/envelope.svg" alt="" className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[18px] font-medium text-black">Get in Touch</h3>
            <p className="text-[13px] text-[#8a857d]">Direct message or copy email</p>
          </div>
        </div>

        {/* Quick Email Copy Box */}
        <div className="bg-[#f7f6f4] border border-[#edeae4] rounded-none p-3 flex items-center justify-between mb-5">
          <span className="text-[14px] font-mono text-neutral-800">{portfolioData.email}</span>
          <button
            onClick={copyEmail}
            className="text-xs bg-white border border-neutral-200 px-3 py-1.5 rounded-none hover:bg-neutral-50 transition-all font-medium text-black cursor-pointer active:scale-95"
          >
            {copied ? '✓ Copied!' : 'Copy Email'}
          </button>
        </div>

        {formSent ? (
          <div className="py-8 text-center text-emerald-600 font-medium text-[15px]">
            ✓ Message sent! Donny will respond shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-[12px] font-medium text-neutral-600 block mb-1">Your Email</label>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full border border-neutral-200 rounded-none px-3 py-2 text-[14px] focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-neutral-600 block mb-1">Message</label>
              <textarea
                required
                rows={3}
                placeholder="Tell me a bit about your project or inquiry..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-neutral-200 rounded-none px-3 py-2 text-[14px] focus:outline-none focus:border-black resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[14px] text-neutral-600 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-dark-glow px-5 py-2 rounded-none text-[14px] text-white font-medium"
              >
                Send Note
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
