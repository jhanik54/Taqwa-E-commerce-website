import React from 'react';
import { ShieldAlert, Phone, Mail, Clock, Lock } from 'lucide-react';

interface MaintenanceScreenProps {
  lang: 'en' | 'bn';
  onAdminLoginClick: () => void;
  supportPhone?: string;
  supportEmail?: string;
}

export default function MaintenanceScreen({
  lang,
  onAdminLoginClick,
  supportPhone = '01913955452',
  supportEmail = 'taqwaenterpriseoffice@gmail.com'
}: MaintenanceScreenProps) {
  const isBn = lang === 'bn';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 sm:p-12 animate-fade-in" id="maintenance-overlay-screen">
      
      {/* Decorative top spacer or header */}
      <div className="flex justify-between items-center max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-black">
            ⏳
          </div>
          <span className="font-extrabold text-xs tracking-widest text-slate-400">TAQWA SECURE</span>
        </div>
        <button
          onClick={onAdminLoginClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-[10px] font-black text-slate-500 hover:text-slate-800 transition-all cursor-pointer shadow-xs"
        >
          <Lock className="w-3 h-3 text-slate-400" />
          <span>{isBn ? 'অ্যাডমিন প্রবেশ' : 'Staff Access'}</span>
        </button>
      </div>

      {/* Main Announcement Card */}
      <div className="max-w-xl w-full mx-auto my-auto text-center space-y-8 py-12">
        <div className="w-20 h-20 bg-amber-50 border border-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-md animate-bounce">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-extrabold uppercase bg-amber-100/65 border border-amber-200 text-amber-800 px-3 py-1 rounded-full tracking-wider">
            ⚙️ {isBn ? 'রক্ষণাবেক্ষণ চলছে' : 'SYSTEM RECONSTRUCTION ACTIVE'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight pt-2">
            {isBn 
              ? 'স্টোর সাময়িকভাবে বন্ধ রয়েছে' 
              : 'Our Store is Temporarily Undergoing Maintenance'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed max-w-md mx-auto">
            {isBn 
              ? 'সম্মানিত গ্রাহক, তাকওয়া এন্টারপ্রাইজ ওয়েবসাইটকে আরও উন্নত ও গতিশীল করার জন্য আমাদের সিস্টেমে জরুরি আপগ্রেড চলছে। খুব দ্রুত আমরা লাইভ ফিরে আসছি।' 
              : 'Dear valued buyer, we are conducting a scheduled core infrastructure upgrade to bring you a faster and more secure shopping experience. We will be back online shortly.'}
          </p>
        </div>

        {/* Support Alert banner */}
        <div className="p-4 bg-amber-50/40 border border-amber-100/50 rounded-2xl max-w-sm mx-auto text-left space-y-2 text-[11px] leading-relaxed font-bold text-slate-600">
          <p className="text-amber-850 font-black flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{isBn ? 'আপনার অর্ডারের নিরাপত্তা নিশ্চয়তা:' : 'Your Active Orders are 100% Safe:'}</span>
          </p>
          <p className="text-slate-500 font-semibold">
            {isBn 
              ? 'আপনার পূর্বে কৃত সকল অর্ডার ও পেমেন্ট সম্পূর্ণ নিরাপদ রয়েছে। নির্ধারিত সময়েই কুরিয়ারে পণ্য ডেলিভারি সম্পন্ন হবে।' 
              : 'Rest assured, all processing and pending orders are fully cataloged. Parcel courier dispatch will take place on schedule without interruption.'}
          </p>
        </div>

        {/* Contact/Support hotlines */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-xs font-bold text-slate-500 pt-2 select-all">
          <div className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
            <Phone className="w-4 h-4 text-slate-400" />
            <span>{supportPhone}</span>
          </div>
          <span className="hidden sm:inline text-slate-300">|</span>
          <div className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>{supportEmail}</span>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[10px] text-slate-400 font-semibold max-w-4xl w-full mx-auto border-t border-slate-100 pt-4">
        © {new Date().getFullYear()} Taqwa Enterprise. {isBn ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All Rights Reserved.'}
      </div>

    </div>
  );
}
