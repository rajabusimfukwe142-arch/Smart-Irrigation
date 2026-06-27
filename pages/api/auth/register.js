// pages/api/auth/register.js
export default function handler(req, res) {
  // Ruhusu POST tu
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false, 
      error: "Method not allowed" 
    });
  }

  // Chukua data kutoka frontend
  const { username, password, name, phone, email, role, region } = req.body;

  // ============ VALIDATION ============
  // Hakikisha zimejazwa
  if (!username || !password || !name) {
    return res.status(400).json({
      success: false,
      error: "Tafadhali jaza jina, username na nenosiri!"
    });
  }

  // Nenosiri lazima iwe na angalau herufi 4
  if (password.length < 4) {
    return res.status(400).json({
      success: false,
      error: "Nenosiri lazima iwe na angalau herufi 4!"
    });
  }

  // ============ UNDA MTUMIAJI ============
  const newUser = {
    id: Date.now(), // ID ya kipekee
    name: name,
    username: username,
    password: password, // Katika production, hashed
    role: role || "Mkulima Mkuu",
    phone: phone || "",
    email: email || "",
    region: region || "Morogoro"
  };

  // ============ RUDISHA MAFANIKIO ============
  return res.status(201).json({
    success: true,
    message: "Akaunti imeundwa!",
    user: newUser,
    token: "token_" + Date.now()
  });
}
