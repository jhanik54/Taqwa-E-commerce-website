import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Smile } from 'lucide-react';
import { ChatMessage } from '../types';

interface LiveChatProps {
  lang: 'en' | 'bn';
  onSendMessage: (prompt: string, history: ChatMessage[]) => Promise<string>;
}

export default function LiveChat({ lang, onSendMessage }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'assistant',
      text: lang === 'bn' 
        ? 'আসসালামু আলাইকুম! তাকওয়া এন্টারপ্রাইজ কাস্টমার কেয়ারে স্বাগতম। আমি আপনার পোষা পাখির খাদ্য, বিড়ালের ড্রাইভ ফুড, বা কুরিয়ার ডেলিভারি সংক্রান্ত যেকোনো জটিলতায় সাহায্য করতে প্রস্তুত।' 
        : 'Welcome to Taqwa Enterprise! Ask me any questions regarding bird seeds, cat nutrition, secure bKash payment or delivery. I represent Taqwa AI Customer Service.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleMessageSubmit = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}-usr`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Proxying conversation safely to server-side Gemini API
      const reply = await onSendMessage(textToSend, messages);
      const assistantMsg: ChatMessage = {
        id: `m-${Date.now()}-ast`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const assistantMsg: ChatMessage = {
        id: `m-${Date.now()}-err`,
        sender: 'assistant',
        text: lang === 'bn' ? 'দুঃখিত, কানেকশন ত্রুটি হয়েছে। আবার চেষ্টা করুন।' : 'Apologies, communication glitch occurred. Retry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Quick Prompt chips
  const chips = lang === 'bn' 
    ? [
        'ডেলিভারি চার্জ কত?',
        'বিকাশ পেমেন্ট করব কীভাবে?',
        'সবচেয়ে ভালো পাখি মিক্স কোনটি?',
        'বিড়ালের খাবার কি কি পাওয়া যায়?'
      ]
    : [
        'How much is delivery fee?',
        'How to pay using bKash?',
        'Recommend best bird seed mix',
        'Which dry kitten food is high protein?'
      ];

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 flex flex-col items-end" id="support-live-chat-bubble">
      
      {/* 1. Floating round bubble - 40% more compact, subtle float animation */}
      {!isOpen && (
        <button
          id="chat-bubble-trigger"
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-115 flex items-center justify-center cursor-pointer group relative animate-[bounce_4s_infinite] hover:animate-none"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 w-2.5 h-2.5 rounded-full ring-2 ring-white"></span>
          {/* Smart Tooltip hover */}
          <div className="absolute right-12 bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
            {lang === 'bn' ? 'তাকওয়া লাইভ চ্যাট সাপোর্ট' : 'Taqwa 24/7 AI Chat Support'}
          </div>
        </button>
      )}

      {/* 2. Chat Conversation Box */}
      {isOpen && (
        <div 
          className="bg-white rounded-3xl shadow-2xl w-[90vw] sm:w-[380px] h-[500px] flex flex-col border border-gray-150 overflow-hidden animate-fade-in"
          id={`active-chat-box`}
        >
          {/* Header */}
          <div className="bg-emerald-700 px-4 py-3.5 flex items-center justify-between text-white">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center shadow-inner relative">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-emerald-700 rounded-full"></span>
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wide flex items-center gap-1">
                  {lang === 'bn' ? 'তাকওয়া এআই অ্যাসিস্ট্যান্ট' : 'Taqwa Smart Shop Advisor'}
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                </h3>
                <p className="text-[10px] text-emerald-100 font-medium">
                  {lang === 'bn' ? 'লাইভ অনলাইন সহায়তা।' : 'Online 24/7 Support Agent'}
                </p>
              </div>
            </div>
            
            <button
              id="close-chat-box"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-emerald-800 rounded-lg text-emerald-100 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Logs Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-3.5">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Visual Avatar */}
                <div className={`w-7- h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                }`}>
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Message Bubble text content */}
                <div className="space-y-1">
                  <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-150'
                  }`}>
                    {msg.text}
                  </div>
                  <p className={`text-[9px] font-mono text-gray-400 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 bg-white text-gray-400 rounded-2xl rounded-tl-none border border-gray-150 text-xs flex items-center space-x-1.5 font-medium animate-pulse">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce."></span>
                  <span>{lang === 'bn' ? 'তাকওয়া এআই লিখছে...' : 'Taqwa Assistant is typing...'}</span>
                </div>
              </div>
            )}
            <div ref={scrollRef}></div>
          </div>

          {/* Quick Prompt Suggester Chips */}
          <div className="px-3.5 py-2.5 border-t border-gray-100 bg-white/85 flex gap-1.5 overflow-x-auto pr-1">
            {chips.map((chipText, idx) => (
              <button
                key={idx}
                id={`chat-chip-${idx}`}
                onClick={() => handleMessageSubmit(chipText)}
                className="text-[10px] font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100/60 px-2.5 py-1.5 rounded-full whitespace-nowrap cursor-pointer shrink-0 transition-colors"
                title={`Ask: ${chipText}`}
              >
                {chipText}
              </button>
            ))}
          </div>

          {/* Prompt Entry Box */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleMessageSubmit(inputText);
            }} 
            className="p-3 bg-white border-t border-gray-150 flex items-center gap-2"
          >
            <input
              id="chat-text-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={lang === 'bn' ? 'আপনার মেসেজ লিখুন...' : 'Type message here...'}
              className="flex-1 text-xs px-3 py-2.5 bg-gray-50 border border-gray-250 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white text-gray-700 font-semibold"
            />
            <button
              id="send-chat-btn"
              type="submit"
              disabled={!inputText.trim()}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                inputText.trim() 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
