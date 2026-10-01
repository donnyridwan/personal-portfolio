import React, { useState } from 'react';
import confetti from 'canvas-confetti';

export default function BookingModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState('New Product Design & Strategy');
  const [selectedDate, setSelectedDate] = useState('Today (Quick Intro)');
  const [selectedSlot, setSelectedSlot] = useState('03:30 PM - 03:45 PM');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
    setStep(2);
  };

  const handleReset = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-[16px] max-w-[500px] w-full p-6 shadow-2xl border border-neutral-100 relative">
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 text-neutral-400 hover:text-black transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === 1 ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                <img src="./assets/call-icon.png" alt="" className="w-5 h-4 object-contain" />
              </div>
              <div>
                <h3 className="text-[18px] font-medium text-black">Book a 15-Min Intro Call</h3>
                <p className="text-[13px] text-[#8a857d]">With Donny Ridwan S • Google Meet</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-medium text-neutral-600 block mb-1">
                  What would you like to discuss?
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full border border-neutral-200 rounded-[8px] px-3 py-2 text-[14px] text-black focus:outline-none focus:border-black"
                >
                  <option>New Product Design & Strategy</option>
                  <option>UI/UX Audit & Conversion Boost</option>
                  <option>Design System & Token Architecture</option>
                  <option>General Intro & Team Collab</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-medium text-neutral-600 block mb-1">Date</label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border border-neutral-200 rounded-[8px] px-3 py-2 text-[13px] text-black focus:outline-none focus:border-black"
                  >
                    <option>Today (Instant Intro)</option>
                    <option>Tomorrow</option>
                    <option>Friday, Oct 2</option>
                    <option>Monday, Oct 5</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-neutral-600 block mb-1">Time Slot (GMT+7)</label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full border border-neutral-200 rounded-[8px] px-3 py-2 text-[13px] text-black focus:outline-none focus:border-black"
                  >
                    <option>02:00 PM - 02:15 PM</option>
                    <option>03:30 PM - 03:45 PM</option>
                    <option>04:15 PM - 04:30 PM</option>
                    <option>07:00 PM - 07:15 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium text-neutral-600 block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Henderson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-neutral-200 rounded-[8px] px-3 py-2 text-[14px] text-black focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-neutral-600 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-neutral-200 rounded-[8px] px-3 py-2 text-[14px] text-black focus:outline-none focus:border-black"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-[14px] text-neutral-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-dark-glow px-5 py-2.5 rounded-[8px] text-[14px] text-white font-medium flex items-center gap-2"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xl">
              ✓
            </div>
            <h3 className="text-[20px] font-medium text-black">Meeting Confirmed!</h3>
            <p className="text-[14px] text-neutral-600 max-w-sm">
              Thanks {name || 'there'}! A Google Meet invitation has been prepared for <b>{selectedDate}</b> at <b>{selectedSlot}</b>.
            </p>
            <div className="mt-4 bg-neutral-50 border border-neutral-200 rounded-[8px] p-3 text-xs text-neutral-500 w-full text-left">
              Topic: {topic} <br />
              Organizer: Donny Ridwan S (donnyr65@gmail.com)
            </div>
            <button
              onClick={handleReset}
              className="mt-4 btn-dark-glow px-6 py-2.5 rounded-[8px] text-[14px] text-white"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
