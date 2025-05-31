const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const cors = require('cors');
const { contactsDb, messagesDb } = require('./database');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
    const { numbers, message, mediaUrl } = req.body;
    const results = [];

    for (const number of numbers) {
      try {
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        
        if (mediaUrl) {
          // Handle media messages later
          await client.sendMessage(chatId, message);
        } else {
          await client.sendMessage(chatId, message);
        }

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});