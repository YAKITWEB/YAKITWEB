const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Sağlık kontrolü için endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend çalışıyor.' });
});

// Diğer endpointler buraya eklenecek

app.listen(PORT, () => {
  console.log(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
});
