import { useState, useEffect } from 'react';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [contacts, setContacts] = useState([]);

  // Ambil daftar kontak
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/contacts');
        setContacts(response.data.contacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };
    fetchContacts();
  }, []);

  // Ambil pesan untuk kontak yang dipilih
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact) return;
      try {
        const response = await axios.get(`http://localhost:5000/api/messages?phone=${selectedContact.phone}`);
        setMessages(Array.isArray(response.data.messages) ? response.data.messages : []);
      } catch (error) {
        setMessages([]);
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    // Polling untuk pesan baru setiap 3 detik
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedContact]);

  // Kirim balasan pesan
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedContact || !replyMessage.trim()) return;

    try {
      await axios.post('http://localhost:5000/api/send', {
        numbers: [selectedContact.phone],
        message: replyMessage
      });
      setReplyMessage('');
      // Optimis: tambahkan pesan ke tampilan sebelum polling berikutnya
      setMessages((prev) => ([
        ...prev,
        {
          phone: selectedContact.phone,
          message: replyMessage,
          direction: 'outgoing',
          created_at: new Date().toISOString(),
          status: 'success'
        }
      ]));
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex h-[80vh]">
        {/* Daftar Kontak */}
        <div className="w-1/4 border-r overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Kontak</h2>
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedContact?.id === contact.id ? 'bg-gray-200' : ''}`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="font-semibold">{contact.name}</div>
              <div className="text-sm text-gray-600">{contact.phone}</div>
            </div>
          ))}
        </div>

        {/* Area Chat */}
        <div className="w-3/4 flex flex-col">
          {selectedContact ? (
            <>
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">{selectedContact.name}</h3>
                <p className="text-gray-600">{selectedContact.phone}</p>
              </div>

              {/* Pesan */}
              <div className="flex-1 overflow-y-auto p-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${msg.direction === 'incoming' ? 'text-left' : 'text-right'}`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg ${msg.direction === 'incoming' ? 'bg-gray-200' : 'bg-blue-500 text-white'}`}
                    >
                      {msg.message}
                      <div className="text-xs mt-1 opacity-75">
                        {new Date(msg.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Balas */}
              <form onSubmit={handleSendReply} className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Ketik pesan..."
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={!replyMessage.trim()}
                  >
                    Kirim
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Pilih kontak untuk memulai chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;