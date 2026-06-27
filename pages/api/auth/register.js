// pages/api/auth/register.js
import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

const getUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
};

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

  const users = getUsers();

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
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name,
    username,
    password,
    phone: phone || "",
    email: email || "",
    role: role || "Mkulima Mkuu",
    region: region || "Morogoro"
  };

  users.push(newUser);
  saveUsers(users);

  const { password: _, ...userWithoutPassword } = newUser;

  return res.status(201).json({
    success: true,
    message: "Akaunti imeundwa kikamilifu!",
    user: userWithoutPassword,
    token: "token_" + Date.now()
  });
}
