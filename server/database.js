const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Inisialisasi database
const dbPath = path.join(__dirname, 'whatsapp.db');
const db = new sqlite3.Database(dbPath);

// Buat tabel jika belum ada
db.serialize(() => {
  // Tabel kontak
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabel riwayat pesan
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL,
    error TEXT,
    direction TEXT NOT NULL DEFAULT 'outgoing',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Fungsi untuk mengelola kontak
const contactsDb = {
  // Tambah kontak baru
  async add(contact) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO contacts (name, phone) VALUES (?, ?)',
        [contact.name, contact.phone],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...contact });
        }
      );
    });
  },

  // Tambah banyak kontak sekaligus
  async addMany(contacts) {
    const results = [];
    for (const contact of contacts) {
      try {
        const result = await this.add(contact);
        results.push({ ...result, status: 'success' });
      } catch (error) {
        results.push({ ...contact, status: 'failed', error: error.message });
      }
    }
    return results;
  },

  // Ambil semua kontak
  async getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM contacts ORDER BY created_at DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Hitung jumlah kontak
  async count() {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM contacts', [], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });
  },

  // Hapus kontak
  async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM contacts WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  },

  // Hapus semua kontak
  async deleteAll() {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM contacts', [], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }
}

// Fungsi untuk mengelola riwayat pesan
const messagesDb = {
  // Tambah riwayat pesan baru
  async add(message) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO messages (phone, message, status, error, direction) VALUES (?, ?, ?, ?, ?)',
        [message.phone, message.message, message.status, message.error || null, message.direction || 'outgoing'],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...message });
        }
      );
    });
  },

  // Ambil semua riwayat pesan
  async getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM messages ORDER BY created_at DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Ambil pesan berdasarkan nomor telepon
  async getByPhone(phone) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM messages WHERE phone = ? ORDER BY created_at ASC', [phone], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Hitung jumlah pesan sukses
  async successCount() {
    return new Promise((resolve, reject) => {
      try {
        db.get('SELECT COUNT(*) as count FROM messages WHERE status = "success"', [], (err, row) => {
          if (err) {
            console.error('Error in successCount query:', err);
            reject(err);
          } else {
            console.log('Success count result:', row);
            resolve(row ? row.count : 0);
          }
        });
      } catch (error) {
        console.error('Exception in successCount:', error);
        reject(error);
      }
    });
  },

  // Hapus semua riwayat pesan
  async deleteAll() {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM messages', [], function(err) {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }
}; // Tambahkan kurung kurawal penutup

module.exports = {
  contactsDb,
  messagesDb
};