// pages/api/auth/login.js
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false, 
      error: "Method not allowed" 
    });
  }

  const { username, password } = req.body || {};

  // Watumiaji waliosajiliwa (kwa demo)
  const users = {
    "admin": { id: 1, name: "Msimamizi Mkuu", username: "admin", role: "Msimamizi Mkuu", phone: "0712345678", email: "admin@smartirrigation.com", password: "admin" },
    "Wakulima@123": { id: 2, name: "Mhandisi Mkuu", username: "Wakulima@123", role: "Mhandisi Mkuu", phone: "0794172297", email: "engineer@smartirrigation.com", password: "Wakulima@123" }
  };

  const user = users[username];

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
