// pages/api/farmers/[id].js
import { readData, writeData, findById, deleteById } from '../../../lib/db';

export default function handler(req, res) {
  const { id } = req.query;
  const farmerId = parseInt(id);

  // DELETE - Futa mkulima
  if (req.method === 'DELETE') {
    const farmers = readData('farmers.json');
    const farmer = findById(farmers, farmerId);
    
    if (!farmer) {
      return res.status(404).json({ success: false, error: 'Mkulima hapatikani' });
    }
    
    const updatedFarmers = deleteById(farmers, farmerId);
    writeData('farmers.json', updatedFarmers);
    
    return res.status(200).json({ success: true, message: 'Mkulima amefutwa' });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
