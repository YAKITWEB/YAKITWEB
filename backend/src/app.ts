import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Ortam değişkenlerini yükle
dotenv.config();

const app = express();

// Ana dizin endpoint'i
app.get('/', (req, res) => {
  res.send('API çalışıyor!');
});
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Sağlık kontrolü
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend çalışıyor.' });
});

// ---- İKMAL CRUD ----
// Tüm ikmaller (aktifler)
app.get('/api/ikmal', async (req, res) => {
  const ikmaller = await prisma.ikmal.findMany();
  res.json(ikmaller);
});

// Yeni ikmal ekle
app.post('/api/ikmal', async (req, res) => {
  const { form, locked } = req.body;
  const yeniIkmal = await prisma.ikmal.create({ data: { form, locked } });
  res.json(yeniIkmal);
});

// İkmal güncelle
app.put('/api/ikmal/:id', async (req, res) => {
  const { id } = req.params;
  const { form, locked } = req.body;
  const guncelIkmal = await prisma.ikmal.update({ where: { id: Number(id) }, data: { form, locked } });
  res.json(guncelIkmal);
});

// İkmal sil
app.delete('/api/ikmal/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.ikmal.delete({ where: { id: Number(id) } });
  res.json({ success: true });
});

// ---- ARŞİV CRUD ----
app.get('/api/archive', async (req, res) => {
  const archive = await prisma.archive.findMany();
  res.json(archive);
});

app.post('/api/archive', async (req, res) => {
  const { form } = req.body;
  const yeniArsiv = await prisma.archive.create({ data: { form } });
  res.json(yeniArsiv);
});

app.delete('/api/archive/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.archive.delete({ where: { id: Number(id) } });
  res.json({ success: true });
});

// ---- EVRAK CRUD ----
app.get('/api/evrak', async (req, res) => {
  const evraklar = await prisma.evrak.findMany();
  res.json(evraklar);
});

app.post('/api/evrak', async (req, res) => {
  const { shipName, date, agency, fileName, fileUrl } = req.body;
  const yeniEvrak = await prisma.evrak.create({ data: { shipName, date, agency, fileName, fileUrl } });
  res.json(yeniEvrak);
});

app.delete('/api/evrak/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.evrak.delete({ where: { id: Number(id) } });
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
});
