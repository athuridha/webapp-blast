import { useState, useEffect } from 'react'
import { Box, VStack, HStack, Text, Button, Table, Thead, Tbody, Tr, Th, Td, useToast, Input, FormControl, FormLabel } from '@chakra-ui/react'
import { read, utils } from 'xlsx'
import axios from 'axios'

function Contacts() {
  const [contacts, setContacts] = useState([])
  const [newContact, setNewContact] = useState({ name: '', phone: '' })
  const [search, setSearch] = useState("")
  const toast = useToast()

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

  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0]
      const data = await file.arrayBuffer()
      const workbook = read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = utils.sheet_to_json(worksheet)

      // Validasi format data
      const validContacts = jsonData.filter(row => {
        const phone = String(row.phone || row.nomor || row.telepon || '')
        return phone.length > 0
      })

      const response = await axios.post('http://localhost:5000/api/contacts', validContacts)
      if (response.data.success) {
        await loadContacts()
      }
      toast({
        title: 'Sukses',
        description: `${validContacts.length} kontak berhasil diimpor`,
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengimpor kontak. Pastikan format file sesuai',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleDeleteContact = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/contacts/${id}`)
      await loadContacts()
      toast({
        title: 'Sukses',
        description: 'Kontak berhasil dihapus',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus kontak',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleDeleteAllContacts = async () => {
    try {
      await axios.delete('http://localhost:5000/api/contacts')
      await loadContacts()
      toast({
        title: 'Sukses',
        description: 'Semua kontak berhasil dihapus',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus semua kontak',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleAddContact = async () => {
    try {
      // Validasi nomor telepon
      const phoneNumber = newContact.phone.replace(/[^0-9]/g, '')
      if (!phoneNumber) {
        throw new Error('Nomor telepon harus diisi')
      }

      const formattedPhone = phoneNumber.startsWith('62') ? phoneNumber : `62${phoneNumber.replace(/^0/, '')}`
      const contact = { ...newContact, phone: formattedPhone }

      const response = await axios.post('http://localhost:5000/api/contacts', [contact])
      if (response.data.success) {
        await loadContacts()
        setNewContact({ name: '', phone: '' })
        toast({
          title: 'Sukses',
          description: 'Kontak berhasil ditambahkan',
          status: 'success',
          duration: 3000,
          isClosable: true
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menambahkan kontak',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  return (
    <Box bg="white" p={8} borderRadius="lg" shadow="md">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">Daftar Kontak</Text>
          <HStack>
            <Button
              as="a"
              href="/template_kontak.xlsx"
              download
              colorScheme="teal"
              variant="outline"
            >
              Download Template Kontak
            </Button>
            <Button
              as="label"
              htmlFor="file-upload"
              colorScheme="green"
              cursor="pointer"
            >
              Import dari Excel/CSV
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleDeleteAllContacts}
            >
              Hapus Semua Kontak
            </Button>
          </HStack>
        </HStack>
        <Input
          placeholder="Cari nama kontak..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          mb={2}
          maxW="300px"
          alignSelf="flex-end"
        />

        <Box p={4} borderWidth={1} borderRadius="md">
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Nama</FormLabel>
              <Input
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Masukkan nama kontak"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Nomor WhatsApp</FormLabel>
              <Input
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="Contoh: 081234567890"
              />
            </FormControl>
            <Button colorScheme="blue" onClick={handleAddContact} width="full">
              Tambah Kontak
            </Button>
          </VStack>
        </Box>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>No</Th>
                <Th>Nama</Th>
                <Th>Nomor WhatsApp</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {contacts.filter(contact => contact.name.toLowerCase().includes(search.toLowerCase())).map((contact, index) => (
                <Tr key={contact.id}>
                  <Td>{index + 1}</Td>
                  <Td>{contact.name}</Td>
                  <Td>{contact.phone}</Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDeleteContact(contact.id)}
                    >
                      Hapus
                    </Button>
                  </Td>
                </Tr>
              ))}
              {contacts.filter(contact => contact.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={4}>
                    Belum ada kontak
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

export default Contacts