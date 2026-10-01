import React, { useState, useRef, useEffect } from 'react';

export default function ChatView({ onClose, onBookCall }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'user',
      text: "Hey Mike, I came across your profile, your design work looks solid! Could you tell me more about the services you offer?",
      time: "2 Mins Ago",
    },
    {
      id: 2,
      sender: 'bot',
      text: "Hey! Thanks a lot, I appreciate that. I focus on product design, mainly UI/UX for web and mobile apps. I also help with user flow optimization, design systems, and clickable prototypes.",
      time: "2 Mins Ago",
    },
    {
      id: 3,
      sender: 'user',
      text: "What’s your usual process if we start a project?",
      time: "Just Now",
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messages.length > 3 || isTyping) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    setInputVal('');

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: 'Just Now',
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    // Contextual bot reply
    setTimeout(() => {
      let botReply = "Thanks for asking! I'm available for freelance projects and full design consultations. Let's set up a quick 15-minute call!";
      const lower = userText.toLowerCase();

      if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('harga') || lower.includes('biaya')) {
        botReply = "Rates vary based on scope, but project sprints start around $1,500 - $3,500 for full web apps / SaaS prototypes. Feel free to book a call for a tailored estimate!";
      } else if (lower.includes('tools') || lower.includes('software') || lower.includes('aplikasi') || lower.includes('figma')) {
        botReply = "I primarily use Figma for end-to-end design, along with tokens/component systems, and Webflow or React for high-performance frontend builds.";
      } else if (lower.includes('contact') || lower.includes('email') || lower.includes('hubungi')) {
        botReply = "You can reach Donny directly at donnyr65@gmail.com, or click the 'Book 15 Mins Call' button in the top right!";
      } else if (lower.includes('portfolio') || lower.includes('project') || lower.includes('kerjaan')) {
        botReply = "Check out the projects on the main grid (like EvalNow), showcasing SaaS workflows, educational platforms, and analytics systems.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botReply,
          time: 'Just Now',
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex-1 relative h-[calc(100vh-110px)] min-h-[560px] w-full flex items-center justify-center overflow-hidden rounded-[8px]">
      {/* Background with Figma blue wave artwork */}
      <div className="absolute inset-0 bg-[#e7eef0] overflow-hidden pointer-events-none rounded-[8px]">
        <img
          src="./assets/chat-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-110 filter blur-[8px]"
        />
        <div className="absolute inset-0 bg-white/20" />
      </div>

      {/* Floating Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white text-neutral-800 p-2 rounded-[8px] shadow-md backdrop-blur-sm transition-transform hover:scale-105"
        title="Back to Work"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Central Glassmorphic Chat Widget matching Figma 43:85720 with rounded-[8px] & vh height */}
      <div className="relative z-10 w-full max-w-[456px] px-4 py-4 flex flex-col items-center gap-3 h-full justify-center">
        <div className="w-full backdrop-blur-[16px] bg-white/40 p-[10px] rounded-[8px] shadow-[0px_20px_40px_rgba(0,0,0,0.12)] border border-white/60 flex flex-col h-[74vh] max-h-[620px]">
          <div className="chat-glass border border-white rounded-[8px] px-3.5 py-3.5 flex flex-col gap-3 h-full overflow-hidden">
            {/* Message Header */}
            <div className="flex flex-col items-center justify-center gap-1.5 pt-1 pb-2 border-b border-black/5 shrink-0">
              <div className="w-[46px] h-[46px] rounded-full overflow-hidden bg-neutral-200 border-2 border-white shadow-sm relative">
                <img
                  src="./assets/jhonny-avatar.png"
                  alt="Jhonny Helper"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-sans font-medium text-[15px] text-black tracking-[-0.16px]">
                  Jhonny Helper
                </h4>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1 w-full`}
                  >
                    <div
                      className={`relative px-3.5 py-2.5 rounded-[8px] max-w-[85%] text-[14px] leading-[1.4] font-sans ${
                        isUser
                          ? 'bg-gradient-to-b from-[#454545] to-[#1d1d1d] text-white shadow-sm'
                          : 'bg-white text-black border border-neutral-100 shadow-sm'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[11px] text-black/50 font-sans px-1">
                      {msg.time}
                    </span>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-[8px] w-fit border border-neutral-100 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form with rounded-[8px] */}
            <form
              onSubmit={handleSend}
              className="bg-white border border-white rounded-[8px] h-[42px] pl-3 pr-1.5 flex items-center gap-2 shadow-[0px_2px_4px_rgba(0,0,0,0.06)] shrink-0"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Send me message"
                className="flex-1 bg-transparent text-[14px] text-black placeholder:text-black/40 focus:outline-none font-sans"
              />
              <button
                type="submit"
                className="w-[30px] h-[30px] rounded-[6px] bg-gradient-to-b from-black to-[#444] border border-[#353535] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                title="Send"
              >
                <img
                  src="./assets/arrow-send.svg"
                  alt="Send"
                  className="w-[15px] h-[15px] object-contain"
                />
              </button>
            </form>
          </div>
        </div>

        {/* Caption below widget */}
        <p className="text-white text-[13px] leading-snug text-center font-sans drop-shadow-md">
          You can send me a message via this popup <br />
          and ask anything about my service.
        </p>

        {/* Quick action: Book a call link */}
        <button
          onClick={onBookCall}
          className="text-xs text-white/90 underline hover:text-white transition-colors"
        >
          Or click here to book a 15-minute call directly →
        </button>
      </div>
    </div>
  );
}
