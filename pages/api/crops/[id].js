// pages/api/crops/[id].js
import { readData, writeData, findById } from '../../../lib/db';

export default function handler(req, res) {
  const { id } = req.query;
  const cropId = parseInt(id);

  // PUT - Sasisha zao
  if (req.method === 'PUT') {
    const crops = readData('crops.json');
    const cropIndex = crops.findIndex(c => c.id === cropId);
    
    if (cropIndex === -1) {
      return res.status(404).json({ success: false, error: 'Zao halipatikani' });
    }

    const { moisture, cropName, variety, growthStage } = req.body;
    
    if (moisture !== undefined) crops[cropIndex].moisture = moisture;
    if (cropName) crops[cropIndex].cropName = cropName;
    if (variety) crops[cropIndex].variety = variety;
    if (growthStage) crops[cropIndex].growthStage = growthStage;

    writeData('crops.json', crops);
    
    return res.status(200).json({ success: true, crop: crops[cropIndex] });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
