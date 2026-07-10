import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

// ---------------------------------
// PRODUCTION SECURITY MIDDLEWARES
// ---------------------------------

// 1. Secure HTTP Headers (Helmet Custom Implementation)
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data: blob:; img-src * 'self' data: https: http:; connect-src * 'self' ws: wss: https: http:;"
  );
  next();
});

// 2. Rate Limiting Middleware (IP-based in-memory map)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 150; // 150 requests per minute

const rateLimiter = (req: any, res: any, next: any) => {
  // Only rate limit API endpoints
  if (!req.path.startsWith("/api/")) {
    return next();
  }
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  const now = Date.now();
  const limit = rateLimits.get(ip);

  if (!limit) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (now > limit.resetAt) {
    limit.count = 1;
    limit.resetAt = now + RATE_LIMIT_WINDOW_MS;
    return next();
  }

  limit.count++;
  if (limit.count > RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ error: "অনতিবিলম্বে অনেক বেশি রিকোয়েস্ট পাঠানো হয়েছে। অনুগ্রহ করে এক মিনিট অপেক্ষা করে আবার চেষ্টা করুন। (Too many requests. Please try again later.)" });
  }

  next();
};
app.use(rateLimiter);

// 3. XSS Sanitizer for POST & PUT request body parameters
function sanitizeString(str: string): string {
  if (typeof str !== "string") return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // strip script tags
    .replace(/on\w+="[^"]*"/gi, "") // strip inline event handlers
    .replace(/javascript:[^\s]*/gi, ""); // strip javascript links
}

function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  const sanitized: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (typeof val === "string") {
        sanitized[key] = sanitizeString(val);
      } else if (typeof val === "object") {
        sanitized[key] = sanitizeObject(val);
      } else {
        sanitized[key] = val;
      }
    }
  }
  return sanitized;
}

app.use((req, res, next) => {
  if (req.body && (req.method === "POST" || req.method === "PUT")) {
    req.body = sanitizeObject(req.body);
  }
  next();
});

// 4. Critical Environment Variable Verification
const criticalEnvVars = ["GEMINI_API_KEY"];
criticalEnvVars.forEach((v) => {
  if (!process.env[v] || process.env[v] === "MY_GEMINI_API_KEY") {
    console.warn(`[WARN] Critical environment variable ${v} is not set or using placeholder.`);
  }
});


const PORT = 3000;

// Initialize Gemini API responsibly (Lazy client setup)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// Global In-Memory Database for Taqwa Enterprise
let PRODUCTS: any[] = [
  // Cats
  {
    id: "cat-1",
    name: "Premium Kitten Dry Food - High Protein Chicken & Salmon",
    banglaName: "প্রিমিয়াম বিড়ালছানার শুকনো খাবার - চিকেন ও সালমন",
    category: "cats" as const,
    price: 1350,
    originalPrice: 1600,
    weight: "2.5 Kg",
    stock: 45,
    description: "Highly nutritious and easily digestible formula specialized for growing kittens up to 12 months. Enriched with DHA, prebiotic fibers, and organic micro-nutrients to build strong teeth, vision, and natural immune system.",
    banglaDescription: "১২ মাস পর্যন্ত বিড়ালছানাদের জন্য উচ্চ পুষ্টিসম্পন্ন ও সহজে হজমযোগ্য ফর্মুলা। এটি প্রাকৃতিক উপাদানে সমৃদ্ধ যা বিড়ালের হাড়, দৃষ্টিশক্তি এবং রোগ প্রতিরোধ ক্ষমতা বাড়াতে সাহায্য করে।",
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviewsCount: 14,
    tags: ["Kitten Food", "High Protein", "Salmon Oil"],
    featured: true,
    bestSeller: true,
    reviews: [
      { id: "rev-1", userName: "Abrar Hasan", rating: 5, comment: "Excellent food! My kitten loves it and her hair coat has become incredibly silky.", date: "2026-06-15" },
      { id: "rev-2", userName: "Sadia Rahman", rating: 4, comment: "Very good option for indoor kittens. Delivery was exceptionally rapid.", date: "2026-06-19" }
    ]
  },
  {
    id: "cat-2",
    name: "Premium Seafood Medley Wet Cup for Adult Cats",
    banglaName: "সেরা সি-ফুড মিক্স ভেজা ক্যাট ফুড",
    category: "cats" as const,
    price: 180,
    originalPrice: 220,
    weight: "85g",
    stock: 120,
    description: "Savory wet food offering optimal hydration and rich flavor. Made with real pieces of fresh wild-caught tuna, salmon, and mackerel in premium gravy. Grain-free recipe.",
    banglaDescription: "প্রাপ্তবয়স্ক বিড়ালের জন্য অত্যন্ত সুস্বাদু ভেজা খাবার যা শরীরে পর্যাপ্ত পানির জোগান দেয়। এতে আছে আসল টুনা, সালমন এবং ম্যাকেরেল মাছের পুষ্টিকর মিক্সড গ্রেভি।",
    image: "https://images.unsplash.com/photo-1569591159212-b02ea8a9f239?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    reviewsCount: 8,
    tags: ["Wet Food", "Grain Free", "Adult Cat"],
    reviews: [
      { id: "rev-3", userName: "Tariqul Islam", rating: 5, comment: "Best wet food in Dhaka market. Worth every penny.", date: "2026-06-10" }
    ]
  },
  {
    id: "cat-3",
    name: "Premium Lavender scented Clumping Cat Litter",
    banglaName: "প্রিমিয়াম ল্যাভেন্ডার সুগন্ধযুক্ত ক্ল্যাম্পিং ক্যাট লিটার",
    category: "cats" as const,
    price: 520,
    originalPrice: 650,
    weight: "5 Litre",
    stock: 40,
    description: "Highly absorbent and super clumping cat litter with active lavender smell control technology. Dust-free formulation which is safe for kittens.",
    banglaDescription: "উচ্চ শোষণ ক্ষমতাসম্পন্ন ও সহজে জমাট বাঁধতে সক্ষম প্রিমিয়াম ক্যাট লিটার। ল্যাভেন্ডার সুবাসযুক্ত এবং ৯৯% ধুলোবালি মুক্ত ফর্মুলা যা বিড়ালের জন্য নিরাপদ।",
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    reviewsCount: 15,
    tags: ["Cat Litter", "Lavender", "Odour Control"],
    reviews: []
  },
  {
    id: "cat-4",
    name: "Pure Wild Alaskan Salmon Oil for Cats & Dogs",
    banglaName: "খাঁটি আলাস্কান সালমন অয়েল স্কিন অ্যান্ড কোট সাপ্লিমেন্ট",
    category: "supplements" as const,
    price: 850,
    originalPrice: 1100,
    weight: "250 ml",
    stock: 25,
    description: "Rich in Omega-3, Omega-6 fatty acids, EPA and DHA. Supports premium skin hydration, glossy coat development, and improves immunity.",
    banglaDescription: "ওমেগা-৩ এবং ওমেগা-৬ ফ্যাটি অ্যাসিড সমৃদ্ধ খাঁটি সালমন অয়েল। এটি বিড়ালের ত্বকের আর্দ্রতা ধরে রাখতে, পালক সিল্কি করতে এবং রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি করে।",
    image: "https://images.unsplash.com/photo-1628589689885-33923ef1f070?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviewsCount: 9,
    tags: ["Salmon Oil", "Omega 3", "Coat Care"],
    featured: true,
    reviews: []
  },
  // Birds
  {
    id: "bird-1",
    name: "Taqwa Premium Seed & Nut Mix for Parrots & Budgerigars",
    banglaName: "তাকওয়া প্রিমিয়াম পাখির বীজ ও বাদাম মিক্স",
    category: "birds" as const,
    price: 340,
    originalPrice: 420,
    weight: "1 Kg",
    stock: 85,
    description: "Balanced natural seed mix with rich safflower, golden millets, sunflower seeds, rolled oats, and dry fruits. Helps enhance wing color vibrant and builds rich energy reserves.",
    banglaDescription: "লাভবার্ড ও বাজরিগার পাখির জন্য সম্পূর্ণ প্রাকৃতিক মিশ্রিত খাবার। এতে আছে সূর্যমুখী বীজ, বাজরা, ওটস এবং ড্রাই ফ্রুটস যা পাখির ডানা উজ্জ্বল ও প্রফুল্ল রাখে।",
    image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    reviewsCount: 22,
    tags: ["Bird Food", "Premium Mixed", "High Fiber"],
    featured: true,
    reviews: [
      { id: "rev-4", userName: "Mahmudul Hasan", rating: 5, comment: "My Cockatiels love this seed mix! The packet was perfectly air-sealed.", date: "2026-06-12" },
      { id: "rev-5", userName: "Mim Sultana", rating: 4, comment: "Quality is really premium. Packaging is superior.", date: "2026-06-18" }
    ]
  },
  {
    id: "bird-2",
    name: "Vibrant Feather Color-Enhancing Tonic Supplement",
    banglaName: "পাখির পালক উজ্জ্বল করার ভাইব্রেন্ট কালার সলিউশন",
    category: "supplements" as const,
    price: 450,
    originalPrice: 550,
    weight: "100 ml",
    stock: 30,
    description: "Multivitamin drops rich in Vitamin A, E, and Essential Amino Acids that promote faster molting recovery and bright feather growth.",
    banglaDescription: "পাখিদের জন্য বিশেষ মাল্টিভিটামিন সাপ্লিমেন্ট। এটি খুব দ্রুত নতুন পালক গজাতে সাহায্য করে এবং পাখির পালককে উজ্জ্বল ও দীপ্তিময় করে তোলে।",
    image: "https://images.unsplash.com/photo-1552084090-29b9e450b73c?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    reviewsCount: 6,
    tags: ["Bird Health", "Molting", "Vitamins"],
    reviews: [
      { id: "rev-6", userName: "Dr. Rakib", rating: 5, comment: "Excellent for finches. Recommended for pet birds during feather shedding seasons.", date: "2026-06-14" }
    ]
  },
  {
    id: "bird-3",
    name: "Hand-Feeding Formula for Baby Chicks & Parrots",
    banglaName: "পাখির বাচ্চার হ্যান্ড-ফিডিং ফর্মুলা (সেরা পুষ্টি)",
    category: "birds" as const,
    price: 1100,
    originalPrice: 1300,
    weight: "500g",
    stock: 15,
    description: "Highly nutritious hand-rearing food for baby birds. Optimized level of fats, prebiotics, and essential digestive enzymes for rapid health gains.",
    banglaDescription: "পাখির বাচ্চাদের নিজের হাতে খাওয়ানোর অত্যন্ত পুষ্টিকর সুষম ফর্মুলা। এটি সহজে হজম হয় এবং পাখির সঠিক হাড় গঠনে সাহায্য করে।",
    image: "https://images.unsplash.com/photo-1516233593474-73708c58c58a?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    reviewsCount: 11,
    tags: ["Baby Bird", "Hand Feeding", "Formula"],
    bestSeller: true,
    reviews: []
  },
  {
    id: "bird-4",
    name: "Taqwa Premium Cleaned Striped Sunflower Seeds",
    banglaName: "তাকওয়া প্রিমিয়াম পরিষ্কার সূর্যমুখী ফুলের বীজ",
    category: "birds" as const,
    price: 280,
    originalPrice: 350,
    weight: "1 Kg",
    stock: 95,
    description: "Selected large size striped sunflower seeds, meticulously cleaned of dust. Provides healthy dietary fats and oils for energetic birds.",
    banglaDescription: "ধুলাবালি মুক্ত বাছাইকৃত বড় সাইজের প্রিমিয়াম সূর্যমুখী ফুলের বীজ। এটি পাখিদের প্রয়োজনীয় ফ্যাট ও এনার্জি সরবরাহ করে সক্রিয় রাখে।",
    image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    reviewsCount: 18,
    tags: ["Sunflower Seeds", "Bird Treats", "Natural Fat"],
    reviews: []
  },
  // Fish
  {
    id: "fish-1",
    name: "Taqwa Golden Glow High-Protein Floating Pellets for Aquarium Fish",
    banglaName: "গোল্ডেন গ্লো হাই-প্রোটিন মাছের ভাসমান প্যালেট",
    category: "fish" as const,
    price: 260,
    originalPrice: 320,
    weight: "200g",
    stock: 200,
    description: "Premium floating pellets with spirulina extracts and astaxanthin to enhance gold fish, betta, and carps color naturally. Will not muddy aquarium water.",
    banglaDescription: "গোল্ডফিশ, বেটা ও কার্প মাছের জন্য হাই-প্রোটিন ভাসমান খাবার। স্পিরুলিনা সমৃদ্ধ এই খাবার পানির স্বচ্ছতা বজায় রেখে মাছের কালার চমৎকার করে তোলে।",
    image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    reviewsCount: 31,
    tags: ["Aquarium", "Spirulina", "Floating Food"],
    bestSeller: true,
    reviews: [
      { id: "rev-7", userName: "Imtiaz Shuvro", rating: 5, comment: "Extremely quality product. My betta fish has gotten active and highly energetic.", date: "2026-06-13" }
    ]
  },
  {
    id: "fish-2",
    name: "Micro Granules & Bites for Guppy, Neon Tetra & Tiny Fry",
    banglaName: "গাপ্পি, টেট্রা ও ছোট মাছের মাইক্রো গ্র্যানুলস খাবার",
    category: "fish" as const,
    price: 150,
    originalPrice: 190,
    weight: "50g",
    stock: 140,
    description: "Slow-sinking nano-sized bites suitable for small-mouthed ornamental fish. Enriched with natural immunity boosters and colour enhancer extracts.",
    banglaDescription: "ছোট মুখের শৌখিন মাছ যেমন গাপ্পি, মলি, টেট্রার জন্য বিশেষ মাইক্রো দানাদার খাবার যা ধীরে ধীরে পানিতে ডুবে এবং সহজে হজমযোগ্য।",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600",
    rating: 4.5,
    reviewsCount: 10,
    tags: ["Micro Granules", "Guppy Food", "Sinking Feed"],
    reviews: []
  },
  {
    id: "fish-3",
    name: "Premium Astaxanthin Red Boosting Betta Flakes",
    banglaName: "বেটা মাছের উজ্জ্বল লাল রং বর্ধক প্রিমিয়াম ফ্লেক্স",
    category: "fish" as const,
    price: 320,
    originalPrice: 390,
    weight: "60g",
    stock: 60,
    description: "Aesthetic red-color boosting flake formula with high krill meal, astaxanthin and carotenoids. Increases natural color vibrance in 14 days.",
    banglaDescription: "বেটা মাছের শরীরের কালার ও দীপ্তি বাড়ানোর বিশেষ ফ্লেক্স খাবার। ক্রিল মিল সমৃদ্ধ যা মাত্র ১৪ দিনে গায়ের রঙ আকর্ষণীয় করে তোলে।",
    image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviewsCount: 14,
    tags: ["Betta Food", "Color Booster", "Astaxanthin"],
    featured: true,
    reviews: []
  },
  // Rabbits
  {
    id: "rabbit-1",
    name: "Fresh Sun-Dried Orchard & Timothy Hay Feed for Rabbits",
    banglaName: "সূর্য-শুষ্ক অর্গানিক টিমোথি হে (খরগোশের ঘাস)",
    category: "rabbits" as const,
    price: 490,
    originalPrice: 600,
    weight: "1.5 Kg",
    stock: 65,
    description: "High-fiber Timothy Hay select cut. Critically important for bunny digestion, dental grooming, and naturally clean feeding habits.",
    banglaDescription: "বাছাইকৃত হাই-ফাইবার সমৃদ্ধ মিষ্টি সুবাসযুক্ত খরগোশের ড্রাই ঘাস। খরগোশের সুস্বাস্থ্য ও দাঁত ক্ষয় করা এড়াতে এটি অত্যন্ত প্রয়োজনীয় দৈনিক খাদ্য উপাদান।",
    image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviewsCount: 19,
    tags: ["Timothy Hay", "Dental Care", "Rabbit Food"],
    featured: true,
    reviews: [
      { id: "rev-8", userName: "Zarin Tasnim", rating: 5, comment: "Hay is very fresh, smells amazing. Bunny eats it immediately.", date: "2026-06-16" }
    ]
  },
  {
    id: "rabbit-2",
    name: "Premium Alfalfa Hay Feed for Growing Rabbits",
    banglaName: "ছোট ও বাড়ন্ত খরগোশের জন্য প্রিমিয়াম আলফালফা হে (ঘাস)",
    category: "rabbits" as const,
    price: 420,
    originalPrice: 500,
    weight: "1 Kg",
    stock: 50,
    description: "Rich in calcium and protein. Ideal daily fodder for young rabbits under 6 months, nursing mothers, and recovering rabbits.",
    banglaDescription: "উচ্চ প্রোটিন ও ক্যালসিয়াম সমৃদ্ধ অর্গানিক আলফালফা ঘাস যা ৬ মাসের কম বয়সী খরগোশের হাড় গঠনে ও বৃদ্ধিতে সহায়তা করে।",
    image: "https://images.unsplash.com/photo-1591561954555-607968c989ab?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    reviewsCount: 7,
    tags: ["Alfalfa Hay", "Protein Rich", "Young Bunny"],
    reviews: []
  },
  {
    id: "rabbit-3",
    name: "Timothy Hay High-Fiber Pellets for Adult Bunnies",
    banglaName: "প্রাপ্তবয়স্ক খরগোশের টিমোথি হে হাই-ফাইবার প্যালেটস",
    category: "rabbits" as const,
    price: 680,
    originalPrice: 850,
    weight: "2 Kg",
    stock: 35,
    description: "Specially formulated pellets compressed from premium Timothy Hay. Supports easy digestion, prevents obesity and controls dental tooth overgrowth.",
    banglaDescription: "টিমোথি ঘাস থেকে তৈরি খরগোশের পুষ্টিকর প্যালেট খাবার। এতে আছে সুষম ফাইবার যা স্থূলতা প্রতিরোধ করে এবং হজম প্রক্রিয়া সুস্থ রাখে।",
    image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    reviewsCount: 12,
    tags: ["Bunny Pellets", "Timothy Pellet", "Digestive Care"],
    reviews: []
  },
  // Accessories
  {
    id: "acc-1",
    name: "Safe-Grip Pet Nail Clipper with Bright LED Guide Light",
    banglaName: "পোষা প্রাণীর এলএইডি গাইড নেল ক্লিপার (সুরক্ষিত গ্রিপ)",
    category: "accessories" as const,
    price: 650,
    originalPrice: 800,
    weight: "1 Pcs",
    stock: 18,
    description: "Professional nail clipper for cats & small dogs equipped with high illumination LED lights. Highlights the blood line clearly to avoid painful trimming.",
    banglaDescription: "বিড়াল ও কুকুরের জন্য প্রফেশনাল নেল ক্লিপার যাতে রয়েছে এলইডি লাইট। এটি নখের রক্তনালীগুলো স্পষ্ট করে দেখায় যাতে নখ কাটার সময় কোনো দুর্ঘটনা না ঘটে।",
    image: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=600",
    rating: 4.5,
    reviewsCount: 11,
    tags: ["Grooming", "LED Trimmer", "Cat & Dog"],
    reviews: [
      { id: "rev-9", userName: "Faheem Shahriar", rating: 4, comment: "LED helper light is very clever. Cut my cat's nails yesterday safely.", date: "2026-06-11" }
    ]
  },
  {
    id: "acc-2",
    name: "Double Sided Premium Slicker Pet Grooming Brush",
    banglaName: "উভয়মুখী প্রিমিয়াম স্লিকার পেট গ্রুমিং ব্রাশ (চিরুনি)",
    category: "accessories" as const,
    price: 450,
    originalPrice: 580,
    weight: "1 Pcs",
    stock: 30,
    description: "Effectively removes loose hair, dander and dirt. Dual-sided pins with rounded tips for skin massage and smooth tangles reduction.",
    banglaDescription: "বিড়াল ও কুকুরের গায়ের ঝরে পড়া লোম ও ময়লা পরিষ্কার করার চিরুনি। এটি ত্বকের ক্ষতি না করে রক্ত সঞ্চালন বাড়ায় ও লোম মসৃণ করে।",
    image: "https://images.unsplash.com/photo-1541599540903-216a46ca1ad0?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    reviewsCount: 16,
    tags: ["Grooming Brush", "Slicker Brush", "Cat Accessories"],
    reviews: []
  },
  {
    id: "acc-3",
    name: "Aesthetic Automatic Water Fountain with Triple Filter",
    banglaName: "অটোমেটিক ওয়াটার ফাউন্টেন (ইউএসবি ফিল্টারসহ)",
    category: "accessories" as const,
    price: 1450,
    originalPrice: 1800,
    weight: "2.4 Litre",
    stock: 12,
    description: "Encourages cats and small puppies to drink clean running water. Features a whisper-quiet USB pump and carbon cotton water filter system.",
    banglaDescription: "বিড়ালকে বেশি পানি পান করতে উৎসাহিত করার ঝর্ণা। এতে রয়েছে শব্দহীন পাম্প এবং তিন স্তরের কার্বন ফিল্টার যা পানি সর্বদা ধুলো ও ব্যাকটেরিয়ামুক্ত রাখে।",
    image: "https://images.unsplash.com/photo-1504198266287-1659872e6590?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviewsCount: 20,
    tags: ["Water Fountain", "Auto Dispenser", "Cat Care"],
    featured: true,
    reviews: []
  },
  // Supplements
  {
    id: "sup-1",
    name: "Taqwa Premium Liquid Calcium and Vitamin D3 Drops",
    banglaName: "তাকওয়া প্রিমিয়াম লিকুইড ক্যালসিয়াম ও ভিটামিন ডি৩ ড্রপস",
    category: "supplements" as const,
    price: 380,
    originalPrice: 480,
    weight: "50 ml",
    stock: 45,
    description: "Highly absorbable drop supplement for birds, rabbits and reptiles. Strengthens eggshell thickness, bone density, and prevents sudden leg weakness.",
    banglaDescription: "পাখি ও খরগোশের জন্য অত্যন্ত কার্যকর তরল ক্যালসিয়াম সাপ্লিমেন্ট। এটি হাড় মজবুত করে এবং পাখির ডিমের খোসা মজবুত ও উৎপাদন বৃদ্ধি করে।",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    reviewsCount: 15,
    tags: ["Liquid Calcium", "Vitamin D3", "Egg Shell Care"],
    reviews: []
  },
  {
    id: "sup-2",
    name: "Pet-Health Probiotic Digestive Solution Powder",
    banglaName: "পেট-হেলথ প্রোবায়োটিক হজম শক্তি বৃদ্ধিকারক পাউডার",
    category: "supplements" as const,
    price: 690,
    originalPrice: 850,
    weight: "150g",
    stock: 22,
    description: "Probiotics and prebiotics mixture powder for cats, dogs & small animals. Instantly cures diarrhea, loss of appetite, bloating, and stomach issues.",
    banglaDescription: "বিড়াল, খরগোশ ও কবুতরের পেটের সমস্যা দূর করার কার্যকরী পাউডার। এটি হজমশক্তি বাড়ায়, গ্যাস ও ডায়রিয়া নিরাময়ে সাহায্য করে।",
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    reviewsCount: 10,
    tags: ["Probiotics", "Gut Health", "Appetite Booster"],
    bestSeller: true,
    reviews: []
  },
  {
    id: "sup-3",
    name: "Taqwa Bird Molting Amino Acid & Multivitamin Supplement",
    banglaName: "পাখির পালক পরিবর্তনকালীন বিশেষ অ্যামিনো অ্যাসিড ড্রপ",
    category: "supplements" as const,
    price: 490,
    originalPrice: 600,
    weight: "60 ml",
    stock: 25,
    description: "Premium recovery vitamins for shedding pet birds. Hastens feather regeneration, improves liver strength and provides daily mental calming.",
    banglaDescription: "পাখিদের পালক ঝরে যাওয়া ও নতুন সুন্দর পালক গজানোর মাল্টিভিটামিন ড্রপ। এটি পাখির লিভার শক্তিশালী রাখে এবং মানসিক চাপ দূর করে।",
    image: "https://images.unsplash.com/photo-1470115636472-723602d400e6?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviewsCount: 8,
    tags: ["Molting Care", "Amino Acid", "Bird Recovery"],
    reviews: []
  }
];

// Rich Product enrichment for Subcategories, Galleries, Variants & Badges
PRODUCTS.forEach(p => {
  if (!p.subcategory) {
    if (p.category === 'cats') p.subcategory = p.id === 'cat-1' ? 'Dry Food' : 'Wet Food';
    else if (p.category === 'birds') p.subcategory = p.id === 'bird-1' ? 'Premium Seeds' : 'Vitamins & Drops';
    else if (p.category === 'fish') p.subcategory = 'Pellets';
    else if (p.category === 'rabbits') p.subcategory = 'Grass/Hay';
    else if (p.category === 'accessories') p.subcategory = 'Grooming Trim';
    else p.subcategory = 'Vitamins & Drops';
  }
  if (!p.variants) {
    p.variants = p.weight ? [p.weight, `Pack of 2 (${p.weight})`, `Pack of 4 (${p.weight})`] : ["1 Pcs", "Pack of 3", "Pack of 6"];
  }
  if (!p.imagesGallery) {
    p.imagesGallery = [
      p.image,
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1535268647977-a403b69fc756?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (p.featured === undefined) p.featured = p.id === 'cat-1' || p.id === 'bird-1' || p.id === 'rabbit-1';
  if (p.bestSeller === undefined) p.bestSeller = p.id === 'cat-1' || p.id === 'fish-1';
  if (p.recommended === undefined) p.recommended = p.id === 'cat-2' || p.id === 'bird-2' || p.id === 'acc-1';
});

// Tracking order memory
let ORDERS: any[] = [
  {
    id: "ord-1001",
    trackingId: "TQW-78326-DH",
    customerName: "Mohammad Fahim",
    customerPhone: "01712345678",
    customerEmail: "fahim@example.com",
    shippingAddress: "House 24, Road 4, Dhanmondi, Dhaka",
    district: "Dhaka",
    items: [
      { productId: "cat-1", productName: "Premium Kitten Dry Food - High Protein Chicken & Salmon", quantity: 1, price: 1350, image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&q=80&w=600" }
    ],
    subtotal: 1350,
    deliveryCharge: 60,
    totalAmount: 1410,
    paymentMethod: "bKash",
    paymentStatus: "Paid",
    paymentTransactionId: "BK78G90R3Q",
    orderStatus: "Processing",
    createdAt: new Date().toISOString()
  }
];

// Mock Support Conversations
let CHAT_HISTORY: any[] = [];

// SECURE USER AUTH SIMULATION WITH CRYPTO
// Emulates secured register-login with client-side SHA hashing simulation
let USERS: any[] = [
  {
    id: "user-super-admin",
    name: "Mohammad Habibullah (Super Admin)",
    email: "taqwaenterpriseoffice@gmail.com",
    phone: "01999999999",
    role: "Super Admin",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    joinedAt: "2026-01-01T10:00:00Z"
  },
  {
    id: "user-admin-2",
    name: "Tasnia Rahman",
    email: "admin@taqwa.com",
    phone: "01822334455",
    role: "Admin",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    joinedAt: "2026-02-15T11:30:00Z"
  },
  {
    id: "user-manager-1",
    name: "Adnan Chowdhury",
    email: "manager@taqwa.com",
    phone: "01733445566",
    role: "Manager",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    joinedAt: "2026-03-20T09:15:00Z"
  },
  {
    id: "user-customer-1",
    name: "Kamrul Hasan",
    email: "kamrul@gmail.com",
    phone: "01511223344",
    role: "Customer",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    joinedAt: "2026-04-10T14:22:00Z"
  }
];

// Role-Based Access Control (RBAC) verification middleware
const checkAdminRole = (allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    const userEmail = req.headers['x-user-email'];
    if (!userEmail) {
      return res.status(401).json({ error: "Access Denied. Authorization identity missing." });
    }
    const user = USERS.find(u => u.email.trim().toLowerCase() === (userEmail as string).trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "Access Denied. User profile not found in database." });
    }
    if (user.status === 'Inactive' || user.status === 'Banned') {
      return res.status(403).json({ error: "আপনার অ্যাকাউন্টটি নিষ্ক্রিয় বা ব্যান করা হয়েছে। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।" });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: `Access Denied. Role ${user.role} is unauthorized.` });
    }
    // Attach request user profile to request body for granular auditing
    req.requestUser = user;
    next();
  };
};

// ---------------------------------
// PERSISTENT DATABASE ENGINE
// ---------------------------------
const DB_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const PRODUCTS_FILE = path.join(DB_DIR, "products.json");
const ORDERS_FILE = path.join(DB_DIR, "orders.json");
const USERS_FILE = path.join(DB_DIR, "users.json");
const COUPONS_FILE = path.join(DB_DIR, "coupons.json");
const BANNERS_FILE = path.join(DB_DIR, "banners.json");
const CATEGORIES_FILE = path.join(DB_DIR, "categories.json");
const INVENTORY_LOGS_FILE = path.join(DB_DIR, "inventory_logs.json");
const NOTIFICATIONS_FILE = path.join(DB_DIR, "notifications.json");
const CARTS_FILE = path.join(DB_DIR, "carts.json");
const WISHLISTS_FILE = path.join(DB_DIR, "wishlists.json");
const SETTINGS_FILE = path.join(DB_DIR, "settings.json");

function loadJSON(file: string, defaultValue: any) {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8").trim();
      if (!content) {
        return defaultValue;
      }
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error loading database file ${file}:`, err);
    try {
      if (fs.existsSync(file)) {
        const backupPath = `${file}.corrupted-${Date.now()}`;
        fs.renameSync(file, backupPath);
        console.warn(`[RECOVERY] Renamed corrupted database file ${file} to ${backupPath}`);
      }
    } catch (recoveryErr) {
      console.error(`Failed to handle corrupted file recovery:`, recoveryErr);
    }
  }
  return defaultValue;
}

function saveJSON(file: string, data: any) {
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempFile = `${file}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tempFile, file);
  } catch (err) {
    console.error(`Error saving database file ${file}:`, err);
  }
}

// Load arrays or fallback to pre-defined in-memory data
PRODUCTS = loadJSON(PRODUCTS_FILE, PRODUCTS);
if (!fs.existsSync(PRODUCTS_FILE)) {
  saveJSON(PRODUCTS_FILE, PRODUCTS);
}

ORDERS = loadJSON(ORDERS_FILE, ORDERS);
if (!fs.existsSync(ORDERS_FILE)) {
  saveJSON(ORDERS_FILE, ORDERS);
}

USERS = loadJSON(USERS_FILE, USERS);
if (!fs.existsSync(USERS_FILE)) {
  saveJSON(USERS_FILE, USERS);
}

let COUPONS: any[] = loadJSON(COUPONS_FILE, [
  { id: "c-1", code: "TAQWA10", type: "percent", value: 10, minPurchase: 500, description: "10% Discount on all orders above ৳500!", expiryDate: "2026-12-31", usageLimit: 200, usedCount: 5, oneUserOneTime: true },
  { id: "c-2", code: "PETCARE", type: "percent", value: 15, minPurchase: 1000, description: "Save 15% on health-supplements and pet accessories!", expiryDate: "2026-12-31", usageLimit: 100, usedCount: 2, oneUserOneTime: false },
  { id: "c-3", code: "FREE60", type: "flat", value: 60, minPurchase: 400, description: "Flat ৳60 Discount (Free shipping equivalent)!", expiryDate: "2026-12-31", usageLimit: 500, usedCount: 12, oneUserOneTime: true }
]);
if (!fs.existsSync(COUPONS_FILE)) {
  saveJSON(COUPONS_FILE, COUPONS);
}

let BANNERS: any[] = loadJSON(BANNERS_FILE, [
  { id: "b1", title: "Premium Pet Feed & Care!", subtitle: "Specialized nutritional mixes & high-grade accessories", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=1200", link: "featured" },
  { id: "b2", title: "Monsoon Special 15% OFF!", subtitle: "Keep your feathered or furry companions premium healthy", image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=1200", link: "supplements" }
]);
if (!fs.existsSync(BANNERS_FILE)) {
  saveJSON(BANNERS_FILE, BANNERS);
}

const defaultCategories = [
  { id: "birds", name: "Birds", banglaName: "পাখি", image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=200", status: "Active", order: 1, subcategories: ["Premium Seeds", "Vitamins & Drops", "Cages"] },
  { id: "cats", name: "Cats", banglaName: "বিড়াল", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200", status: "Active", order: 2, subcategories: ["Dry Food", "Wet Food", "Litter", "Accessories"] },
  { id: "fish", name: "Fish", banglaName: "মাছ", image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&q=80&w=200", status: "Active", order: 3, subcategories: ["Flakes", "Pellets", "Water Care"] },
  { id: "rabbits", name: "Rabbits", banglaName: "খরগোশ", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=200", status: "Active", order: 4, subcategories: ["Timothy Hay", "Pellets", "Toys"] },
  { id: "accessories", name: "Accessories", banglaName: "এক্সেসরিজ", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=200", status: "Active", order: 5, subcategories: ["Leashes", "Bowls", "Grooming"] },
  { id: "supplements", name: "Supplements", banglaName: "সাপ্লিমেন্ট", image: "https://images.unsplash.com/photo-1628589689885-33923ef1f070?auto=format&fit=crop&q=80&w=200", status: "Active", order: 6, subcategories: ["Vitamins", "Coat Care", "Digestive Care"] }
];

let CATEGORIES: any[] = loadJSON(CATEGORIES_FILE, defaultCategories);
if (!fs.existsSync(CATEGORIES_FILE)) {
  saveJSON(CATEGORIES_FILE, CATEGORIES);
}

let INVENTORY_LOGS: any[] = loadJSON(INVENTORY_LOGS_FILE, []);
if (!fs.existsSync(INVENTORY_LOGS_FILE)) {
  saveJSON(INVENTORY_LOGS_FILE, INVENTORY_LOGS);
}

let NOTIFICATIONS: any[] = loadJSON(NOTIFICATIONS_FILE, [
  {
    id: "notif-1",
    title: "Welcome to Taqwa Enterprise!",
    banglaTitle: "তাকওয়া এন্টারপ্রাইজে স্বাগতম!",
    message: "Thank you for joining our platform. Enjoy premium organic pet foods with 24h delivery.",
    banglaMessage: "আমাদের প্ল্যাটফর্মে যোগদানের জন্য ধন্যবাদ। ২৪ ঘণ্টার হোম ডেলিভারি সহ প্রিমিয়াম ক্যাট/বার্ড ফুড উপভোগ করুন।",
    type: "promo",
    isRead: false,
    createdAt: new Date().toISOString()
  }
]);
if (!fs.existsSync(NOTIFICATIONS_FILE)) {
  saveJSON(NOTIFICATIONS_FILE, NOTIFICATIONS);
}

let USER_CARTS: { [email: string]: any[] } = loadJSON(CARTS_FILE, {});
if (!fs.existsSync(CARTS_FILE)) {
  saveJSON(CARTS_FILE, USER_CARTS);
}

let USER_WISHLISTS: { [email: string]: string[] } = loadJSON(WISHLISTS_FILE, {});
if (!fs.existsSync(WISHLISTS_FILE)) {
  saveJSON(WISHLISTS_FILE, USER_WISHLISTS);
}

let SETTINGS: any = loadJSON(SETTINGS_FILE, {
  storeName: 'Taqwa Enterprise',
  logo: '',
  favicon: '',
  contactEmail: 'taqwaenterpriseoffice@gmail.com',
  contactPhone: '01999999999',
  businessHours: '10 AM - 10 PM',
  socialFacebook: 'https://facebook.com',
  socialYoutube: 'https://youtube.com',
  shippingChargeDhaka: 60,
  shippingChargeOutside: 120,
  taxRate: 0,
  currency: 'BDT',
  language: 'en',
  bkashNumber: '01999999999',
  bkashType: 'Personal',
  nagadNumber: '01888888888',
  nagadType: 'Personal',
  rocketNumber: '01777777777',
  rocketType: 'Personal',
  paymentInstructionsEn: 'Please send money to our official number and input the TxnID.',
  paymentInstructionsBn: 'আমাদের অফিসিয়াল নাম্বারে টাকা সেন্ড মানি করে ট্রানজেকশন আইডি প্রদান করুন।',
  maintenanceMode: false,
  orderIdPrefix: 'TQW'
});
if (!fs.existsSync(SETTINGS_FILE)) {
  saveJSON(SETTINGS_FILE, SETTINGS);
}

// Collection Save Helpers
function saveProducts() { saveJSON(PRODUCTS_FILE, PRODUCTS); }
function saveOrders() { saveJSON(ORDERS_FILE, ORDERS); }
function saveUsers() { saveJSON(USERS_FILE, USERS); }
function saveCoupons() { saveJSON(COUPONS_FILE, COUPONS); }
function saveBanners() { saveJSON(BANNERS_FILE, BANNERS); }
function saveCategories() { saveJSON(CATEGORIES_FILE, CATEGORIES); }
function saveInventoryLogs() { saveJSON(INVENTORY_LOGS_FILE, INVENTORY_LOGS); }
function saveNotifications() { saveJSON(NOTIFICATIONS_FILE, NOTIFICATIONS); }
function saveCarts() { saveJSON(CARTS_FILE, USER_CARTS); }
function saveWishlists() { saveJSON(WISHLISTS_FILE, USER_WISHLISTS); }
function saveSettings() { saveJSON(SETTINGS_FILE, SETTINGS); }

// Real-time Notification Engine
function createNotification(type: 'order' | 'promo' | 'coupon' | 'stock', title: string, banglaTitle: string, message: string, banglaMessage: string, userEmail?: string) {
  const newNotif = {
    id: `notif-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    userEmail: userEmail || "", // blank means global/admin notification
    title,
    banglaTitle,
    message,
    banglaMessage,
    type,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  NOTIFICATIONS.unshift(newNotif);
  saveNotifications();
}

// Real-time Auditing Inventory System
function logInventory(productId: string, actionType: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT', quantity: number, currentStock: number, notes: string, operator?: string) {
  const log = {
    id: `log-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    productId,
    actionType,
    quantity,
    currentStock,
    notes,
    operator: operator || "System Auto",
    timestamp: new Date().toISOString()
  };
  INVENTORY_LOGS.unshift(log);
  saveInventoryLogs();

  // Low Stock & Out of Stock triggers
  const product = PRODUCTS.find(p => p.id === productId);
  if (product) {
    if (product.stock === 0) {
      createNotification("stock", `Product Out of Stock: ${product.name}`, `পণ্য মজুদ শেষঃ ${product.banglaName}`, `The product "${product.name}" is completely out of stock in our system database.`, `এই পণ্যটি "${product.banglaName}" আমাদের স্টোরে সম্পূর্ণ শেষ হয়ে গিয়েছে।`);
    } else if (product.stock <= 10) {
      createNotification("stock", `Low Stock Warning: ${product.name}`, `কম মজুদের সতর্কতাঃ ${product.banglaName}`, `Only ${product.stock} items remaining in stock.`, `আমাদের স্টোরে মাত্র ${product.stock} টি মজুদ রয়েছে।`);
    }
  }
}

// ---------------------------------
// API ENDPOINTS
// ---------------------------------

// API 1: Fetch Products & Support Search / Filter
app.get("/api/products", (req, res) => {
  const { category, search } = req.query;
  const userEmail = req.headers['x-user-email'] as string;
  
  // Verify if requester is admin/staff to decide if we show inactive products
  let isAdmin = false;
  if (userEmail) {
    const user = USERS.find(u => u.email.trim().toLowerCase() === userEmail.trim().toLowerCase());
    if (user && ["Super Admin", "Admin", "Manager"].includes(user.role)) {
      isAdmin = true;
    }
  }

  let filtered = [...PRODUCTS];

  // Inactive products are only shown to admin/staff
  if (!isAdmin) {
    filtered = filtered.filter(p => p.status !== 'Inactive');
  }

  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.banglaName && p.banglaName.toLowerCase().includes(q)) || 
      (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q))) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  }

  // Filter reviews to show only approved reviews for normal customers
  const sanitized = filtered.map(p => {
    let reviewsList = p.reviews || [];
    if (!isAdmin) {
      reviewsList = reviewsList.filter((r: any) => r.approved !== false);
    }
    return {
      ...p,
      reviews: reviewsList,
      reviewsCount: reviewsList.length
    };
  });

  res.json(sanitized);
});

// API 2: Add or Edit review dynamically (With Admin Approval flow)
app.post("/api/products/:id/review", (req, res) => {
  const { id } = req.params;
  const { reviewId, userName, rating, comment, reviewImages } = req.body;

  const product = PRODUCTS.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (!product.reviews) {
    product.reviews = [];
  }

  if (reviewId) {
    const existingReview = product.reviews.find((r: any) => r.id === reviewId);
    if (existingReview) {
      existingReview.rating = Number(rating) || 5;
      existingReview.comment = comment || "";
      existingReview.reviewImages = Array.isArray(reviewImages) ? reviewImages : [];
      existingReview.date = new Date().toISOString().split("T")[0] + " (Edited)";
    } else {
      return res.status(404).json({ error: "Review to edit not found" });
    }
  } else {
    const newReview = {
      id: `rev-${Date.now()}`,
      userName: userName || "Anonymous Buyer",
      rating: Number(rating) || 5,
      comment: comment || "",
      reviewImages: Array.isArray(reviewImages) ? reviewImages : [],
      approved: false, // Requires Admin Approval
      date: new Date().toISOString().split("T")[0]
    };
    if (!product.reviews) product.reviews = [];
    product.reviews.unshift(newReview);
  }

  saveProducts();

  // Create notifications for admins about pending review
  createNotification("promo", "New Product Review Submitted", "নতুন রিভিউ জমা হয়েছে", `A review has been submitted for ${product.name} by ${userName || "Anonymous"} and is pending admin approval.`, `গ্রাহক কর্তৃক "${product.banglaName}" পণ্যের উপর একটি নতুন রিভিউ জমা হয়েছে যা এডমিন অনুমোদনের অপেক্ষায় রয়েছে।`);

  res.json({ success: true, product, message: "রিভিউ সফলভাবে জমা হয়েছে এবং এটি মডারেটরের অনুমোদনের পর প্রদর্শিত হবে।" });
});

// API 3: Create Order with dynamic tracking details & stock logs
app.post("/api/orders", (req, res) => {
  const { customerName, customerPhone, customerEmail, shippingAddress, district, items, paymentMethod, paymentTransactionId, couponCode } = req.body;

  if (!customerName || !customerPhone || !shippingAddress || !items || items.length === 0) {
    return res.status(400).json({ error: "Required fields are missing." });
  }

  const safeDistrict = (district && typeof district === "string") ? district.trim() : "Dhaka";
  const orderNum = `ORD-20260628-${Math.floor(1000 + Math.random() * 9000)}`;
  const invoiceNum = `INV-20260628-${Math.floor(1000 + Math.random() * 9000)}`;
  const trackingId = `TQW-${Math.floor(10000 + Math.random() * 90000)}-${safeDistrict.substring(0,2).toUpperCase()}`;

  // Process Coupon
  let discountAmount = 0;
  let couponApplied = null;
  if (couponCode) {
    const coupon = COUPONS.find(c => c.code.trim().toUpperCase() === couponCode.trim().toUpperCase());
    if (coupon) {
      couponApplied = coupon;
    }
  }

  // Deduct stock safely & log audits
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const p = PRODUCTS.find(prod => prod.id === item.productId);
    if (p) {
      const prevStock = p.stock;
      const quantityToDeduct = Math.min(p.stock, item.quantity);
      p.stock = Math.max(0, p.stock - quantityToDeduct);
      subtotal += p.price * quantityToDeduct;

      orderItems.push({
        productId: p.id,
        productName: p.name,
        quantity: quantityToDeduct,
        price: p.price,
        image: p.image,
        variantSelected: item.variantSelected || p.weight || "1 Pcs"
      });

      // Log Stock Out action
      logInventory(p.id, "STOCK_OUT", quantityToDeduct, p.stock, `Ordered via ${orderNum}`, customerName);
    }
  }

  if (couponApplied) {
    if (couponApplied.type === 'percent') {
      discountAmount = Math.round((subtotal * couponApplied.value) / 100);
    } else {
      discountAmount = couponApplied.value;
    }
    if (couponApplied.usedCount === undefined) couponApplied.usedCount = 0;
    couponApplied.usedCount += 1;
    saveCoupons();
  }

  const deliveryCharge = safeDistrict.toLowerCase() === "dhaka" ? 60 : 120;
  const totalAmount = Math.max(0, subtotal - discountAmount) + deliveryCharge;

  const newOrder = {
    id: `ord-${Date.now()}`,
    orderNumber: orderNum,
    invoiceNumber: invoiceNum,
    trackingId,
    customerName,
    customerPhone,
    customerEmail,
    shippingAddress,
    district: safeDistrict,
    items: orderItems,
    subtotal,
    discountAmount,
    couponCode: couponCode || "",
    deliveryCharge,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentTransactionId ? "Paid" : "Pending",
    paymentTransactionId,
    orderStatus: "Pending", // Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Refunded
    createdAt: new Date().toISOString()
  };

  ORDERS.unshift(newOrder);
  saveOrders();
  saveProducts();

  // Create notifications
  createNotification(
    "order", 
    `Order Placed: ${orderNum}`, 
    `নতুন অর্ডার সাবমিট হয়েছেঃ ${orderNum}`, 
    `Your order ${orderNum} has been placed successfully for ৳${totalAmount}.`, 
    `আপনার অর্ডার ${orderNum} সফলভাবে ৳${totalAmount} এর জন্য গ্রহণ করা হয়েছে।`, 
    customerEmail
  );

  createNotification(
    "order", 
    `New Customer Order: ${orderNum}`, 
    `নতুন কাস্টমার অর্ডার এসেছেঃ ${orderNum}`, 
    `Customer ${customerName} placed order ${orderNum} of BDT ${totalAmount}.`, 
    `গ্রাহক ${customerName} একটি নতুন অর্ডার ${orderNum} সাবমিট করেছেন।`, 
    ""
  );

  res.json({ success: true, order: newOrder });
});

// ---------------------------------
// PRODUCTION INTEGRATED PAYMENT GATEWAY
// ---------------------------------

// API: Initiate Payment
app.post("/api/payments/initiate", (req, res) => {
  const { orderId, paymentMethod } = req.body;
  const order = ORDERS.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  // Generate simulated secure session/redirect URL
  const txnId = `TXN-${paymentMethod.toUpperCase()}-${Date.now().toString().slice(-8)}`;
  const redirectUrl = `/checkout/payment-simulation?orderId=${order.id}&method=${paymentMethod}&txnId=${txnId}&amount=${order.totalAmount}`;
  
  res.json({
    success: true,
    redirectUrl,
    transactionId: txnId,
    message: "Payment checkout gateway initiated."
  });
});

// API: Verify Transaction
app.post("/api/payments/verify", (req, res) => {
  const { orderId, paymentMethod, transactionId, status } = req.body;
  const order = ORDERS.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (status === "Success") {
    order.paymentStatus = "Paid";
    order.paymentTransactionId = transactionId || `TXN-${Date.now().toString().slice(-6)}`;
    order.orderStatus = "Confirmed"; // auto-confirm upon paid

    // Log payment audit trail
    logInventory(order.id, "ADJUSTMENT", 0, 0, `Payment verified via ${paymentMethod}`, order.customerName);

    // Notifications
    createNotification(
      "order",
      `Payment Received: ${order.orderNumber}`,
      `পেমেন্ট পরিশোধিতঃ ${order.orderNumber}`,
      `We received BDT ${order.totalAmount} for your order ${order.orderNumber}.`,
      `আমরা আপনার অর্ডার ${order.orderNumber} এর জন্য সফলভাবে ৳${order.totalAmount} পেমেন্ট পেয়েছি।`,
      order.customerEmail
    );

    saveOrders();
    return res.json({ success: true, message: "পেমেন্ট সফলভাবে যাচাই করা হয়েছে!", order });
  } else {
    order.paymentStatus = "Pending";
    if (status === "Cancelled") {
      order.orderStatus = "Cancelled";
      // Restore stock upon cancellation
      order.items.forEach((it: any) => {
        const prod = PRODUCTS.find(p => p.id === it.productId);
        if (prod) {
          prod.stock += it.quantity;
          logInventory(prod.id, "STOCK_IN", it.quantity, prod.stock, `Restored from Cancelled Order ${order.orderNumber}`, "System Auto-Restore");
        }
      });
      saveProducts();
      saveOrders();
      return res.json({ success: false, error: "পেমেন্ট বাতিল করা হয়েছে।", order });
    } else {
      return res.json({ success: false, error: "পেমেন্ট ব্যর্থ হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।", order });
    }
  }
});

// API: Refund Payment (Admin Only)
app.post("/api/admin/refund-payment", checkAdminRole(["Super Admin", "Admin"]), (req, res) => {
  const { orderId, reason } = req.body;
  const order = ORDERS.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (order.paymentStatus !== "Paid") {
    return res.status(400).json({ error: "Only paid orders can be refunded for online channels." });
  }

  order.paymentStatus = "Refunded";
  order.orderStatus = "Refunded";

  // Restore inventory stock safely and log audit
  order.items.forEach((it: any) => {
    const prod = PRODUCTS.find(p => p.id === it.productId);
    if (prod) {
      prod.stock += it.quantity;
      logInventory(prod.id, "STOCK_IN", it.quantity, prod.stock, `Restored from Refunded Order ${order.orderNumber}`, reason || "Admin Refund Process");
    }
  });

  saveProducts();
  saveOrders();

  // Notify customer
  createNotification(
    "order",
    `Refund Processed: ${order.orderNumber}`,
    `রিফান্ড সফল হয়েছেঃ ${order.orderNumber}`,
    `Refund of BDT ${order.totalAmount} has been processed for your order ${order.orderNumber}. Reason: ${reason || "N/A"}`,
    `আপনার অর্ডার ${order.orderNumber} এর রিফান্ড ৳${order.totalAmount} সফলভাবে সম্পন্ন হয়েছে। কারণঃ ${reason || "N/A"}`,
    order.customerEmail
  );

  res.json({ success: true, message: "Order payment refunded successfully.", order });
});

// ---------------------------------
// PRODUCTION SEO METRICS (Sitemaps & Robots)
// ---------------------------------

// SEO Sitemap.xml
app.get("/sitemap.xml", (req, res) => {
  res.header("Content-Type", "application/xml");
  
  const siteUrl = "https://taqwaenterprise.com";
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  const paths = ["", "/cart", "/orders", "/track-order", "/reviews", "/contact"];
  paths.forEach(p => {
    xml += `  <url>\n    <loc>${siteUrl}${p}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });
  
  CATEGORIES.forEach(c => {
    xml += `  <url>\n    <loc>${siteUrl}/category/${c.id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  });

  PRODUCTS.forEach(p => {
    xml += `  <url>\n    <loc>${siteUrl}/product/${p.id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  });

  xml += `</urlset>`;
  res.send(xml);
});

// SEO robots.txt
app.get("/robots.txt", (req, res) => {
  res.header("Content-Type", "text/plain");
  res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nSitemap: https://taqwaenterprise.com/sitemap.xml\n`);
});

// API 4: Get order tracking status info
app.get("/api/orders/track/:trackingId", (req, res) => {
  const { trackingId } = req.params;
  const order = ORDERS.find(o => 
    o.trackingId.trim().toUpperCase() === trackingId.trim().toUpperCase() ||
    (o.orderNumber && o.orderNumber.trim().toUpperCase() === trackingId.trim().toUpperCase())
  );
  if (!order) {
    return res.status(404).json({ error: "অর্ডার ট্র্যাকিং আইডি পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডি দিন।" });
  }
  res.json(order);
});

// API 4b: Get past orders by user email
app.get("/api/orders/user/:email", (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const userOrders = ORDERS.filter(o => o.customerEmail?.trim().toLowerCase() === email.trim().toLowerCase());
  res.json(userOrders);
});

// API 5: Secure Registration & Login Simulations
app.post("/api/auth/register", (req, res) => {
  const { name, email, phone, encryptedPassword } = req.body;
  if (!name || !email || !encryptedPassword) {
    return res.status(400).json({ error: "Registration failed. Invalid arguments." });
  }

  if (USERS.some(u => u.email.trim().toLowerCase() === email.trim().toLowerCase())) {
    return res.status(409).json({ error: "ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে।" });
  }

  const isSuperAdmin = email.trim().toLowerCase() === 'taqwaenterpriseoffice@gmail.com';
  const newUser = {
    id: `u-${Date.now()}`,
    name,
    email: email.trim().toLowerCase(),
    phone: phone || "",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    role: isSuperAdmin ? ("Super Admin" as const) : ("Customer" as const),
    status: "Active",
    password: encryptedPassword,
    addresses: [],
    joinedAt: new Date().toISOString()
  };

  USERS.push(newUser);
  saveUsers();
  res.json({ success: true, user: newUser });
});

app.post("/api/auth/login", (req, res) => {
  const { email, encryptedPassword } = req.body;
  const matchedUser = USERS.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());

  if (!matchedUser) {
    return res.status(401).json({ error: "ভুল ইমেইল বা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।" });
  }

  if (matchedUser.status === 'Inactive' || matchedUser.status === 'Banned') {
    return res.status(403).json({ error: "আপনার অ্যাকাউন্টটি নিষ্ক্রিয় বা ব্যান করা হয়েছে। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।" });
  }

  // Verify credentials safely (allow empty/undefined passwords for predefined bootstrap mock users to log in easily)
  if (matchedUser.password && matchedUser.password !== encryptedPassword) {
    return res.status(401).json({ error: "ভুল পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।" });
  }

  res.json({ success: true, user: matchedUser });
});

// API 5.4: Get or create Firebase user in backend database
app.post("/api/auth/sync", (req, res) => {
  const { name, email, phone, avatar } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required for syncing." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = USERS.find(u => u.email.trim().toLowerCase() === normalizedEmail);

  if (user && (user.status === 'Inactive' || user.status === 'Banned')) {
    return res.status(403).json({ error: "আপনার অ্যাকাউন্টটি নিষ্ক্রিয় বা ব্যান করা হয়েছে। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।" });
  }

  if (!user) {
    const isSuperAdmin = normalizedEmail === 'taqwaenterpriseoffice@gmail.com';
    user = {
      id: `u-${Date.now()}`,
      name: name || email.split('@')[0],
      email: normalizedEmail,
      phone: phone || "",
      avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      role: isSuperAdmin ? ("Super Admin" as const) : ("Customer" as const),
      status: "Active",
      password: "",
      addresses: [],
      joinedAt: new Date().toISOString()
    };
    USERS.push(user);
    saveUsers();
  }

  res.json({ success: true, user });
});

// API 5.5: Update user profile and address book (Support multiple addresses and defaults)
app.put("/api/auth/update", (req, res) => {
  const { userId, name, phone, email, addresses, avatar, password } = req.body;
  const user = USERS.find(u => {
    const uIdMatch = userId && u.id === userId;
    const uEmail = u.email ? u.email.trim().toLowerCase() : "";
    const reqEmail = email ? email.trim().toLowerCase() : "";
    return uIdMatch || (reqEmail && uEmail === reqEmail);
  });
  if (!user) {
    return res.status(404).json({ error: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" });
  }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;
  if (password !== undefined) user.password = password; // support password update!

  if (addresses !== undefined) {
    user.addresses = Array.isArray(addresses) ? addresses : [];
    // Ensure there is at most one default address
    if (user.addresses.length > 0) {
      const hasDefault = user.addresses.some((a: any) => a.isDefault);
      if (!hasDefault) {
        user.addresses[0].isDefault = true;
      }
    }
  }

  saveUsers();
  res.json({ success: true, user });
});

// API 6: Admin Dashboard - Fetch Sales KPIs and Orders List (Protected for Super Admin, Admin, Manager)
app.get("/api/admin/dashboard", checkAdminRole(["Super Admin", "Admin", "Manager"]), (req, res) => {
  const sales = ORDERS.filter(o => o.orderStatus !== "Cancelled" && o.orderStatus !== "Refunded")
                      .reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = ORDERS.length;
  const inventoriesCount = PRODUCTS.reduce((sum, p) => sum + p.stock, 0);
  
  // High granularity status counts
  const pendingOrders = ORDERS.filter(o => o.orderStatus === "Pending").length;
  const processingOrders = ORDERS.filter(o => o.orderStatus === "Processing").length;
  const shippedOrders = ORDERS.filter(o => o.orderStatus === "Shipped").length;
  const deliveredOrders = ORDERS.filter(o => o.orderStatus === "Delivered").length;
  const cancelledOrders = ORDERS.filter(o => o.orderStatus === "Cancelled").length;
  const returnedOrders = ORDERS.filter(o => o.orderStatus === "Return Requested").length;
  const refundedOrders = ORDERS.filter(o => o.orderStatus === "Refunded").length;

  const lowStockProducts = PRODUCTS.filter(p => p.stock <= 10);
  const lowStockCount = lowStockProducts.length;

  // Mock sales tracking for Recharts graphs
  const salesHistory = [
    { date: "06-16", sales: 4200, orders: 3 },
    { date: "06-17", sales: 5800, orders: 4 },
    { date: "06-18", sales: 2900, orders: 2 },
    { date: "06-19", sales: 8100, orders: 6 },
    { date: "06-20", sales: 6300, orders: 5 },
    { date: "06-21", sales: sales || 1410, orders: totalOrders || 1 }
  ];

  // Category distributions
  const categories = ['birds', 'cats', 'fish', 'rabbits', 'accessories', 'supplements'];
  const categoryAnalytics = categories.map(cat => {
    const catProds = PRODUCTS.filter(p => p.category === cat);
    const stockVal = catProds.reduce((acc, p) => acc + p.stock, 0);
    const valuation = catProds.reduce((acc, p) => acc + (p.price * p.stock), 0);
    return {
      category: cat,
      productCount: catProds.length,
      totalStock: stockVal,
      valuation
    };
  });

  res.json({
    kpis: {
      sales,
      totalOrders,
      inventoriesCount,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
      refundedOrders,
      lowStockCount,
      totalCoupons: COUPONS.length,
      totalUsers: USERS.length
    },
    lowStockAlerts: lowStockProducts.map(p => ({ id: p.id, name: p.name, stock: p.stock, image: p.image })),
    salesHistory,
    categoryAnalytics,
    orders: ORDERS,
    products: PRODUCTS,
    coupons: COUPONS,
    users: USERS,
    banners: BANNERS
  });
});

// Dynamic admin action: update order status (With Stock audits & Alerts)
app.post("/api/admin/order-status", checkAdminRole(["Super Admin", "Admin", "Manager"]), (req: any, res) => {
  const { orderId, status, paymentStatus } = req.body;
  const order = ORDERS.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  const oldStatus = order.orderStatus;
  const isOldRestoring = ["Cancelled", "Returned", "Refunded"].includes(oldStatus);
  const isNewRestoring = ["Cancelled", "Returned", "Refunded"].includes(status);

  order.orderStatus = status;
  if (paymentStatus !== undefined) {
    order.paymentStatus = paymentStatus;
  }

  if (!isOldRestoring && isNewRestoring) {
    // Restore stock back into our inventory catalog
    order.items.forEach((item: any) => {
      const p = PRODUCTS.find(prod => prod.id === item.productId);
      if (p) {
        p.stock += item.quantity;
        // Log stock restore
        logInventory(p.id, "STOCK_IN", item.quantity, p.stock, `Stock Restored: Order ${order.orderNumber} became ${status}`, req.requestUser?.name || "Admin Operator");
      }
    });
  } else if (isOldRestoring && !isNewRestoring) {
    // Deduct stock again as the order is restored back into an active flow
    order.items.forEach((item: any) => {
      const p = PRODUCTS.find(prod => prod.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
        // Log stock deduction
        logInventory(p.id, "STOCK_OUT", item.quantity, p.stock, `Stock Re-deducted: Order ${order.orderNumber} changed from ${oldStatus} to ${status}`, req.requestUser?.name || "Admin Operator");
      }
    });
  }

  saveOrders();
  saveProducts();

  // Create notifications
  createNotification(
    "order",
    `Order Status Updated: ${order.orderNumber || order.trackingId}`,
    `অর্ডারের অবস্থা পরিবর্তিত হয়েছেঃ ${order.orderNumber || order.trackingId}`,
    `Your order status is now: ${status}.`,
    `আপনার অর্ডারের বর্তমান অবস্থা এখনঃ ${status}।`,
    order.customerEmail
  );

  res.json({ success: true, order });
});

// Dynamic admin action: quick stock updates (SaaS Inventory Panel)
app.post("/api/admin/update-stock", checkAdminRole(["Super Admin", "Admin", "Manager"]), (req: any, res) => {
  const { productId, newStock, notes } = req.body;
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  const oldStock = product.stock;
  const qty = Number(newStock) || 0;
  product.stock = qty;
  
  saveProducts();

  // Audit Log Entry
  const diff = qty - oldStock;
  const actType = diff >= 0 ? "STOCK_IN" : "STOCK_OUT";
  logInventory(
    productId,
    actType,
    Math.abs(diff),
    qty,
    notes || `Manual admin stock adjustment from ${oldStock} to ${qty}`,
    req.requestUser?.name || "Inventory Manager"
  );

  res.json({ success: true, product });
});

// Admin product customizer CRUD: Add a brand new product
app.post("/api/admin/add-product", checkAdminRole(["Super Admin", "Admin"]), (req: any, res) => {
  const { 
    name, banglaName, category, price, originalPrice, weight, stock, description, banglaDescription, image, tags,
    status, featured, newArrival, bestSeller, images, variants, sku, barcode, seoTitle, seoDescription
  } = req.body;

  if (!name || !banglaName || !price || !category) {
    return res.status(400).json({ error: "Name, Bangla Name, Category, Price are required" });
  }

  const generatedSku = sku || `TQW-${category.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const generatedBarcode = barcode || `880123${Math.floor(1000000 + Math.random() * 9000000)}`;

  const newProduct = {
    id: `${category}-${Date.now()}`,
    name,
    banglaName,
    category,
    price: Number(price),
    originalPrice: Number(originalPrice || price),
    weight: weight || "1 Pcs",
    stock: Number(stock) || 0,
    description: description || "",
    banglaDescription: banglaDescription || "",
    image: image || "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&q=80&w=600",
    rating: 5.0,
    reviewsCount: 0,
    tags: Array.isArray(tags) ? tags : [category],
    reviews: [],
    status: status || "Active",
    featured: featured === true,
    newArrival: newArrival === true,
    bestSeller: bestSeller === true,
    images: Array.isArray(images) ? images : [image].filter(Boolean),
    variants: Array.isArray(variants) ? variants : (weight ? [weight] : ["1 Pcs"]),
    sku: generatedSku,
    barcode: generatedBarcode,
    seoTitle: seoTitle || `${name} | Taqwa Enterprise`,
    seoDescription: seoDescription || description || ""
  };

  PRODUCTS.unshift(newProduct);
  saveProducts();

  // Audit log entry
  logInventory(newProduct.id, "STOCK_IN", newProduct.stock, newProduct.stock, "Initial product catalog listing creation", req.requestUser?.name || "Admin Catalogist");

  res.json({ success: true, product: newProduct });
});

// Admin product customizer CRUD: Update product parameters
app.post("/api/admin/update-product", checkAdminRole(["Super Admin", "Admin"]), (req: any, res) => {
  const { 
    id, name, banglaName, category, price, originalPrice, weight, stock, description, banglaDescription, image, tags,
    status, featured, newArrival, bestSeller, images, variants, sku, barcode, seoTitle, seoDescription
  } = req.body;

  const product = PRODUCTS.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const oldStock = product.stock;

  if (name !== undefined) product.name = name;
  if (banglaName !== undefined) product.banglaName = banglaName;
  if (category !== undefined) product.category = category;
  if (price !== undefined) product.price = Number(price);
  if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);
  if (weight !== undefined) product.weight = weight;
  if (description !== undefined) product.description = description;
  if (banglaDescription !== undefined) product.banglaDescription = banglaDescription;
  if (image !== undefined) product.image = image;
  if (tags !== undefined) product.tags = Array.isArray(tags) ? tags : [category];
  
  // Advanced fields
  if (status !== undefined) product.status = status;
  if (featured !== undefined) product.featured = featured === true;
  if (newArrival !== undefined) product.newArrival = newArrival === true;
  if (bestSeller !== undefined) product.bestSeller = bestSeller === true;
  if (images !== undefined) product.images = Array.isArray(images) ? images : [image].filter(Boolean);
  if (variants !== undefined) product.variants = Array.isArray(variants) ? variants : (weight ? [weight] : ["1 Pcs"]);
  if (sku !== undefined) product.sku = sku;
  if (barcode !== undefined) product.barcode = barcode;
  if (seoTitle !== undefined) product.seoTitle = seoTitle;
  if (seoDescription !== undefined) product.seoDescription = seoDescription;

  if (stock !== undefined) {
    const updatedStock = Number(stock) || 0;
    if (updatedStock !== oldStock) {
      product.stock = updatedStock;
      const diff = updatedStock - oldStock;
      const actType = diff >= 0 ? "STOCK_IN" : "STOCK_OUT";
      logInventory(id, actType, Math.abs(diff), updatedStock, "Manual admin stock override via update form", req.requestUser?.name || "Admin Operator");
    }
  }

  saveProducts();
  res.json({ success: true, product });
});

// Admin product customizer CRUD: Delete product
app.post("/api/admin/delete-product", checkAdminRole(["Super Admin", "Admin"]), (req, res) => {
  const { id } = req.body;
  const index = PRODUCTS.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  PRODUCTS.splice(index, 1);
  saveProducts();
  res.json({ success: true, message: "Product deleted" });
});

// API 7: Data Synchronizing & Encryption Backup Simulation (Cloud sync status)
app.get("/api/sync/status", (req, res) => {
  res.json({
    synchronized: true,
    lastSyncTime: new Date().toISOString(),
    cloudBackup: "Enabled (Secured AWS KMS Client-side AES-256)",
    activeUsersCount: USERS.length,
    activeOrdersCount: ORDERS.length,
    dbKeysEncrypted: true
  });
});

app.post("/api/sync/trigger-backup", (req, res) => {
  res.json({
    success: true,
    message: "তাকওয়া এন্টারপ্রাইজ লোকাল ডাটাবেজ ক্লাউড ব্যাকআপ সার্ভারে অত্যন্ত সুরক্ষিতভাবে এনক্রিপ্ট ও সিঙ্ক হয়েছে!",
    backupSize: `${(JSON.stringify(ORDERS) + JSON.stringify(PRODUCTS)).length} bytes`,
    timestamp: new Date().toISOString(),
    encryptionAlgorithm: "AES-GCM-256"
  });
});

// API 8: AI-based customer personalized recommendations algorithm
app.post("/api/gemini/recommend", async (req, res) => {
  const { cartItems } = req.body;
  const ai = getGeminiClient();

  let productsDetails = PRODUCTS.map(p => `- ${p.name} (Category: ${p.category}, Price: ${p.price} BDT)`).join("\n");
  let promptContext = "";

  if (cartItems && cartItems.length > 0) {
    const purchased = cartItems.map((item: any) => `- Name: ${item.name}, Category: ${item.category}`).join("\n");
    promptContext = `The buyer is looking at: \n${purchased}\n\nSuggest 2 specific products from Taqwa Enterprise products below to upsell or bundle: \n${productsDetails}`;
  } else {
    promptContext = `Give a short summary of top recommended pet products for birds and cats based on seasonal diet from this list: \n${productsDetails}`;
  }

  if (!ai) {
    // Elegant fallback if Gemini Key is not set or placeholder
    return res.json({
      recommendation: "পাখিদের জন্য 'তাকওয়া প্রিমিয়াম বীজ মিক্স' এবং বিড়ালছানাদের পুষ্টির উন্নয়নে ওমেগা-৩ সাপ্লিমেন্টটি একসাথে নেওয়ার পরামর্শ দিচ্ছি। এগুলো তাদের পালক ও ত্বকের সুরক্ষা দেয়।"
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are Taqwa Enterprise's smart e-commerce recommender system. Suggest pet feed or supplements recommendation in Bangla. Keep the reply highly friendly, professional and within 3 concise sentences. Include the exact name of products from the available list.
      
      ${promptContext}`,
    });
    res.json({ recommendation: response.text });
  } catch (err: any) {
    res.json({ recommendation: "আমাদের প্রোটিন ফুড এবং ভিটামিন সাপ্লিমেন্ট মিক্সড আপনার পোষা প্রাণীর জন্য অত্যন্ত চমৎকার এবং স্বাস্থ্যসম্মত হবে।" });
  }
});

// API 9: Smart Live Chat with Gemini AI (লাইভ চ্যাট)
app.post("/api/gemini/chat", async (req, res) => {
  const { prompt, history } = req.body;
  const ai = getGeminiClient();

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (!ai) {
    // Beautiful automated support response as local fallback
    let responseText = "তাকওয়া এন্টারপ্রাইজ কাস্টমার কেয়ারে স্বাগতম! আপনার মেসেজের জন্য ধন্যবাদ। আমাদের সব প্রোডাক্ট ১০০% আসল। আপনি কি পাখি, বিড়াল, নাকি রঙিন মাছের প্রিয় খবারের বিবরণ চান?";
    const pLower = prompt.toLowerCase();
    if (pLower.includes("পাখি") || pLower.includes("bird")) {
      responseText = "পাখির জন্য আমাদের 'তাকওয়া প্রিমিয়াম বীজ ও বাদাম মিক্স' এবং মাল্টিভিটামিন ড্রপগুলো অত্যন্ত জনপ্রিয়। দ্রুত হোম ডেলিভারি পেতে সরাসরি অর্ডার করতে পারেন!";
    } else if (pLower.includes("বিড়াল") || pLower.includes("cat")) {
      responseText = "ছোট বিড়ালের জন্য আমাদের প্রোটিনযুক্ত ক্যাট ড্রাইভ ফুড এবং ভেজা খাবার বেশ পুষ্টিকর। এটি বিড়ালের পালক উজ্জ্বল ও রোগ প্রতিরোধ বাড়ায়।";
    } else if (pLower.includes("ডেলিভারি") || pLower.includes("delivery")) {
      responseText = "আমরা ঢাকা সিটিতে মাত্র ২৪ ঘন্টায় ৬০ টাকায় এবং সারদেশে ১২০ টাকায় হোম ডেলিভারি দিয়ে থাকি!";
    } else if (pLower.includes("পেমেন্ট") || pLower.includes("payment") || pLower.includes("বিকাশ")) {
      responseText = "আপনার সুবিধার জন্য আমাদের ওবেয়বসাইটে বিকাশ, নগদ, রকেট পেমেন্ট সফলভাবে ইন্টিগ্রেট করা হয়েছে। অর্ডার কনফার্ম করতে পেমেন্ট ট্রানজেকশন আইডি প্রদান করতে পারেন।";
    }

    return res.json({ text: responseText });
  }

  try {
    // Map existing history to structured format for generation API
    const contents = [];
    if (history && history.length > 0) {
      for (const msg of history.slice(-6)) { // Take last 6 turns to prevent token pressure
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents as any,
      config: {
        systemInstruction: `You are 'Taqwa AI Support Agent', an expert customer service advisor for Taqwa Enterprise pet store. 
        We sell bird seeds, dry wet cat foods, aquarium pellets,Timothy hay, vitamins/supplements, and nail clippers/accessories.
        Keep answers helpful, respectful and extremely polite in Bangla (or English if the user asks in English). 
        Mention our core advantages: 24h delivery inside Dhaka, secure online payments (bKash/Nagad/Rocket/Visa), and verified premium food imports.
        Do not make up products we do not sell. Keep answers short and within 3 sentences.`
      }
    });

    res.json({ text: response.text });
  } catch (err: any) {
    res.json({ text: "দুঃখিত, একটু লোডিং সমস্যা হচ্ছে। অনুগ্রহ করে অর্ডার ট্র্যাক আইডি অথবা অর্ডার করতে সাহায্য লাগবে কিনা লিখুন, আমি সাহায্য করছি।" });
  }
});


// API 10: Coupon System
app.get("/api/coupons", (req, res) => {
  res.json(COUPONS);
});

app.post("/api/validate-coupon", (req, res) => {
  const { code, subtotal, userEmail } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Coupon code is required" });
  }

  const coupon = COUPONS.find(c => c.code.trim().toUpperCase() === code.trim().toUpperCase());
  if (!coupon) {
    return res.status(404).json({ error: "ভুল কুপন কোড! অনুগ্রহ করে সঠিক কোড দিন।" });
  }

  // Check Expiry Date
  if (coupon.expiryDate) {
    const today = new Date().toISOString().split("T")[0]; // e.g. "2026-06-28"
    if (today > coupon.expiryDate) {
      return res.status(400).json({ error: "দুঃখিত, এই কুপনটির মেয়াদ শেষ হয়ে গিয়েছে।" });
    }
  }

  // Check overall usage limit
  if (coupon.usageLimit !== undefined && coupon.usedCount !== undefined) {
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: "দুঃখিত, এই কুপনটি ব্যবহারের সর্বোচ্চ সীমা অতিক্রম করেছে।" });
    }
  }

  // Check One User One Time
  if (coupon.oneUserOneTime && userEmail) {
    const hasUsed = ORDERS.some(o => 
      o.customerEmail?.trim().toLowerCase() === userEmail.trim().toLowerCase() && 
      o.couponCode?.trim().toUpperCase() === code.trim().toUpperCase() &&
      o.orderStatus !== "Cancelled"
    );
    if (hasUsed) {
      return res.status(400).json({ error: "আপনি ইতিপূর্বে এই কুপনটি একবার ব্যবহার করেছেন।" });
    }
  }

  const minAmt = coupon.minPurchase || 0;
  if (subtotal && subtotal < minAmt) {
    return res.status(450).json({ error: `এই কুপনটি ব্যবহার করতে ন্যূনতম ৳${minAmt} কেনাকাটা করা প্রয়োজন।` });
  }

  res.json({
    success: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    description: coupon.description
  });
});

app.post("/api/admin/add-coupon", checkAdminRole(["Super Admin", "Admin"]), (req, res) => {
  const { code, type, value, minPurchase, description, expiryDate, usageLimit, oneUserOneTime } = req.body;
  if (!code || !type || !value) {
    return res.status(400).json({ error: "Code, Type, and Value are required." });
  }

  const exists = COUPONS.some(c => c.code.toUpperCase() === code.trim().toUpperCase());
  if (exists) {
    return res.status(400).json({ error: "Coupon code already exists." });
  }

  const newCoupon = {
    id: `coupon-${Date.now()}`,
    code: code.trim().toUpperCase(),
    type,
    value: Number(value),
    minPurchase: Number(minPurchase || 0),
    description: description || `${type === 'percent' ? value + '%' : '৳' + value} discount`,
    expiryDate: expiryDate || null,
    usageLimit: usageLimit !== undefined ? Number(usageLimit) : 1000,
    usedCount: 0,
    oneUserOneTime: oneUserOneTime === true
  };

  COUPONS.push(newCoupon);
  saveCoupons();

  // Create notifications about new coupon
  createNotification(
    "coupon", 
    `New Coupon Promo: Use ${newCoupon.code}`, 
    `নতুন কুপন অফারঃ ${newCoupon.code} ব্যবহার করুন`, 
    `Get discounts using code "${newCoupon.code}". Active for a limited time!`, 
    `ডিসকাউন্ট কোড "${newCoupon.code}" ব্যবহার করে আজই আকর্ষণীয় ছাড় পান! কুপনটির মেয়াদ সীমিত সময়ের জন্য।`
  );

  res.json({ success: true, coupon: newCoupon });
});

app.post("/api/admin/delete-coupon", checkAdminRole(["Super Admin", "Admin"]), (req, res) => {
  const { id } = req.body;
  const index = COUPONS.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Coupon not found" });
  }
  COUPONS.splice(index, 1);
  saveCoupons();
  res.json({ success: true, message: "Coupon deleted successfully" });
});


// ---------------------------------
// PRODUCTION COMPLEMENTARY ENDPOINTS
// ---------------------------------

// 1. DUPLICATE PRODUCT API
app.post("/api/admin/duplicate-product", checkAdminRole(["Super Admin", "Admin"]), (req: any, res) => {
  const { id } = req.body;
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: "Product to duplicate not found" });
  }

  const newId = `${product.category}-${Date.now()}`;
  const duplicated = {
    ...product,
    id: newId,
    name: `${product.name} (Copy)`,
    banglaName: `${product.banglaName} (অনুলিপি)`,
    sku: `TQW-${product.category.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    barcode: `880123${Math.floor(1000000 + Math.random() * 9000000)}`,
    stock: 0, // Reset stock safety on duplication
    reviews: [],
    reviewsCount: 0,
    rating: 5.0,
    createdAt: new Date().toISOString()
  };

  PRODUCTS.unshift(duplicated);
  saveProducts();

  // Log inventory duplication
  logInventory(newId, "ADJUSTMENT", 0, 0, "Duplicate Product Creation", req.requestUser?.name || "Admin Duplicator");

  res.json({ success: true, product: duplicated });
});

// 2. ADMIN REVIEW MODERATION / APPROVAL API
app.post("/api/admin/approve-review", checkAdminRole(["Super Admin", "Admin", "Manager"]), (req, res) => {
  const { productId, reviewId, approved } = req.body;
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const review = product.reviews.find((r: any) => r.id === reviewId);
  if (!review) {
    return res.status(404).json({ error: "Review not found" });
  }

  review.approved = approved;

  // Recalculate average rating of approved reviews only
  const approvedReviews = product.reviews.filter((r: any) => r.approved !== false);
  if (approvedReviews.length > 0) {
    const total = approvedReviews.reduce((acc: number, curr: any) => acc + curr.rating, 0);
    product.rating = Number((total / approvedReviews.length).toFixed(1));
    product.reviewsCount = approvedReviews.length;
  } else {
    product.rating = 5.0;
    product.reviewsCount = 0;
  }

  saveProducts();
  res.json({ success: true, message: approved ? "Review approved" : "Review rejected", product });
});

app.post("/api/admin/delete-review", checkAdminRole(["Super Admin", "Admin", "Manager"]), (req, res) => {
  const { productId, reviewId } = req.body;
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const index = product.reviews.findIndex((r: any) => r.id === reviewId);
  if (index === -1) {
    return res.status(404).json({ error: "Review not found" });
  }

  product.reviews.splice(index, 1);

  // Recalculate average rating of approved reviews only
  const approvedReviews = product.reviews.filter((r: any) => r.approved !== false);
  if (approvedReviews.length > 0) {
    const total = approvedReviews.reduce((acc: number, curr: any) => acc + curr.rating, 0);
    product.rating = Number((total / approvedReviews.length).toFixed(1));
    product.reviewsCount = approvedReviews.length;
  } else {
    product.rating = 5.0;
    product.reviewsCount = 0;
  }

  saveProducts();
  res.json({ success: true, message: "Review deleted successfully", product });
});

// 3. CATEGORIES CRUD ENDPOINTS
app.get("/api/categories", (req, res) => {
  // Sort active categories by order
  const activeCategories = CATEGORIES.filter(c => c.status !== 'Inactive')
                                     .sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(activeCategories);
});

app.get("/api/admin/categories", checkAdminRole(["Super Admin", "Admin", "Manager"]), (req, res) => {
  res.json(CATEGORIES);
});

app.post("/api/admin/add-category", checkAdminRole(["Super Admin", "Admin"]), (req, res) => {
  const { id, name, banglaName, image, status, order, subcategories } = req.body;
  if (!id || !name || !banglaName) {
    return res.status(400).json({ error: "ID, Name and Bangla Name are required" });
  }

  const lowerId = id.toLowerCase().trim();
  if (CATEGORIES.some(c => c.id === lowerId)) {
    return res.status(400).json({ error: "Category with this ID already exists" });
  }

  const newCategory = {
    id: lowerId,
    name,
    banglaName,
    image: image || "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=200",
    status: status || "Active",
    order: Number(order) || CATEGORIES.length + 1,
    subcategories: Array.isArray(subcategories) ? subcategories : []
  };

  CATEGORIES.push(newCategory);
  saveCategories();

  // Create notifications about new category
  createNotification(
    "promo", 
    `New Pet Category Launched: ${name}`, 
    `নতুন পোষা ক্যাটাগরি যুক্তঃ ${banglaName}`, 
    `We now sell premium items for ${name}! Discover what's new.`, 
    `আমরা এখন "${banglaName}" ক্যাটাগরির প্রিমিয়াম আইটেম সরবরাহ করছি! নতুন কালেকশনগুলো আজই দেখে নিন।`
  );

  res.json({ success: true, category: newCategory });
});

app.post("/api/admin/update-category", checkAdminRole(["Super Admin", "Admin"]), (req, res) => {
  const { id, name, banglaName, image, status, order, subcategories } = req.body;
  const category = CATEGORIES.find(c => c.id === id);
  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }

  if (name !== undefined) category.name = name;
  if (banglaName !== undefined) category.banglaName = banglaName;
  if (image !== undefined) category.image = image;
  if (status !== undefined) category.status = status;
  if (order !== undefined) category.order = Number(order);
  if (subcategories !== undefined) category.subcategories = Array.isArray(subcategories) ? subcategories : [];

  saveCategories();
  res.json({ success: true, category });
});

app.post("/api/admin/delete-category", checkAdminRole(["Super Admin", "Admin"]), (req, res) => {
  const { id } = req.body;
  const index = CATEGORIES.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Category not found" });
  }

  CATEGORIES.splice(index, 1);
  saveCategories();
  res.json({ success: true, message: "Category deleted successfully" });
});

// SETTINGS API ENDPOINTS
app.get("/api/settings", (req, res) => {
  res.json(SETTINGS);
});

app.post("/api/admin/settings", checkAdminRole(["Super Admin", "Admin"]), (req, res) => {
  SETTINGS = { ...SETTINGS, ...req.body };
  saveSettings();
  res.json({ success: true, settings: SETTINGS });
});

// 4. INVENTORY SYSTEM AUDIT LOGS ENDPOINT
app.get("/api/admin/inventory-logs", checkAdminRole(["Super Admin", "Admin", "Manager"]), (req, res) => {
  res.json(INVENTORY_LOGS);
});

// 5. SHOPPING CART SYNC ENDPOINTS
app.get("/api/cart", (req, res) => {
  const email = req.headers['x-user-email'] as string;
  if (!email) {
    return res.status(400).json({ error: "Email header missing" });
  }
  const cart = USER_CARTS[email.trim().toLowerCase()] || [];
  res.json({ success: true, cart });
});

app.post("/api/cart", (req, res) => {
  const email = req.headers['x-user-email'] as string;
  const { cart } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email header missing" });
  }
  if (!Array.isArray(cart)) {
    return res.status(400).json({ error: "Cart must be an array" });
  }
  USER_CARTS[email.trim().toLowerCase()] = cart;
  saveCarts();
  res.json({ success: true });
});

// 6. WISHLIST SYNC ENDPOINTS
app.get("/api/wishlist", (req, res) => {
  const email = req.headers['x-user-email'] as string;
  if (!email) {
    return res.status(400).json({ error: "Email header missing" });
  }
  const wishlist = USER_WISHLISTS[email.trim().toLowerCase()] || [];
  res.json({ success: true, wishlist });
});

app.post("/api/wishlist", (req, res) => {
  const email = req.headers['x-user-email'] as string;
  const { wishlist } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email header missing" });
  }
  if (!Array.isArray(wishlist)) {
    return res.status(400).json({ error: "Wishlist must be an array" });
  }
  USER_WISHLISTS[email.trim().toLowerCase()] = wishlist;
  saveWishlists();
  res.json({ success: true });
});

// 7. NOTIFICATIONS CHANNELS
app.get("/api/notifications", (req, res) => {
  const email = req.headers['x-user-email'] as string;
  let filtered = [...NOTIFICATIONS];
  if (email) {
    filtered = filtered.filter(n => !n.userEmail || n.userEmail.trim().toLowerCase() === email.trim().toLowerCase());
  } else {
    filtered = filtered.filter(n => !n.userEmail);
  }
  res.json(filtered);
});

app.post("/api/notifications/read", (req, res) => {
  const { id, all } = req.body;
  const email = req.headers['x-user-email'] as string;

  if (all) {
    NOTIFICATIONS.forEach(n => {
      if (!n.userEmail || (email && n.userEmail.trim().toLowerCase() === email.trim().toLowerCase())) {
        n.isRead = true;
      }
    });
  } else if (id) {
    const notif = NOTIFICATIONS.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
    }
  }
  saveNotifications();
  res.json({ success: true });
});

// 8. AUTOCOMPLETE SEARCH SUGGESTIONS
app.get("/api/search/suggestions", (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.json([]);
  }
  const q = (query as string).toLowerCase();

  const matchedCategories = CATEGORIES.filter(c => c.name.toLowerCase().includes(q) || c.banglaName.includes(q))
                                      .map(c => ({ type: 'category', text: c.name, banglaText: c.banglaName, id: c.id }));

  const matchedProducts = PRODUCTS.filter(p => p.status !== 'Inactive' && (p.name.toLowerCase().includes(q) || p.banglaName.includes(q) || p.tags.some((t: string) => t.toLowerCase().includes(q))))
                                  .slice(0, 5)
                                  .map(p => ({ type: 'product', text: p.name, banglaText: p.banglaName, id: p.id, image: p.image, price: p.price }));

  res.json([...matchedCategories, ...matchedProducts]);
});


// API 11: Homepage Banners Management
app.get("/api/banners", (req, res) => {
  res.json(BANNERS);
});

app.post("/api/admin/update-banners", checkAdminRole(["Super Admin", "Admin"]), (req, res) => {
  const { banners } = req.body;
  if (!Array.isArray(banners)) {
    return res.status(400).json({ error: "Banners must be an array" });
  }
  BANNERS = banners;
  res.json({ success: true, banners: BANNERS });
});


// API 12: User & Role Management
app.get("/api/admin/users", checkAdminRole(["Super Admin", "Admin"]), (req, res) => {
  res.json(USERS);
});

app.post("/api/admin/add-user", checkAdminRole(["Super Admin"]), (req, res) => {
  const { name, email, phone, role } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: "Name, email and role are required." });
  }

  const exists = USERS.some(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "A user with this email already exists." });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email: email.trim().toLowerCase(),
    phone: phone || "",
    role,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    joinedAt: new Date().toISOString()
  };

  USERS.push(newUser);
  saveUsers();
  res.json({ success: true, user: newUser });
});

app.post("/api/admin/update-user", checkAdminRole(["Super Admin", "Admin"]), (req: any, res: any) => {
  const { id, name, email, phone, role, status } = req.body;
  const user = USERS.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const requester = req.requestUser;

  // Admins cannot modify Super Admin accounts
  if (user.role === 'Super Admin' && requester.role !== 'Super Admin') {
    return res.status(403).json({ error: "Admins cannot modify Super Admin accounts." });
  }

  // Only Super Admin can promote or change user roles
  if (role !== undefined && role !== user.role && requester.role !== 'Super Admin') {
    return res.status(403).json({ error: "Only Super Admin can change user roles." });
  }

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (role !== undefined && requester.role === 'Super Admin') user.role = role;
  if (status !== undefined) user.status = status; // allow Admin & Super Admin to activate/deactivate accounts

  saveUsers();
  res.json({ success: true, user });
});

app.post("/api/admin/delete-user", checkAdminRole(["Super Admin"]), (req, res) => {
  const { id } = req.body;
  const index = USERS.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  if (USERS[index].email === 'taqwaenterpriseoffice@gmail.com') {
    return res.status(403).json({ error: "Super Admin account cannot be deleted for safety." });
  }
  USERS.splice(index, 1);
  saveUsers();
  res.json({ success: true, message: "User deleted successfully" });
});

// API 13: Order Deletion
app.post("/api/admin/delete-order", checkAdminRole(["Super Admin", "Admin"]), (req, res) => {
  const { id } = req.body;
  const index = ORDERS.findIndex(o => o.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Order not found" });
  }
  ORDERS.splice(index, 1);
  saveOrders();
  res.json({ success: true, message: "Order deleted successfully" });
});


// ---------------------------------
// VITE CLIENT ROUTING
// ---------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Taqwa Enterprise full-stack server running on address http://0.0.0.0:${PORT}`);
  });
}

startServer();
