// pages/api/crops/index.js
import { readData, writeData, getNextId } from '../../../lib/db';

export default function handler(req, res) {
  const { userId } = req.query;

  // GET - Orodha ya mazao
  if (req.method === 'GET') {
    const crops = readData('crops.json');
    const userCrops = crops.filter(c => c.userId === parseInt(userId));
    return res.status(200).json({ success: true, crops: userCrops });
  }

  // POST - Ongeza zao
  if (req.method === 'POST') {
    const { userId, farmerId, cropName, variety, plantingDate, daysAfterPlanting, areaHa, irrigationMethod, growthStage, moisture } = req.body;
    
    if (!cropName || !farmerId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Jina la zao na ID ya mkulima vinahitajika!' 
      });
    }

    const crops = readData('crops.json');
    
    const newCrop = {
      id: getNextId(crops),
      userId: parseInt(userId),
      farmerId: parseInt(farmerId),
      cropName,
      variety: variety || 'Kawaida',
      plantingDate: plantingDate || new Date().toISOString().split('T')[0],
      daysAfterPlanting: daysAfterPlanting || 0,
      areaHa: parseFloat(areaHa) || 1.0,
      irrigationMethod: irrigationMethod || 'Drip',
      growthStage: growthStage || '🌱 Kupanda',
      moisture: moisture || 75
    };

    crops.push(newCrop);
    writeData('crops.json', crops);
    
    return res.status(201).json({ success: true, crop: newCrop });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
