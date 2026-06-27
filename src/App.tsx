import React, { useState, useEffect } from 'react';
import { Farmer, Crop, Schedule, WeatherData } from './types';
import { TANZANIA_REGIONS, TANZANIA_VILLAGES, CROPS_DATA, TANZANIA_SEED_VARIETIES } from './data';
import { calculateIrrigationRequirement, downloadCSV, downloadText } from './utils';
import { Dashboard } from './components/Dashboard';
import { FarmersList } from './components/FarmersList';
import { CropsList } from './components/CropsList';
import { GrowthTracker } from './components/GrowthTracker';
import { WeatherPanel } from './components/WeatherPanel';
import { IrrigationCalculatorView } from './components/IrrigationCalculatorView';
import { SchedulesView } from './components/SchedulesView';
import { ReportsView } from './components/ReportsView';
import { HelpContact } from './components/HelpContact';
import { ProTools } from './components/ProTools';
import { AssistantsView } from './components/AssistantsView';
import { LayoutDashboard, Users, Sprout, Compass, Droplets, Calendar, FileText, BookOpen, Menu, X, Check, Smartphone, Trash2, Send, ShieldCheck, Cpu, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';

// Seeding realistic starting data for Tanzania
const INITIAL_FARMERS: Farmer[] = [
  { id: 101, name: 'Rajabu Simfukwe', phone: '0794172297', region: 'Morogoro', district: 'Kilosa', village: 'Mhenda', latitude: -6.827, longitude: 37.659, registeredDate: '2026-05-10T10:00:00Z' },
  { id: 102, name: 'Fatuma Juma', phone: '0655123456', region: 'Dodoma', district: 'Bahi', village: 'Mundemu', latitude: -6.163, longitude: 35.751, registeredDate: '2026-06-01T08:30:00Z' },
  { id: 103, name: 'Joseph Kahama', phone: '0712345678', region: 'Mbeya', district: 'Mbarali', village: 'Rujewa', latitude: -8.900, longitude: 33.450, registeredDate: '2026-06-15T14:15:00Z' }
];

const INITIAL_CROPS: Crop[] = [
  { id: 201, farmerId: 101, cropName: 'mahindi', variety: 'Seedco 513', plantingDate: '2026-05-12', daysAfterPlanting: 45, areaHa: 1.5, irrigationMethod: 'Drip', growthStage: '🌿 Ukuaji', moisture: 68 },
  { id: 202, farmerId: 102, cropName: 'nyanya', variety: 'Assila F1', plantingDate: '2026-06-02', daysAfterPlanting: 24, areaHa: 0.5, irrigationMethod: 'Sprinkler', growthStage: '🌿 Kuota', moisture: 35 },
  { id: 203, farmerId: 103, cropName: 'mpunga', variety: 'SARO 5', plantingDate: '2026-05-20', daysAfterPlanting: 37, areaHa: 2.0, irrigationMethod: 'Flood', growthStage: '🌿 Ukuaji', moisture: 72 }
];

// Fallback Tanzanian weather
const FALLBACK_WEATHER: WeatherData = {
  temperature: 28.5,
  humidity: 65,
  windSpeed: 12.3,
  solarRadiation: 18.5,
  rainfall: 1.5,
  forecast: [1.5, 0.0, 5.2, 0.0, 3.1, 10.5, 0.0]
};

export default function App() {
  // ================= STATE =================
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [weather, setWeather] = useState<WeatherData>(FALLBACK_WEATHER);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCropName, setSelectedCropName] = useState<string>('mahindi');
  const [isRefreshingWeather, setIsRefreshingWeather] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<'SW' | 'EN'>(() => {
    return (localStorage.getItem('smart_irr_language') as 'SW' | 'EN') || 'SW';
  });

  // ================= AUTH STATE =================
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('smart_irr_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('smart_irr_user');
  });

  // ================= AUTH INPUTS =================
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');

  // ================= OPERATOR PROFILE =================
  const [operatorName, setOperatorName] = useState<string>('Rajabu Simfukwe');
  const [operatorPhone, setOperatorPhone] = useState<string>('0794172297');
  const [operatorRole, setOperatorRole] = useState<string>('Mhandisi Mkuu');
  const [operatorEmail, setOperatorEmail] = useState<string>('niyovisitoni@gmail.com');

  // ================= MODAL STATES =================
  const [showAddFarmer, setShowAddFarmer] = useState(false);
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [showDeleteFarmer, setShowDeleteFarmer] = useState(false);
  const [showSendSms, setShowSendSms] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // ================= FORM STATES =================
  const [farmerForm, setFarmerForm] = useState({ name: '', phone: '', region: 'Morogoro', district: 'Kilosa', village: '' });
  const [cropForm, setCropForm] = useState({ farmerId: '', cropName: 'mahindi', variety: 'Seedco 513', plantingDate: new Date().toISOString().split('T')[0], areaHa: '1.0', irrigationMethod: 'Drip' });
  const [deleteFarmerId, setDeleteFarmerId] = useState<string>('');
  const [smsForm, setSmsForm] = useState({ farmerId: 'all', message: '' });
  const [profileForm, setProfileForm] = useState({ name: operatorName, phone: operatorPhone, role: operatorRole, email: operatorEmail });
  const [autoSmsLogs, setAutoSmsLogs] = useState<Array<{ id: number; date: string; farmerName: string; phone: string; cropName: string; moisture: number; message: string }>>([]);
  const [sentAlerts, setSentAlerts] = useState<Record<number, boolean>>({});

  // ================= EFFECTS =================
  useEffect(() => {
    if (currentUser) {
      setOperatorName(currentUser.name || 'Mtumiaji');
      setOperatorPhone(currentUser.phone || '');
      setOperatorRole(currentUser.role || 'Mkulima Mkuu');
      setOperatorEmail(currentUser.email || '');
    }
  }, [currentUser]);

  useEffect(() => {
    setProfileForm({ name: operatorName, phone: operatorPhone, role: operatorRole, email: operatorEmail });
  }, [operatorName, operatorPhone, operatorRole, operatorEmail]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const activeUserId = currentUser.role === 'Msaidizi' ? currentUser.adminId : currentUser.id;
      fetch(`/api/farmers?userId=${activeUserId}`).then(res => res.json()).then(data => { if (data.success) setFarmers(data.farmers); });
      fetch(`/api/crops?userId=${activeUserId}`).then(res => res.json()).then(data => { if (data.success) setCrops(data.crops); });
      fetch(`/api/schedules?userId=${activeUserId}`).then(res => res.json()).then(data => { if (data.success) setSchedules(data.schedules); });
      fetchLiveWeather(-6.827, 37.659);
    }
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    if (crops.length > 0) generateSchedules(crops);
  }, [crops]);

  useEffect(() => {
    if (crops.length > 0) generateSchedules(crops);
  }, [weather]);

  // ================= SOIL DRYING SIMULATION =================
  useEffect(() => {
    const interval = setInterval(() => {
      setCrops((prevCrops) => {
        if (prevCrops.length === 0) return prevCrops;
        let updated = false;
        const nextCrops = prevCrops.map((crop) => {
          const currentMoisture = typeof crop.moisture === 'number' ? crop.moisture : 70;
          const tempFactor = weather.temperature > 30 ? 1.4 : 1.0;
          const dryingAmount = parseFloat(((Math.random() * 0.7 + 0.3) * tempFactor).toFixed(1));
          const nextMoisture = Math.max(10, Math.min(100, parseFloat((currentMoisture - dryingAmount).toFixed(1))));
          if (nextMoisture !== crop.moisture) updated = true;
          return { ...crop, moisture: nextMoisture };
        });
        return updated ? nextCrops : prevCrops;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [weather.temperature]);

  // ================= SMS ALERT SYSTEM =================
  useEffect(() => {
    crops.forEach((crop) => {
      if (typeof crop.moisture === 'number' && crop.moisture < 40) {
        if (!sentAlerts[crop.id]) {
          const farmer = farmers.find((f) => f.id === crop.farmerId);
          if (farmer) {
            const cropConfig = CROPS_DATA[crop.cropName.toLowerCase()];
            const cropSwahili = cropConfig ? cropConfig.swahili : crop.cropName;
            const message = `Habari ${farmer.name}. Sensor ya unyevu wa udongo kwenye shamba lako la ${cropSwahili} (${crop.variety}) inaonesha unyevu umeshuka hadi ${crop.moisture}%. Tafadhali kagua ratiba yako ya leo ya umwagiliaji na uwashe mfumo. - Smart Irrigation`;
            sendRealSms(farmer.phone, message, farmer.name);
            setSentAlerts((prev) => ({ ...prev, [crop.id]: true }));
            setAutoSmsLogs((prev) => [{ id: Date.now() + Math.random(), date: new Date().toLocaleTimeString('sw-TZ'), farmerName: farmer.name, phone: farmer.phone, cropName: cropSwahili, moisture: crop.moisture!, message }, ...prev]);
            triggerToast(`📢 SMS ya Kiotomatiki imetumwa kwa ${farmer.name} (${cropSwahili}): Unyevu upo chini sana (${crop.moisture}%)!`, 'error');
          }
        }
      } else if (typeof crop.moisture === 'number' && crop.moisture >= 60) {
        if (sentAlerts[crop.id]) {
          setSentAlerts((prev) => { const next = { ...prev }; delete next[crop.id]; return next; });
        }
      }
    });
  }, [crops, farmers, sentAlerts]);

  // ================= HELPERS =================
  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLanguageToggle = () => {
    const nextLang = language === 'SW' ? 'EN' : 'SW';
    setLanguage(nextLang);
    localStorage.setItem('smart_irr_language', nextLang);
    triggerToast(nextLang === 'SW' ? 'Lugha imebadilishwa kuwa Kiswahili.' : 'Language toggled to English.', 'info');
  };

  const updateCropMoistureOnServer = async (cropId: number, moisture: number) => {
    try { await fetch(`/api/crops/${cropId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moisture }) }); } 
    catch (e) { console.error("Failed to sync moisture:", e); }
  };

  const generateSchedules = (currentCrops: Crop[]) => {
    const activeSchedules: Schedule[] = currentCrops.map((crop, idx) => {
      const calc = calculateIrrigationRequirement(crop.cropName, crop.areaHa, weather, crop.daysAfterPlanting, crop.irrigationMethod);
      return { id: 300 + idx, cropId: crop.id, date: new Date().toISOString().split('T')[0], daysAfterPlanting: crop.daysAfterPlanting, kc: calc.kc, eto: calc.eto, etc: calc.etc, netIrrigation: calc.netIrrigation, grossIrrigation: calc.grossIrrigation, rainAdjustment: weather.rainfall, status: 'PENDING' };
    });
    setSchedules(activeSchedules);
  };

  const fetchLiveWeather = async (lat = -6.827, lon = 37.659) => {
    setIsRefreshingWeather(true);
    try {
      const response = await fetch(`/api/weather?latitude=${lat}&longitude=${lon}`);
      const data = await response.json();
      if (data.success) { setWeather(data.weather); triggerToast('Hali ya hewa imesajiliwa kutoka satelaiti ya Open-Meteo!'); } 
      else { setWeather(FALLBACK_WEATHER); }
    } catch (e) { setWeather(FALLBACK_WEATHER); } 
    finally { setIsRefreshingWeather(false); }
  };

  const sendRealSms = async (phone: string, message: string, recipientName: string) => {
    if (!phone) { triggerToast(`Mkulima ${recipientName} hana namba ya simu!`, 'error'); return false; }
    try {
      const response = await fetch('/api/send-sms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, message }) });
      const data = await response.json();
      if (response.ok && data.success) { triggerToast(`SMS imetumwa kwenda kwa ${recipientName} (${phone})!`, 'success'); return true; } 
      else { triggerToast(data.error || "SMS haikutumwa.", 'error'); return false; }
    } catch (err) { triggerToast("Mawasiliano ya mtandao yamefeli.", 'error'); return false; }
  };

  // ================= HANDLE LOGIN (IMEREKEBISHWA) =================
  const handleLogin = async (e?: React.FormEvent, username?: string, password?: string) => {
    if (e) e.preventDefault();
    setPasswordError("");

    // Tumia vigezo vilivyotumwa, au tumia vya input
    const u = username !== undefined ? username : usernameInput.trim();
    const p = password !== undefined ? password : passwordInput.trim();

    if (!u || !p) {
      setPasswordError("Tafadhali weka jina la mtumiaji na nenosiri!");
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('smart_irr_user', JSON.stringify(data.user));
        localStorage.setItem('smart_irr_token', data.token || '');
        setUsernameInput("");
        setPasswordInput("");
        triggerToast(`Karibu ${u} ✅`, 'success');
      } else {
        setPasswordError(data.error || "Jina la mtumiaji au nenosiri si sahihi!");
      }
    } catch (err) {
      setPasswordError("Imeshindwa kuunganisha na server.");
    }
  };

  // ================= HANDLE LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem('smart_irr_user');
    localStorage.removeItem('smart_irr_token');
    setCurrentUser(null);
    setIsAuthenticated(false);
    triggerToast(language === 'SW' ? 'Umetoka kwenye akaunti kwa usalama!' : 'Logged out successfully!', 'info');
  };

  // ================= HANDLE PROFILE SAVE =================
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { triggerToast('Tafadhali ingia kwenye akaunti kwanza!', 'error'); return; }
    try {
      const body: any = { name: profileForm.name, phone: profileForm.phone, role: profileForm.role, email: profileForm.email };
      if (newPassword.trim()) body.password = newPassword.trim();
      const response = await fetch(`/api/users/${currentUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (data.success) {
        setOperatorName(profileForm.name);
        setOperatorPhone(profileForm.phone);
        setOperatorRole(profileForm.role);
        setOperatorEmail(profileForm.email);
        setCurrentUser(data.user);
        localStorage.setItem('smart_irr_user', JSON.stringify(data.user));
        setNewPassword('');
        triggerToast('Wasifu wako umehifadhiwa kikamilifu!', 'success');
        setShowProfileModal(false);
      } else { triggerToast(data.error || 'Imeshindwa kusasisha wasifu.', 'error'); }
    } catch (err) { triggerToast('Hitilafu kuwasiliana na server.', 'error'); }
  };

  // ================= HANDLE ADD FARMER =================
  const handleAddFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerForm.name) { triggerToast('Tafadhali weka jina la mkulima!', 'error'); return; }
    const cleanedPhone = farmerForm.phone.replace(/\s+/g, '');
    const tzPhoneRegex = /^(0|\+255)[67]\d{8}$/;
    if (cleanedPhone && !tzPhoneRegex.test(cleanedPhone)) {
      triggerToast('Namba ya simu si sahihi! Lazima ianzie na 0 au +255 ikifuatiwa na tarakimu 9.', 'error');
      return;
    }
    if (!currentUser) { triggerToast('Tafadhali ingia kwenye akaunti kwanza!', 'error'); return; }
    try {
      const activeUserId = currentUser.role === 'Msaidizi' ? currentUser.adminId : currentUser.id;
      const response = await fetch('/api/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId, name: farmerForm.name, phone: farmerForm.phone, region: farmerForm.region, district: farmerForm.district, village: farmerForm.village, latitude: -6.827 + (Math.random() - 0.5) * 0.1, longitude: 37.659 + (Math.random() - 0.5) * 0.1 }),
      });
      const data = await response.json();
      if (data.success) {
        setFarmers((prev) => [...prev, data.farmer]);
        setFarmerForm({ name: '', phone: '', region: 'Morogoro', district: 'Kilosa', village: '' });
        setShowAddFarmer(false);
        triggerToast(`Mkulima ${data.farmer.name} amesajiliwa!`);
      } else { triggerToast(data.error || 'Imeshindwa kusajili mkulima.', 'error'); }
    } catch (err) { triggerToast('Imeshindwa kuunganisha na database.', 'error'); }
  };

  // ================= HANDLE ADD CROP =================
  const handleAddCropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropForm.farmerId) { triggerToast('Tafadhali chagua mkulima!', 'error'); return; }
    const areaVal = parseFloat(cropForm.areaHa);
    if (isNaN(areaVal) || areaVal <= 0) { triggerToast('Weka eneo sahihi la shamba!', 'error'); return; }
    if (!currentUser) { triggerToast('Tafadhali ingia kwenye akaunti kwanza!', 'error'); return; }
    try {
      const activeUserId = currentUser.role === 'Msaidizi' ? currentUser.adminId : currentUser.id;
      const response = await fetch('/api/crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId, farmerId: parseInt(cropForm.farmerId), cropName: cropForm.cropName, variety: cropForm.variety || 'Kawaida', plantingDate: cropForm.plantingDate, daysAfterPlanting: Math.max(1, Math.round((Date.now() - new Date(cropForm.plantingDate).getTime()) / (1000 * 60 * 60 * 24))), areaHa: areaVal, irrigationMethod: cropForm.irrigationMethod, growthStage: '🌱 Kupanda', moisture: 75 }),
      });
      const data = await response.json();
      if (data.success) {
        setCrops((prev) => [...prev, data.crop]);
        setShowAddCrop(false);
        triggerToast(`Zao la ${data.crop.cropName.toUpperCase()} limehifadhiwa!`);
      } else { triggerToast(data.error || 'Imeshindwa kuhifadhi zao.', 'error'); }
    } catch (err) { triggerToast('Hitilafu katika kuwasiliana na server.', 'error'); }
  };

  // ================= HANDLE DELETE FARMER =================
  const handleDeleteFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteFarmerId) { triggerToast('Tafadhali chagua mkulima!', 'error'); return; }
    const idNum = parseInt(deleteFarmerId);
    const farmerToDelete = farmers.find((f) => f.id === idNum);
    if (farmerToDelete) {
      try {
        const response = await fetch(`/api/farmers/${idNum}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
          setCrops((prev) => prev.filter((c) => c.farmerId !== idNum));
          setFarmers((prev) => prev.filter((f) => f.id !== idNum));
          setDeleteFarmerId('');
          setShowDeleteFarmer(false);
          triggerToast(`Mkulima ${farmerToDelete.name} amefutwa.`, 'info');
        } else { triggerToast(data.error || 'Kushindwa kufuta mkulima.', 'error'); }
      } catch (err) { triggerToast('Imeshindwa kufuta mkulima.', 'error'); }
    }
  };

  // ================= HANDLE SMS =================
  const handleGeneralSmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsForm.message) { triggerToast('Tafadhali weka ujumbe wako!', 'error'); return; }
    if (smsForm.farmerId === 'all') {
      const farmersWithPhone = farmers.filter((f) => f.phone);
      if (farmersWithPhone.length === 0) { triggerToast('Hakuna wakulima wenye namba za simu!', 'error'); return; }
      triggerToast(`Inaanza kutuma SMS Blast kwa wakulima ${farmersWithPhone.length}...`, 'info');
      let successCount = 0;
      for (const farmer of farmersWithPhone) {
        const ok = await sendRealSms(farmer.phone, smsForm.message, farmer.name);
        if (ok) successCount++;
      }
      triggerToast(`SMS Blast imekamilika! ${successCount}/${farmersWithPhone.length}.`, 'success');
    } else {
      const farmer = farmers.find((f) => f.id === parseInt(smsForm.farmerId));
      if (farmer) await sendRealSms(farmer.phone, smsForm.message, farmer.name);
    }
    setSmsForm({ farmerId: 'all', message: '' });
    setShowSendSms(false);
  };

  const handleSendSmsText = async (farmerId: number, message: string) => {
    const farmer = farmers.find((f) => f.id === farmerId);
    if (!farmer) return;
    await sendRealSms(farmer.phone, message, farmer.name);
  };

  // ================= HANDLE TOGGLE SCHEDULE =================
  const handleToggleSchedule = async (scheduleId: number) => {
    const targetSchedule = schedules.find((s) => s.id === scheduleId);
    if (!targetSchedule) return;
    const nextStatus: 'PENDING' | 'COMPLETED' = targetSchedule.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
    const updatedSchedules = schedules.map((s) => { if (s.id === scheduleId) return { ...s, status: nextStatus }; return s; });
    setSchedules(updatedSchedules);
    try { await fetch(`/api/schedules/${scheduleId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus }) }); } 
    catch (e) { console.error("Failed to update schedule:", e); }
    triggerToast(nextStatus === 'COMPLETED' ? 'Umwagiliaji umekamilika!' : 'Ratiba imerudishwa kusubiri.', 'info');
    if (nextStatus === 'COMPLETED') {
      setCrops((prevCrops) => prevCrops.map((c) => { if (c.id === targetSchedule.cropId) { updateCropMoistureOnServer(c.id, 85); return { ...c, moisture: 85 }; } return c; }));
    }
  };

  // ================= IRRIGATION CONTROLS =================
  const handleIrrigateCrop = (cropId: number) => {
    setCrops((prev) => prev.map((c) => (c.id === cropId ? { ...c, moisture: 85 } : c)));
    updateCropMoistureOnServer(cropId, 85);
    const crop = crops.find((c) => c.id === cropId);
    if (crop) { const swahili = CROPS_DATA[crop.cropName.toLowerCase()]?.swahili || crop.cropName; triggerToast(`💧 Shamba la ${swahili.toUpperCase()} limemwagiliwa maji!`, 'success'); }
  };

  const handleDrySoilSimulate = (cropId: number) => {
    setCrops((prev) => prev.map((c) => (c.id === cropId ? { ...c, moisture: 32 } : c)));
    updateCropMoistureOnServer(cropId, 32);
    const crop = crops.find((c) => c.id === cropId);
    if (crop) { const swahili = CROPS_DATA[crop.cropName.toLowerCase()]?.swahili || crop.cropName; triggerToast(`💨 Ukame umeanza kwa ${swahili.toUpperCase()}!`, 'info'); }
  };

  const handleSimulateGlobalRain = () => {
    setCrops((prev) => prev.map((c) => { updateCropMoistureOnServer(c.id, 88); return { ...c, moisture: 88 }; }));
    setSentAlerts({});
    triggerToast('🌧️ Mvua kubwa imeanza kunyesha! Mazao yote yana unyevu 88%.', 'success');
  };

  const handleSimulateGlobalHeatwave = () => {
    setCrops((prev) => prev.map((c) => { const nextM = Math.max(12, (c.moisture ?? 70) - 20); updateCropMoistureOnServer(c.id, nextM); return { ...c, moisture: nextM }; }));
    triggerToast('☀️ Joto kali limeongezeka! Unyevu umeshuka kwa 20%.', 'info');
  };

  // ================= REPORTS =================
  const triggerGenerateExcel = () => {
    let csvContent = 'Aina ya Zao,Mkulima,Eneo (ha),Siku,Maji ya Umwagiliaji (Liters),Status\n';
    schedules.forEach((s) => {
      const crop = crops.find((c) => c.id === s.cropId);
      const farmer = farmers.find((f) => f.id === crop?.farmerId);
      csvContent += `${crop?.cropName || 'N/A'},${farmer?.name || 'N/A'},${crop?.areaHa || 0},Siku ${s.daysAfterPlanting},${s.netIrrigation},${s.status}\n`;
    });
    downloadCSV(`Ripoti_Umwagiliaji_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
    triggerToast('Ripoti ya Excel imeundwa!');
  };

  const triggerGeneratePdf = () => {
    let doc = '==================================================\n';
    doc += '            RIPOTI YA UMWAGILIAJI TANZANIA        \n';
    doc += '==================================================\n';
    doc += `Tarehe: ${new Date().toLocaleDateString('sw-TZ')}\n`;
    doc += `Maji yaliyotumika leo: ${schedules.filter((s) => s.status === 'COMPLETED').reduce((sum, s) => sum + s.netIrrigation, 0).toLocaleString()} Liters\n\n`;
    doc += 'ORODHA YA RATIBA ZA MAZAO LEO:\n';
    doc += '--------------------------------------------------\n';
    schedules.forEach((s) => {
      const crop = crops.find((c) => c.id === s.cropId);
      const farmer = farmers.find((f) => f.id === crop?.farmerId);
      doc += `• Zao: ${crop?.cropName.toUpperCase()} (${crop?.variety})\n`;
      doc += `  Mkulima: ${farmer?.name} (${farmer?.phone})\n`;
      doc += `  Kiwango cha Maji: ${s.netIrrigation.toLocaleString()} Liters | Hali: ${s.status}\n`;
      doc += '--------------------------------------------------\n';
    });
    doc += '\nAsante kwa kutumia Smart Irrigation Tanzania Pro v3.0\n';
    downloadText(`Ripoti_Umwagiliaji_${new Date().toISOString().split('T')[0]}.txt`, doc);
    triggerToast('Ripoti ya PDF imepakuliwa!');
  };

  const triggerBackup = () => {
    const backupObj = { farmers, crops, schedules, timestamp: new Date().toISOString() };
    downloadText('SmartIrrigation_Backup.json', JSON.stringify(backupObj, null, 2));
    triggerToast('Backup ya JSON imekamilika!');
  };

  // ================= STATS =================
  const totalWaterUsed = schedules.filter((s) => s.status === 'COMPLETED').reduce((sum, s) => sum + s.netIrrigation, 0);
  const pendingSchedulesCount = schedules.filter((s) => s.status === 'PENDING').length;

  // ================= NAVIGATION =================
  const NAV_LINKS = [
    { id: 'dashboard', label: language === 'SW' ? '📊 Dashboard' : '📊 Dashboard', icon: LayoutDashboard },
    { id: 'farmers', label: language === 'SW' ? '👨‍🌾 Wakulima' : '👨‍🌾 Farmers', icon: Users },
    { id: 'crops', label: language === 'SW' ? '🌱 Mazao' : '🌱 Crops', icon: Sprout },
    ...(currentUser?.role === 'Mhandisi Mkuu' ? [{ id: 'assistants', label: language === 'SW' ? '👥 Wasaidizi' : '👥 Assistants', icon: Users }] : []),
    { id: 'growth', label: language === 'SW' ? '🌾 Ukuaji' : '🌾 Growth Stage', icon: Compass },
    { id: 'weather', label: language === 'SW' ? '☁️ Hali Hewa' : '☁️ Weather', icon: Compass },
    { id: 'irrigation', label: language === 'SW' ? '💧 Umwagiliaji' : '💧 Irrigation', icon: Droplets },
    { id: 'schedules', label: language === 'SW' ? '📅 Ratiba' : '📅 Schedules', icon: Calendar },
    { id: 'pro', label: language === 'SW' ? '🚀 Pro & IoT' : '🚀 Pro & IoT', icon: Cpu },
    { id: 'reports', label: language === 'SW' ? '📄 Ripoti' : '📄 Reports', icon: FileText },
    { id: 'help', label: language === 'SW' ? '📖 Msaada' : '📖 Help', icon: BookOpen },
  ];

  const handleSelectCropForTracker = (cropName: string) => {
    setSelectedCropName(cropName);
    setActiveTab('growth');
  };

  // ================= LOGIN SCREEN =================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

        <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/60 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">🖥️ Real DB & Auth</span>
            <button type="button" onClick={handleLanguageToggle} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs text-slate-600 transition font-bold cursor-pointer">
              <span>🌐</span>
              <span>{language === 'SW' ? 'English (EN)' : 'Kiswahili (SW)'}</span>
            </button>
          </div>

          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs animate-bounce" style={{ animationDuration: '3s' }}>
              <span className="text-3xl">🌾</span>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Smart Irrigation</h2>
              <span className="text-xs text-emerald-600 font-extrabold font-mono tracking-wider uppercase block mt-0.5">Tanzania Pro</span>
            </div>
          </div>

          <div className="bg-emerald-50/70 text-emerald-800 text-[11px] font-bold p-3 rounded-xl border border-emerald-100 mb-5 text-center">
            {language === 'SW' ? '🔒 Ingia kwa kutumia Akaunti yako' : '🔒 Log in using your Account'}
          </div>

          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">{language === 'SW' ? 'Jina la Mtumiaji:' : 'Username:'}</label>
              <input type="text" required value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="admin" className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">{language === 'SW' ? 'Nenosiri:' : 'Password:'}</label>
              <div className="relative rounded-xl shadow-xs">
                <input type={showPassword ? "text" : "password"} required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Weka nenosiri..." className="w-full border border-slate-200 rounded-xl py-2.5 pl-4 pr-11 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono tracking-wide" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="text-xs font-extrabold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 flex items-start gap-1.5 animate-pulse">
                <span className="shrink-0 text-sm">⚠️</span>
                <span>{passwordError}</span>
              </div>
            )}

            <button type="submit" className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98">
              <KeyRound size={16} />
              <span>{language === 'SW' ? 'Fungua Mfumo (Ingia)' : 'Unlock System (Log In)'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 block mb-2.5 text-center uppercase tracking-wider">{language === 'SW' ? '🔑 Akaunti za Kuingia Haraka' : '🔑 Quick Access Demo Accounts'}</span>
            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" onClick={() => handleLogin(undefined, "admin", "admin")} className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-left transition group cursor-pointer">
                <div className="text-[11px] font-extrabold text-slate-800 group-hover:text-emerald-800 block leading-tight">{language === 'SW' ? 'Msimamizi Mkuu' : 'Super Admin'}</div>
                <div className="text-[9px] text-slate-400 group-hover:text-emerald-600 font-mono mt-0.5">admin / admin</div>
              </button>
              <button type="button" onClick={() => handleLogin(undefined, "Wakulima@123", "Wakulima@123")} className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-left transition group cursor-pointer">
                <div className="text-[11px] font-extrabold text-slate-800 group-hover:text-emerald-800 block leading-tight">{language === 'SW' ? 'Mhandisi Mkuu' : 'Chief Engineer'}</div>
                <div className="text-[9px] text-slate-400 group-hover:text-emerald-600 font-mono mt-0.5">Wakulima@123 / Wakulima@123</div>
              </button>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 font-semibold font-mono border-t border-slate-100 pt-4 mt-5">
            Smart Irrigation Tanzania Pro v3.0 | {language === 'SW' ? 'Salama & Imelindwa' : 'Secure & Protected'}
          </div>
        </div>
      </div>
    );
  }

  // ================= MAIN APP (ILIYOINGIA) =================
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl">🌾</span>
              <div>
                <span className="font-extrabold text-slate-800 text-sm sm:text-base tracking-tight block">Smart Irrigation</span>
                <span className="text-[10px] text-emerald-600 font-bold font-mono tracking-wide block uppercase leading-none">Tanzania Pro</span>
              </div>
              <div onClick={() => setShowProfileModal(true)} className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-150 rounded-full text-[11px] text-emerald-800 font-bold ml-2 select-none shadow-xs hover:bg-emerald-100 transition cursor-pointer">
                <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                <span>Msimamizi:</span>
                <span className="text-emerald-900 font-extrabold uppercase">{operatorName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>

            <nav className="hidden lg:flex space-x-1 items-center">
              {NAV_LINKS.map((link) => {
                const isActive = activeTab === link.id;
                return (
                  <button key={link.id} onClick={() => setActiveTab(link.id)} className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 cursor-pointer ${isActive ? 'bg-emerald-50 text-emerald-800 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                    <span>{link.label}</span>
                  </button>
                );
              })}
              <button onClick={() => setShowProfileModal(true)} className="ml-3 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer">
                <Users size={13} />
                <span>Wasifu Wangu</span>
              </button>
              <button type="button" onClick={handleLanguageToggle} className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition cursor-pointer">
                <span>🌐</span>
                <span>{language === 'SW' ? 'English (EN)' : 'Kiswahili (SW)'}</span>
              </button>
              <button type="button" onClick={handleLogout} className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition cursor-pointer">
                <X size={12} className="text-red-500 shrink-0" />
                <span>{language === 'SW' ? 'Ondoka' : 'Logout'}</span>
              </button>
            </nav>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 py-2 px-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <button key={link.id} onClick={() => { setActiveTab(link.id); setMobileMenuOpen(false); }} className={`w-full text-left flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-sm font-bold transition cursor-pointer ${activeTab === link.id ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500 hover:bg-slate-50'}`}>
                <span>{link.label}</span>
              </button>
            ))}
            <div className="border-t border-slate-50 pt-2.5 pb-2.5 mt-2 px-3 flex flex-col gap-2 bg-emerald-50/50 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>Msimamizi: <span className="text-emerald-900 font-black uppercase">{operatorName}</span></span>
                </div>
                <button type="button" onClick={handleLanguageToggle} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-700 hover:bg-slate-50">🌐 {language === 'SW' ? 'EN' : 'SW'}</button>
              </div>
              <button type="button" onClick={() => { setMobileMenuOpen(false); setShowProfileModal(true); }} className="w-full text-center py-1.5 bg-white border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-50 transition">⚙️ Badili Wasifu</button>
              <button type="button" onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="w-full text-center py-1.5 bg-red-50 hover:bg-red-100 text-red-800 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
                <X size={12} className="text-red-500 shrink-0" />
                <span>{language === 'SW' ? 'Ondoka (Logout)' : 'Logout'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            farmers={farmers} crops={crops} pendingCount={pendingSchedulesCount} totalWater={totalWaterUsed}
            weather={weather} autoSmsLogs={autoSmsLogs} onTabChange={setActiveTab}
            onOpenAddFarmer={() => setShowAddFarmer(true)} onOpenAddCrop={() => setShowAddCrop(true)}
            onOpenDeleteFarmer={() => setShowDeleteFarmer(true)} onOpenSendSms={() => setShowSendSms(true)}
            onBackup={triggerBackup} onGeneratePdf={triggerGeneratePdf} onGenerateExcel={triggerGenerateExcel}
            onIrrigateCrop={handleIrrigateCrop} onDrySoilSimulate={handleDrySoilSimulate}
            onSimulateRain={handleSimulateGlobalRain} onSimulateHeatwave={handleSimulateGlobalHeatwave}
            language={language}
          />
        )}
        {activeTab === 'farmers' && (
          <FarmersList farmers={farmers} crops={crops} onOpenAddFarmer={() => setShowAddFarmer(true)} onDeleteFarmer={(id) => { setDeleteFarmerId(id.toString()); setShowDeleteFarmer(true); }} />
        )}
        {activeTab === 'crops' && (
          <CropsList crops={crops} farmers={farmers} onOpenAddCrop={() => setShowAddCrop(true)} onSelectCropForGrowth={handleSelectCropForTracker} />
        )}
        {activeTab === 'growth' && (
          <GrowthTracker crops={crops} selectedCropName={selectedCropName} onSelectCrop={setSelectedCropName} />
        )}
        {activeTab === 'weather' && (
          <WeatherPanel weather={weather} onRefreshWeather={fetchLiveWeather} isRefreshing={isRefreshingWeather} />
        )}
        {activeTab === 'irrigation' && (
          <IrrigationCalculatorView crops={crops} farmers={farmers} weather={weather} onRefreshCalculations={() => generateSchedules(crops)} />
        )}
        {activeTab === 'schedules' && (
          <SchedulesView schedules={schedules} crops={crops} farmers={farmers} onToggleStatus={handleToggleSchedule} onSendSms={handleSendSmsText} />
        )}
        {activeTab === 'reports' && (
          <ReportsView farmers={farmers} crops={crops} schedules={schedules} onGeneratePdf={triggerGeneratePdf} onGenerateExcel={triggerGenerateExcel} onBackup={triggerBackup} />
        )}
        {activeTab === 'pro' && (
          <ProTools crops={crops} farmers={farmers} language={language} onLanguageToggle={handleLanguageToggle} />
        )}
        {activeTab === 'assistants' && currentUser?.role === 'Mhandisi Mkuu' && (
          <AssistantsView currentUser={currentUser} language={language} triggerToast={triggerToast} />
        )}
        {activeTab === 'help' && (
          <HelpContact operatorName={operatorName} operatorRole={operatorRole} operatorPhone={operatorPhone} operatorEmail={operatorEmail} />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 mt-auto font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>© 2026 Smart Irrigation Tanzania Pro v3.0. Haki zote zimehifadhiwa.</p>
          <p className="text-emerald-700 font-extrabold flex items-center justify-center gap-1">
            <ShieldCheck size={12} className="inline shrink-0" />
            Imesanifiwa na {operatorRole} {operatorName}
          </p>
        </div>
      </footer>

      {/* ================= TOAST NOTIFICATIONS ================= */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`px-5 py-3.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg border flex items-center gap-2.5 ${toastMessage.type === 'success' ? 'bg-emerald-900 border-emerald-700 text-white' : toastMessage.type === 'error' ? 'bg-red-900 border-red-700 text-white' : 'bg-slate-900 border-slate-700 text-white'}`}>
            <Check size={18} className="text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}
      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2"><span className="text-xl">⚙️</span><h3 className="font-extrabold text-slate-800 text-lg">Sanidi Wasifu Wako</h3></div>
              <button type="button" onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg font-bold"><X size={20} /></button>
            </div>
            <p className="text-xs text-slate-500 leading-normal">Ukibadilisha taarifa hizi, mfumo wote utajiweka chini ya jina lako binafsi.</p>
            <div className="space-y-4">
              <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Jina lako Kamili:</label><input type="text" required value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-sm" /></div>
              <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Namba ya Simu:</label><input type="text" required value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-sm" /></div>
              <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Cheo / Wajibu:</label><select value={profileForm.role} onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-sm">
                <option value="Mkulima Mkuu">Mkulima Mkuu</option><option value="Mhandisi Mkuu">Mhandisi Mkuu</option><option value="Mtaalamu wa Agronomy">Mtaalamu wa Agronomy</option><option value="Msimamizi wa Shamba">Msimamizi wa Shamba</option><option value="Mkurugenzi wa Kilimo">Mkurugenzi wa Kilimo</option>
              </select></div>
              <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Barua Pepe:</label><input type="email" required value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-sm" /></div>
              <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
                <div className="flex items-center gap-2"><span className="text-sm">🔒</span><h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">Usalama wa Mfumo (Nenosiri)</h4></div>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Nenosiri Jipya (Acha tupu kama hutaki kubadili):</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Weka nenosiri jipya hapa..." className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono" /></div>
              </div>
            </div>
            <div className="flex gap-3 pt-3 border-t border-slate-50">
              <button type="button" onClick={() => { setShowProfileModal(false); setNewPassword(''); }} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer">Ghairi</button>
              <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer">Hifadhi Wasifu</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Farmer Modal */}
      {showAddFarmer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddFarmerSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3"><h3 className="font-extrabold text-slate-800 text-lg">👨‍🌾 Sajili Mkulima Mpya</h3><button type="button" onClick={() => setShowAddFarmer(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={20} /></button></div>
            <div className="space-y-4 text-sm">
              <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Jina Kamili:</label><input type="text" required placeholder="mf: Fatuma Juma" value={farmerForm.name} onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20" /></div>
              <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Namba ya Simu:</label><input type="tel" placeholder="mf: 0794172297" value={farmerForm.phone} onChange={(e) => setFarmerForm({ ...farmerForm, phone: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 font-mono" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Mkoa:</label><select value={farmerForm.region} onChange={(e) => { const reg = e.target.value; const dists = TANZANIA_REGIONS[reg] || []; const defaultDist = dists[0] || ''; const vills = TANZANIA_VILLAGES[defaultDist] || []; setFarmerForm({ ...farmerForm, region: reg, district: defaultDist, village: vills[0] || '' }); }} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20">{Object.keys(TANZANIA_REGIONS).map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Wilaya:</label><select value={farmerForm.district} onChange={(e) => { const dist = e.target.value; const vills = TANZANIA_VILLAGES[dist] || []; setFarmerForm({ ...farmerForm, district: dist, village: vills[0] || '' }); }} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20">{(TANZANIA_REGIONS[farmerForm.region] || []).map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
              </div>
              <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Kijiji:</label>{(TANZANIA_VILLAGES[farmerForm.district] || []).length > 0 ? (<select value={farmerForm.village} onChange={(e) => setFarmerForm({ ...farmerForm, village: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"><option value="">-- Chagua Kijiji --</option>{(TANZANIA_VILLAGES[farmerForm.district] || []).map((v) => <option key={v} value={v}>{v}</option>)}<option value="other">Nyinginezo...</option></select>) : (<input type="text" required placeholder="mf: Mhenda" value={farmerForm.village} onChange={(e) => setFarmerForm({ ...farmerForm, village: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20" />)}</div>
            </div>
            <div className="flex gap-2.5 pt-4"><button type="submit" className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm cursor-pointer">Hifadhi Mkulima</button><button type="button" onClick={() => setShowAddFarmer(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition cursor-pointer">Ghairi</button></div>
          </form>
        </div>
      )}

      {/* Add Crop Modal */}
      {showAddCrop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddCropSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3"><h3 className="font-extrabold text-slate-800 text-lg">🌱 Ongeza Zao</h3><button type="button" onClick={() => setShowAddCrop(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={20} /></button></div>
            <div className="space-y-4 text-sm">
              {farmers.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 text-xs leading-relaxed">
                  <p className="font-extrabold text-amber-800">⚠️ HAKUNA MKULIMA ALIYESAJILIWA</p>
                  <p className="text-amber-700 font-semibold">Tafadhali sajili mkulima kwanza katika kichupo cha "Wakulima".</p>
                </div>
              ) : (
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Chagua Mkulima:</label><select required value={cropForm.farmerId} onChange={(e) => setCropForm({ ...cropForm, farmerId: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"><option value="">-- Chagua mkulima --</option>{farmers.map((f) => <option key={f.id} value={f.id}>{f.name} (ID: {f.id})</option>)}</select></div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Aina ya Zao:</label><select value={cropForm.cropName} onChange={(e) => { const selectedCrop = e.target.value; const seeds = TANZANIA_SEED_VARIETIES[selectedCrop] || []; setCropForm({ ...cropForm, cropName: selectedCrop, variety: seeds[0] || '' }); }} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 capitalize">{Object.keys(CROPS_DATA).map((key) => <option key={key} value={key}>{CROPS_DATA[key].icon} {CROPS_DATA[key].swahili}</option>)}</select></div>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Mbegu:</label>{TANZANIA_SEED_VARIETIES[cropForm.cropName] ? (<select value={TANZANIA_SEED_VARIETIES[cropForm.cropName].includes(cropForm.variety) ? cropForm.variety : ''} onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"><option value="">-- Chagua Mbegu --</option>{TANZANIA_SEED_VARIETIES[cropForm.cropName].map((seed) => <option key={seed} value={seed}>{seed}</option>)}</select>) : (<input type="text" required placeholder="mf: Seedco 513" value={cropForm.variety} onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20" />)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Eneo (Hectares):</label><input type="number" step="0.1" required placeholder="mf: 1.5" value={cropForm.areaHa} onChange={(e) => setCropForm({ ...cropForm, areaHa: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 font-mono" /></div>
                <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Njia ya Umwagiliaji:</label><select value={cropForm.irrigationMethod} onChange={(e) => setCropForm({ ...cropForm, irrigationMethod: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"><option value="Drip">Njia ya Matone (Drip)</option><option value="Sprinkler">Mizunguko (Sprinkler)</option><option value="Flood">Mifereji (Flood)</option><option value="Mvua">Mvua Pekee</option></select></div>
              </div>
              <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Tarehe ya Kupanda:</label><input type="date" required value={cropForm.plantingDate} onChange={(e) => setCropForm({ ...cropForm, plantingDate: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 font-mono" /></div>
            </div>
            <div className="flex gap-2.5 pt-4">{farmers.length === 0 ? (<button type="submit" disabled className="flex-1 bg-slate-200 text-slate-400 font-bold py-3 rounded-xl text-sm cursor-not-allowed">Haiwezi Kuhifadhi</button>) : (<button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm cursor-pointer">Hifadhi Zao</button>)}<button type="button" onClick={() => setShowAddCrop(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition cursor-pointer">Ghairi</button></div>
          </form>
        </div>
      )}

      {/* Delete Farmer Modal */}
      {showDeleteFarmer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleDeleteFarmerSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3"><h3 className="font-extrabold text-red-700 text-lg flex items-center gap-2"><Trash2 size={20} />Futa Mkulima</h3><button type="button" onClick={() => setShowDeleteFarmer(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={20} /></button></div>
            <div className="bg-red-50 border border-red-100 text-red-800 rounded-xl p-4 text-xs leading-relaxed">⚠️ <strong>ONYO:</strong> Kufuta mkulima kutaondoa pia mazao yake yote. Tendo hili haliwezi kubatilishwa.</div>
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Chagua Mkulima:</label><select required value={deleteFarmerId} onChange={(e) => setDeleteFarmerId(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"><option value="">-- Chagua mkulima --</option>{farmers.map((f) => <option key={f.id} value={f.id}>{f.name} (ID: {f.id})</option>)}</select></div>
            <div className="flex gap-2.5 pt-4"><button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm cursor-pointer">Ndio, Futa</button><button type="button" onClick={() => setShowDeleteFarmer(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition cursor-pointer">Ghairi</button></div>
          </form>
        </div>
      )}

      {/* Send SMS Modal */}
      {showSendSms && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleGeneralSmsSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3"><h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2"><Smartphone size={20} className="text-emerald-600" />Tuma SMS</h3><button type="button" onClick={() => setShowSendSms(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={20} /></button></div>
            <div className="space-y-4 text-sm">
              <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Mpokeaji:</label><select value={smsForm.farmerId} onChange={(e) => setSmsForm({ ...smsForm, farmerId: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"><option value="all">Tuma kwa Wakulima wote (Blast)</option>{farmers.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.phone || 'N/A'})</option>)}</select></div>
              <div className="space-y-1"><label className="text-xs font-semibold text-slate-500">Meseji:</label><textarea required rows={4} placeholder="Andika ujumbe wako hapa..." value={smsForm.message} onChange={(e) => setSmsForm({ ...smsForm, message: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20" /></div>
            </div>
            <div className="space-y-2.5 pt-4"><button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm cursor-pointer flex items-center justify-center gap-2"><Send size={15} />Tuma kwa Gateway</button><button type="button" onClick={() => setShowSendSms(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition cursor-pointer">Ghairi</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
