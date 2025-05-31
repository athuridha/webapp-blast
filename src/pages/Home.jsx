import { useState, useEffect } from 'react'
import { Box, VStack, Text, Image, Button, useToast, HStack } from '@chakra-ui/react'
import QRCode from 'qrcode.react'
import axios from 'axios'
import { Flex, SimpleGrid, Stat, StatLabel, StatNumber } from '@chakra-ui/react';

function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [contactsCount, setContactsCount] = useState(0)
  const [successCount, setSuccessCount] = useState(0)
  const toast = useToast()

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/status');
        console.log('Status response:', response.data);
        setIsConnected(response.data.connected);
        
        // Jika ada QR code dan belum terhubung, tampilkan QR code
        if (response.data.qrCode && !response.data.connected) {
          console.log('QR Code diterima, panjang:', response.data.qrCode.length);
          setQrCode(response.data.qrCode);
        } else if (response.data.connected) {
          // Jika sudah terhubung, hapus QR code
          setQrCode('');
        }
      } catch (error) {
        console.error('Error checking status:', error);
        setIsConnected(false);
        setQrCode('');
        toast({
          title: 'Gagal terhubung ke server',
          description: 'Pastikan server WhatsApp sedang berjalan',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const fetchStats = async () => {
      try {
        const contactsRes = await axios.get('/api/contacts/count');
        const messagesRes = await axios.get('/api/messages/success-count');
        setContactsCount(contactsRes.data.count);
        setSuccessCount(messagesRes.data.count);
      } catch (error) {
        console.error('Gagal memuat statistik:', error);
      }
    };

    // Panggil checkStatus segera saat komponen dimuat
    checkStatus();
    
    // Panggil fetchStats jika sudah terhubung
    if(isConnected) fetchStats();
    
    // Set interval untuk polling status dan statistik
    const interval = setInterval(() => {
      checkStatus();
      if(isConnected) fetchStats();
    }, 3000); // Polling lebih cepat (3 detik) untuk responsivitas yang lebih baik
    return () => clearInterval(interval);
  }, [isConnected]);

  const handleConnect = async () => {
    try {
      // Tampilkan toast bahwa sistem sedang mempersiapkan QR Code
      toast({
        title: 'Menunggu QR Code',
        description: 'Mohon tunggu sebentar, sistem sedang mempersiapkan QR Code',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      // Cek status untuk mendapatkan QR code
      const response = await axios.get('http://localhost:5000/api/status');
      console.log('Connect response:', response.data);
      
      if (response.data.qrCode) {
        // Jika QR code tersedia, tampilkan
        setQrCode(response.data.qrCode);
        toast({
          title: 'Menghubungkan ke WhatsApp',
          description: 'Silakan scan QR code yang muncul dengan aplikasi WhatsApp di HP Anda',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      } else if (response.data.connected) {
        // Jika sudah terhubung, perbarui status
        setIsConnected(true);
        setQrCode('');
        toast({
          title: 'Sudah Terhubung',
          description: 'WhatsApp sudah terhubung',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Jika tidak ada QR code dan tidak terhubung
        toast({
          title: 'Menunggu QR Code',
          description: 'Mohon tunggu sebentar, sistem sedang mempersiapkan QR Code. Coba klik tombol lagi dalam beberapa detik.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: 'Gagal terhubung ke server',
        description: 'Pastikan server WhatsApp sedang berjalan dan coba lagi',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }

  return (
    <VStack spacing={8} align="center">
      <Text fontSize="2xl" fontWeight="bold">
        WhatsApp Blast Dashboard
      </Text>
      
      <Box p={8} bg="white" borderRadius="lg" shadow="md" maxW="md" w="full">
        {!isConnected ? (
          <VStack spacing={4}>
            <Text>Status: Tidak terhubung</Text>
            {qrCode ? (
              <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                <QRCode 
                  value={qrCode} 
                  size={256} 
                  level="H"
                  includeMargin={true}
                  renderAs="svg"
                />
              </Box>
            ) : (
              <Button
                colorScheme="green"
                onClick={handleConnect}
              >
                Hubungkan WhatsApp
              </Button>
            )}
          </VStack>
        ) : (
          <VStack spacing={4}>
            <Text color="green.500">Status: Terhubung</Text>
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/479px-WhatsApp.svg.png"
              boxSize="100px"
              alt="WhatsApp Connected"
            />
            <Button
              colorScheme="red"
              onClick={async () => {
                try {
                  await axios.post('http://localhost:5000/api/logout');
                  setIsConnected(false);
                  setQrCode('');
                  toast({
                    title: 'Berhasil logout',
                    description: 'WhatsApp telah diputuskan',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                  });
                } catch (error) {
                  toast({
                    title: 'Gagal logout',
                    description: error.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                  });
                }
              }}
            >
              Logout WhatsApp
            </Button>
          </VStack>
        )}
      </Box>
    </VStack>
  )
}

export default Home