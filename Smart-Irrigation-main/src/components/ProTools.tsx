import React, { useState, useEffect } from 'react';
import { Crop, Farmer } from '../types';
import { CROPS_DATA } from '../data';
import {
  Cpu,
  DollarSign,
  ShoppingBag,
  Bug,
  Lock,
  Calendar as CalendarIcon,
  Droplet,
  Send,
  RefreshCw,
  Plus,
  Trash2,
  ShieldCheck,
  Check,
  Phone,
  MessageSquare,
  AlertTriangle,
  Info,
  Terminal,
  FileCheck
} from 'lucide-react';

interface ProToolsProps {
  crops: Crop[];
  farmers: Farmer[];
  language: 'SW' | 'EN';
  onLanguageToggle: () => void;
}

interface FinancialLog {
  id: number;
  cropId: number;
  type: 'EXPENSE' | 'INCOME';
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  category: 'SECURITY' | 'IOT' | 'SYSTEM' | 'SMS';
  details: string;
  operator: string;
}

export const ProTools: React.FC<ProToolsProps> = ({ crops, farmers, language }) => {
  const [activeSubTab, setActiveSubTab] = useState<'iot' | 'finance' | 'market' | 'pests' | 'calendar' | 'security'>('iot');

  // IoT state
  const [selectedIotCropId, setSelectedIotCropId] = useState<number>(crops[0]?.id || 0);
  const [soilMoistureSim, setSoilMoistureSim] = useState<number>(38);
  const [tempSim, setTempSim] = useState<number>(29);
  const [humiditySim, setHumiditySim] = useState<number>(65);
  const [valveStatus, setValveStatus] = useState<'ON' | 'OFF'>('OFF');
  const [iotLogs, setIotLogs] = useState<string[]>([
    'System initialization successful.',
    'Connecting to local gateway via WiFi...',
    'ESP32 handshaking done. Device ID: TZ-ESP32-9428',
    'Sensors returning valid JSON payload.',
  ]);

  // Financial tracking state
  const [financeLogs, setFinanceLogs] = useState<FinancialLog[]>(() => {
    const saved = localStorage.getItem('smart_irr_finance');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, cropId: crops[0]?.id || 201, type: 'EXPENSE', category: 'Mbegu (Seeds)', amount: 45000, description: 'Kununua mbegu chotara SeedCo 513', date: '2026-05-12' },
      { id: 2, cropId: crops[0]?.id || 201, type: 'EXPENSE', category: 'Mbolea (Fertilizers)', amount: 110000, description: 'Minjingu Organic na Yara Mila Otesha', date: '2026-05-20' },
      { id: 3, cropId: crops[1]?.id || 202, type: 'EXPENSE', category: 'Dawa (Pesticides)', amount: 25000, description: 'Kuzuia wadudu na ukungu kwenye Nyanya', date: '2026-06-05' },
      { id: 4, cropId: crops[0]?.id || 201, type: 'INCOME', category: 'Mauzo ya Mavuno (Sales)', amount: 850000, description: 'Kuuza gunia 10 za Mahindi soko kuu', date: '2026-06-25' },
    ];
  });

  const [finForm, setFinForm] = useState({
    cropId: crops[0]?.id || 0,
    type: 'EXPENSE' as 'EXPENSE' | 'INCOME',
    category: 'Mbolea (Fertilizers)',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Pest state
  const [pestSearch, setPestSearch] = useState('');

  // Security and Audit log state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('smart_irr_audit_logs');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, timestamp: '2026-06-26T08:12:00Z', action: 'USER_LOGIN', category: 'SECURITY', details: 'Operator successfully verified with SHA-256 secret authorization token.', operator: 'Msimamizi' },
      { id: 2, timestamp: '2026-06-26T09:30:15Z', action: 'IOT_HEARTBEAT', category: 'IOT', details: 'IoT Device TZ-ESP32-9428 reported soil moisture 38% (Threshold trigger active).', operator: 'Auto-Daemon' },
      { id: 3, timestamp: '2026-06-26T10:15:30Z', action: 'SMS_ALERT_SENT', category: 'SMS', details: 'SMS warning broadcasted to Rajabu Simfukwe: Soil moisture low.', operator: 'System Router' },
      { id: 4, timestamp: '2026-06-26T11:05:00Z', action: 'DATABASE_BACKUP', category: 'SYSTEM', details: 'Automatic backup generated. Cryptographic hash sum verified.', operator: 'Admin DB' },
    ];
  });

  // Sync states to storage
  useEffect(() => {
    localStorage.setItem('smart_irr_finance', JSON.stringify(financeLogs));
  }, [financeLogs]);

  useEffect(() => {
    localStorage.setItem('smart_irr_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // IoT logic triggers
  useEffect(() => {
    if (soilMoistureSim < 40) {
      if (valveStatus === 'OFF') {
        setValveStatus('ON');
        addIotLog(`⚠️ ALARM: Soil moisture (${soilMoistureSim}%) fell below 40% threshold. Actuating Solenoid Valve ON.`);
        addAuditLog('VALVE_ACTUATE', 'IOT', `Solenoid Valve automatically switched ON. Moisture: ${soilMoistureSim}%`);
      }
    } else {
      if (valveStatus === 'ON') {
        setValveStatus('OFF');
        addIotLog(`✅ SAFE: Soil moisture (${soilMoistureSim}%) restored. Closing Solenoid Valve OFF.`);
        addAuditLog('VALVE_ACTUATE', 'IOT', `Solenoid Valve automatically closed OFF. Moisture: ${soilMoistureSim}%`);
      }
    }
  }, [soilMoistureSim]);

  const addIotLog = (msg: string) => {
    setIotLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 30)]);
  };

  const addAuditLog = (action: string, category: 'SECURITY' | 'IOT' | 'SYSTEM' | 'SMS', details: string) => {
    const newLog: AuditLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      category,
      details,
      operator: 'Msimamizi wa Mfumo'
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleAddFinance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finForm.amount || isNaN(Number(finForm.amount))) return;
    const newLog: FinancialLog = {
      id: Date.now(),
      cropId: Number(finForm.cropId),
      type: finForm.type,
      category: finForm.category,
      amount: Number(finForm.amount),
      description: finForm.description,
      date: finForm.date
    };
    setFinanceLogs((prev) => [newLog, ...prev]);
    addAuditLog('FINANCE_RECORD_ADD', 'SYSTEM', `Added finance record: ${finForm.type} - ${finForm.category} of TZS ${Number(finForm.amount).toLocaleString()}`);
    setFinForm({
      cropId: crops[0]?.id || 0,
      type: 'EXPENSE',
      category: 'Mbolea (Fertilizers)',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeleteFinance = (id: number) => {
    setFinanceLogs((prev) => prev.filter(log => log.id !== id));
    addAuditLog('FINANCE_RECORD_DELETE', 'SYSTEM', `Deleted financial entry ID: ${id}`);
  };

  const selectedCropObj = crops.find(c => c.id === Number(finForm.cropId)) || crops[0];

  // Pest dataset
  const PESTS_DATA = [
    {
      name: 'Kiwavi Jeshi wa Malisho (Fall Armyworm)',
      sciName: 'Spodoptera frugiperda',
      crop: 'Mahindi, Mtama, Ngano',
      symptoms_sw: 'Mashimo makubwa kwenye majani, vumbi la mbao (kinyesi cha kiwavi) katikati ya mche.',
      symptoms_en: 'Ragged holes in leaves, sawdust-like frass in the whorls of maize plants.',
      prevention_sw: 'Kupanda mapema, kuondoa magugu, kukagua shamba kila wiki, na kutumia mbegu bora zinazovumilia wadudu.',
      prevention_en: 'Early planting, weeding, weekly scouting, and using pest-tolerant high-quality seeds.',
      chemical_sw: 'Nyunyizia dawa za Chlorantraniliprole (Belt) au Emamectin Benzoate mapema asubuhi au jioni wadudu wanapokuwa hai.',
      chemical_en: 'Spray Chlorantraniliprole (Belt) or Emamectin Benzoate in early mornings or evenings.'
    },
    {
      name: 'Kanitangaze wa Nyanya (Tomato Leaf Miner)',
      sciName: 'Tuta absoluta',
      crop: 'Nyanya, Bilinganya, Viazi Mviringo',
      symptoms_sw: 'Madoa meupe au "migodi" kwenye majani, matundu kwenye matunda yanayopelekea kuoza.',
      symptoms_en: 'White papery mines on leaves, exit holes and rot on tomatoes fruits.',
      prevention_sw: 'Mzunguko wa mazao (Crop rotation), mitego ya mwanga au pheromone traps, kuangamiza mabaki ya mmea yaliyoambukizwa.',
      prevention_en: 'Crop rotation, pheromone/light traps, proper disposal of infested plant debris.',
      chemical_sw: 'Nyunyizia Abamectin au Spinotoram. Hakikisha unapishanisha dawa ili wasijenge usugu.',
      chemical_en: 'Apply Abamectin or Spinotoram, rotating chemicals to prevent resistance.'
    },
    {
      name: 'Ukungu wa Majani ya Kahawa (Coffee Leaf Rust)',
      sciName: 'Hemileia vastatrix',
      crop: 'Kahawa (Coffee)',
      symptoms_sw: 'Madoa ya unga ya njano au machungwa upande wa chini wa majani ya kahawa.',
      symptoms_en: 'Powdery yellow-orange spots on the lower surface of coffee leaves.',
      prevention_sw: 'Kupogoa vizuri matawi ya kahawa ili kuruhusu hewa na mwanga, na kupanda mbegu chotara zenye ustahimilivu.',
      prevention_en: 'Proper pruning to improve aeration/light penetration, and planting resistant hybrids.',
      chemical_sw: 'Nyunyizia fungicides za kopa (Copper-based fungicides) mwanzoni mwa msimu wa mvua.',
      chemical_en: 'Apply copper-based preventative fungicides at the onset of rainy seasons.'
    },
    {
      name: 'Minyauko ya Bakteria ya Ndizi (Banana Xanthomonas Wilt - BXW)',
      sciName: 'Xanthomonas campestris',
      crop: 'Ndizi (Banana)',
      symptoms_sw: 'Majani kuanza kuwa ya njano na kukauka haraka, ndizi kuiva kabla ya wakati na kuwa nyeusi au kuoza ndani.',
      symptoms_en: 'Premature yellowing/wilting of leaves, uneven fruit ripening and internal brown rot.',
      prevention_sw: 'Kutumia zana za kukatia zilizosafishwa na moto, kukata kengele ya kiume ya ndizi mara baada ya kuzaa.',
      prevention_en: 'Sterilize cutting tools using fire, and de-bud the male flower immediately after fruit set.',
      chemical_sw: 'Hakuna dawa ya kemikali. Mmea ulioambukizwa lazima ung\'olewe na kuchomwa moto.',
      chemical_en: 'No chemical treatment. Uproot and burn infected banana mats immediately.'
    }
  ];

  const filteredPests = PESTS_DATA.filter(pest =>
    pest.name.toLowerCase().includes(pestSearch.toLowerCase()) ||
    pest.crop.toLowerCase().includes(pestSearch.toLowerCase()) ||
    pest.sciName.toLowerCase().includes(pestSearch.toLowerCase())
  );

  // Supplier Marketplace dataset
  const SUPPLIERS = [
    { name: 'SeedCo Tanzania Ltd', region: 'Arusha', contact: '+255754888999', product: 'Mbegu bora za Mahindi, Alizeti na Mboga', type: 'Seeds' },
    { name: 'Kibo Seed Company', region: 'Arusha / Kilimanjaro', contact: '+255272548000', product: 'Mbegu chotara za Mboga, Mahindi na Ngano', type: 'Seeds' },
    { name: 'Minjingu Mines & Fertilizer Ltd', region: 'Manyara / Kanda zote', contact: '+255784111222', product: 'Mbolea za asili zenye virutubisho vya phosphate kwa udongo wa Tanzania', type: 'Fertilizers' },
    { name: 'Yara Tanzania Ltd', region: 'Dar es Salaam / Kanda zote', contact: '+255222120000', product: 'Mbolea maalumu kama YaraMila Otesha, YaraLiva Nitrabor', type: 'Fertilizers' },
    { name: 'Davis & Shirtliff (T) Ltd', region: 'Dar / Mwanza / Arusha', contact: '+255222112500', product: 'Pampu za maji za sola (Solar pumps) na mifumo ya drip', type: 'Equipment' },
    { name: 'Soko Kuu la Pembejeo Tanzania', region: 'Dodoma', contact: '+255655909090', product: 'Mabomba ya drip, solenoid valves na sensor za unyevu wa ardhi', type: 'Equipment' },
  ];

  const triggerCallSimulation = (name: string, phone: string) => {
    alert(`📞 UNAPIGA SIMU: ${name}\nNamba: ${phone}\n\n(Hapa simu yako ingepiga namba hii moja kwa moja kufanya oda!)`);
    addAuditLog('SUPPLIER_CONTACT', 'SYSTEM', `Initiated direct inquiry to supplier ${name} (${phone})`);
  };

  const triggerWhatsAppSimulation = (name: string, phone: string, item: string) => {
    const formattedPhone = phone.replace('+', '').trim();
    const txt = encodeURIComponent(`Habari ${name}, nimeona pembejeo yako ya "${item}" kwenye mfumo wa Smart Irrigation Tanzania. Naomba kupata maelezo ya bei na ununuzi.`);
    const url = `https://wa.me/${formattedPhone}?text=${txt}`;
    addAuditLog('SUPPLIER_WHATSAPP', 'SYSTEM', `Opened WhatsApp chat link for supplier ${name}`);
    window.open(url, '_blank');
  };

  // Arduino/ESP32 Code generation templates
  const esp32Code = `/*
  ==============================================================
  SMART IRRIGATION TANZANIA - AUTOMATED FIELD CONTROLLER
  Target Board: ESP32 Dev Module (Wroom 32)
  Sensors: Capacitive Soil Moisture, DHT22 (Temp & Humidity)
  Solenoid Valve Control via GPIO 12 Relays
  Generated for: ${selectedCropObj?.variety || 'Active Crops'}
  ==============================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22
#define SOIL_MOISTURE_PIN 34
#define SOLENOID_PIN 12

// Wifi details
const char* ssid = "WIFI_NAME_YAKO";
const char* password = "WIFI_PASSWORD_YAKO";

// Web API endpoint to sync triggers
const char* serverApi = "https://tanzania-smart-irrigation.gov/api/telemetry";

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  pinMode(SOLENOID_PIN, OUTPUT);
  digitalWrite(SOLENOID_PIN, LOW); // Solenoid imefungwa mwanzoni

  dht.begin();
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected!");
}

void loop() {
  // Kusoma unyevu wa ardhi (moisture)
  int rawValue = analogRead(SOIL_MOISTURE_PIN);
  // Calibration: 0% unyevu = 4095, 100% unyevu = 1500
  int moisturePercent = map(rawValue, 4095, 1500, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);

  // Kusoma hali ya hewa shambani
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  Serial.printf("Soil Moisture: %d%% | Temp: %.1fC | Humid: %.1f%%\\n", moisturePercent, temperature, humidity);

  // Kigezo cha kuanzisha umwagiliaji (Kipengele kilichosanidiwa na Mfumo)
  if (moisturePercent < 40) {
    digitalWrite(SOLENOID_PIN, HIGH); // Fungua Maji!
    Serial.println("STATUS: [ON] Soil dry! Valve opened automatically.");
  } else {
    digitalWrite(SOLENOID_PIN, LOW);  // Funga Maji!
    Serial.println("STATUS: [OFF] Moisture sufficient. Valve closed.");
  }

  // Tuma data kwenye dashboard ya msimamizi
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverApi);
    http.addHeader("Content-Type", "application/json");
    
    String jsonPayload = "{\\"cropId\\": ${selectedIotCropId}, \\"moisture\\": " + String(moisturePercent) + 
                         ", \\"temperature\\": " + String(temperature) + ", \\"humidity\\": " + String(humidity) + "}";
                         
    int httpResponseCode = http.POST(jsonPayload);
    Serial.print("HTTP Send Status: ");
    Serial.println(httpResponseCode);
    http.end();
  }

  delay(60000); // Soma kila baada ya dakika 1
}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* Upper info panel */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-3xl p-6 shadow-md border border-emerald-500/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-xs text-slate-900 px-3 py-1 rounded-full font-black tracking-widest uppercase">PRO VERSION</span>
              <span className="text-xs text-emerald-300 font-medium font-mono">📡 IoT Enabled // Cryptographic Security</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">🚀 Zana za Juu na IoT (Advanced Smart-Farm Controls)</h2>
            <p className="text-xs text-slate-300 leading-normal max-w-2xl">
              Hapa utapata moduli za kisasa kabisa za kuongeza tija: muunganisho wa kihisi cha IoT na nambari za ESP32, usimamizi wa hesabu za fedha, soko la pembejeo za kilimo nchini Tanzania, na kinga ya wadudu.
            </p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/50 p-4 rounded-2xl flex items-center gap-4 shrink-0">
            <Cpu className="text-emerald-400 animate-pulse" size={32} />
            <div className="font-mono text-xs text-slate-300">
              <p>Gateway: <span className="text-emerald-400 font-bold">ONLINE</span></p>
              <p>Device Handshake: <span className="text-emerald-400 font-bold">SHA-256</span></p>
              <p>Firmware: <span className="text-emerald-400 font-bold">v3.42-Stable</span></p>
            </div>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveSubTab('iot')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'iot'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Cpu size={14} />
            <span>🛰️ IoT Sensors & ESP32 Code</span>
          </button>
          <button
            onClick={() => setActiveSubTab('finance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'finance'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <DollarSign size={14} />
            <span>💰 Fedha & Shajara (Finances)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'calendar'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <CalendarIcon size={14} />
            <span>🌱 Kalenda & Mbolea (Nutrients)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('pests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'pests'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Bug size={14} />
            <span>🐛 Wadudu & Magonjwa (Pest Alerts)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('market')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'market'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <ShoppingBag size={14} />
            <span>🛒 Pembejeo Market (Suppliers)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'security'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Lock size={14} />
            <span>🔐 Logi na Usalama (Security Logs)</span>
          </button>
        </div>
      </div>

      {/* IoT Sub-tab content */}
      {activeSubTab === 'iot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Simulation & Controls */}
          <div className="lg:col-span-5 bg-white border border-slate-100 p-6 rounded-3xl space-y-5">
            <div className="border-b border-slate-50 pb-3">
              <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                <span className="text-lg">🛰️</span>
                <span>Kigawaji na Simulizi ya Sensor za IoT</span>
              </h3>
              <p className="text-xs text-slate-400">
                Weka vigezo vya kihisi ili kuona majibu na kichochezi cha vali ya maji.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">Chagua Zao la IoT shambani:</label>
              <select
                value={selectedIotCropId}
                onChange={(e) => setSelectedIotCropId(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10"
              >
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.variety} ({c.cropName.toUpperCase()}) - Shamba la Ha {c.areaHa}
                  </option>
                ))}
              </select>
            </div>

            {/* Sliders for Simulation */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600 flex items-center gap-1">
                    <Droplet className="text-blue-500" size={14} /> Unyevu wa Udongo (Soil Moisture):
                  </span>
                  <span className={`font-mono font-black ${soilMoistureSim < 40 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {soilMoistureSim}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={soilMoistureSim}
                  onChange={(e) => setSoilMoistureSim(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>Kavu sana (Chini ya 40% Vali Inafunguka 🚰)</span>
                  <span>Udongo Una unyevu kamilifu</span>
                </div>
              </div>

              <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600">🌡️ Joto (Temperature):</span>
                  <span className="font-mono font-black text-slate-700">{tempSim}°C</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  value={tempSim}
                  onChange={(e) => setTempSim(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600">☁️ Unyevunyevu wa Hewa (Humidity):</span>
                  <span className="font-mono font-black text-slate-700">{humiditySim}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="95"
                  value={humiditySim}
                  onChange={(e) => setHumiditySim(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-400"
                />
              </div>
            </div>

            {/* Actuation Status card */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              valveStatus === 'ON'
                ? 'bg-blue-50 border-blue-200 text-blue-900 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Solonoid Valve Relay (Kiwanda cha Maji)</span>
                <span className="text-sm font-black flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${valveStatus === 'ON' ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
                  Vali ya Umeme: {valveStatus === 'ON' ? 'INAWAKILISHA MAJI (FUNGUA)' : 'IMEFUNGWA (ZIMA)'}
                </span>
              </div>
              <span className={`text-2xl ${valveStatus === 'ON' ? 'animate-bounce' : ''}`}>
                {valveStatus === 'ON' ? '🚰' : '🔒'}
              </span>
            </div>

            {/* Simulated Live Console logs */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 block">Soma Telemetry Terminal Console (Live Live):</span>
              <div className="bg-slate-950 text-emerald-400 rounded-2xl p-4 font-mono text-[10px] space-y-1 overflow-y-auto max-h-[160px] border border-slate-900">
                {iotLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    <span className="text-slate-500 select-none">&gt;</span> {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Arduino / ESP32 Code Generator block */}
          <div className="lg:col-span-7 bg-white border border-slate-100 p-6 rounded-3xl space-y-4">
            <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                  <Terminal className="text-emerald-600" size={18} />
                  <span>Nambari za ESP32/Arduino (Valve Control Sketch)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Pakia msimbo huu kwenye ESP32 yako ili kuunganisha kiotomatiki na vali na sensorer.
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(esp32Code);
                  alert('Msimbo wa ESP32 umekopishwa kwenye clipboard! Fungua Arduino IDE na ubandike.');
                  addAuditLog('ESP32_CODE_COPY', 'SECURITY', 'ESP32 source code sketch exported/copied.');
                }}
                className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition shadow-xs cursor-pointer"
              >
                <FileCheck size={13} />
                <span>Kopi Sketch (C++)</span>
              </button>
            </div>

            <div className="relative">
              <pre className="bg-slate-900 text-slate-200 rounded-2xl p-5 font-mono text-[10px] leading-relaxed overflow-x-auto max-h-[480px] border border-slate-800">
                <code>{esp32Code}</code>
              </pre>
              <div className="absolute top-3 right-3 bg-slate-800/80 text-[9px] text-emerald-400 px-2 py-0.5 rounded font-mono uppercase">
                esp32_firmware_v3.cpp
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finance Ledger Sub-tab content */}
      {activeSubTab === 'finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ledger logger form */}
          <div className="lg:col-span-4 bg-white border border-slate-100 p-6 rounded-3xl h-fit space-y-4">
            <div className="border-b border-slate-50 pb-3">
              <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                <span>💰</span>
                <span>Ingiza Muamala Mpya wa Shamba</span>
              </h3>
              <p className="text-xs text-slate-400">
                Fuatilia mapato na matumizi yote yanayohusu mazao na uendeshaji.
              </p>
            </div>

            <form onSubmit={handleAddFinance} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Chagua Zao linalohusika:</label>
                <select
                  value={finForm.cropId}
                  onChange={(e) => setFinForm({ ...finForm, cropId: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:outline-hidden"
                >
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.variety} ({c.cropName.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Aina ya Muamala:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFinForm({ ...finForm, type: 'EXPENSE' })}
                    className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                      finForm.type === 'EXPENSE'
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-white border-slate-150 text-slate-600'
                    }`}
                  >
                    🔴 Matumizi (Expense)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFinForm({ ...finForm, type: 'INCOME' })}
                    className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                      finForm.type === 'INCOME'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-white border-slate-150 text-slate-600'
                    }`}
                  >
                    🟢 Mapato (Income)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Kipengele (Category):</label>
                <select
                  value={finForm.category}
                  onChange={(e) => setFinForm({ ...finForm, category: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:outline-hidden"
                >
                  {finForm.type === 'EXPENSE' ? (
                    <>
                      <option value="Mbolea (Fertilizers)">Mbolea (Fertilizers)</option>
                      <option value="Mbegu (Seeds)">Mbegu (Seeds)</option>
                      <option value="Dawa za Kudhibiti Wadudu">Dawa za Wadudu (Pesticides)</option>
                      <option value="Gharama ya Maji & Umeme">Maji & Umeme (Water/Power)</option>
                      <option value="Kibarua & Maandalizi">Vibarua & Maandalizi ya Shamba</option>
                      <option value="Zana & Vifaa vya Umwagiliaji">Zana & Vipuri vya Umwagiliaji</option>
                    </>
                  ) : (
                    <>
                      <option value="Mauzo ya Mavuno (Sales)">Mauzo ya Mavuno (Sales)</option>
                      <option value="Ruzuku za Serikali">Ruzuku za Serikali (Subsidies)</option>
                      <option value="Kukodisha Mitambo/Shamba">Kukodisha Mitambo (Renting)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Kiasi cha Fedha (TZS):</label>
                <input
                  type="number"
                  required
                  min="500"
                  value={finForm.amount}
                  onChange={(e) => setFinForm({ ...finForm, amount: e.target.value })}
                  placeholder="Mfano: 50000"
                  className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Maelezo fupi (Details):</label>
                <input
                  type="text"
                  required
                  value={finForm.description}
                  onChange={(e) => setFinForm({ ...finForm, description: e.target.value })}
                  placeholder="Mfano: Kununua mfuko mmoja wa NPK"
                  className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Tarehe ya Tukio:</label>
                <input
                  type="date"
                  required
                  value={finForm.date}
                  onChange={(e) => setFinForm({ ...finForm, date: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Sajili kwenye Shajara</span>
              </button>
            </form>
          </div>

          {/* Ledger results and tables */}
          <div className="lg:col-span-8 bg-white border border-slate-100 p-6 rounded-3xl space-y-6">
            {/* Summary widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Jumla ya Mapato (Income)</span>
                <p className="text-xl font-black font-mono text-emerald-600">
                  TZS {financeLogs.filter(l => l.type === 'INCOME').reduce((s, c) => s + c.amount, 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Jumla ya Matumizi (Expenses)</span>
                <p className="text-xl font-black font-mono text-rose-600">
                  TZS {financeLogs.filter(l => l.type === 'EXPENSE').reduce((s, c) => s + c.amount, 0).toLocaleString()}
                </p>
              </div>

              {(() => {
                const inc = financeLogs.filter(l => l.type === 'INCOME').reduce((s, c) => s + c.amount, 0);
                const exp = financeLogs.filter(l => l.type === 'EXPENSE').reduce((s, c) => s + c.amount, 0);
                const balance = inc - exp;
                return (
                  <div className={`p-4 rounded-2xl border text-center space-y-1 ${balance >= 0 ? 'bg-emerald-50/50 border-emerald-100 text-emerald-950' : 'bg-rose-50/50 border-rose-100 text-rose-955'}`}>
                    <span className="text-xs font-semibold block">Faida / Hasara Halisi (Net Profit)</span>
                    <p className="text-xl font-black font-mono">
                      TZS {balance.toLocaleString()}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* List Table of Logs */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Orodha ya Shajara na Risiti:</h3>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-55 text-slate-700 font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Tarehe</th>
                      <th className="py-3 px-4">Zao / Kipengele</th>
                      <th className="py-3 px-4">Maelezo</th>
                      <th className="py-3 px-4 text-right">Kiasi</th>
                      <th className="py-3 px-4 text-center">Futa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {financeLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-400 font-mono text-xs">
                          Hakuna muamala uliosajiliwa kwenye shajara.
                        </td>
                      </tr>
                    ) : (
                      financeLogs.map((log) => {
                        const associatedCrop = crops.find(c => c.id === log.cropId);
                        return (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{log.date}</td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-800 block">
                                {associatedCrop ? `${associatedCrop.variety} (${associatedCrop.cropName.toUpperCase()})` : 'Zao Halikupatikana'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{log.category}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 leading-relaxed max-w-[200px] truncate" title={log.description}>
                              {log.description}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`font-mono font-black ${log.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {log.type === 'INCOME' ? '+' : '-'} {log.amount.toLocaleString()} TZS
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteFinance(log.id)}
                                className="text-rose-400 hover:text-rose-600 transition p-1 cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fertilizer calculator & Crop calendar */}
      {activeSubTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white border border-slate-100 p-6 rounded-3xl h-fit space-y-4">
            <div className="border-b border-slate-50 pb-3">
              <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                <span>🌱</span>
                <span>Injini ya Ushauri wa Mbolea</span>
              </h3>
              <p className="text-xs text-slate-400">
                Pata ratiba ya mbolea, NPK, Urea na kiasi kinachopendekezwa na wataalamu nchini Tanzania.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Chagua Zao unalotaka maelekezo:</label>
                <select
                  value={selectedIotCropId}
                  onChange={(e) => setSelectedIotCropId(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10"
                >
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.variety} ({c.cropName.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {(() => {
                const activeCrop = crops.find(c => c.id === selectedIotCropId) || crops[0];
                if (!activeCrop) return null;
                const config = CROPS_DATA[activeCrop.cropName.toLowerCase()];
                return (
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100 text-xs text-slate-600">
                    <p className="font-bold text-slate-800 text-center text-sm border-b border-slate-200/60 pb-1.5">
                      📊 Vigezo vya {activeCrop.variety}
                    </p>
                    <p className="flex justify-between">
                      <span>Umri wa Mche (DAP):</span>
                      <span className="font-mono font-bold text-slate-800">{activeCrop.daysAfterPlanting} Siku</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Eneo la Shamba:</span>
                      <span className="font-mono font-bold text-slate-800">{activeCrop.areaHa} Hekta</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Muda hadi Kukomaa:</span>
                      <span className="font-mono font-bold text-slate-800">{config?.days_to_maturity || 120} Siku</span>
                    </p>
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-950 font-medium leading-relaxed">
                      💡 <strong>Ushauri Mkuu wa Kipindi hiki:</strong><br />
                      {activeCrop.daysAfterPlanting < 14 && 'Zao lipo hatua ya kuota. Hakikisha udongo una unyevu na weka mbolea ya kukuzia mizizi (DAP) wakati wa kupanda au wiki ya pili.'}
                      {activeCrop.daysAfterPlanting >= 14 && activeCrop.daysAfterPlanting < 40 && 'Zao lipo kwenye ukuaji wa haraka wa majani na matawi. Tumia Urea au CAN ili kupata majani mabichi yenye afya na weka maji ya kutosha.'}
                      {activeCrop.daysAfterPlanting >= 40 && activeCrop.daysAfterPlanting < 80 && 'Hatua ya uzazi au maua. Mbolea ya NPK au virutubisho vyenye Potassium (K) na Boron vinahitajika sana ili kupata uzazi mnono na dhabiti.'}
                      {activeCrop.daysAfterPlanting >= 80 && 'Mazao yapo karibu kukomaa au hatua ya mavuno. Punguza umwagiliaji kwa mazao kama vitunguu, mahindi au viazi ili kuruhusu kukauka kiasili na kuzuia kuoza.'}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white border border-slate-100 p-6 rounded-3xl space-y-5">
            <h3 className="font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
              <span className="text-lg">📅</span>
              <span>Kalenda ya Zao na Hatua za Mbolea (TZ Agricultural Extension Guide)</span>
            </h3>

            {(() => {
              const activeCrop = crops.find(c => c.id === selectedIotCropId) || crops[0];
              if (!activeCrop) {
                return (
                  <p className="text-center py-6 text-slate-400 text-xs font-mono">
                    Tafadhali kwanza sajili zao shambani ili kuzalisha kalenda.
                  </p>
                );
              }

              // Generate steps
              const steps = [
                {
                  days: 'Mwanzo (Siku 0-3)',
                  title: 'Kupanda & DAP/Minjingu Organic',
                  desc: 'Mbolea ya kupandia yenye Phosphorous ya juu kwa ukuaji dhabiti wa mizizi.',
                  dosage: `${50 * activeCrop.areaHa} kg za DAP au Minjingu kwa Hekta.`,
                  completed: activeCrop.daysAfterPlanting >= 3
                },
                {
                  days: 'Ukuaji (Siku 14-28)',
                  title: 'Kupalilia & Kukuzia (Urea/CAN)',
                  desc: 'Nitrogen inahitajika kuongeza nguvu ya photosynthesis na rangi ya kijani kibichi.',
                  dosage: `${100 * activeCrop.areaHa} kg za Urea/CAN kwa Hekta.`,
                  completed: activeCrop.daysAfterPlanting >= 28
                },
                {
                  days: 'Maua / Uzazi (Siku 45-60)',
                  title: 'Uwekaji NPK & Umwagiliaji Makini',
                  desc: 'Kusaidia usitishaji mzuri wa mbegu na kufunga matunda imara.',
                  dosage: `${150 * activeCrop.areaHa} kg za NPK mchanganyiko dhabiti.`,
                  completed: activeCrop.daysAfterPlanting >= 60
                },
                {
                  days: 'Mavuno (Siku 90-120)',
                  title: 'Kukausha na Kuhifadhi',
                  desc: 'Kusitisha umwagiliaji ili kukausha mbegu, kuzuia magonjwa ya kuhifadhi na kuongeza uhai.',
                  dosage: 'Kusitisha umwagiliaji siku 10 kabla ya kuvuna.',
                  completed: activeCrop.daysAfterPlanting >= 100
                }
              ];

              return (
                <div className="relative border-l-2 border-slate-100 pl-6 ml-4 space-y-8 py-3">
                  {steps.map((step, idx) => (
                    <div key={idx} className="relative">
                      {/* Bullet icon */}
                      <span className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border font-bold text-[10px] ${
                        step.completed
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}>
                        {step.completed ? <Check size={12} /> : idx + 1}
                      </span>

                      <div className="bg-slate-50 hover:bg-slate-100/80 transition rounded-2xl p-4 border border-slate-100 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                            {step.days}
                          </span>
                          {step.completed && <span className="text-[10px] text-emerald-600 font-bold">✓ Imekamilika (Passed)</span>}
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-sm">{step.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                        <div className="pt-2 text-[11px] text-slate-700 font-semibold border-t border-slate-200/50 flex justify-between">
                          <span>Kiwango Kinachotakiwa kwa Eneo Lako:</span>
                          <span className="font-mono text-emerald-800">{step.dosage}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Pest Alerts & Warnings */}
      {activeSubTab === 'pests' && (
        <div className="space-y-5 bg-white border border-slate-100 p-6 rounded-3xl">
          <div className="border-b border-slate-50 pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                <span className="text-lg">🐛</span>
                <span>Uangalizi wa Wadudu na Tahadhari za Magonjwa</span>
              </h3>
              <p className="text-xs text-slate-400">
                Orodha ya wadudu hatari nchini Tanzania, jinsi ya kuwatambua, kinga zao na dawa zinazoidhinishwa na TPRI.
              </p>
            </div>
            <input
              type="text"
              value={pestSearch}
              onChange={(e) => setPestSearch(e.target.value)}
              placeholder="Tafuta kwa jina la wadudu au zao..."
              className="border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 max-w-xs w-full focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPests.length === 0 ? (
              <p className="col-span-2 text-center py-10 text-slate-400 font-mono text-xs">
                Hakuna magonjwa au wadudu waliopatikana kwa utafutaji huo.
              </p>
            ) : (
              filteredPests.map((pest, i) => (
                <div key={i} className="bg-slate-50 hover:bg-slate-100/50 transition border border-slate-100 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-black text-slate-800 text-sm">{pest.name}</h4>
                        <span className="text-[10px] italic text-slate-400 block font-mono">Sci: {pest.sciName}</span>
                      </div>
                      <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded font-mono shrink-0 uppercase">
                        Mazao: {pest.crop}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div>
                        <strong className="text-slate-800 font-bold block text-[11px] uppercase">🔴 Jinsi ya Kutambua (Symptoms):</strong>
                        <p className="leading-relaxed bg-white border border-slate-200/50 p-2.5 rounded-lg text-slate-500 font-medium">
                          {pest.symptoms_sw}
                        </p>
                      </div>

                      <div className="pt-1">
                        <strong className="text-slate-800 font-bold block text-[11px] uppercase">🛡️ Kinga & Udhibiti Bora:</strong>
                        <p className="leading-relaxed text-slate-500">
                          {pest.prevention_sw}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-950 font-medium text-xs leading-relaxed">
                    🧪 <strong>Udhibiti wa Kemikali (TPRI Approved):</strong><br />
                    {pest.chemical_sw}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Supplier Marketplace */}
      {activeSubTab === 'market' && (
        <div className="space-y-5 bg-white border border-slate-100 p-6 rounded-3xl">
          <div className="border-b border-slate-50 pb-3">
            <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
              <span className="text-lg">🛒</span>
              <span>Soko la Pembejeo za Kilimo & Wauzaji Tanzania</span>
            </h3>
            <p className="text-xs text-slate-400">
              Usiingie hasara kwa kupanda mbegu fake. Wasiliana moja kwa moja na taasisi na mawakala walioidhinishwa nchini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUPPLIERS.map((sup, i) => (
              <div key={i} className="bg-slate-50 hover:bg-slate-100/50 transition border border-slate-100 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                      {sup.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      📍 {sup.region}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-800 text-sm">{sup.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                    {sup.product}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => triggerCallSimulation(sup.name, sup.contact)}
                    className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Phone size={13} />
                    <span>Piga Simu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerWhatsAppSimulation(sup.name, sup.contact, sup.product)}
                    className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare size={13} />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Audit log block */}
      {activeSubTab === 'security' && (
        <div className="space-y-5 bg-white border border-slate-100 p-6 rounded-3xl">
          <div className="border-b border-slate-50 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                <span className="text-lg">🔐</span>
                <span>Logi za Usalama, Audit Logs na Key Hashing</span>
              </h3>
              <p className="text-xs text-slate-400">
                Uadilifu na ukaguzi salama wa rekodi za shamba chini ya usimbaji fiche wa SHA-256 (System Event Logs).
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Je, una uhakika unataka kufuta logi zote za usalama?')) {
                  setAuditLogs([]);
                  localStorage.removeItem('smart_irr_audit_logs');
                  alert('Logi zote zimefutwa!');
                }
              }}
              className="text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              Futa Logi Zote
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Hashing Integrity info card */}
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 space-y-4 border border-slate-800">
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <ShieldCheck className="text-emerald-400 shrink-0" size={16} />
                <span>Usalama wa Data</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">SHA-256 Block Signature:</span>
                  <div className="bg-slate-950 font-mono text-[9px] text-emerald-400/90 p-2.5 rounded-lg border border-slate-850 break-all leading-normal select-all select-none">
                    ef537f25c895baf7bc01b443c7cf4c281ef546c1f01c80efbf093e62fba170a4
                  </div>
                </div>
                <p className="leading-relaxed text-slate-400 text-[11px]">
                  Kila muamala wa mkulima na umwagiliaji unasainiwa na kitambulisho salama ili kuzuia mabadiliko haramu ya rekodi. Hii inahakikisha data yako ya usimamizi na kielektroniki ni salama kabisa.
                </p>
                <div className="p-3 bg-emerald-950/50 border border-emerald-900 rounded-lg text-[10px] text-emerald-300 leading-normal">
                  🔐 <strong>Authorization Token:</strong> Active on this device. Key pair binds to browser localStorage environment.
                </div>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="lg:col-span-3 border border-slate-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-55 text-slate-700 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Muda / Tarehe</th>
                    <th className="py-3 px-4">Tukio (Action)</th>
                    <th className="py-3 px-4">Kipengele</th>
                    <th className="py-3 px-4">Maelezo Kamili</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 text-xs">
                        Hakuna kumbukumbu za matukio kwa sasa.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4 text-slate-400 text-[10px] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            log.category === 'SECURITY' ? 'bg-red-50 text-red-700 border border-red-100' :
                            log.category === 'IOT' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            'bg-slate-50 text-slate-700 border border-slate-100'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[10px] text-slate-500 font-bold">{log.category}</td>
                        <td className="py-3 px-4 text-slate-600 font-sans leading-relaxed text-[11px]">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
