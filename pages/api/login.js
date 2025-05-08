export default function handler(req, res) {
    const { username, password } = req.body;
  
    if (username === 'admin' && password === '1234') {
      res.status(200).json({ message: '✅ Login successful!' });
    } else {
      res.status(401).json({ message: '❌ Invalid credentials.' });
    }
  }
  