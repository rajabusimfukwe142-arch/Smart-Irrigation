export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body || {};

  if (email === "test@gmail.com" && password === "1234") {
    return res.status(200).json({ message: "Login successful" });
  }

  return res.status(401).json({ message: "Neno la siri si sahihi" });
}
