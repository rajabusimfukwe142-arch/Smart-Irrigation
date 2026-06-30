// pages/api/users/[id].js
import { readData, writeData, findById } from '../../../lib/db';

export default function handler(req, res) {
  const { id } = req.query;
  const userId = parseInt(id);

  // GET - Pata mtumiaji
  if (req.method === 'GET') {
    const users = readData('users.json');
    const user = findById(users, userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Mtumiaji hapatikani' });
    }
    
    const { password, ...userWithoutPassword } = user;
    return res.status(200).json({ success: true, user: userWithoutPassword });
  }

  // PUT - Sasisha mtumiaji
  if (req.method === 'PUT') {
    const users = readData('users.json');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'Mtumiaji hapatikani' });
    }

    const { name, phone, role, email, password } = req.body;
    
    // Sasisha data
    if (name) users[userIndex].name = name;
    if (phone) users[userIndex].phone = phone;
    if (role) users[userIndex].role = role;
    if (email) users[userIndex].email = email;
    if (password) users[userIndex].password = password;

    // Hifadhi kwenye faili
    const saved = writeData('users.json', users);
    
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        error: 'Imeshindwa kuhifadhi data!' 
      });
    }

    const { password: _, ...userWithoutPassword } = users[userIndex];
    
    return res.status(200).json({ 
      success: true, 
      user: userWithoutPassword,
      message: 'Taarifa zimehifadhiwa kikamilifu!'
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
