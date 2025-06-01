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
    <Box bg="white" p={[2, 4, 8]} borderRadius="lg" shadow="md" maxW="100vw" overflowX="hidden">
      <VStack spacing={6} align="stretch">
        <Text fontSize={['xl', '2xl']} fontWeight="bold">Riwayat Pengiriman</Text>
        <Button
          colorScheme="red"
          alignSelf={['stretch', 'flex-end']}
          onClick={handleDeleteAll}
          mb={2}
          fontSize={['sm', 'md']}
        >
          Hapus Semua Riwayat
        </Button>

        <Box overflowX="auto" width="100%">
          <Table variant="simple" size={['xs', 'sm']} minWidth="600px">
            <Thead>
              <Tr>
                <Th fontSize={['xs', 'sm']}>Tanggal</Th>
                <Th fontSize={['xs', 'sm']}>Pesan</Th>
                <Th fontSize={['xs', 'sm']}>Media</Th>
                <Th fontSize={['xs', 'sm']}>Total Penerima</Th>
                <Th fontSize={['xs', 'sm']}>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {history.map((item) => (
                <Tr key={item.id}>
                  <Td fontSize={['xs', 'sm']}>{new Date(item.created_at).toLocaleString()}</Td>
                  <Td fontSize={['xs', 'sm']}>{item.message}</Td>
                  <Td fontSize={['xs', 'sm']}>
                    <Badge colorScheme="gray">Tidak</Badge>
                  </Td>
                  <Td fontSize={['xs', 'sm']}>{item.phone.includes('@') ? item.phone.split('@')[0] : item.phone}</Td>
                  <Td fontSize={['xs', 'sm']}>
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
                  <Td colSpan={5} textAlign="center" py={4} fontSize={['xs', 'sm']}>
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