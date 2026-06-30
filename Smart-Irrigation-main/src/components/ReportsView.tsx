import React from 'react';
import { Farmer, Crop, Schedule } from '../types';
import { FileText, Download, ShieldAlert, PieChart, TrendingUp, HelpCircle } from 'lucide-react';

interface ReportsViewProps {
  farmers: Farmer[];
  crops: Crop[];
  schedules: Schedule[];
  onGeneratePdf: () => void;
  onGenerateExcel: () => void;
  onBackup: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  farmers,
  crops,
  schedules,
  onGeneratePdf,
  onGenerateExcel,
  onBackup,
}) => {
  const pendingCount = schedules.filter((s) => s.status === 'PENDING').length;
  const completedCount = schedules.filter((s) => s.status === 'COMPLETED').length;

  const totalAreaHa = crops.reduce((sum, c) => sum + c.areaHa, 0);
  const totalWaterEstimated = schedules.reduce((sum, s) => sum + s.netIrrigation, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">📄 Ripoti na Uchambuzi wa Data</h2>
        <p className="text-slate-500 text-sm">Pakua fomu, kagua takwimu za jumla za kilimo, na fanya backup ya data zako.</p>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-start gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <PieChart size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Eneo Chini ya Mazao</span>
            <h4 className="text-2xl font-black text-slate-800 font-mono mt-1">{totalAreaHa.toFixed(1)} Hectares</h4>
            <p className="text-slate-500 text-xs mt-1">Eneo lote lililosajiliwa</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Jumla ya Maji (Leo)</span>
            <h4 className="text-2xl font-black text-slate-800 font-mono mt-1">{totalWaterEstimated.toLocaleString()} L</h4>
            <p className="text-slate-500 text-xs mt-1">Unyunyizaji uliopangwa</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Unyunyiziaji uliokamilishwa</span>
            <h4 className="text-2xl font-black text-slate-800 font-mono mt-1">
              {completedCount} / {completedCount + pendingCount}
            </h4>
            <p className="text-slate-500 text-xs mt-1">Kazi zilizotikiwa leo</p>
          </div>
        </div>
      </div>

      {/* Report generators section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PDF Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-6 hover:border-slate-200 transition">
          <div className="space-y-2">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl w-12 h-12 flex items-center justify-center">
              <FileText size={24} />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg">Ripoti ya PDF (Mkulima/Maafisa)</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Tengeneza na pakua ripoti kamili ya kiswahili yenye takwimu za wakulima, hali ya hewa na miongozo ya umwagiliaji kwa ajili ya kuchapa.
            </p>
          </div>
          <button
            onClick={onGeneratePdf}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm cursor-pointer"
          >
            Tengeneza PDF (Report.txt)
          </button>
        </div>

        {/* Excel Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-6 hover:border-slate-200 transition">
          <div className="space-y-2">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-12 h-12 flex items-center justify-center">
              <Download size={24} />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg">Ripoti ya Excel (Takwimu/CSV)</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Pakua jedwali lenye maelezo yote ya wakulima, orodha ya mazao, eneo kwa hekta na ratiba za umwagiliaji kwa ajili ya uchambuzi wa ziada.
            </p>
          </div>
          <button
            onClick={onGenerateExcel}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm cursor-pointer"
          >
            Pakua Excel (Report.csv)
          </button>
        </div>

        {/* Backup Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-6 hover:border-slate-200 transition">
          <div className="space-y-2">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-12 h-12 flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg">Hifadhi Data (Hati ya Usalama)</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Hifadhi salama data zako zote (wakulima, mazao, ratiba na mipangilio) katika faili la JSON la kupakua ili usipoteze maendeleo.
            </p>
          </div>
          <button
            onClick={onBackup}
            className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm cursor-pointer"
          >
            Backup Data sasa hivi
          </button>
        </div>
      </div>

      {/* Automatic backups notice */}
      <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-900 text-xs sm:text-sm">
        <HelpCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold">Ushauri wa Data:</h4>
          <p className="text-amber-800 leading-relaxed">
            Mfumo wetu unahifadhi data zako zote moja kwa moja kwenye Kivinjari chako cha Wavuti (LocalStorage). Inashauriwa kupakua jedwali la Excel au faili la Backup mara moja kwa mwezi ili kuweka kumbukumbu thabiti nje ya kivinjari.
          </p>
        </div>
      </div>
    </div>
  );
};
