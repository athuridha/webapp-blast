import { useState, useEffect } from 'react'
import { Box, VStack, FormControl, FormLabel, Input, Textarea, Button, useToast, HStack, Text, Image, Checkbox, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

function Blast() {
  const [message, setMessage] = useState('')
  const [media, setMedia] = useState(null)
  const [contacts, setContacts] = useState([])
  const [selectedContacts, setSelectedContacts] = useState([])
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState("")
  const toast = useToast()
  const [totalSent, setTotalSent] = useState(0)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/contacts')
      if (response.data.success) {
        setContacts(response.data.contacts)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data kontak',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleToggleContact = (contactId) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId)
      } else {
        return [...prev, contactId]
      }
    })
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'video/*': ['.mp4'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setMedia(acceptedFiles[0])
    }
  })

  const handleSendBlast = async () => {
    if (!message && !media) {
      toast({
        title: 'Error',
        description: 'Mohon masukkan pesan atau media',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }

    if (selectedContacts.length === 0) {
      toast({
        title: 'Error',
        description: 'Mohon pilih minimal satu penerima',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }

    try {
      setSending(true)
      const selectedPhones = contacts
        .filter(contact => selectedContacts.includes(contact.id))
        .map(contact => contact.phone)

      let response
      if (media) {
        // Kirim sebagai FormData jika ada media
        let formData = new FormData()
        formData.append('media', media)
        formData.append('numbers', JSON.stringify(selectedPhones))
        formData.append('message', message)
        response = await axios.post('http://localhost:5000/api/send', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      } else {
        // Kirim sebagai JSON jika tanpa media
        response = await axios.post('http://localhost:5000/api/send', {
          numbers: selectedPhones,
          message: message
        })
      }

      const results = response.data.results || []
      const successCount = results.filter(r => r.status === 'success').length
      const failedCount = results.filter(r => r.status === 'failed').length

      if (successCount > 0) {
        toast({
          title: 'Berhasil',
          description: `Pesan terkirim ke ${successCount} nomor${failedCount > 0 ? `, gagal ke ${failedCount} nomor` : ''}`,
          status: 'success',
          duration: 3000,
          isClosable: true
        })
      }
      
      if (failedCount > 0) {
        toast({
          title: 'Peringatan',
          description: `Gagal mengirim ke ${failedCount} nomor`,
          status: 'warning',
          duration: 3000,
          isClosable: true
        })
      }

      setMessage('')
      setMedia(null)
      setSelectedContacts([])
      setTotalSent(prev => prev + successCount)
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } finally {
      setSending(false)
    }
  }

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      setSelectedContacts(contacts.map(contact => contact.id))
    } else {
      setSelectedContacts([])
    }
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">Kirim Blast</Text>
        
        <FormControl>
          <FormLabel>Pesan</FormLabel>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Masukkan pesan yang akan dikirim"
            rows={5}
          />
        </FormControl>
    <FormControl>
          <FormLabel>Media (opsional)</FormLabel>
          <Box
            {...getRootProps()}
            border="2px dashed #CBD5E0"
            borderRadius="md"
            p={4}
            textAlign="center"
            cursor="pointer"
            bg={media ? 'green.50' : 'gray.50'}
            mb={2}
          >
            <input {...getInputProps()} />
            {media ? (
              <HStack justify="center">
                {media.type.startsWith('image/') && (
                  <Image src={URL.createObjectURL(media)} alt="preview" maxH="100px" />
                )}
                {media.type.startsWith('video/') && (
                  <video src={URL.createObjectURL(media)} controls style={{ maxHeight: '100px' }} />
                )}
                {media.type === 'application/pdf' && (
                  <Text>PDF: {media.name}</Text>
                )}
                <Button size="sm" colorScheme="red" onClick={e => { e.stopPropagation(); setMedia(null); }}>Hapus</Button>
              </HStack>
            ) : (
              <Text color="gray.500">Drag & drop file media di sini, atau klik untuk pilih file (jpg, png, mp4, pdf)</Text>
            )}
          </Box>
        </FormControl>

        <FormControl>
          <FormLabel>Pilih Penerima</FormLabel>
          <Input
            placeholder="Cari nama kontak..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            mb={2}
            maxW="300px"
            alignSelf="flex-end"
          />
          <Box overflowX="auto" maxH="300px" overflowY="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th width="50px">
                    <Checkbox
                      isChecked={selectedContacts.length === contacts.filter(contact => contact.name.toLowerCase().includes(search.toLowerCase())).length && contacts.filter(contact => contact.name.toLowerCase().includes(search.toLowerCase())).length > 0}
                      isIndeterminate={selectedContacts.length > 0 && selectedContacts.length < contacts.filter(contact => contact.name.toLowerCase().includes(search.toLowerCase())).length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </Th>
                  <Th>Nama</Th>
                  <Th>Nomor WhatsApp</Th>
                </Tr>
              </Thead>
              <Tbody>
                {contacts.filter(contact => contact.name.toLowerCase().includes(search.toLowerCase())).map((contact) => (
                  <Tr key={contact.id}>
                    <Td>
                      <Checkbox
                        isChecked={selectedContacts.includes(contact.id)}
                        onChange={() => handleToggleContact(contact.id)}
                      />
                    </Td>
                    <Td>{contact.name}</Td>
                    <Td>{contact.phone}</Td>
                  </Tr>
                ))}
                {contacts.filter(contact => contact.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                  <Tr>
                    <Td colSpan={3} textAlign="center" py={4}>
                      Belum ada kontak
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </FormControl>

        <Button
          colorScheme="green"
          isLoading={sending}
          loadingText="Mengirim..."
          onClick={handleSendBlast}
        >
          Kirim Blast ({selectedContacts.length} penerima)
        </Button>
      </VStack>
    </Box>
  )
}

export default Blast