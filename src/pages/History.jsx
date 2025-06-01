import { useState, useEffect } from 'react'
import { Box, VStack, Text, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, useToast } from '@chakra-ui/react'
import axios from 'axios'

function History() {
  const [history, setHistory] = useState([])
  const toast = useToast()

  useEffect(() => {
    let polling = null
    const loadHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/messages')
        if (response.data.success) {
          console.log('Data pesan diterima:', response.data.messages)
          setHistory(response.data.messages || [])
        } else {
          console.error('Respons API tidak berhasil:', response.data)
        }
      } catch (error) {
        console.error('Error loading message history:', error)
      }
    }
    loadHistory()
    polling = setInterval(loadHistory, 3000)
    return () => clearInterval(polling)
  }, [])

  const handleDeleteAll = async () => {
    try {
      await axios.delete('http://localhost:5000/api/messages')
      setHistory([])
      toast({
        title: 'Sukses',
        description: 'Semua riwayat berhasil dihapus',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus riwayat',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  return (
    <Box bg="white" p={8} borderRadius="lg" shadow="md">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">Riwayat Pengiriman</Text>
        <Button colorScheme="red" alignSelf="flex-end" onClick={handleDeleteAll} mb={2}>
          Hapus Semua Riwayat
        </Button>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Tanggal</Th>
                <Th>Pesan</Th>
                <Th>Media</Th>
                <Th>Total Penerima</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {history.map((item) => (
                <Tr key={item.id}>
                  <Td>{new Date(item.created_at).toLocaleString()}</Td>
                  <Td>{item.message}</Td>
                  <Td>
                    <Badge colorScheme="gray">Tidak</Badge>
                  </Td>
                  <Td>{item.phone.includes('@') ? item.phone.split('@')[0] : item.phone}</Td>
                  <Td>
                    <Badge 
                      colorScheme={item.status === 'success' ? 'green' : 
                                 item.status === 'received' ? 'blue' : 'red'}
                    >
                      {item.status === 'success' ? 'Berhasil' : 
                       item.status === 'received' ? 'Diterima' : 'Gagal'}
                    </Badge>
                  </Td>
                </Tr>
              ))}
              {history.length === 0 && (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={4}>
                    Belum ada riwayat pengiriman
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  )
}

export default History