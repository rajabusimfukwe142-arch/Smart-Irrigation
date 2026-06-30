import React from 'react';
import { Crop, WeatherData, Farmer } from '../types';
import { calculateIrrigationRequirement } from '../utils';
import { CROPS_DATA } from '../data';
import { Droplets, Info, RefreshCw, Compass, ShieldCheck, Waves } from 'lucide-react';

interface IrrigationCalculatorViewProps {
  crops: Crop[];
  farmers: Farmer[];
  weather: WeatherData;
  onRefreshCalculations: () => void;
}

export const IrrigationCalculatorView: React.FC<IrrigationCalculatorViewProps> = ({
  crops,
  farmers,
  weather,
  onRefreshCalculations,
}) => {
  const getFarmerName = (farmerId: number) => {
    const farmer = farmers.find((f) => f.id === farmerId);
    return farmer ? farmer.name : 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">💧 Mahitaji ya Maji na Mahesabu</h2>
          <p className="text-slate-500 text-sm">Kokotoa kiwango halisi cha maji kwa hekta kulingana na fomula ya Penman-Monteith.</p>
        </div>
        <button
          onClick={onRefreshCalculations}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-sm cursor-pointer"
        >
          <RefreshCw size={16} />
          Sasisha Mahesabu Leo
        </button>
      </div>

      {crops.length > 0 ? (
        <div className="space-y-6">
          {crops.map((crop) => {
            const farmerName = getFarmerName(crop.farmerId);
            const cropConfig = CROPS_DATA[crop.cropName.toLowerCase()];
            const isRainFed = crop.irrigationMethod?.toLowerCase() === 'mvua' || crop.irrigationMethod?.toLowerCase() === 'rain-fed';
            const calculations = calculateIrrigationRequirement(
              crop.cropName,
              crop.areaHa,
              weather,
              crop.daysAfterPlanting,
              crop.irrigationMethod
            );

            return (
              <div
                key={crop.id}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6 hover:border-slate-200 transition"
              >
                {/* Crop ID, Name, and owner banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-50 pb-4 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl p-1 bg-slate-50 rounded-xl">{cropConfig?.icon || '🌱'}</span>
                    <div>
                      <h3 className="text-lg font-black text-slate-800">
                        {cropConfig?.swahili || crop.cropName.toUpperCase()} ({crop.variety})
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        Shamba la: <span className="text-slate-600">{farmerName}</span> | Eneo: {crop.areaHa} ha
                      </p>
                    </div>
                  </div>

                  <span className="self-start sm:self-center bg-emerald-50 text-emerald-800 text-xs font-mono font-bold px-3 py-1 rounded-full">
                    Siku {crop.daysAfterPlanting} ya mzunguko
                  </span>
                </div>

                {/* Main results cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Reference ETo */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-slate-400 text-xs font-semibold">Reference ETo (Evapo)</span>
                    <p className="text-2xl font-black text-slate-800 font-mono">
                      {calculations.eto.toFixed(2)} <span className="text-xs font-medium text-slate-400">mm/day</span>
                    </p>
                    <p className="text-[10px] text-slate-400">Uvukizaji wa udongo wa marejeo</p>
                  </div>

                  {/* Crop Kc */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-slate-400 text-xs font-semibold">Zao Coefficient (Kc)</span>
                    <p className="text-2xl font-black text-slate-800 font-mono">{calculations.kc.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">Mgawo wa zao katika hatua hii</p>
                  </div>

                  {/* Crop ETc */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-slate-400 text-xs font-semibold">Crop ETc (ETo × Kc)</span>
                    <p className="text-2xl font-black text-emerald-700 font-mono">
                      {calculations.etc.toFixed(2)} <span className="text-xs font-medium text-emerald-600">mm/day</span>
                    </p>
                    <p className="text-[10px] text-slate-400">Uvukizaji halisi wa zao hili</p>
                  </div>

                  {/* Net Irrigation Needs */}
                  <div className={`${isRainFed ? 'bg-blue-800' : 'bg-emerald-800'} p-4 rounded-xl text-white space-y-1 shadow-xs`}>
                    <span className={`${isRainFed ? 'text-blue-200' : 'text-emerald-200'} text-xs font-semibold`}>
                      {isRainFed ? 'Njia ya Uzalishaji' : 'Maji Halisi (Net Water)'}
                    </span>
                    <p className="text-xl font-black">
                      {isRainFed ? '🌧️ Mvua Pekee' : `${calculations.netIrrigation.toLocaleString()} Liters`}
                    </p>
                    <p className={`text-[10px] ${isRainFed ? 'text-blue-100' : 'text-emerald-100'} font-medium`}>
                      {isRainFed ? 'Haitumii mfumo wa kumwagilia' : 'Baada ya kurekebisha mvua'}
                    </p>
                  </div>
                </div>

                {/* Efficiency calculation banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Gross demand */}
                  <div className="border border-slate-100 rounded-xl p-4 flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <Waves className="text-blue-500 shrink-0" size={18} />
                      <div className="text-left">
                        <p className="text-xs text-slate-400 font-medium">Maji Jumla (Gross Water Needed)</p>
                        <p className="font-bold text-slate-800 font-mono">
                          {calculations.grossIrrigation.toLocaleString()} L
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-sm">
                      Eff: 80%
                    </span>
                  </div>

                  {/* Rain Adjustment summary */}
                  <div className="border border-emerald-100 bg-emerald-50/50 rounded-xl p-4 flex items-center gap-3 text-emerald-800">
                    <Compass size={20} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs text-emerald-950 font-bold">
                        Hali ya Mvua: {calculations.rainAction} ({weather.rainfall} mm)
                      </p>
                      <p className="text-xs text-emerald-700 leading-relaxed mt-0.5">
                        {calculations.rainMessage} (Mzidisho wa maji: x{calculations.rainMultiplier})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Hakuna Mazao kwa Sasa</h3>
          <p className="text-slate-500 text-sm mt-1">
            Mara baada ya kusajili mkulima na zao, mfumo utakokotoa kiwango sahihi cha maji moja kwa moja.
          </p>
        </div>
      )}
    </div>
  );
};
