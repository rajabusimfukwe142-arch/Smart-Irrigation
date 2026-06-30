export interface Farmer {
  id: number;
  name: string;
  phone: string;
  region: string;
  district: string;
  village: string;
  latitude: number;
  longitude: number;
  registeredDate: string;
}

export interface Crop {
  id: number;
  farmerId: number;
  cropName: string;
  variety: string;
  plantingDate: string;
  daysAfterPlanting: number;
  areaHa: number;
  irrigationMethod: string;
  growthStage: string;
  moisture?: number; // Soil moisture percentage (e.g. 15% - 85%)
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  solarRadiation: number;
  rainfall: number;
  forecast: number[]; // 7 days of daily rainfall
}

export interface Schedule {
  id: number;
  cropId: number;
  date: string;
  daysAfterPlanting: number;
  kc: number;
  eto: number;
  etc: number;
  netIrrigation: number;
  grossIrrigation: number;
  rainAdjustment: number;
  status: 'PENDING' | 'COMPLETED';
}

export interface CropConfig {
  kc: {
    mwanzo: number;
    katikati: number;
    mwisho: number;
  };
  water_needed: number;
  days_to_maturity: number;
  icon: string;
  swahili: string;
  category: 'Chakula' | 'Mboga' | 'Matunda' | 'Biashara';
}
