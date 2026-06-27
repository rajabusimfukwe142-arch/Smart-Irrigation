import React, { useState, useEffect } from 'react';
import { Crop } from '../types';
import { CROPS_DATA, TANZANIA_SEED_VARIETIES } from '../data';
import { getGrowthStageName } from '../utils';
import { Play, Pause, ChevronRight, Droplet, Calendar, Gauge } from 'lucide-react';

interface GrowthTrackerProps {
  crops: Crop[];
  selectedCropName: string;
  onSelectCrop: (cropName: string) => void;
}

export const GrowthTracker: React.FC<GrowthTrackerProps> = ({
  crops,
  selectedCropName,
  onSelectCrop,
}) => {
  const [simulatedDays, setSimulatedDays] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Sync selected crop
  const currentCrop = crops.find(
    (c) => c.cropName.toLowerCase() === selectedCropName.toLowerCase()
  ) || crops[0];

  useEffect(() => {
    if (currentCrop) {
      setSimulatedDays(currentCrop.daysAfterPlanting);
    }
  }, [currentCrop]);

  // Simulation timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating && currentCrop) {
      const cropConfig = CROPS_DATA[currentCrop.cropName.toLowerCase()];
      const maxDays = cropConfig ? cropConfig.days_to_maturity : 90;

      interval = setInterval(() => {
        setSimulatedDays((prev) => {
          if (prev >= maxDays) {
            setIsSimulating(false);
            return prev;
          }
          return prev + 1;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isSimulating, currentCrop]);

  if (!currentCrop) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-12 text-center max-w-md mx-auto">
        <h3 className="text-lg font-bold text-slate-800">Hakuna Mazao Yasajiliwa</h3>
        <p className="text-slate-500 text-sm mt-1">
          Tafadhali ongeza zao kwenye kichupo cha Mazao kwanza ili kuona tracker.
        </p>
      </div>
    );
  }

  const cropConfig = CROPS_DATA[currentCrop.cropName.toLowerCase()];
  const maxDays = cropConfig ? cropConfig.days_to_maturity : 90;
  const progressPercent = Math.min(100, Math.round((simulatedDays / maxDays) * 100));
  const stage = getGrowthStageName(currentCrop.cropName, simulatedDays);

  // SVG Circular progress dimensions
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Swahili stages array
  const STAGES = [
    { name: '🌱 Kupanda', desc: 'Siku za kwanza za kuota' },
    { name: '🌿 Kuota', desc: 'Matawi kuanza kuchipua' },
    { name: '🌻 Ukuaji', desc: 'Mmea unakua kwa kasi' },
    { name: '🌸 Maua', desc: 'Hatua ya kuweka matunda' },
    { name: '🌾 Kuvuna', desc: 'Zao lipo tayari kwa soko' },
  ];

  const getWaterAdvice = (stageIndex: number) => {
    const advice = [
      'Lita 20-30 kwa mwezi mmoja wa kwanza. Nyunyiza kwa uangalifu asubuhi.',
      'Lita 30-40 kwa mwezi. Mfumo wa mizizi unaanza kuimarika vizuri.',
      'Lita 40-50 kwa mwezi. Huu ni muda muhimu, mmea unahitaji maji ya kutosha.',
      'Lita 50-60 kwa mwezi. Usiache udongo ukauke wakati huu wa maua.',
      'Lita 30-40 kwa mwezi. Punguza umwagiliaji pole pole kabla ya kuvuna.',
    ];
    return advice[stageIndex] || 'Nyunyiza kulingana na unyevu wa udongo.';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">🌾 Tracker ya Ukuaji wa Mazao</h2>
        <p className="text-slate-500 text-sm">Fuatilia hatua kwa hatua, mahitaji ya maji, na kimelea cha unyevu kinachobadilika.</p>
      </div>

      {/* Select Crop bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <label className="text-sm font-semibold text-slate-600 sm:w-1/4">Chagua Zao la Kufuatilia:</label>
        <select
          value={currentCrop.cropName}
          onChange={(e) => onSelectCrop(e.target.value)}
          className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
        >
          {crops.map((c) => (
            <option key={c.id} value={c.cropName}>
              {c.cropName.toUpperCase()} ({cropConfig?.swahili}) - ID: {c.id}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Circular Progress Gauge */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="font-bold text-slate-700">Maendeleo ya Kukomaa</h3>

          <div className="relative flex items-center justify-center w-52 h-52">
            <svg className="w-full h-full -rotate-90">
              {/* Background circle */}
              <circle
                cx="104"
                cy="104"
                r={radius}
                className="stroke-slate-100 fill-none"
                strokeWidth="10"
              />
              {/* Foreground progress circle */}
              <circle
                cx="104"
                cy="104"
                r={radius}
                className="stroke-emerald-600 fill-none transition-all duration-300"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
              <span className="text-4xl">{cropConfig?.icon || '🌱'}</span>
              <span className="text-2xl font-black text-slate-800 font-mono">{progressPercent}%</span>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Maturity</span>
            </div>
          </div>

          <div className="text-center">
            <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100/50">
              {stage.name}
            </span>
            <p className="text-slate-400 text-xs mt-3">Hatua sasa hivi inasoma: {STAGES[stage.index]?.desc}</p>
          </div>
        </div>

        {/* Detailed Metrics Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
            <h3 className="font-bold text-slate-800 text-lg border-b border-slate-50 pb-3">
              Maelezo ya Kina ya Ukuaji
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <span className="text-xs text-slate-400 font-medium">Zao na Aina</span>
                <p className="font-bold text-slate-800 text-base">
                  {cropConfig?.swahili || currentCrop.cropName} ({currentCrop.variety})
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <span className="text-xs text-slate-400 font-medium">Siku tangu kupanda</span>
                <p className="font-bold text-slate-800 text-base font-mono">
                  Siku {simulatedDays} / {maxDays}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <span className="text-xs text-slate-400 font-medium">Upeo wa Kc (Crop Coeff.)</span>
                <p className="font-bold text-slate-800 text-base font-mono">
                  {simulatedDays < 0.2 * maxDays
                    ? cropConfig?.kc.mwanzo
                    : simulatedDays < 0.7 * maxDays
                    ? cropConfig?.kc.katikati
                    : cropConfig?.kc.mwisho}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <span className="text-xs text-slate-400 font-medium">Makadirio ya Mavuno</span>
                <p className="font-bold text-slate-800 text-base">
                  Katika siku {maxDays - simulatedDays} zijazo
                </p>
              </div>
            </div>

            {/* Irrigation advice box */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                <Droplet size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-emerald-900">Ushauri wa Kumwagilia Katika Hatua Hii:</h4>
                <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                  {getWaterAdvice(stage.index)}
                </p>
              </div>
            </div>

            {/* Recommended seed varieties list */}
            {TANZANIA_SEED_VARIETIES[currentCrop.cropName.toLowerCase()] && (
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  🌱 Mbegu Bora Zinazopendekezwa nchini Tanzania kwa {cropConfig?.swahili || currentCrop.cropName}:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {TANZANIA_SEED_VARIETIES[currentCrop.cropName.toLowerCase()].map((seed) => {
                    const isUsed = currentCrop.variety.toLowerCase().trim() === seed.toLowerCase().trim();
                    return (
                      <span
                        key={seed}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition ${
                          isUsed
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        {seed} {isUsed && '⭐'}
                      </span>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400">
                  *Mbegu hizi zimethibitishwa na Taasisi ya Kudhibiti Ubora wa Mbegu Tanzania (TOSCI) kwa uzalishaji bora.
                </p>
              </div>
            )}

            {/* Manual Slider & Simulation Speed controllers */}
            <div className="space-y-3 pt-3 border-t border-slate-50">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Simulate Growth Days (Ongeza Siku)</span>
                <span className="font-mono text-slate-400">Siku {simulatedDays}</span>
              </div>
              <input
                type="range"
                min="0"
                max={maxDays}
                value={simulatedDays}
                onChange={(e) => {
                  setSimulatedDays(parseInt(e.target.value));
                  setIsSimulating(false);
                }}
                className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                    isSimulating
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-white hover:bg-slate-900'
                  }`}
                >
                  {isSimulating ? <Pause size={13} /> : <Play size={13} />}
                  {isSimulating ? 'Simamisha Simulation' : 'Anza Auto-Simulate (Growth animation)'}
                </button>

                <button
                  onClick={() => {
                    setSimulatedDays(currentCrop.daysAfterPlanting);
                    setIsSimulating(false);
                  }}
                  className="text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Reset to Actual
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
