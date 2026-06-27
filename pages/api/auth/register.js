// pages/api/auth/register.js
import { readData, writeData, getNextId } from '../../../lib/db';

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { username, password, name, phone, email, role, region } = req.body || {};

  // Validation
  if (!username || !password || !name) {
    return res.status(400).json({ 
      success: false, 
      error: "Tafadhali jaza sehemu zote muhimu!" 
    });
  }

  // Soma watumiaji kutoka faili
  const users = readData('users.json');

  // Angalia kama username tayari ipo
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ 
      success: false, 
      error: `Jina la mtumiaji "${username}" tayari lipo!` 
    });
  }

  if (password.length < 4) {
    return res.status(400).json({ 
      success: false, 
      error: "Nenosiri lazima iwe na angalau herufi 4!" 
    });
  }

  // Unda mtumiaji mpya
  const newUser = {
    id: getNextId(users),
    name,
    username,
    password,
    phone: phone || "",
    email: email || "",
    role: role || "Mkulima Mkuu",
    region: region || "Morogoro"
  };

  users.push(newUser);
  writeData('users.json', users);

  const { password: _, ...userWithoutPassword } = newUser;

  return res.status(201).json({
    success: true,
    message: "Akaunti imeundwa kikamilifu!",
    user: userWithoutPassword,
    token: "token_" + Date.now()
  });
}
