import fs from "fs";
import path from "path";
import crypto from "crypto";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const SQLITE_FILE = path.join(DATA_DIR, "sqlite.db");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database Interfaces
export interface DbUser {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  name: string;
  phone: string;
  role: string;
  email: string;
  region: string;
  adminId?: string;
}

export interface DbFarmer {
  id: number;
  userId: string;
  name: string;
  phone: string;
  region: string;
  district: string;
  village: string;
  latitude: number;
  longitude: number;
  registeredDate: string;
}

export interface DbCrop {
  id: number;
  userId: string;
  farmerId: number;
  cropName: string;
  variety: string;
  plantingDate: string;
  daysAfterPlanting: number;
  areaHa: number;
  irrigationMethod: string;
  growthStage: string;
  moisture: number;
}

export interface DbSchedule {
  id: number;
  userId: string;
  cropId: number;
  date: string;
  daysAfterPlanting: number;
  kc: number;
  eto: number;
  etc: number;
  netIrrigation: number;
  grossIrrigation: number;
  rainAdjustment: number;
  status: 'PENDING' | 'COMPLETED';
}

export interface DbAiRecommendation {
  id: string;
  cropId: number;
  date: string;
  advice: string;
  forecastRain: number;
  moisture: number;
}

export interface DbSimulatedSms {
  id: string;
  phone: string;
  message: string;
  timestamp: string;
  reason: string;
}

export interface DatabaseSchema {
  users: DbUser[];
  farmers: DbFarmer[];
  crops: DbCrop[];
  schedules: DbSchedule[];
  aiRecommendations: DbAiRecommendation[];
  simulatedSms?: DbSimulatedSms[];
}

// Initialize SQLite database connection
export const dbSqlite = new Database(SQLITE_FILE);

// Setup database tables
dbSqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    salt TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT,
    email TEXT,
    region TEXT,
    adminId TEXT
  );

  CREATE TABLE IF NOT EXISTS farmers (
    id INTEGER PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    region TEXT,
    district TEXT,
    village TEXT,
    latitude REAL,
    longitude REAL,
    registeredDate TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS crops (
    id INTEGER PRIMARY KEY,
    userId TEXT NOT NULL,
    farmerId INTEGER NOT NULL,
    cropName TEXT NOT NULL,
    variety TEXT,
    plantingDate TEXT NOT NULL,
    daysAfterPlanting INTEGER NOT NULL,
    areaHa REAL NOT NULL,
    irrigationMethod TEXT,
    growthStage TEXT,
    moisture INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY,
    userId TEXT NOT NULL,
    cropId INTEGER NOT NULL,
    date TEXT NOT NULL,
    daysAfterPlanting INTEGER NOT NULL,
    kc REAL NOT NULL,
    eto REAL NOT NULL,
    etc REAL NOT NULL,
    netIrrigation REAL NOT NULL,
    grossIrrigation REAL NOT NULL,
    rainAdjustment REAL NOT NULL,
    status TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS aiRecommendations (
    id TEXT PRIMARY KEY,
    cropId INTEGER NOT NULL,
    date TEXT NOT NULL,
    advice TEXT NOT NULL,
    forecastRain REAL NOT NULL,
    moisture REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS simulatedSms (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    reason TEXT
  );
`);

// Table migrations for existing databases
try {
  dbSqlite.exec("ALTER TABLE users ADD COLUMN adminId TEXT");
} catch (e) {
  // column already exists
}

// Password Helpers using bcryptjs with legacy PBKDF2 compatibility
export function hashPassword(password: string, salt = bcrypt.genSaltSync(10)): { hash: string; salt: string } {
  const hash = bcrypt.hashSync(password, salt);
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
    try {
      return bcrypt.compareSync(password, hash);
    } catch {
      return false;
    }
  }
  // Fallback to PBKDF2 for old/migrated records
  const legacyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return legacyHash === hash;
}

// Check if SQLite is completely empty to perform initial migration from db.json or seed defaults
const userCountResult = dbSqlite.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };

if (userCountResult.count === 0) {
  console.log("SQLite database is empty. Performing initial migration and seeding...");
  let initialDb: DatabaseSchema;

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, "utf8");
      initialDb = JSON.parse(data);
      console.log(`Loaded existing data from db.json for SQLite seeding (${initialDb.farmers?.length || 0} farmers, ${initialDb.crops?.length || 0} crops).`);
    } catch (error) {
      console.error("Failed to parse db.json, generating defaults instead:", error);
      initialDb = getDefaults();
    }
  } else {
    initialDb = getDefaults();
  }

  // Write default or migrated data directly to SQLite
  writeDb(initialDb);
}

function getDefaults(): DatabaseSchema {
  const { hash, salt } = hashPassword("admin");
  return {
    users: [
      {
        id: "admin-id",
        username: "admin",
        passwordHash: hash,
        salt,
        name: "Rajabu Simfukwe",
        phone: "0794172297",
        role: "Mhandisi Mkuu",
        email: "niyovisitoni@gmail.com",
        region: "Morogoro"
      }
    ],
    farmers: [
      { id: 101, userId: "admin-id", name: 'Rajabu Simfukwe', phone: '0794172297', region: 'Morogoro', district: 'Kilosa', village: 'Mhenda', latitude: -6.827, longitude: 37.659, registeredDate: '2026-05-10T10:00:00Z' },
      { id: 102, userId: "admin-id", name: 'Fatuma Juma', phone: '0655123456', region: 'Dodoma', district: 'Bahi', village: 'Mundemu', latitude: -6.163, longitude: 35.751, registeredDate: '2026-06-01T08:30:00Z' },
      { id: 103, userId: "admin-id", name: 'Joseph Kahama', phone: '0712345678', region: 'Mbeya', district: 'Mbarali', village: 'Rujewa', latitude: -8.900, longitude: 33.450, registeredDate: '2026-06-15T14:15:00Z' }
    ],
    crops: [
      { id: 201, userId: "admin-id", farmerId: 101, cropName: 'mahindi', variety: 'Seedco 513', plantingDate: '2026-05-12', daysAfterPlanting: 45, areaHa: 1.5, irrigationMethod: 'Drip', growthStage: '🌿 Ukuaji', moisture: 68 },
      { id: 202, userId: "admin-id", farmerId: 102, cropName: 'nyanya', variety: 'Assila F1', plantingDate: '2026-06-02', daysAfterPlanting: 24, areaHa: 0.5, irrigationMethod: 'Sprinkler', growthStage: '🌿 Kuota', moisture: 35 },
      { id: 203, userId: "admin-id", farmerId: 103, cropName: 'mpunga', variety: 'SARO 5', plantingDate: '2026-05-20', daysAfterPlanting: 37, areaHa: 2.0, irrigationMethod: 'Flood', growthStage: '🌿 Ukuaji', moisture: 72 }
    ],
    schedules: [],
    aiRecommendations: [],
    simulatedSms: []
  };
}

// Read database from SQLite
export function readDb(): DatabaseSchema {
  try {
    const users = dbSqlite.prepare("SELECT * FROM users").all() as DbUser[];
    const farmers = dbSqlite.prepare("SELECT * FROM farmers").all() as DbFarmer[];
    const crops = dbSqlite.prepare("SELECT * FROM crops").all() as DbCrop[];
    const schedules = dbSqlite.prepare("SELECT * FROM schedules").all() as DbSchedule[];
    const aiRecommendations = dbSqlite.prepare("SELECT * FROM aiRecommendations").all() as DbAiRecommendation[];
    const simulatedSms = dbSqlite.prepare("SELECT * FROM simulatedSms").all() as DbSimulatedSms[];

    return {
      users,
      farmers,
      crops,
      schedules,
      aiRecommendations,
      simulatedSms
    };
  } catch (error) {
    console.error("Error reading from SQLite database:", error);
    return { users: [], farmers: [], crops: [], schedules: [], aiRecommendations: [], simulatedSms: [] };
  }
}

// Write database atomically using SQLite Transaction
export function writeDb(data: DatabaseSchema): void {
  const transaction = dbSqlite.transaction(() => {
    // Clear old records
    dbSqlite.prepare("DELETE FROM users").run();
    dbSqlite.prepare("DELETE FROM farmers").run();
    dbSqlite.prepare("DELETE FROM crops").run();
    dbSqlite.prepare("DELETE FROM schedules").run();
    dbSqlite.prepare("DELETE FROM aiRecommendations").run();
    dbSqlite.prepare("DELETE FROM simulatedSms").run();

    // Re-insert users
    const insertUser = dbSqlite.prepare(`
      INSERT INTO users (id, username, passwordHash, salt, name, phone, role, email, region, adminId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const u of data.users) {
      insertUser.run(u.id, u.username, u.passwordHash, u.salt, u.name, u.phone, u.role, u.email, u.region, u.adminId || null);
    }

    // Re-insert farmers
    const insertFarmer = dbSqlite.prepare(`
      INSERT INTO farmers (id, userId, name, phone, region, district, village, latitude, longitude, registeredDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const f of data.farmers) {
      insertFarmer.run(f.id, f.userId, f.name, f.phone, f.region, f.district, f.village, f.latitude, f.longitude, f.registeredDate);
    }

    // Re-insert crops
    const insertCrop = dbSqlite.prepare(`
      INSERT INTO crops (id, userId, farmerId, cropName, variety, plantingDate, daysAfterPlanting, areaHa, irrigationMethod, growthStage, moisture)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of data.crops) {
      insertCrop.run(c.id, c.userId, c.farmerId, c.cropName, c.variety, c.plantingDate, c.daysAfterPlanting, c.areaHa, c.irrigationMethod, c.growthStage, c.moisture);
    }

    // Re-insert schedules
    const insertSchedule = dbSqlite.prepare(`
      INSERT INTO schedules (id, userId, cropId, date, daysAfterPlanting, kc, eto, etc, netIrrigation, grossIrrigation, rainAdjustment, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of data.schedules) {
      insertSchedule.run(s.id, s.userId, s.cropId, s.date, s.daysAfterPlanting, s.kc, s.eto, s.etc, s.netIrrigation, s.grossIrrigation, s.rainAdjustment, s.status);
    }

    // Re-insert aiRecommendations
    const insertRec = dbSqlite.prepare(`
      INSERT INTO aiRecommendations (id, cropId, date, advice, forecastRain, moisture)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const r of data.aiRecommendations) {
      insertRec.run(r.id, r.cropId, r.date, r.advice, r.forecastRain, r.moisture);
    }

    // Re-insert simulated SMS
    const insertSms = dbSqlite.prepare(`
      INSERT INTO simulatedSms (id, phone, message, timestamp, reason)
      VALUES (?, ?, ?, ?, ?)
    `);
    if (data.simulatedSms) {
      for (const sms of data.simulatedSms) {
        insertSms.run(sms.id, sms.phone, sms.message, sms.timestamp, sms.reason);
      }
    }
  });

  transaction();
}

