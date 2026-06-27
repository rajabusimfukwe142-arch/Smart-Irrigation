import React, { useState } from 'react';
import { Farmer, Crop, WeatherData } from '../types';
import { 
  Users, 
  Sprout, 
  Calendar, 
  Droplets, 
  MapPin, 
  Wind, 
  Thermometer, 
  CloudRain, 
  Sun, 
  Trash2, 
  Plus, 
  FileText, 
  Download, 
  ShieldAlert, 
  BookOpen, 
  Smartphone, 
  Sparkles, 
  Brain,
  Cpu
} from 'lucide-react';
import { CROPS_DATA } from '../data';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend,
  Cell
} from 'recharts';

interface DashboardProps {
  farmers: Farmer[];
  crops: Crop[];
  pendingCount: number;
  totalWater: number;
  weather: WeatherData;
  autoSmsLogs: Array<{
    id: number;
    date: string;
    farmerName: string;
    phone: string;
    cropName: string;
    moisture: number;
    message: string;
  }>;
  onTabChange: (tab: string) => void;
  onOpenAddFarmer: () => void;
  onOpenAddCrop: () => void;
  onOpenDeleteFarmer: () => void;
  onOpenSendSms: () => void;
  onBackup: () => void;
  onGeneratePdf: () => void;
  onGenerateExcel: () => void;
  onIrrigateCrop: (cropId: number) => void;
  onDrySoilSimulate: (cropId: number) => void;
  onSimulateRain: () => void;
  onSimulateHeatwave: () => void;
  language: 'SW' | 'EN';
}

export const Dashboard: React.FC<DashboardProps> = ({
  farmers,
  crops,
  pendingCount,
  totalWater,
  weather,
  autoSmsLogs,
  onTabChange,
  onOpenAddFarmer,
  onOpenAddCrop,
  onOpenDeleteFarmer,
  onOpenSendSms,
  onBackup,
  onGeneratePdf,
  onGenerateExcel,
  onIrrigateCrop,
  onDrySoilSimulate,
  onSimulateRain,
  onSimulateHeatwave,
  language,
}) => {
  // AI Recommendation States
  const [loadingAiId, setLoadingAiId] = useState<number | null>(null);
  const [aiAdvices, setAiAdvices] = useState<Record<number, string>>({});
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchAiAdvice = async (crop: Crop, farmerName: string, region: string) => {
    setLoadingAiId(crop.id);
    setAiError(null);
    try {
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropId: crop.id,
          cropName: crop.cropName,
          variety: crop.variety,
          growthStage: crop.growthStage,
          moisture: crop.moisture || 60,
          temperature: weather.temperature,
          rainfall: weather.rainfall,
          region: region
        })
      });

      const data = await response.json();
      if (data.success) {
        setAiAdvices(prev => ({ ...prev, [crop.id]: data.advice }));
      } else {
        setAiError(data.error || "Hitilafu ilitokea kwenye Gemini AI.");
      }
    } catch (err: any) {
      setAiError(err.message || "Imeshindwa kuunganisha na seva ya AI.");
    } finally {
      setLoadingAiId(null);
    }
  };

  // Prepare Recharts Data for Soil Moisture comparison
  const moistureChartData = crops.map(c => {
    const config = CROPS_DATA[c.cropName.toLowerCase()];
    return {
      name: `${config?.swahili || c.cropName} (${c.variety})`,
      moisture: c.moisture || 60,
      criticalLimit: 40
    };
  });

  // Prepare Recharts Data for 7-Day weather forecast
  const forecastChartData = weather.forecast.map((rain, idx) => {
    const daysSwahili = ["Leo", "Kesho", "Keshokutwa", "Siku 4", "Siku 5", "Siku 6", "Siku 7"];
    const daysEnglish = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
    return {
      day: language === 'SW' ? daysSwahili[idx] : daysEnglish[idx],
      rain: Number(rain.toFixed(1))
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-emerald-800 text-white p-6 rounded-2xl shadow-sm border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sprout size={120} />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="bg-emerald-600/60 text-emerald-100 text-xs px-2.5 py-1 rounded-full font-mono font-medium tracking-wide">
            TANZANIA PRO V4.0 (AI + DATA EDITION)
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans sm:text-4xl">
            Smart Irrigation Tanzania
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl font-light">
            Mfumo mahiri wa kusimamia umwagiliaji kwa kutumia hali ya hewa ya satelaiti, sensorer halisi, na Ushauri wa AI (Gemini) uliopo kwenye seva salama.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Farmers Stat */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 font-medium text-xs sm:text-sm">👨‍🌾 Wakulima</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{farmers.length}</h3>
            <p className="text-slate-400 text-xs mt-1">Waliomsajiliwa</p>
          </div>
        </div>

        {/* Crops Stat */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 font-medium text-xs sm:text-sm">🌱 Mazao Yote</span>
            <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
              <Sprout size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{crops.length}</h3>
            <p className="text-slate-400 text-xs mt-1">Chini ya uangalizi</p>
          </div>
        </div>

        {/* Pending Schedules */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 font-medium text-xs sm:text-sm">📅 Ratiba za Leo</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Calendar size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{pendingCount}</h3>
            <p className="text-slate-400 text-xs mt-1">Zinasubiri mwagilio</p>
          </div>
        </div>

        {/* Water Liters */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 font-medium text-xs sm:text-sm">💧 Maji Jumla</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Droplets size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              {totalWater.toLocaleString()} L
            </h3>
            <p className="text-slate-400 text-xs mt-1">Makadirio ya umwagiliaji</p>
          </div>
        </div>
      </div>

      {/* Geolocation & Weather strip */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-slate-600 text-sm">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-emerald-600 animate-bounce" />
          <span className="font-medium text-slate-700">📍 Satelaiti Inasoma Live:</span>
          <span className="font-mono text-slate-500 text-xs">Morogoro / Dodoma / Mbeya (Tanzania Live Network)</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1 font-mono text-xs">
            <Thermometer size={14} className="text-amber-500" />
            <span>{weather.temperature}°C</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs">
            <Droplets size={14} className="text-blue-500" />
            <span>{weather.humidity}% Unyevu</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs">
            <Wind size={14} className="text-teal-500" />
            <span>{weather.windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs">
            <CloudRain size={14} className="text-indigo-500" />
            <span>{weather.rainfall} mm Mvua</span>
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER (Uchambuzi wa Data Halisi) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soil Moisture Chart */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
              📊 Mlinganisho wa Unyevu wa Udongo (%)
            </h3>
            <p className="text-slate-400 text-xs">Unyevu wa udongo kwenye mashamba yako ikilinganishwa na kikomo cha ukame (40%)</p>
          </div>
          <div className="h-64 w-full">
            {crops.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moistureChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #f1f5f9' }} />
                  <Bar dataKey="moisture" radius={[6, 6, 0, 0]}>
                    {moistureChartData.map((entry, index) => {
                      const color = entry.moisture < entry.criticalLimit ? "#ef4444" : "#10b981";
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Hakuna mazao yaliyosajiliwa ya kulinganisha.</div>
            )}
          </div>
        </div>

        {/* 7-Day Rainfall Forecast Area Chart */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
              🌧️ Utabiri wa Mvua wa Siku 7 (Open-Meteo Satelaiti)
            </h3>
            <p className="text-slate-400 text-xs">Kiwango cha usimbaji (rainfall) kinachotarajiwa kunyesha kwa mm</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #f1f5f9' }} />
                <Area type="monotone" dataKey="rain" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRain)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Action Matrix */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
          Njia za Mkato na Matendo ya Haraka
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <button
            onClick={onOpenAddFarmer}
            className="flex flex-col items-center justify-center p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-700 hover:text-emerald-700 transition shadow-xs text-center group cursor-pointer"
          >
            <div className="p-3 bg-emerald-50 rounded-full text-emerald-600 group-hover:scale-105 transition duration-200">
              <Plus size={20} />
            </div>
            <span className="mt-2 text-xs font-medium">Ongeza Mkulima</span>
          </button>

          <button
            onClick={onOpenAddCrop}
            className="flex flex-col items-center justify-center p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-700 hover:text-emerald-700 transition shadow-xs text-center group cursor-pointer"
          >
            <div className="p-3 bg-teal-50 rounded-full text-teal-600 group-hover:scale-105 transition duration-200">
              <Plus size={20} />
            </div>
            <span className="mt-2 text-xs font-medium">Ongeza Zao</span>
          </button>

          <button
            onClick={() => onTabChange('schedules')}
            className="flex flex-col items-center justify-center p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-700 hover:text-emerald-700 transition shadow-xs text-center group cursor-pointer"
          >
            <div className="p-3 bg-amber-50 rounded-full text-amber-600 group-hover:scale-105 transition duration-200">
              <Calendar size={20} />
            </div>
            <span className="mt-2 text-xs font-medium">Ratiba ya Leo</span>
          </button>

          <button
            onClick={onOpenDeleteFarmer}
            className="flex flex-col items-center justify-center p-4 bg-white hover:bg-red-50 border border-slate-100 hover:border-red-100 rounded-xl text-slate-700 hover:text-red-700 transition shadow-xs text-center group cursor-pointer"
          >
            <div className="p-3 bg-red-50 rounded-full text-red-600 group-hover:scale-105 transition duration-200">
              <Trash2 size={20} />
            </div>
            <span className="mt-2 text-xs font-medium">Futa Mkulima</span>
          </button>

          <button
            onClick={() => onTabChange('pro')}
            className="flex flex-col items-center justify-center p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-700 hover:text-emerald-700 transition shadow-xs text-center group cursor-pointer"
          >
            <div className="p-3 bg-indigo-50 rounded-full text-indigo-600 group-hover:scale-105 transition duration-200">
              <Cpu size={20} />
            </div>
            <span className="mt-2 text-xs font-medium">Pro & IoT Config</span>
          </button>
        </div>
      </div>

      {/* Soil Moisture Sensor and Auto-SMS Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Sensor Live Feed */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                📡 Sensor za Unyevu wa Udongo (Soil Moisture Live)
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">Unyevu wa udongo unabadilika live. Chini ya 40% utatuma SMS otomatiki.</p>
            </div>
          </div>

          {/* Jopo la Uigizaji wa Kitaifa (National Simulation controls) */}
          {crops.length > 0 && (
            <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-2.5 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
                  {language === 'SW' ? '🎛️ Uigizaji wa Hali ya Hewa (Harakisha Demo)' : '🎛️ Weather Simulation (Fast-Track Demo)'}
                </span>
                <span className="text-[9px] bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-600 font-bold uppercase font-mono">Kitaifa</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={onSimulateRain}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 text-xs font-bold rounded-lg border border-blue-100/50 transition cursor-pointer active:scale-97"
                >
                  <CloudRain size={14} />
                  <span>{language === 'SW' ? 'Nyesha Mvua (Unyevu 88%)' : 'Simulate Rain (Moisture 88%)'}</span>
                </button>
                <button
                  type="button"
                  onClick={onSimulateHeatwave}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 text-xs font-bold rounded-lg border border-amber-100/50 transition cursor-pointer active:scale-97"
                >
                  <Sun size={14} />
                  <span>{language === 'SW' ? 'Jua Kali (Unyevu -20%)' : 'Heatwave (Moisture -20%)'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {crops.map((crop) => {
              const farmer = farmers.find((f) => f.id === crop.farmerId);
              const moisture = typeof crop.moisture === 'number' ? crop.moisture : 70;
              const isDry = moisture < 40;
              const isGood = moisture >= 65;
              const cropConfig = CROPS_DATA[crop.cropName.toLowerCase()];
              const regionName = farmer ? farmer.region : 'Morogoro';

              return (
                <div key={crop.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/40 space-y-3 hover:border-slate-200 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{cropConfig?.icon || '🌱'}</span>
                        <h4 className="font-bold text-slate-700 capitalize text-sm sm:text-base">
                          {cropConfig?.swahili || crop.cropName} ({crop.variety})
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Mkulima: <span className="font-semibold text-slate-600">{farmer ? farmer.name : 'Unknown'}</span> | Tel: <span className="font-mono text-slate-500">{farmer ? farmer.phone : 'N/A'}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isDry 
                          ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse'
                          : isGood
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {isDry ? '❌ Udongo Kavu' : isGood ? '✅ Unyevu Unaridhisha' : '⚠️ Unyevu wa Wastani'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Kiwango cha unyevu wa sasa:</span>
                      <span className={`font-mono font-bold ${isDry ? 'text-red-600' : isGood ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {moisture}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isDry ? 'bg-red-500' : isGood ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${moisture}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* AI Recommendation Panel */}
                  {aiAdvices[crop.id] && (
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 mt-3 space-y-2 animate-fade-in relative">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs font-mono">
                        <Brain size={14} className="text-emerald-600 animate-pulse" />
                        <span>MAPENDEKEZO YA GEMINI AI KILIMO:</span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap font-sans font-light">
                        {aiAdvices[crop.id]}
                      </p>
                      <button 
                        onClick={() => {
                          const updated = { ...aiAdvices };
                          delete updated[crop.id];
                          setAiAdvices(updated);
                        }}
                        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 text-xs font-mono"
                      >
                        [Funga]
                      </button>
                    </div>
                  )}

                  {/* Crop Action Buttons */}
                  <div className="flex flex-wrap justify-between items-center gap-2 pt-1.5">
                    {/* Ask Gemini Button */}
                    <button
                      type="button"
                      disabled={loadingAiId === crop.id}
                      onClick={() => fetchAiAdvice(crop, farmer ? farmer.name : 'Mkulima', regionName)}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-extrabold rounded-lg border transition cursor-pointer ${
                        loadingAiId === crop.id
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200 animate-pulse'
                          : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 active:scale-97'
                      }`}
                    >
                      <Sparkles size={12} className={loadingAiId === crop.id ? "animate-spin" : ""} />
                      <span>
                        {loadingAiId === crop.id 
                          ? (language === 'SW' ? 'AI Inachambua...' : 'AI Analyzing...') 
                          : (language === 'SW' ? '🧠 Ushauri wa AI' : '🧠 Ask AI Advisor')
                        }
                      </span>
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onDrySoilSimulate(crop.id)}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-100/50 transition cursor-pointer"
                      >
                        💨 Simulate Ukame (Drying)
                      </button>
                      <button
                        type="button"
                        onClick={() => onIrrigateCrop(crop.id)}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100/50 transition cursor-pointer"
                      >
                        💧 Mwagilia (Irrigate)
                      </button>
                    </div>
                  </div>

                  {aiError && loadingAiId === crop.id && (
                    <div className="text-red-600 text-[10px] bg-red-50 p-2 rounded-lg border border-red-100">
                      ⚠️ {aiError}
                    </div>
                  )}
                </div>
              );
            })}
            {crops.length === 0 && (
              <p className="text-slate-400 text-xs py-4 text-center">Hakuna mazao yaliyosajiliwa bado.</p>
            )}
          </div>
        </div>

        {/* Live Automatic SMS Logs */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-50 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Smartphone size={18} className="text-blue-500 animate-bounce" />
                ✉️ SMS Logs (Server Dispatch Live)
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">Ujumbe unaotumwa kiotomatiki kwa simu ya mkulima kupitia server database yetu.</p>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {autoSmsLogs.map((log) => (
                <div key={log.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-mono">
                    <span className="font-bold text-slate-600">{log.farmerName}</span>
                    <span className="text-[10px] text-slate-400">{log.date}</span>
                  </div>
                  <p className="text-slate-500 font-mono text-[11px] leading-relaxed italic bg-white p-2 rounded-lg border border-slate-100/40">
                    "{log.message}"
                  </p>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-blue-600 font-semibold font-mono">Recipient: {log.phone}</span>
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-mono text-[9px]">
                      Dispatched ✓
                    </span>
                  </div>
                </div>
              ))}

              {autoSmsLogs.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                  <div className="w-10 h-10 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                    <Smartphone size={20} />
                  </div>
                  <p>Hakuna SMS za sensor zilizotumwa bado.</p>
                  <p className="text-[10px] text-slate-300">Bonyeza "Simulate Ukame" kushuhudia mfumo ukisafirisha SMS ya dharura!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
