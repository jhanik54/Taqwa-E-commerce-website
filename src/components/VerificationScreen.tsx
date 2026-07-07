import React, { useState, useEffect } from 'react';
import { Mail, ShieldAlert, RefreshCw, Send, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface VerificationScreenProps {
  lang: 'en' | 'bn';
}

export default function VerificationScreen({ lang }: VerificationScreenProps) {
  const { 
    firebaseUser, 
    sendVerification, 
    refreshVerificationStatus, 
    logout, 
    error, 
    success,
    clearMessages 
  } = useAuth();

  const [cooldown, setCooldown] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Clear messages on mount/unmount
  useEffect(() => {
    clearMessages();
    return () => clearMessages();
  }, []);

  // Cooldown timer for resending email
  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isSending) return;
    setIsSending(true);
    try {
      await sendVerification();
      setCooldown(60); // 60 seconds cooldown
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshVerificationStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-100 text-center animate-scale-up">
        {/* Shield Icon Accent */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-6 border border-amber-100 shadow-inner">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        {/* Heading */}
        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none mb-2">
          {lang === 'bn' ? 'ইমেইল ভেরিফিকেশন প্রয়োজন' : 'Email Verification Required'}
        </h2>
        
        <p className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-4">
          Taqwa Enterprise Security
        </p>

        {/* Message */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-150 text-left text-xs text-slate-600 space-y-2 font-medium">
          <p className="leading-relaxed">
            {lang === 'bn' 
              ? `আমরা আপনার ইমেইল ঠিকানা (${firebaseUser?.email}) এ একটি যাচাইকরণ লিঙ্ক পাঠিয়েছি। আপনার অ্যাকাউন্টটি সক্রিয় করতে অনুগ্রহ করে আপনার ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন এবং লিঙ্কে ক্লিক করুন।`
              : `We have sent a verification link to your email address (${firebaseUser?.email}). Please check your inbox or spam folder and click the link to activate your profile.`}
          </p>
          <div className="flex items-center space-x-2 text-emerald-600 font-bold bg-emerald-50/50 p-2 rounded-lg text-[11px]">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>
              {lang === 'bn' 
                ? 'এআই স্বয়ংক্রিয়ভাবে যাচাই করছে... (লিঙ্কে ক্লিক করলেই এই পাতা চলে যাবে)' 
                : 'AI auto-detecting verification status... (click link to enter)'}
            </span>
          </div>
        </div>

        {/* Display Success & Error Messages */}
        {error && (
          <div className="mb-4 bg-rose-50 text-rose-600 border border-rose-100 p-2.5 rounded-xl text-xs font-bold animate-fade-in text-left">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-emerald-50 text-emerald-600 border border-emerald-100 p-2.5 rounded-xl text-xs font-bold animate-fade-in text-left flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-3">
          {/* Check verification status manually */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>
              {lang === 'bn' ? 'যাচাইকরণ অবস্থা রিফ্রেশ করুন' : 'Verify & Continue Now'}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            {/* Resend button */}
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || isSending}
              className={`py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                cooldown > 0 || isSending
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 cursor-pointer'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {cooldown > 0 
                  ? `${cooldown}s` 
                  : (lang === 'bn' ? 'আবার পাঠান' : 'Resend Email')}
              </span>
            </button>

            {/* Logout button */}
            <button
              onClick={() => logout()}
              className="py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
