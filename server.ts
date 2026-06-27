import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { GoogleGenAI } from "@google/genai";
import {
  readDb,
  writeDb,
  hashPassword,
  verifyPassword,
  DbUser,
  DbFarmer,
  DbCrop,
  DbSchedule,
  DbAiRecommendation
} from "./server/db.js";

dotenv.config();

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY haijawekwa kwenye siri (Secrets) za AI Studio. Tafadhali nenda kwenye Settings > Secrets upande wa juu kulia na uweke siri yako.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable trust proxy for Cloud Run reverse proxies
  app.set('trust proxy', 1);

  // 1. CONFIGURE CORS
  app.use(cors());

  // 2. CONFIGURE HELMET FOR SECURITY
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled to allow the development applet iframe to work flawlessly
    crossOriginEmbedderPolicy: false
  }));

  // 3. CONFIGURE RATE LIMITER
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    validate: false, // Disables IP/proxy validation checks to prevent logs/warnings on multi-tiered reverse proxies like Cloud Run
    message: { success: false, error: "Umezidi kiwango cha maombi. Tafadhali jaribu tena baada ya dakika 15." }
  });
  app.use("/api/", limiter);

  app.use(express.json());

  // Safe helper to format Tanzanian phone numbers to international standards
  function formatPhoneNumber(phone: string) {
    let clean = phone.replace(/[\s\-\+\(\)]/g, '');
    if (clean.startsWith('0')) {
      clean = '255' + clean.slice(1);
    } else if (clean.startsWith('7') || clean.startsWith('6')) {
      clean = '255' + clean;
    }
    return '+' + clean;
  }

  // --- API ROUTES FIRST ---

  // 1. AUTHENTICATION ENDPOINTS WITH JWT & BCRYPT
  app.post("/api/auth/register", (req, res) => {
    try {
      const { username, password, name, phone, role, email, region } = req.body;
      if (!username || !password || !name) {
        return res.status(400).json({ success: false, error: "Jina la mtumiaji, nenosiri, na jina kamili yanahitajika." });
      }

      const db = readDb();
      const exists = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (exists) {
        return res.status(400).json({ success: false, error: "Jina la mtumiaji tayari limechukuliwa." });
      }

      // bcrypt hashing
      const { hash, salt } = hashPassword(password);
      const newUser: DbUser = {
        id: "user-" + Date.now(),
        username,
        passwordHash: hash,
        salt,
        name,
        phone: phone || "0794172297",
        role: role || "Mkulima Mkuu",
        email: email || "",
        region: region || "Morogoro"
      };

      db.users.push(newUser);
      writeDb(db);

      // Issue JWT Token
      const token = jwt.sign(
        { id: newUser.id, username: newUser.username, role: newUser.role },
        process.env.JWT_SECRET || "mshauri_kilimo_secret_key_2026",
        { expiresIn: "7d" }
      );

      // Return user profile (exclude hash & salt) and JWT token
      const { passwordHash, salt: _, ...userProfile } = newUser;
      return res.json({ success: true, user: userProfile, token });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, error: "Jina la mtumiaji na nenosiri vinahitajika." });
      }

      const db = readDb();
      const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, error: "Mtumiaji hajapatikana au nenosiri sio sahihi." });
      }

      // Secure verify with legacy support
      if (!verifyPassword(password, user.passwordHash, user.salt)) {
        return res.status(401).json({ success: false, error: "Jina la mtumiaji au nenosiri sio sahihi." });
      }

      // Issue JWT Token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || "mshauri_kilimo_secret_key_2026",
        { expiresIn: "7d" }
      );

      const { passwordHash, salt: _, ...userProfile } = user;
      return res.json({ success: true, user: userProfile, token });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1b. ASSISTANT & PROFILE ENDPOINTS
  app.get("/api/assistants", (req, res) => {
    try {
      const adminId = req.query.adminId as string;
      if (!adminId) {
        return res.status(400).json({ success: false, error: "adminId inahitajika." });
      }
      const db = readDb();
      const assistants = db.users.filter(u => u.adminId === adminId);
      const safeAssistants = assistants.map(({ passwordHash, salt, ...u }) => u);
      return res.json({ success: true, assistants: safeAssistants });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/assistants", (req, res) => {
    try {
      const { adminId, username, password, name, phone, email, region } = req.body;
      if (!adminId || !username || !password || !name) {
        return res.status(400).json({ success: false, error: "Admin ID, Jina la mtumiaji, Nenosiri, na Jina kamili yanahitajika." });
      }

      const db = readDb();
      const exists = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (exists) {
        return res.status(400).json({ success: false, error: "Jina la mtumiaji tayari limechukuliwa na mtumiaji mwingine." });
      }

      const { hash, salt } = hashPassword(password);
      const newAssistant: DbUser = {
        id: "user-" + Date.now(),
        username,
        passwordHash: hash,
        salt,
        name,
        phone: phone || "",
        role: "Msaidizi",
        email: email || "",
        region: region || "Morogoro",
        adminId
      };

      db.users.push(newAssistant);
      writeDb(db);

      const { passwordHash, salt: _, ...profile } = newAssistant;
      return res.json({ success: true, assistant: profile });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete("/api/assistants/:id", (req, res) => {
    try {
      const { id } = req.params;
      const db = readDb();
      db.users = db.users.filter(u => u.id !== id);
      writeDb(db);
      return res.json({ success: true, message: "Msaidizi amefutwa kwa mafanikio." });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put("/api/users/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { name, phone, role, email, password } = req.body;
      const db = readDb();
      const idx = db.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        db.users[idx].name = name || db.users[idx].name;
        db.users[idx].phone = phone || db.users[idx].phone;
        db.users[idx].role = role || db.users[idx].role;
        db.users[idx].email = email || db.users[idx].email;
        if (password && password.trim()) {
          const { hash, salt } = hashPassword(password);
          db.users[idx].passwordHash = hash;
          db.users[idx].salt = salt;
        }
        writeDb(db);
        const { passwordHash, salt: _, ...updatedUser } = db.users[idx];
        return res.json({ success: true, user: updatedUser });
      }
      return res.status(404).json({ success: false, error: "Mtumiaji hajapatikana." });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. FARMERS ENDPOINTS
  app.get("/api/farmers", (req, res) => {
    try {
      const userId = req.query.userId as string;
      const db = readDb();
      const filtered = userId ? db.farmers.filter(f => f.userId === userId) : db.farmers;
      return res.json({ success: true, farmers: filtered });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/farmers", (req, res) => {
    try {
      const { userId, name, phone, region, district, village, latitude, longitude } = req.body;
      if (!userId || !name || !phone) {
        return res.status(400).json({ success: false, error: "Mtumiaji, jina la mkulima, na namba ya simu vinahitajika." });
      }

      const db = readDb();
      const newFarmer: DbFarmer = {
        id: Date.now(),
        userId,
        name,
        phone,
        region: region || "Morogoro",
        district: district || "Kilosa",
        village: village || "",
        latitude: Number(latitude) || -6.827,
        longitude: Number(longitude) || 37.659,
        registeredDate: new Date().toISOString()
      };

      db.farmers.push(newFarmer);
      writeDb(db);
      return res.json({ success: true, farmer: newFarmer });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete("/api/farmers/:id", (req, res) => {
    try {
      const id = Number(req.params.id);
      const db = readDb();
      db.farmers = db.farmers.filter(f => f.id !== id);
      db.crops = db.crops.filter(c => c.farmerId !== id); // Cascade delete crops
      writeDb(db);
      return res.json({ success: true, message: "Mkulima amefutwa." });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. CROPS ENDPOINTS
  app.get("/api/crops", (req, res) => {
    try {
      const userId = req.query.userId as string;
      const db = readDb();
      const filtered = userId ? db.crops.filter(c => c.userId === userId) : db.crops;
      return res.json({ success: true, crops: filtered });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/crops", (req, res) => {
    try {
      const { userId, farmerId, cropName, variety, plantingDate, daysAfterPlanting, areaHa, irrigationMethod, growthStage, moisture } = req.body;
      if (!userId || !farmerId || !cropName) {
        return res.status(400).json({ success: false, error: "Taarifa zote muhimu za zao zinahitajika." });
      }

      const db = readDb();
      const newCrop: DbCrop = {
        id: Date.now(),
        userId,
        farmerId: Number(farmerId),
        cropName,
        variety: variety || "Kienyeji",
        plantingDate: plantingDate || new Date().toISOString().split('T')[0],
        daysAfterPlanting: Number(daysAfterPlanting) || 1,
        areaHa: Number(areaHa) || 1.0,
        irrigationMethod: irrigationMethod || "Drip",
        growthStage: growthStage || "🌿 Ukuaji",
        moisture: Number(moisture) || 60
      };

      db.crops.push(newCrop);
      writeDb(db);
      return res.json({ success: true, crop: newCrop });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put("/api/crops/:id", (req, res) => {
    try {
      const id = Number(req.params.id);
      const db = readDb();
      const idx = db.crops.findIndex(c => c.id === id);
      if (idx !== -1) {
        db.crops[idx] = { ...db.crops[idx], ...req.body };
        writeDb(db);
        return res.json({ success: true, crop: db.crops[idx] });
      }
      return res.status(404).json({ success: false, error: "Zao halijapatikana." });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete("/api/crops/:id", (req, res) => {
    try {
      const id = Number(req.params.id);
      const db = readDb();
      db.crops = db.crops.filter(c => c.id !== id);
      writeDb(db);
      return res.json({ success: true, message: "Zao limefutwa." });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. SCHEDULES ENDPOINTS
  app.get("/api/schedules", (req, res) => {
    try {
      const userId = req.query.userId as string;
      const db = readDb();
      const filtered = userId ? db.schedules.filter(s => s.userId === userId) : db.schedules;
      return res.json({ success: true, schedules: filtered });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/schedules", (req, res) => {
    try {
      const { userId, cropId, date, daysAfterPlanting, kc, eto, etc, netIrrigation, grossIrrigation, rainAdjustment, status } = req.body;
      const db = readDb();
      const newSchedule: DbSchedule = {
        id: Date.now(),
        userId,
        cropId: Number(cropId),
        date: date || new Date().toISOString().split('T')[0],
        daysAfterPlanting: Number(daysAfterPlanting) || 1,
        kc: Number(kc) || 1.0,
        eto: Number(eto) || 4.5,
        etc: Number(etc) || 4.5,
        netIrrigation: Number(netIrrigation) || 0,
        grossIrrigation: Number(grossIrrigation) || 0,
        rainAdjustment: Number(rainAdjustment) || 0,
        status: status || 'PENDING'
      };
      db.schedules.push(newSchedule);
      writeDb(db);
      return res.json({ success: true, schedule: newSchedule });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put("/api/schedules/:id", (req, res) => {
    try {
      const id = Number(req.params.id);
      const db = readDb();
      const idx = db.schedules.findIndex(s => s.id === id);
      if (idx !== -1) {
        db.schedules[idx] = { ...db.schedules[idx], ...req.body };
        writeDb(db);
        return res.json({ success: true, schedule: db.schedules[idx] });
      }
      return res.status(404).json({ success: false, error: "Ratiba haijapatikana." });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. LIVE WEATHER PROXY ENDPOINT
  app.get("/api/weather", async (req, res) => {
    try {
      const lat = Number(req.query.latitude) || -6.827;
      const lon = Number(req.query.longitude) || 37.659;

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_sum,shortwave_radiation_sum&hourly=relative_humidity_2m,wind_speed_10m&timezone=Africa/Dar_es_Salaam&forecast_days=7`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        const weatherObj = {
          temperature: data.daily.temperature_2m_max[0] || 28.5,
          humidity: data.hourly.relative_humidity_2m[0] || 65,
          windSpeed: data.hourly.wind_speed_10m[0] || 12.0,
          solarRadiation: data.daily.shortwave_radiation_sum[0] || 18.0,
          rainfall: data.daily.precipitation_sum[0] || 0.0,
          forecast: data.daily.precipitation_sum || [0, 0, 0, 0, 0, 0, 0]
        };
        return res.json({ success: true, weather: weatherObj });
      } else {
        throw new Error("Satelaiti ya Open-Meteo inashindwa kupatikana kwa sasa.");
      }
    } catch (err: any) {
      // Return high-quality fallback weather on fail so the app keeps functioning elegantly
      return res.json({
        success: false,
        error: err.message,
        weather: {
          temperature: 28.5,
          humidity: 65,
          windSpeed: 12.3,
          solarRadiation: 18.5,
          rainfall: 1.5,
          forecast: [1.5, 0.0, 5.2, 0.0, 3.1, 10.5, 0.0]
        }
      });
    }
  })  // 6. AI RECOMMENDATIONS WITH GEMINI
  app.post("/api/ai/recommend", async (req, res) => {
    const { cropName, variety, growthStage, moisture, temperature, rainfall, region } = req.body;
    if (!cropName) {
      return res.status(400).json({ success: false, error: "Jina la zao linahitajika ili kutoa ushauri wa kilimo." });
    }

    let adviceText = "";
    let isFallback = false;

    // Retry wrapper for Gemini call with multi-model fallback to resist transient 503/429/overload errors
    const tryGeminiCall = async (maxAttempts = 3): Promise<string> => {
      let lastErr: any = null;
      const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest"];

      for (const modelName of modelsToTry) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            const client = getAiClient();
            const prompt = `Wewe ni mtaalamu wa kilimo wa satelaiti nchini Tanzania (Agronomist). Msaidie mkulima wa zao la ${cropName} (Aina: ${variety || 'Kienyeji'}), lililopo katika hatua ya "${growthStage || 'Ukuaji'}" mkoani ${region || 'Morogoro'}.
Unyevu wa udongo sasa ni ${moisture || 55}%, joto la hewa ni ${temperature || 28.5}°C, na kiwango cha mvua ya leo ni ${rainfall || 0}mm.

Toa mapendekezo ya kitaalam, mafupi, na ya vitendo kwa lugha ya KISWAHILI ya kueleweka. Jumuisha sehemu hizi tatu kwa kutumia alama za bullet au namba:
1. Ratiba na Ushauri wa Umwagiliaji (kulingana na unyevu).
2. Kudhibiti Wadudu/Magonjwa au Matumizi ya Mbolea yanayofaa sasa hivi.
3. Angalizo maalum la kiusalama kwa zao hili.

Ushauri wako uwe thabiti na usizidi maneno 150.`;

            const response = await client.models.generateContent({
              model: modelName,
              contents: prompt
            });

            if (response.text) {
              return response.text;
            }
            throw new Error("Ukurasa mkuu wa ushauri ulikuwa mtupu.");
          } catch (err: any) {
            lastErr = err;
            const errMsg = String(err.message || err || "");
            const isTransient = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("429") || errMsg.includes("demand");
            
            if (isTransient && attempt < maxAttempts) {
              const delay = attempt * 1200;
              console.warn(`[Gemini Retry] Model ${modelName} Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms due to transient error:`, errMsg);
              await new Promise(resolve => setTimeout(resolve, delay));
            } else {
              console.warn(`[Gemini Retry] Model ${modelName} failed or exhausted attempts. Falling back or throwing. Error:`, errMsg);
              break; // break attempt loop to try the next model
            }
          }
        }
      }
      throw lastErr || new Error("Imeshindwa baada ya majaribio mengi ya miundo yote.");
    };

    try {
      adviceText = await tryGeminiCall(3);
    } catch (err: any) {
      console.warn("Gemini advice generation failed or service unavailable, falling back to offline agronomy heuristics:", err);
      isFallback = true;
      
      // Offline heuristic agronomy engine in Swahili
      const cropLower = cropName.toLowerCase();
      let irrigationAdvice = "";
      if (Number(moisture) < 40) {
        irrigationAdvice = `1. RATIBA YA UMWAGILIAJI (Kulingana na Unyevu wa ${moisture}%):
- Udongo una unyevu mdogo sana. Zao la ${cropName} (${variety || 'Kienyeji'}) linahitaji umwagiliaji wa dharura mara moja mkoani ${region || 'Morogoro'}.
- Mwaga maji kwa dakika 30-45 asubuhi mapema au jioni ili kurejesha unyevu sahihi na kuzuia kukauka kwa mimea.`;
      } else if (Number(moisture) < 65) {
        irrigationAdvice = `1. RATIBA YA UMWAGILIAJI (Kulingana na Unyevu wa ${moisture}%):
- Kiwango cha unyevu kiko wastani lakini kiko karibu na kiwango cha chini.
- Mwaga maji kwa dakika 15 hivi karibuni ili kuweka shamba katika hali nzuri kwa ukuaji thabiti wa ${cropName}.`;
      } else {
        irrigationAdvice = `1. RATIBA YA UMWAGILIAJI (Kulingana na Unyevu wa ${moisture}%):
- Udongo una unyevu thabiti na wa kuridhisha kwa sasa. Hakuna haja ya kumwagilia shamba hivi sasa.
- Hii inasaidia kuzuia magonjwa ya mizizi kutokana na maji kujaa sana kwenye shamba la ${cropName}.`;
      }

      if (Number(rainfall) > 3) {
        irrigationAdvice += `\n* Kumbuka: Kuna mvua iliyorekodiwa ya ${rainfall}mm leo, kwa hiyo punguza umwagiliaji wa ziada.`;
      }

      let fertilizerDiseaseAdvice = "";
      if (cropLower.includes('mahindi')) {
        fertilizerDiseaseAdvice = `2. KUDHIBITI WADUDU NA MBOLEA (Hatua ya ${growthStage || 'Ukuaji'}):
- Katika hatua hii, weka mbolea ya kukuzia (kama Urea au CAN - kilo 50 kwa ekari) ikiwa bado hujafanya hivyo.
- Kagua majani mara kwa mara kubaini uwepo wa Kiwavi Jeshi wa Vuli (Fall Armyworm). Ukiona dalili, tumia dawa thabiti kama Belt au Duduthrin.`;
      } else if (cropLower.includes('nyanya')) {
        fertilizerDiseaseAdvice = `2. KUDHIBITI WADUDU NA MBOLEA (Hatua ya ${growthStage || 'Ukuaji'}):
- Nyanya zako zinahitaji mbolea yenye Calcium Nitrate na Potassium ili kuzuia ugonjwa wa kuoza makalio (blossom-end rot).
- Nyunyizia fungicides dhidi ya ugonjwa wa Chule (Early & Late Blight) na kagua uwepo wa wadudu wa Tuta Absoluta.`;
      } else if (cropLower.includes('mpunga')) {
        fertilizerDiseaseAdvice = `2. KUDHIBITI WADUDU NA MBOLEA (Hatua ya ${growthStage || 'Ukuaji'}):
- Hakikisha maji yanakaa kwenye mabonde au vitalu katika kina kisichozidi inchi 2.
- Weka Urea kilo 50 kwa ekari na dhibiti magugu yote ili kuzuia ushindani wa chakula.`;
      } else {
        fertilizerDiseaseAdvice = `2. KUDHIBITI WADUDU NA MBOLEA (Hatua ya ${growthStage || 'Ukuaji'}):
- Tunashauri kuweka mbolea ya N.P.K au mboji iliyoiva vizuri kulisha mizizi.
- Kagua shamba mara kwa mara kubaini chawa wa mimea au magonjwa ya ukungu ili kupulizia dawa sahihi kwa wakati.`;
      }

      let safetyAdvice = "";
      if (Number(temperature) > 31) {
        safetyAdvice = `3. ANGALIZO MAALUM LA USALAMA (Joto kali la ${temperature}°C):
- Joto kali linaongeza uvukizaji wa maji.
- Weka matandazo (mulching) ya nyasi kavu kuzuia uvukizaji na kulinda unyevu wa ardhi kwa muda mrefu.`;
      } else {
        safetyAdvice = `3. ANGALIZO MAALUM LA USALAMA:
- Hakikisha mifumo ya kusambaza maji haina uchafu kuzuia maji kutuama sehemu moja na kusababisha magonjwa ya kuvu.`;
      }

      adviceText = `🤖 [Ushauri mbadala wa Agronomist Satellite (Offline Heuristics Engine)]\n\nHuduma ya Gemini AI ina mahitaji makubwa kwa sasa au siri haijawekwa sahihi, kwa hivyo mfumo umezalisha ushauri huu mbadala wa kiotomatiki kwa usalama:\n\n${irrigationAdvice}\n\n${fertilizerDiseaseAdvice}\n\n${safetyAdvice}`;
    }

    try {
      // Save recommendation to local DB log for tracking
      const db = readDb();
      const newRec: DbAiRecommendation = {
        id: "ai-" + Date.now(),
        cropId: Number(req.body.cropId) || 0,
        date: new Date().toISOString(),
        advice: adviceText,
        forecastRain: Number(rainfall) || 0,
        moisture: Number(moisture) || 55
      };
      db.aiRecommendations.push(newRec);
      writeDb(db);

      return res.json({ success: true, advice: adviceText, isFallback, recommendation: newRec });
    } catch (err: any) {
      // Fallback response even if db write fails
      return res.json({ success: true, advice: adviceText, isFallback });
    }
  });

  // 6b. INTERACTIVE AI CHAT ASSISTANT WITH GEMINI (Q&A IN SWAHILI)
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ success: false, error: "Ujumbe unahitajika." });
      }

      let replyText = "";
      try {
        const client = getAiClient();
        const systemPrompt = `Wewe ni "Mshauri wa AI", mtaalamu wa kilimo wa kidijitali nchini Tanzania. 
Msaidie mkulima yeyote anayeuliza maswali kuhusu umwagiliaji, mbegu, magonjwa ya mazao, matumizi ya mbolea, na hali ya hewa.
Maswali yatakuja kwa Kiswahili au Kiingereza, jibu kwa lugha ile ile anayoulizia mkulima, kwa ufasaha, adabu, upendo na utaalamu wa hali ya juu.
Wape ushauri wa kitaalam wa vitendo na hatua kwa hatua. Jibu lako liwe fupi, lisizidi maneno 150 ili lisomeke vizuri kwenye simu za mkononi.`;

        const contents = [];
        if (history && Array.isArray(history)) {
          for (const turn of history) {
            contents.push({
              role: turn.role === "user" ? "user" : "model",
              parts: [{ text: turn.text }]
            });
          }
        }
        contents.push({
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nSwali la Mkulima: ${message}` }]
        });

        // Retry wrapper with fallback models to handle 503 high demand
        const tryChatCall = async (maxAttempts = 3): Promise<string> => {
          let lastErr: any = null;
          const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest"];
          
          for (const modelName of modelsToTry) {
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
              try {
                const response = await client.models.generateContent({
                  model: modelName,
                  contents: contents
                });
                if (response.text) {
                  return response.text;
                }
                throw new Error("Jibu la mazungumzo lilikuwa tupu.");
              } catch (err: any) {
                lastErr = err;
                const errMsg = String(err.message || err || "");
                const isTransient = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("429") || errMsg.includes("demand");
                
                if (isTransient && attempt < maxAttempts) {
                  const delay = attempt * 1200;
                  console.warn(`[Gemini Chat Retry] Model ${modelName} Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms due to transient error:`, errMsg);
                  await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                  console.warn(`[Gemini Chat Retry] Model ${modelName} failed or exhausted attempts. Error:`, errMsg);
                  break; // break attempt loop to try next model
                }
              }
            }
          }
          throw lastErr || new Error("Majaribio yote ya mazungumzo yameshindwa.");
        };

        replyText = await tryChatCall(3);
      } catch (geminiErr: any) {
        console.warn("Gemini Q&A chat failed, using local fallback heuristics:", geminiErr);
        
        // Swahili agricultural heuristic engine
        const msgLower = message.toLowerCase();
        if (msgLower.includes("mahindi") || msgLower.includes("corn") || msgLower.includes("maize")) {
          replyText = `🤖 [Mshauri wa Kilimo - Heuristics Offline Mode]:
Zao la Mahindi linahitaji sana nitrojeni katika hatua za mwanzo. Tumia mbolea ya Urea (kilo 50/ekari) siku 21-30 baada ya kupanda. Kagua uwepo vya viwavi jeshi wa vuli; ukigundua viwavi, nyunyizia dawa ya Duduthrin au Belt mara moja kudhibiti hasara.`;
        } else if (msgLower.includes("nyanya") || msgLower.includes("tomato")) {
          replyText = `🤖 [Mshauri wa Kilimo - Heuristics Offline Mode]:
Kwa zao la Nyanya, kuwa makini na ugonjwa wa Kuoza Makalio (blossom-end rot) unaosababishwa na ukosefu wa chokaa (Calcium) na maji yasiyo na uwiano. Dhibiti ukungu (early/late blight) kwa kupuliza fungicides na kagua uwepo wa Tuta Absoluta.`;
        } else if (msgLower.includes("mpunga") || msgLower.includes("rice")) {
          replyText = `🤖 [Mshauri wa Kilimo - Heuristics Offline Mode]:
Mpunga unahitaji unyevu wa juu sana katika hatua ya kuchipua na kutoa masuke. Hakikisha shamba lina maji ya kutosha lakini yasiyozidi inchi 2 ili kuepuka kuoza mizizi. Ondoa magugu mara kwa mara kuboresha uvunaji.`;
        } else if (msgLower.includes("magonjwa") || msgLower.includes("ugonjwa") || msgLower.includes("wadudu") || msgLower.includes("disease")) {
          replyText = `🤖 [Mshauri wa Kilimo - Heuristics Offline Mode]:
Magonjwa mengi ya mazao yanatokana na ukungu (fungal) unaochochewa na unyevu wa juu wa hewa au maji yaliyotuama. Daima hakikisha shamba lina mfumo mzuri wa mifereji ya maji, punguza msongamano vya mimea, na utumie mbegu zilizoidhinishwa (certified seeds).`;
        } else if (msgLower.includes("mbolea") || msgLower.includes("fertilizer")) {
          replyText = `🤖 [Mshauri wa Kilimo - Heuristics Offline Mode]:
Matumizi ya mbolea yanapaswa kuendana na hatua ya zao. Wakati wa kupanda tumia mbolea ya DAP kulisha mizizi. Wakati wa kukuzia (wiki 3-4 baadaye), tumia mbolea ya Urea na CAN kwa ajili ya majani na afya ya zao kwa ujumla.`;
        } else {
          replyText = `🤖 [Mshauri wa Kilimo - Heuristics Offline Mode]:
Asante kwa swali lako la kilimo. Nyakati za vijijini zenye mtandao hafifu au mzigo mkubwa wa AI, ninapendekeza:
1. Umwagiliaji ufanyike asubuhi mapema (kabla ya jua kali) au jioni ili kuzuia uvukizaji mkubwa wa maji.
2. Hakikisha unaongeza samadi/mboji iliyoiva ili kuongeza uwezo wa udongo kushika maji.
3. Kagua mimea yako kila wiki ili kubaini wadudu mapema kabla ya kuleta madhara makubwa mkoani kwako.`;
        }
      }

      return res.json({ success: true, reply: replyText });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET SIMULATED SMS LOGS FOR CLIENT VISIBILITY
  app.get("/api/simulated-sms", (req, res) => {
    try {
      const db = readDb();
      return res.json({ success: true, smsList: db.simulatedSms || [] });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. REAL SMS SENDER WITH PROVIDERS (Twilio / Africa's Talking / Sandbox)
  app.post("/api/send-sms", async (req, res) => {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ 
        success: false, 
        error: "Namba ya simu na ujumbe wa matini vinahitajika." 
      });
    }

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    const atUsername = process.env.AFRICASTALKING_USERNAME;
    const atApiKey = process.env.AFRICASTALKING_API_KEY;
    const atSenderId = process.env.AFRICASTALKING_SENDER_ID;

    let smsSent = false;
    let providerUsed = '';
    let apiErrorDetail = '';

    try {
      // 1. Try Twilio integration (Primary)
      if (twilioSid && twilioToken && twilioFrom) {
        const formattedPhone = formatPhoneNumber(phone);
        const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
        
        const params = new URLSearchParams();
        params.append('From', twilioFrom);
        params.append('To', formattedPhone);
        params.append('Body', message);

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${auth}`
          },
          body: params.toString()
        });

        const data = await response.json();
        if (response.ok) {
          smsSent = true;
          providerUsed = 'twilio';
        } else {
          apiErrorDetail = data.message || "Mtoa huduma wa Twilio haujakamilisha utumaji sahihi.";
          console.log(`[SMS Gateway Twilio] Taarifa: ${apiErrorDetail}`);
        }
      }

      // 2. Try Africa's Talking (Secondary)
      if (!smsSent && atUsername && atApiKey) {
        const formattedPhone = formatPhoneNumber(phone);
        const isSandbox = atUsername.toLowerCase() === 'sandbox';
        const url = isSandbox 
          ? "https://api.sandbox.africastalking.com/version1/messaging"
          : "https://api.africastalking.com/version1/messaging";

        const params = new URLSearchParams();
        params.append('username', atUsername);
        params.append('to', formattedPhone);
        params.append('message', message);
        if (atSenderId) {
          params.append('from', atSenderId);
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "apiKey": atApiKey
          },
          body: params.toString()
        });

        const data = await response.json();
        if (response.ok && data.SMSMessageData && data.SMSMessageData.Recipients) {
          const rec = data.SMSMessageData.Recipients[0];
          if (rec && (rec.status === 'Success' || rec.status === 'Success (Sent To Gateway)' || rec.statusCode === 101)) {
            smsSent = true;
            providerUsed = 'africastalking';
          } else {
            apiErrorDetail = rec ? `Hali ya utumaji: ${rec.status}` : "Mtoa huduma wa Africa's Talking haujakamilisha utumaji sahihi.";
          }
        } else {
          apiErrorDetail = data.errorMessage || "Mtoa huduma wa Africa's Talking haujakamilisha utumaji sahihi.";
        }
      }

      if (smsSent) {
        return res.json({ success: true, provider: providerUsed });
      }

      // 3. Fallback to Simulated Delivery (Virtual simulation)
      // This allows the app to never block the user even when daily limit or credentials are met.
      console.log(`[SMS Simulator Fallback] Delivering SMS virtually to ${phone}: "${message}". Info: ${apiErrorDetail || 'Mtoa huduma wa SMS bado hajaunganishwa.'}`);
      
      const db = readDb();
      if (!db.simulatedSms) {
        db.simulatedSms = [];
      }
      db.simulatedSms.push({
        id: "sim-" + Date.now(),
        phone,
        message,
        timestamp: new Date().toISOString(),
        reason: apiErrorDetail || "Mtoa huduma wa SMS hajaunganishwa thabiti"
      });
      writeDb(db);

      return res.json({ 
        success: true, 
        provider: 'simulator', 
        isSimulated: true,
        reason: apiErrorDetail || "Mtoa huduma wa SMS bado hajaunganishwa kwa funguo za siri.",
        info: "Ujumbe umehifadhiwa kwenye kumbukumbu ya Seva Virtual Simulator kwa ufanisi!"
      });

    } catch (error: any) {
      console.log("SMS simulation path fallback engaged:", error);
      return res.json({
        success: true,
        provider: 'simulator',
        isSimulated: true,
        reason: error.message || "Mchakato mbadala umekamilika.",
        info: "Mawasiliano yameanguka kwenye simulator kwa usalama!"
      });
    }
  });

  // --- VITE MIDDLEWARE OR STATIC SERVER ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
