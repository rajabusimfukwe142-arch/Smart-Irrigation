// pages/api/farmers/index.js
import { readData, writeData, getNextId } from '../../../lib/db';

export default function handler(req, res) {
  const { userId } = req.query;

  // GET - Orodha ya wakulima
  if (req.method === 'GET') {
    const farmers = readData('farmers.json');
    const userFarmers = farmers.filter(f => f.userId === parseInt(userId));
    return res.status(200).json({ success: true, farmers: userFarmers });
  }

  // POST - Ongeza mkulima
  if (req.method === 'POST') {
    const { userId, name, phone, region, district, village, latitude, longitude } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Jina la mkulima linahitajika!' });
    }

    const farmers = readData('farmers.json');
    
    const newFarmer = {
      id: getNextId(farmers),
      userId: parseInt(userId),
      name,
      phone: phone || '',
      region: region || 'Morogoro',
      district: district || 'Kilosa',
      village: village || '',
      latitude: latitude || -6.827,
      longitude: longitude || 37.659,
      registeredDate: new Date().toISOString()
    };

    farmers.push(newFarmer);
    writeData('farmers.json', farmers);
    
    return res.status(201).json({ success: true, farmer: newFarmer });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
