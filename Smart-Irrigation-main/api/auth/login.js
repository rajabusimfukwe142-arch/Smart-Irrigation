// pages/api/auth/login.js (Next.js API Route)

export default function handler(req, res) {
  // Ruhusu tu POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false,
      error: "Method not allowed" 
    });
  }

  const { username, password, email } = req.body || {};

  // Tumia username au email
  const loginId = username || email;

  // ================= WATUMIAJI WALIOUNDWA =================
  const USERS = {
    "admin": {
      id: 1,
      name: "Msimamizi Mkuu",
      username: "admin",
      role: "Msimamizi Mkuu",
      email: "admin@smartirrigation.com",
      password: "admin"
    },
    "Wakulima@123": {
      id: 2,
      name: "Mhandisi Mkuu",
      username: "Wakulima@123",
      role: "Mhandisi Mkuu",
      email: "engineer@smartirrigation.com",
      password: "Wakulima@123"
    },
    "test@gmail.com": {
      id: 3,
      name: "Test User",
      username: "test@gmail.com",
      role: "Mkulima Mkuu",
      email: "test@gmail.com",
      password: "1234"
    }
  };

  // Angalia kama mtumiaji yupo
  const user = USERS[loginId];

  if (!user) {
    return res.status(401).json({ 
      success: false,
      error: "Jina la mtumiaji au nenosiri si sahihi!" 
    });
  }

  // Angalia nenosiri
  if (user.password !== password) {
    return res.status(401).json({ 
      success: false,
      error: "Jina la mtumiaji au nenosiri si sahihi!" 
    });
  }

  // ================= MAFANIKIO =================
  // Usirudishe password katika response
  const { password: _, ...userWithoutPassword } = user;

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: userWithoutPassword,
    token: "jwt_token_here_" + Date.now()
  });
}
