import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_PRODUCT_IMAGE } from '../lib/cloudinary';

export interface HeroSlide {
  id: number;
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  ctaEn: string;
  ctaBn: string;
  image: string;
  fallbackImage: string;
  accentBg: string;
  categoryLink?: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    titleEn: "Premium Pigeon Feed & Grain Mix",
    titleBn: "কবুতরের সুস্বাস্থ্য, ব্রিডিং ও উড্ডয়নের বিশেষ খাবার!",
    descEn: "100% dust-free cleaned grains, racing super mixes, peas, corn & mineral grits.",
    descBn: "ধুলোবালিমুক্ত বাছাইকৃত ১২ পদের প্রিমিয়াম মিক্সড দানা, রেসিং সিড ও মিনারেল গ্রিট।",
    ctaEn: "Shop Pigeon Feed",
    ctaBn: "কবুতরের খাবার কিনুন",
    image: "https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&q=80&w=800",
    fallbackImage: "/uploads/tqw_1789295462226_r3t7o_1000008385_jpg.jpg",
    accentBg: "from-blue-950 via-slate-900 to-blue-900",
    categoryLink: "pigeons"
  },
  {
    id: 2,
    titleEn: "Healthy Diets for Happy Birds",
    titleBn: "পাখির সুস্বাস্থ্য ও প্রজননে পুষ্টিকর সিড মিক্স!",
    descEn: "Premium natural seed mixes for Budgerigar, Cockatiel, Parrots & Baby formulas.",
    descBn: "বাজরিগার, ককাটেল, লাভবার্ডের সেরা সিড মিক্স এবং হ্যান্ড ফিডিং বেবি ফর্মুলা।",
    ctaEn: "Shop Bird Seeds",
    ctaBn: "পাখির খাবার কিনুন",
    image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=800",
    fallbackImage: "/uploads/tqw_1789214333858_fwt5i_1000013587_jpg.jpg",
    accentBg: "from-blue-900 via-indigo-950 to-slate-900",
    categoryLink: "birds"
  },
  {
    id: 3,
    titleEn: "Veterinary Medicine & Avian Supplies",
    titleBn: "পাখি ও কবুতরের নির্ভরযোগ্য ঔষধ ও এক্সেসরিজ!",
    descEn: "Essential vitamins, dewormers, electrolytes, automatic feeders & breeding nests.",
    descBn: "প্রয়োজনীয় মাল্টিভিটামিন, কৃমিনাশক, স্যালাইন, অটোমেটিক ফিডার ও নেস্টিং বাটি।",
    ctaEn: "Explore Medicine & Supplies",
    ctaBn: "ঔষধ ও এক্সেসরিজ দেখুন",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800",
    fallbackImage: "/uploads/tqw_1789295462226_r3t7o_1000008385_jpg.jpg",
    accentBg: "from-slate-900 via-blue-950 to-blue-900",
    categoryLink: "medicine"
  }
];

interface HeroBannerProps {
  lang: 'en' | 'bn';
  currentSlide: number;
  setCurrentSlide: React.Dispatch<React.SetStateAction<number>>;
  onCtaClick?: (category?: string) => void;
  banners?: any[];
}

export default function HeroBanner({
  lang,
  currentSlide,
  setCurrentSlide,
  onCtaClick,
  banners = []
}: HeroBannerProps) {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [isPaused, setIsPaused] = useState(false);

  const activeSlides = banners.length > 0 ? banners : HERO_SLIDES;

  // Auto-slide every 5 seconds (paused when user hovers over banner)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, setCurrentSlide, activeSlides.length]);

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const handleCta = (slide: HeroSlide) => {
    if (onCtaClick) {
      onCtaClick(slide.categoryLink);
    } else {
      const feed = document.getElementById('main-product-feed');
      if (feed) {
        feed.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div 
      className="relative overflow-hidden rounded-2xl shadow-xs bg-slate-950 group min-h-[220px] sm:min-h-[260px] md:h-[320px] lg:h-[350px] border border-slate-800"
      id="homepage-hero-banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Container */}
      <div className="w-full h-full relative min-h-[220px] sm:min-h-[260px] md:h-[320px] lg:h-[350px]">
        {activeSlides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          const isFailed = imageErrors[idx];
          const displayImage = isFailed ? (slide.fallbackImage || DEFAULT_PRODUCT_IMAGE) : slide.image;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0 invisible'
              } flex items-center bg-gradient-to-r ${slide.accentBg} p-4 sm:p-6 md:p-8 lg:p-10 pb-9 sm:pb-9 md:pb-8`}
              aria-hidden={!isActive}
            >
              {/* Balanced 2-Column Layout */}
              <div className="w-full h-full flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 md:gap-8">
                
                {/* Left Column: Content & CTA */}
                <div className="flex-1 min-w-0 text-left z-10 w-full space-y-2 sm:space-y-3 flex flex-col justify-center">
                  
                  {/* Brand Badge */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-200 font-bold text-[10px] sm:text-xs tracking-wider uppercase px-2.5 py-0.5 sm:py-1 rounded-full border border-blue-400/30 backdrop-blur-xs">
                      <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-300 shrink-0" />
                      <span>{lang === 'bn' ? 'তাকওয়া এন্টারপ্রাইজ' : 'Taqwa Enterprise'}</span>
                    </span>
                  </div>

                  {/* Heading */}
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug sm:leading-tight">
                    {lang === 'bn' ? slide.titleBn : slide.titleEn}
                  </h2>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-200/90 font-medium leading-relaxed max-w-xl line-clamp-2">
                    {lang === 'bn' ? slide.descBn : slide.descEn}
                  </p>

                  {/* CTA Action Button */}
                  <div className="pt-0.5 sm:pt-1">
                    <button
                      type="button"
                      onClick={() => handleCta(slide)}
                      className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-lg inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <span>{lang === 'bn' ? slide.ctaBn : slide.ctaEn}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right Column: Visual Product Showcase */}
                <div className="hidden sm:block sm:w-5/12 md:w-5/12 lg:w-4/12 h-40 sm:h-48 md:h-56 shrink-0 z-10">
                  <div className="w-full h-full relative overflow-hidden rounded-xl border border-white/15 shadow-md bg-slate-900/50 flex items-center justify-center p-1.5">
                    <img
                      src={displayImage}
                      alt={lang === 'bn' ? 'তাকওয়া পণ্য' : 'Taqwa Showcase'}
                      onError={() => handleImageError(idx)}
                      className="w-full h-full object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Prev Navigation Chevron */}
      <button
        type="button"
        onClick={() => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-slate-950/50 hover:bg-slate-950/80 border border-white/15 text-white backdrop-blur-xs transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer z-20 shadow-xs"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Next Navigation Chevron */}
      <button
        type="button"
        onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)}
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-slate-950/50 hover:bg-slate-950/80 border border-white/15 text-white backdrop-blur-xs transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer z-20 shadow-xs"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-20">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === currentSlide ? 'w-6 bg-blue-500 shadow-2xs' : 'w-1.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
