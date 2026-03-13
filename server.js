const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const CLAUDE_API_KEY = process.env.API_KEY;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Clairvoyant Courtney backend is alive 🔮' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system } = req.body;

    if (!CLAUDE_API_KEY) {
      return res.status(500).json({ error: 'Missing CLAUDE_API_KEY in server environment.' });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: system || '',
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'Anthropic API request failed'
      });
    }

    res.json({ content: data.content });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'The spirits are unavailable right now.' });
  }
});

app.listen(PORT, () => {
  console.log(`Courtney backend running on port ${PORT}`);
});
