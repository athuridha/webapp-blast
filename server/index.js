const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const cors = require('cors');
const { contactsDb, messagesDb } = require('./database');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run'],
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    timeout: 60000
  },
  restartOnAuthFail: true
});

// Store QR code
let qrCode = '';

// WhatsApp Events
client.on('qr', (qr) => {
  qrCode = qr;
  console.log('QR Code received:', qr.substring(0, 20) + '...');
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');
});

client.on('authenticated', () => {
  console.log('WhatsApp client is authenticated!');
});

client.on('auth_failure', async (msg) => {
  console.error('WhatsApp authentication failed:', msg);
  try {
    await client.destroy();
    client.initialize();
  } catch (error) {
    console.error('Error reinitializing client:', error);
  }
});

client.on('message', async (msg) => {
  try {
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    
    const message = {
      phone: msg.from,
      message: msg.body,
      status: 'received',
      direction: 'incoming'
    };
    
    await messagesDb.add(message);
    console.log('Incoming message saved:', message);
  } catch (error) {
    console.error('Error handling incoming message:', error);
  }
});

// Initialize WhatsApp client
client.initialize().catch(err => {
  console.error('Failed to initialize WhatsApp client:', err);
  setTimeout(() => {
    client.initialize();
  }, 5000);
});

// API Endpoints
app.get('/api/status', (req, res) => {
  const isConnected = client.info ? true : false;
  console.log('Status check - Connected:', isConnected, 'QR available:', qrCode ? 'Yes' : 'No');
  res.json({
    connected: isConnected,
    qrCode: !isConnected ? qrCode : null
  });
});

// API Endpoints untuk kontak
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await contactsDb.getAll();
    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint untuk jumlah kontak
app.get('/api/contacts/count', async (req, res) => {
  try {
    const count = await contactsDb.count();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post('/api/contacts', async (req, res) => {
  try {
    const contacts = req.body;
    const results = await contactsDb.addMany(contacts);
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    await contactsDb.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Tambahkan endpoint untuk hapus semua kontak
app.delete('/api/contacts', async (req, res) => {
  try {
    await contactsDb.deleteAll();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Endpoint untuk riwayat pesan
app.get('/api/messages', async (req, res) => {
  try {
    const { phone } = req.query;
    const messages = phone ? await messagesDb.getByPhone(phone) : await messagesDb.getAll();
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint untuk jumlah pesan sukses
app.get('/api/messages/success-count', async (req, res) => {
  try {
    console.log('Fetching success count...');
    const count = await messagesDb.successCount();
    console.log('Success count fetched:', count);
    res.json({ count });
  } catch (error) {
    console.error('Error in /api/messages/success-count endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post('/api/send', async (req, res) => {
  try {
    let numbers, message, mediaFilePath = null, mediaMimetype = null, mediaFilename = null;
    // Jika request berupa FormData (ada file media)
    if (req.files && req.files.media) {
      numbers = JSON.parse(req.body.numbers);
      message = req.body.message;
      const media = req.files.media;
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
      const uniqueName = Date.now() + '-' + media.name.replace(/\s/g, '_');
      mediaFilePath = path.join(uploadDir, uniqueName);
      await media.mv(mediaFilePath);
      mediaMimetype = media.mimetype;
      mediaFilename = uniqueName;
    } else {
      numbers = req.body.numbers;
      message = req.body.message;
    }

    const results = [];
    // Kirim ke banyak kontak secara paralel jika ada media
    if (mediaFilePath) {
      const MessageMedia = require('whatsapp-web.js').MessageMedia;
      const mediaObj = MessageMedia.fromFilePath(mediaFilePath);
      await Promise.all(numbers.map(async (number) => {
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        try {
          await client.sendMessage(chatId, mediaObj, { caption: message });
          const result = {
            phone: chatId,
            message,
            status: 'success',
            media: mediaFilename ? `/uploads/${mediaFilename}` : null
          };
          await messagesDb.add(result);
          results.push(result);
        } catch (error) {
          const result = {
            phone: number,
            message,
            status: 'failed',
            error: error.message
          };
          await messagesDb.add(result);
          results.push(result);
        }
      }));
    } else {
      // Tanpa media, tetap bisa paralel
      await Promise.all(numbers.map(async (number) => {
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        try {
          await client.sendMessage(chatId, message);
          const result = {
            phone: chatId,
            message,
            status: 'success'
          };
          await messagesDb.add(result);
          results.push(result);
        } catch (error) {
          const result = {
            phone: number,
            message,
            status: 'failed',
            error: error.message
          };
          await messagesDb.add(result);
          results.push(result);
        }
      }));
    }

    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API Endpoint untuk logout
app.post('/api/logout', async (req, res) => {
  try {
    await client.logout();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Tambahkan endpoint untuk hapus semua riwayat pesan
app.delete('/api/messages', async (req, res) => {
  try {
    await messagesDb.deleteAll();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== Tambah untuk settings =====
let settingsCache = null;

// --- Tambah: Password login persist di file settings.json ---
const settingsFile = path.join(__dirname, 'settings.json');
function getPasswordFromFile() {
  try {
    if (fs.existsSync(settingsFile)) {
      const data = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      return data.password || 'usindomaju01';
    }
  } catch (e) {}
  return 'usindomaju01';
}
function setPasswordToFile(password) {
  let data = {};
  if (fs.existsSync(settingsFile)) {
    try {
      data = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    } catch (e) {}
  }
  data.password = password;
  fs.writeFileSync(settingsFile, JSON.stringify(data, null, 2));
}

// Endpoint GET password login
app.get('/api/settings/password', (req, res) => {
  const password = getPasswordFromFile();
  res.json({ password });
});

// Endpoint POST untuk ubah password login
app.post('/api/settings/password', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, error: 'Password tidak boleh kosong' });
  }
  setPasswordToFile(password);
  res.json({ success: true });
});

app.get('/api/settings', (req, res) => {
  if (settingsCache) {
    res.json({ success: true, settings: settingsCache });
  } else {
    // Default settings jika belum pernah disimpan
    res.json({
      success: true,
      settings: {
        defaultMessage: '',
        autoReply: false,
        autoReplyMessage: '',
        notificationSound: true,
        messageDelay: '2',
        maxBlastSize: 'unlimited'
      }
    });
  }
});

app.post('/api/settings', (req, res) => {
  settingsCache = req.body;
  res.json({ success: true });
});

// Endpoint untuk cek status WhatsApp nomor
app.post('/api/check-whatsapp', async (req, res) => {
  try {
    const { numbers } = req.body;
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return res.status(400).json({ success: false, error: 'Numbers array required' });
    }
    // Cek status WhatsApp untuk setiap nomor
    const results = await Promise.all(numbers.map(async (number) => {
      const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
      try {
        const exists = await client.isRegisteredUser(chatId);
        return { number, exists };
      } catch (e) {
        return { number, exists: false };
      }
    }));
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});