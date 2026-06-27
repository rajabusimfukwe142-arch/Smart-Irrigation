import React, { useState } from 'react';
import { WeatherData } from '../types';
import { CloudRain, Thermometer, Droplets, Wind, Sun, Compass, RotateCw, Map } from 'lucide-react';

interface WeatherPanelProps {
  weather: WeatherData;
  onRefreshWeather: (lat?: number, lon?: number) => Promise<void>;
  isRefreshing: boolean;
}

const TANZANIA_HUBS = [
  { name: 'Dodoma (Capital)', lat: -6.163, lon: 35.751, desc: 'Central semi-arid zone' },
  { name: 'Morogoro (Kilosa/Mvomero)', lat: -6.827, lon: 37.659, desc: 'High agriculture yield hub' },
  { name: 'Arusha (Meru)', lat: -3.386, lon: 36.683, desc: 'Northern Highlands region' },
  { name: 'Mbeya (Mbarali)', lat: -8.900, lon: 33.450, desc: 'Southern Grain Basket' },
  { name: 'Dar es Salaam (Kigamboni)', lat: -6.792, lon: 39.208, desc: 'Coastal hot humid zone' },
  { name: 'Mwanza (Kwimba)', lat: -2.516, lon: 32.900, desc: 'Lake Zone agriculture area' }
];

export const WeatherPanel: React.FC<WeatherPanelProps> = ({
  weather,
  onRefreshWeather,
  isRefreshing,
}) => {
  const [selectedHubIndex, setSelectedHubIndex] = useState<number>(1); // Morogoro default

  const handleHubSelect = async (index: number) => {
    setSelectedHubIndex(index);
    const hub = TANZANIA_HUBS[index];
    await onRefreshWeather(hub.lat, hub.lon);
  };

  const getForecastIcon = (rainAmount: number) => {
    if (rainAmount > 8) return '🌧️';
    if (rainAmount > 2) return '🌦️';
    if (rainAmount > 0) return '🌤️';
    return '☀️';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">☁️ Hali ya Hewa na Mvua</h2>
          <p className="text-slate-500 text-sm">Takwimu sahihi za hali ya hewa nchini Tanzania kwa mahesabu sahihi ya umwagiliaji.</p>
        </div>
        <button
          onClick={() => handleHubSelect(selectedHubIndex)}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <RotateCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Inatafuta...' : 'Pakia Upya Hali ya Hewa'}
        </button>
      </div>

      {/* Hub Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {TANZANIA_HUBS.map((hub, i) => (
          <button
            key={hub.name}
            onClick={() => handleHubSelect(i)}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
              selectedHubIndex === i
                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <span className="text-xs font-bold leading-tight line-clamp-1">{hub.name}</span>
            <span className="text-[10px] text-slate-400 mt-1">{hub.desc}</span>
          </button>
        ))}
      </div>

      {/* Main Stats panel */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Kituo cha utabiri</span>
            <h3 className="text-xl font-extrabold text-slate-800">{TANZANIA_HUBS[selectedHubIndex].name}</h3>
            <p className="text-slate-500 text-xs">
              Lat: {TANZANIA_HUBS[selectedHubIndex].lat}, Lon: {TANZANIA_HUBS[selectedHubIndex].lon}
            </p>
          </div>

          <div className="flex items-center gap-4 py-3">
            <span className="text-5xl">🌡️</span>
            <div>
              <h4 className="text-4xl font-black text-slate-800 font-mono">{weather.temperature}°C</h4>
              <p className="text-xs text-slate-400 font-medium">Joto la sasa hivi</p>
            </div>
          </div>

          <div className="text-xs bg-slate-50 p-3 rounded-xl text-slate-500 flex items-center gap-2">
            <Compass size={14} className="text-emerald-600 shrink-0" />
            <span>Mionzi ya jua inasoma: {weather.solarRadiation} MJ/m² leo.</span>
          </div>
        </div>

        {/* Climate Metrics cards */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg w-10 h-10 flex items-center justify-center">
              <Droplets size={20} />
            </div>
            <div className="mt-6">
              <span className="text-xs text-slate-400 font-semibold uppercase">Unyevu (Humidity)</span>
              <h4 className="text-2xl font-black text-slate-800 font-mono mt-1">{weather.humidity}%</h4>
              <p className="text-slate-400 text-xs mt-1">Kiasi cha mvuke angani</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg w-10 h-10 flex items-center justify-center">
              <Wind size={20} />
            </div>
            <div className="mt-6">
              <span className="text-xs text-slate-400 font-semibold uppercase">Upepo (Wind Speed)</span>
              <h4 className="text-2xl font-black text-slate-800 font-mono mt-1">{weather.windSpeed} km/h</h4>
              <p className="text-slate-400 text-xs mt-1">Kasi ya uvukizaji majani</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg w-10 h-10 flex items-center justify-center">
              <CloudRain size={20} />
            </div>
            <div className="mt-6">
              <span className="text-xs text-slate-400 font-semibold uppercase">Kiwango cha Mvua</span>
              <h4 className="text-2xl font-black text-slate-800 font-mono mt-1">{weather.rainfall} mm</h4>
              <p className="text-slate-400 text-xs mt-1">Kiasi cha maji ya mvua</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7-day forecast table */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Map size={18} className="text-emerald-600" />
          Utabiri wa Mvua wa Siku 7 Zijazo
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {weather.forecast.map((rain, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dayName = date.toLocaleDateString('sw-TZ', { weekday: 'short' });
            const dayNum = date.toLocaleDateString('sw-TZ', { day: 'numeric', month: 'short' });

            return (
              <div
                key={i}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center flex flex-col justify-between space-y-2 hover:bg-slate-100/50 transition"
              >
                <div>
                  <p className="text-slate-700 text-xs font-bold capitalize">{dayName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{dayNum}</p>
                </div>
                <span className="text-2xl my-1 block">{getForecastIcon(rain)}</span>
                <div>
                  <p className="text-xs font-extrabold text-slate-800 font-mono">{rain.toFixed(1)} mm</p>
                  <span className="text-[9px] font-semibold uppercase text-slate-400 font-mono">Rain</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
