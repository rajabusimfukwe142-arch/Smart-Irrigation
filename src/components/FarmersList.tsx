import React, { useState } from 'react';
import { Farmer, Crop } from '../types';
import { Search, Plus, Trash2, Phone, MapPin, Calendar, UserX } from 'lucide-react';

interface FarmersListProps {
  farmers: Farmer[];
  crops: Crop[];
  onOpenAddFarmer: () => void;
  onDeleteFarmer: (farmerId: number) => void;
}

export const FarmersList: React.FC<FarmersListProps> = ({
  farmers,
  crops,
  onOpenAddFarmer,
  onDeleteFarmer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFarmers = farmers.filter((farmer) => {
    const searchString = `${farmer.name} ${farmer.phone} ${farmer.region} ${farmer.district} ${farmer.village}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const getFarmerCrops = (farmerId: number) => {
    return crops.filter((crop) => crop.farmerId === farmerId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">👨‍🌾 Wasifu wa Wakulima</h2>
          <p className="text-slate-500 text-sm">Orodha na maelezo ya kina ya wakulima waliosajiliwa kwenye mfumo.</p>
        </div>
        <button
          onClick={onOpenAddFarmer}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-sm cursor-pointer"
        >
          <Plus size={18} />
          Ongeza Mkulima Mpya
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Tafuta mkulima kwa jina, simu, mkoa, wilaya, au kijiji..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition"
        />
      </div>

      {/* Farmers Grid */}
      {filteredFarmers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarmers.map((farmer) => {
            const farmerCrops = getFarmerCrops(farmer.id);
            return (
              <div
                key={farmer.id}
                className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{farmer.name}</h3>
                      <span className="text-slate-400 text-xs font-mono">ID: {farmer.id}</span>
                    </div>
                    <button
                      onClick={() => onDeleteFarmer(farmer.id)}
                      title="Futa Mkulima"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2.5 text-slate-600 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone size={15} className="text-slate-400" />
                      <a href={`tel:${farmer.phone}`} className="hover:text-emerald-700 hover:underline">
                        {farmer.phone || 'N/A'}
                      </a>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin size={15} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-700">
                          {farmer.region}, {farmer.district}
                        </p>
                        <p className="text-xs text-slate-500">Kijiji cha {farmer.village || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar size={13} />
                      <span>Sajili: {new Date(farmer.registeredDate).toLocaleDateString('sw-TZ')}</span>
                    </div>
                  </div>
                </div>

                {/* Crop Tags */}
                <div className="mt-5 pt-4 border-t border-slate-50">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Mazao yanayolimwa ({farmerCrops.length})
                  </h4>
                  {farmerCrops.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {farmerCrops.map((crop) => (
                        <span
                          key={crop.id}
                          className="text-xs bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded-md"
                        >
                          {crop.cropName.charAt(0).toUpperCase() + crop.cropName.slice(1)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Hakuna mazao bado.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserX size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Hakuna Mkulima Aliyepatikana</h3>
          <p className="text-slate-500 text-sm mt-1">
            Jaribu kutafuta kwa herufi tofauti au bonyeza "Ongeza Mkulima Mpya" hapo juu.
          </p>
        </div>
      )}
    </div>
  );
};
