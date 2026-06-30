import { CROPS_DATA } from './data';
import { WeatherData, Schedule } from './types';

// Evapotranspiration (ETo) Penman-Monteith equation
export function calculateEtoPenmanMonteith(
  temp: number,
  humidity: number,
  windSpeed: number,
  solarRadiation: number
): number {
  try {
    // Vapor pressure
    const es = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
    const ea = es * (humidity / 100);
    const vpd = Math.max(0, es - ea);

    // Delta: Slope of vapor pressure curve
    const delta = (4098 * es) / Math.pow(temp + 237.3, 2);

    // Psychrometric constant (kPa/C) at sea level is ~0.066, adjusting for typical elevations
    const gamma = 0.000665 * 101.3;

    // Wind speed at 2m (assume conversion or raw u2)
    const u2 = Math.max(0.1, windSpeed * 0.2777); // convert km/h to m/s, bound it

    // Net radiation (MJ/m2/day)
    const rn = Math.max(0.1, 0.7 * solarRadiation - 2.5);

    // Standard FAO-56 Penman-Monteith
    const numerator = 0.408 * delta * rn + gamma * (900 / (temp + 273)) * u2 * vpd;
    const denominator = delta + gamma * (1 + 0.34 * u2);

    const eto = numerator / denominator;
    return Math.max(0.1, parseFloat(eto.toFixed(2)));
  } catch (e) {
    return 4.5; // reasonable fallback ETo in mm/day for Tanzania
  }
}

export function getKcForStage(cropName: string, daysAfterPlanting: number): number {
  const crop = CROPS_DATA[cropName.toLowerCase()];
  if (!crop) return 0.8;

  const { kc, days_to_maturity } = crop;
  if (daysAfterPlanting < 0.2 * days_to_maturity) {
    return kc.mwanzo;
  } else if (daysAfterPlanting < 0.7 * days_to_maturity) {
    return kc.katikati;
  } else {
    return kc.mwisho;
  }
}

export function getGrowthStageName(cropName: string, daysAfterPlanting: number): { index: number; name: string } {
  const crop = CROPS_DATA[cropName.toLowerCase()];
  if (!crop) return { index: 0, name: '🌱 Kupanda' };

  const daysToMaturity = crop.days_to_maturity;
  if (daysAfterPlanting < 0.2 * daysToMaturity) {
    return { index: 0, name: '🌱 Kupanda (Initial)' };
  } else if (daysAfterPlanting < 0.45 * daysToMaturity) {
    return { index: 1, name: '🌿 Kuota (Development)' };
  } else if (daysAfterPlanting < 0.65 * daysToMaturity) {
    return { index: 2, name: '🌻 Ukuaji (Mid-Season)' };
  } else if (daysAfterPlanting < 0.85 * daysToMaturity) {
    return { index: 3, name: '🌸 Maua (Late-Stage)' };
  } else {
    return { index: 4, name: '🌾 Kuvuna (Harvest-Ready)' };
  }
}

export function getRainAdjustment(rainfall: number): { action: string; message: string; multiplier: number } {
  if (rainfall >= 15) {
    return { action: 'RUKA UMWAGILIAJI', message: 'Mvua ya kutosha kabisa. Usinyunyize maji.', multiplier: 0 };
  } else if (rainfall >= 8) {
    return { action: 'PUNGUSHA UMWAGILIAJI', message: `Punguza umwagiliaji kwa ${Math.round(rainfall * 5)}% kutokana na mvua.`, multiplier: Math.max(0, 1 - (rainfall * 0.05)) };
  } else if (rainfall >= 3) {
    return { action: 'Mvua Kidogo', message: 'Mvua haitoshi, endelea na ratiba lakini punguza kidogo.', multiplier: 0.9 };
  } else {
    return { action: 'ONGEZA UMWAGILIAJI', message: 'Hakuna mvua ya kutosha. Umwagiliaji kamili unahitajika.', multiplier: 1.0 };
  }
}

export function calculateIrrigationRequirement(
  cropName: string,
  areaHa: number,
  weather: WeatherData,
  daysAfterPlanting: number,
  irrigationMethod?: string
) {
  const eto = calculateEtoPenmanMonteith(weather.temperature, weather.humidity, weather.windSpeed, weather.solarRadiation);
  const kc = getKcForStage(cropName, daysAfterPlanting);
  const etc = eto * kc;

  // Rain adjustment
  const rainAdj = getRainAdjustment(weather.rainfall);

  // If the crop is rain-fed (Mvua pekee / Kutegemea Mvua), mechanical irrigation is 0
  const isRainFed = irrigationMethod?.toLowerCase() === 'mvua' || irrigationMethod?.toLowerCase() === 'rain-fed';

  // 1 mm of water depth on 1 hectare (10,000 m²) = 10,000 Liters of water!
  const netIrrigationDepthMm = isRainFed ? 0 : etc * rainAdj.multiplier;
  const netIrrigationLiters = netIrrigationDepthMm * areaHa * 10000;

  // Assuming typical drip/sprinkler efficiency in Tanzania of 80% (0.80)
  const efficiency = 0.80;
  const grossIrrigationLiters = netIrrigationLiters / efficiency;

  return {
    eto,
    kc,
    etc,
    netIrrigation: Math.round(netIrrigationLiters),
    grossIrrigation: Math.round(grossIrrigationLiters),
    rainMultiplier: isRainFed ? 0 : rainAdj.multiplier,
    rainMessage: isRainFed 
      ? 'Zao hili linategemea mvua pekee. Hakuna mfumo wa umwagiliaji bandia uliosajiliwa.' 
      : rainAdj.message,
    rainAction: isRainFed ? 'KUTEGEMEA MVUA' : rainAdj.action
  };
}

// Simulated file exporters to make it work seamlessly in our browser environment
export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
