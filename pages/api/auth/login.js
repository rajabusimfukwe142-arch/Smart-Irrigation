// pages/api/auth/login.js
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

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false, 
      error: "Method not allowed" 
    });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "Tafadhali weka jina la mtumiaji na nenosiri!"
    });
  }

  const users = getUsers();
  const user = users.find(u => u.username === username);

  if (!user || user.password !== password) {
    return res.status(401).json({ 
      success: false, 
      error: "Jina la mtumiaji au nenosiri si sahihi!" 
    });
  }

  const { password: _, ...userWithoutPassword } = user;

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: userWithoutPassword,
    token: "token_" + Date.now()
  });
}
