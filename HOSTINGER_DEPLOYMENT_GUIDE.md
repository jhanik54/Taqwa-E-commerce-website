# 🚀 Taqwa Enterprise - Hostinger Business Web Hosting Deployment Guide
### হোস্টিংগার বিজনেস ওয়েব হোস্টিং ও সাবডোমেনে ডিপ্লয়মেন্ট এবং MySQL ডাটাবেজ গাইড

এই গাইডটি অনুসরণ করে আপনি খুব সহজেই **Taqwa Enterprise** ওয়েবসাইটটি আপনার **Hostinger Business Web Hosting**-এর একটি সাবডোমেনে (যেমন: `shop.yourdomain.com` অথবা `store.yourdomain.com`) লাইভ করতে পারবেন।

---

## 📁 প্রজেক্টের প্রধান ফাইলসমূহ (Hostinger-Ready Files)
1. **`taqwa_database.sql`**: সম্পূর্ণ ডেটাবেজ স্কিমা ও প্রাথমিক ডেটার SQL ডাম্প।
2. **`server/mysql.ts`**: অটো-কানেকশন, টেবিল স্বয়ংক্রিয় তৈরি এবং কুয়েরি পুলিং ইঞ্জিন।
3. **`.htaccess`**: হোস্টিংগার Apache/LiteSpeed রিভার্স প্রক্সি, ক্যাশিং, Gzip কম্প্রেশন এবং সিকিউরিটি কনফিগারেশন।
4. **`.env.example`**: হোস্টিংগার MySQL ও পোর্ট কনফিগারেশনের টেমপ্লেট।
5. **`public/uploads/`**: পণ্যের সব ছবি সরাসরি আপনার হোস্টিংগারের NVMe লোকাল ডিস্কে সংরক্ষিত থাকবে।

---

## ধাপ ১: হোস্টিংগারে সাবডোমেন তৈরি করা (Create Subdomain)
1. আপনার [Hostinger hPanel](https://hpanel.hostinger.com)-এ লগইন করুন।
2. **Websites** মেনু থেকে আপনার ডোমেনটি সিলেক্ট করুন।
3. বাম পাশের মেনু থেকে **Domains > Subdomains**-এ যান।
4. **Subdomain Name**-এ আপনার কাঙ্ক্ষিত নাম দিন (যেমন: `shop` বা `store`)।
5. **Custom folder for subdomain** অপশনটি চেক দিয়ে ফোল্ডারের নাম দিন (যেমন: `public_html/shop`)।
6. **Create** বাটনে ক্লিক করুন।

---

## ধাপ ২: MySQL ডেটাবেজ ও ইউজার তৈরি করা (Create MySQL Database)
1. hPanel-এর বাম পাশের মেনু থেকে **Databases > Management**-এ যান।
2. **Create a New MySQL Database and User** সেকশনে:
   - **Database name:** যেমন `taqwa_db` (পুরো নাম হবে: `u123456789_taqwa_db`)
   - **Database username:** যেমন `taqwa_user` (পুরো নাম হবে: `u123456789_taqwa_user`)
   - **Password:** একটি শক্তিশালী পাসওয়ার্ড দিন এবং নোটপ্যাডে লিখে রাখুন।
3. **Create** বাটনে ক্লিক করুন।
4. *(ঐচ্ছিক কিন্তু দারুণ)*: **phpMyAdmin** বাটনে ক্লিক করে ডেটাবেজে ঢুকুন এবং উপরে **Import** ট্যাবে গিয়ে আমাদের প্রজেক্টের `taqwa_database.sql` ফাইলটি সিলেক্ট করে **Import** দিন। (আপনি এটি না করলেও আমাদের Node.js সার্ভার চালু হওয়ার সাথে সাথেই সব টেবিল একা একাই তৈরি করে নিবে!)

---

## ধাপ ৩: Node.js অ্যাপ্লিকেশন সেটআপ করা (Hostinger Node.js Manager)
Hostinger Business প্যাকেজে বিল্ট-ইন **Node.js Manager** থাকে:
1. hPanel-এ সার্চ বারে লিখুন **Node.js** অথবা বাম পাশের **Advanced > Node.js**-এ যান।
2. **Create Application** বাটনে ক্লিক করুন:
   - **Node.js version:** `20.x` বা `22.x` সিলেক্ট করুন।
   - **Application root:** আপনার সাবডোমেন ফোল্ডার (যেমন: `public_html/shop`)
   - **Application URL:** আপনার সাবডোমেনটি সিলেক্ট করুন (যেমন: `shop.yourdomain.com`)
   - **Application startup file:** `dist/server.cjs`
3. **Create** বাটনে ক্লিক করুন।

---

## ধাপ ৪: ফাইল আপলোড ও ডিপ্লয় (Upload Files)
1. **File Manager** ওপেন করে আপনার সাবডোমেন ফোল্ডারে (`public_html/shop`) যান।
2. প্রজেক্টের ফাইলগুলো (অথবা জিপ করা কোড) আপলোড করে আনজিপ করুন।
3. ফোল্ডারের মধ্যে `.env` ফাইল তৈরি করুন (বা `.env.example` রিনেম করে `.env` করুন) এবং আপনার MySQL তথ্য দিন:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=u123456789_taqwa_user
   DB_PASSWORD=YourStrongPasswordHere
   DB_NAME=u123456789_taqwa_db
   PORT=3000
   NODE_ENV=production
   ```
4. **NPM Dependencies:**
   - hPanel-এর Node.js Manager থেকে **NPM Install** বাটনে ক্লিক করুন।
   - অথবা SSH টার্মিনালে ঢুকে রান করুন: `npm install && npm run build`
5. **Start / Restart Application** বাটনে ক্লিক করুন।

---

## ধাপ ৫: ছবি ও ডেটা হোস্টিংগারে সংরক্ষণের নিশ্চয়তা (Local Disk Storage)
- পণ্যের সব ছবি এবং আপলোড সরাসরি আপনার হোস্টিংগারের `public_html/shop/public/uploads/` ফোল্ডারে সেভ হবে।
- প্রতিটি আপলোডকৃত ছবির রেকর্ড MySQL-এর `uploaded_files` টেবিলে সংরক্ষিত হবে।
- ক্লাউডিনারি বা ফায়ারবেসের উপর কোনো বাধ্যবাধকতা নেই—আপনার নিজস্ব হোস্টিংয়েই সব ডেটা থাকবে।

---

## ধাপ ৬: সিস্টেম স্বাস্থ্য ও ডেটাবেজ স্ট্যাটাস পরীক্ষা (Verification)
ব্রাউজারে আপনার সাবডোমেনের এই লিঙ্কে ভিজিট করুন:
`https://shop.yourdomain.com/api/system/db-status`

আপনি এরকম রেসপন্স দেখতে পাবেন:
```json
{
  "mysql": {
    "configured": true,
    "connected": true,
    "host": "localhost",
    "database": "u123456789_taqwa_db",
    "port": 3306
  },
  "localFilesystem": {
    "active": true,
    "productsCount": 24,
    "ordersCount": 8,
    "courierPointsCount": 6
  },
  "environment": "production"
}
```

আপনার তাকওয়া এন্টারপ্রাইজ ওয়েবসাইট এখন সফলভাবে হোস্টিংগারে স্বয়ংসম্পূর্ণভাবে চলবে!
