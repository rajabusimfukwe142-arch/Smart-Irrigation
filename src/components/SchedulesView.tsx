import React, { useState } from 'react';
import { Schedule, Crop, Farmer } from '../types';
import { CROPS_DATA } from '../data';
import { Calendar, CheckCircle2, AlertTriangle, Send, Phone, MessageSquare, Info, Smartphone } from 'lucide-react';

interface SchedulesViewProps {
  schedules: Schedule[];
  crops: Crop[];
  farmers: Farmer[];
  onToggleStatus: (scheduleId: number) => void;
  onSendSms: (farmerId: number, message: string) => void;
}

export const SchedulesView: React.FC<SchedulesViewProps> = ({
  schedules,
  crops,
  farmers,
  onToggleStatus,
  onSendSms,
}) => {
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'COMPLETED'>('all');
  const [smsModalFarmerId, setSmsModalFarmerId] = useState<number | null>(null);
  const [smsText, setSmsText] = useState('');

  const getCropDetails = (cropId: number) => {
    const crop = crops.find((c) => c.id === cropId);
    if (!crop) return null;
    const config = CROPS_DATA[crop.cropName.toLowerCase()];
    return {
      cropName: crop.cropName,
      swahili: config?.swahili || crop.cropName,
      icon: config?.icon || '🌱',
      areaHa: crop.areaHa,
      farmerId: crop.farmerId,
    };
  };

  const getFarmerDetails = (farmerId: number) => {
    return farmers.find((f) => f.id === farmerId) || null;
  };

  const filteredSchedules = schedules.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const openSmsModal = (farmerId: number, cropName: string, waterLiters: number, isRainFed?: boolean) => {
    const farmer = getFarmerDetails(farmerId);
    const farmerName = farmer ? farmer.name : 'Mkulima';
    const message = isRainFed
      ? `🌾 HABARI HALI YA HEWA NA MVUA\n\nNdugu ${farmerName},\nZao lako la ${cropName.toUpperCase()} linategemea mvua pekee. Tunashauri kufuatilia unyevu wa udongo na taarifa za hali ya hewa za leo ili kuona kama kuna upungufu wa unyevu kwa zao lako.\n\nTafadhali kagua tracker yako kwenye mfumo.\nAsante! - Smart Irrigation`
      : `🌾 SMART IRRIGATION TANZANIA\n\nNdugu ${farmerName},\nZao lako la ${cropName.toUpperCase()} linahitaji umwagiliaji wa lita ${waterLiters.toLocaleString()} leo tarehe ${new Date().toLocaleDateString('sw-TZ')}.\n\nTafadhali hakikisha shamba limepata maji.\nAsante! - Smart Irrigation`;

    setSmsModalFarmerId(farmerId);
    setSmsText(message);
  };

  const handleSendSms = () => {
    if (smsModalFarmerId !== null) {
      onSendSms(smsModalFarmerId, smsText);
      setSmsModalFarmerId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">📅 Ratiba na Udhibiti wa Umwagiliaji</h2>
          <p className="text-slate-500 text-sm">Tazama ratiba za leo, weka tiki zilizokamilika, na utume tahadhari za SMS kwa mkulima.</p>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-center">
          {(['all', 'PENDING', 'COMPLETED'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition cursor-pointer ${
                filter === t ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t === 'all' ? 'Zote' : t === 'PENDING' ? 'Zinasubiri' : 'Zimekamilika'}
            </button>
          ))}
        </div>
      </div>

      {filteredSchedules.length > 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-4 px-5">Hali / Status</th>
                  <th className="py-4 px-5">Zao</th>
                  <th className="py-4 px-5">Mkulima</th>
                  <th className="py-4 px-5">Maji (Liters)</th>
                  <th className="py-4 px-5">Siku za Mzunguko</th>
                  <th className="py-4 px-5 text-right">Matendo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchedules.map((schedule) => {
                  const cropDetails = getCropDetails(schedule.cropId);
                  if (!cropDetails) return null;

                  const farmer = getFarmerDetails(cropDetails.farmerId);
                  const isCompleted = schedule.status === 'COMPLETED';
                  
                  const origCrop = crops.find((c) => c.id === schedule.cropId);
                  const isRainFed = origCrop?.irrigationMethod?.toLowerCase() === 'mvua' || origCrop?.irrigationMethod?.toLowerCase() === 'rain-fed';

                  return (
                    <tr
                      key={schedule.id}
                      className={`hover:bg-slate-50/50 transition duration-150 ${
                        isCompleted ? 'bg-slate-50/30' : ''
                      }`}
                    >
                      <td className="py-4 px-5">
                        <button
                          onClick={() => onToggleStatus(schedule.id)}
                          className={`flex items-center gap-1.5 text-xs font-bold font-mono px-3 py-1 rounded-full cursor-pointer transition ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                              : isRainFed
                              ? 'bg-blue-50 text-blue-800 border border-blue-100'
                              : 'bg-amber-50 text-amber-800 border border-amber-100'
                          }`}
                        >
                          <CheckCircle2 size={14} className={isCompleted ? 'text-emerald-600' : isRainFed ? 'text-blue-500 animate-bounce' : 'text-amber-500'} />
                          {isCompleted ? 'Kamilika' : isRainFed ? 'Mvua (Sawa)' : 'Pend (Nyunyiza)'}
                        </button>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-1 bg-slate-50 rounded-lg">{cropDetails.icon}</span>
                          <div>
                            <p className="font-bold text-slate-800 capitalize leading-tight">
                              {cropDetails.swahili}
                            </p>
                            <p className="text-[10px] text-slate-400">Shamba: {cropDetails.areaHa} ha</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-700">{farmer?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Phone size={10} /> {farmer?.phone || 'N/A'}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        {isRainFed ? (
                          <span className="text-xs text-blue-700 font-bold bg-blue-50/50 px-2.5 py-1 rounded-lg border border-blue-100 inline-flex items-center gap-1">
                            🌧️ Mvua Pekee
                          </span>
                        ) : (
                          <span className="font-bold font-mono text-slate-800">
                            {schedule.netIrrigation.toLocaleString()} L
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 font-mono text-xs text-slate-500">
                        Siku ya {schedule.daysAfterPlanting}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() =>
                            openSmsModal(cropDetails.farmerId, cropDetails.cropName, schedule.netIrrigation, isRainFed)
                          }
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          <Send size={12} />
                          Tuma Tahadhari
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Ratiba Zimeisha</h3>
          <p className="text-slate-500 text-sm mt-1">
            Hakuna ratiba za umwagiliaji zilizokutana na chujio hili kwa leo.
          </p>
        </div>
      )}

      {/* Custom SMS Modal */}
      {smsModalFarmerId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Hakiki Tahadhari ya SMS (SMS Gateway)</h3>
                <p className="text-slate-400 text-xs">Mkulima: {getFarmerDetails(smsModalFarmerId)?.name}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Meseji ya Kipekee ya Kutuma Swahili:</label>
              <textarea
                rows={6}
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 font-sans"
              />
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleSendSms}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <Send size={15} />
                Tuma kupitia SMS Gateway (Kutumia Internet API)
              </button>
              
              <a
                href={`sms:${getFarmerDetails(smsModalFarmerId)?.phone || ''}?body=${encodeURIComponent(smsText)}`}
                onClick={() => setSmsModalFarmerId(null)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm cursor-pointer text-center flex items-center justify-center gap-2 block"
              >
                <Smartphone size={15} />
                Tuma kupitia Simu Yako (BURE / Mtandao wa Kawaida)
              </a>

              <button
                onClick={() => setSmsModalFarmerId(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition cursor-pointer"
              >
                Ghairi / Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
