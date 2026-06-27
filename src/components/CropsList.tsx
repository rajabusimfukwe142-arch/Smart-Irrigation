import React, { useState } from 'react';
import { Crop, Farmer } from '../types';
import { CROPS_DATA } from '../data';
import { Search, Plus, Calendar, Ruler, CheckCircle, Flame, Eye } from 'lucide-react';

interface CropsListProps {
  crops: Crop[];
  farmers: Farmer[];
  onOpenAddCrop: () => void;
  onSelectCropForGrowth: (cropName: string) => void;
}

export const CropsList: React.FC<CropsListProps> = ({
  crops,
  farmers,
  onOpenAddCrop,
  onSelectCropForGrowth,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getFarmerName = (farmerId: number) => {
    const farmer = farmers.find((f) => f.id === farmerId);
    return farmer ? farmer.name : 'N/A';
  };

  const getCropStats = (cropName: string, daysAfterPlanting: number) => {
    const cropConfig = CROPS_DATA[cropName.toLowerCase()];
    if (!cropConfig) return { progress: 0, maturityDays: 90, icon: '🌱', swahili: cropName };

    const maturityDays = cropConfig.days_to_maturity;
    const progress = Math.min(100, Math.round((daysAfterPlanting / maturityDays) * 100));
    return {
      progress,
      maturityDays,
      icon: cropConfig.icon,
      swahili: cropConfig.swahili,
      category: cropConfig.category,
    };
  };

  const filteredCrops = crops.filter((crop) => {
    const stats = getCropStats(crop.cropName, crop.daysAfterPlanting);
    const farmerName = getFarmerName(crop.farmerId);
    const matchesSearch = `${crop.cropName} ${stats.swahili} ${farmerName} ${crop.variety}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || stats.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">🌱 Mazao Chini ya Umwagiliaji</h2>
          <p className="text-slate-500 text-sm">Fuatilia maendeleo ya kila zao, tarehe za kupanda, na hatua zao za sasa za kukomaa.</p>
        </div>
        <button
          onClick={onOpenAddCrop}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-sm cursor-pointer"
        >
          <Plus size={18} />
          Ongeza Zao Jipya
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Tafuta zao kwa jina, mkulima, au aina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm transition"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'Chakula', 'Mboga', 'Matunda', 'Biashara'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl border transition cursor-pointer ${
                selectedCategory === category
                  ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {category === 'all' ? 'Aina Zote' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Crops Table/Cards */}
      {filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCrops.map((crop) => {
            const stats = getCropStats(crop.cropName, crop.daysAfterPlanting);
            const farmerName = getFarmerName(crop.farmerId);

            return (
              <div
                key={crop.id}
                className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition relative overflow-hidden"
              >
                {/* Category tag */}
                <div className="absolute top-0 right-0">
                  <span className="text-[10px] uppercase tracking-wider font-semibold font-mono bg-teal-50 text-teal-800 px-3 py-1 rounded-bl-lg border-l border-b border-teal-100/50">
                    {stats.category || 'N/A'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-slate-50 rounded-lg">{stats.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {stats.swahili} <span className="text-sm font-normal text-slate-400">({crop.variety})</span>
                      </h3>
                      <p className="text-slate-500 text-xs font-medium">
                        Mkulima: <span className="text-slate-700">{farmerName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Growth stats */}
                  <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={15} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Tarehe ya Kupanda</p>
                        <p className="font-semibold text-slate-700">{new Date(crop.plantingDate).toLocaleDateString('sw-TZ')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Ruler size={15} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Eneo la Shamba</p>
                        <p className="font-semibold text-slate-700">{crop.areaHa} Hectare</p>
                      </div>
                    </div>
                  </div>

                  {/* Maturity Tracker */}
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Hatua ya Ukomaaji</span>
                      <span className="text-teal-700 font-bold font-mono">
                        Siku {crop.daysAfterPlanting} / {stats.maturityDays} ({stats.progress}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-teal-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${stats.progress}%` }}
                      ></div>
                    </div>
                    {stats.progress >= 100 && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse mt-2.5">
                        <span>🚜</span>
                        <span>TAYARI KUVUNWA / READY FOR HARVEST!</span>
                      </div>
                    )}
                  </div>

                  {/* Soil Moisture Sensor Indicator */}
                  <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-medium">Unyevu wa Udongo:</span>
                      <span className={`font-mono font-bold ${
                        (crop.moisture ?? 70) < 40 
                          ? 'text-red-600 animate-pulse' 
                          : (crop.moisture ?? 70) >= 65 
                          ? 'text-emerald-600' 
                          : 'text-amber-600'
                      }`}>
                        {crop.moisture ?? 70}%
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold font-mono uppercase tracking-wider ${
                      (crop.moisture ?? 70) < 40 
                        ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' 
                        : (crop.moisture ?? 70) >= 65 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {(crop.moisture ?? 70) < 40 ? 'Ukame' : (crop.moisture ?? 70) >= 65 ? 'Mzuri' : 'Wastani'}
                    </span>
                  </div>
                </div>

                {/* Bottom interactive row */}
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      (crop.irrigationMethod.toLowerCase() === 'mvua' || crop.irrigationMethod.toLowerCase() === 'rain-fed')
                        ? 'bg-blue-400 animate-bounce'
                        : 'bg-teal-500 animate-pulse'
                    }`}></span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {crop.irrigationMethod.toLowerCase() === 'mvua' || crop.irrigationMethod.toLowerCase() === 'rain-fed'
                        ? '🌧️ Kutegemea Mvua (Rain-fed)'
                        : `💧 ${crop.irrigationMethod} Irrigation`}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectCropForGrowth(crop.cropName)}
                    className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-800 transition cursor-pointer"
                  >
                    <Eye size={14} />
                    Fungua Tracker
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Hakuna Mazao Yaliyopatikana</h3>
          <p className="text-slate-500 text-sm mt-1">
            Mkulima kwanza lazima asajiliwe, kisha unaweza kuongeza zao.
          </p>
        </div>
      )}
    </div>
  );
};
