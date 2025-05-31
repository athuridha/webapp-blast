import { useState } from 'react'
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Text,
  Switch,
  HStack,
  Divider,
  Card,
  CardBody,
  Select
} from '@chakra-ui/react'
import axios from 'axios'

function Settings() {
  const [settings, setSettings] = useState({
    defaultMessage: '',
    autoReply: false,
    autoReplyMessage: '',
    notificationSound: true,
    messageDelay: '2',
    maxBlastSize: '100'
  })
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await axios.post('http://localhost:5000/api/settings', settings)
      
      if (response.data.success) {
        toast({
          title: 'Sukses',
          description: 'Pengaturan berhasil disimpan',
          status: 'success',
          duration: 3000,
          isClosable: true
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pengaturan',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">Pengaturan</Text>

        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="semibold">Pengaturan Pesan</Text>
              <FormControl>
                <FormLabel>Pesan Default</FormLabel>
                <Input
                  value={settings.defaultMessage}
                  onChange={(e) => handleChange('defaultMessage', e.target.value)}
                  placeholder="Masukkan template pesan default"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Jeda Antar Pesan (detik)</FormLabel>
                <Select
                  value={settings.messageDelay}
                  onChange={(e) => handleChange('messageDelay', e.target.value)}
                >
                  <option value="1">1 detik</option>
                  <option value="2">2 detik</option>
                  <option value="3">3 detik</option>
                  <option value="5">5 detik</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Batas Maksimal Blast</FormLabel>
                <Select
                  value={settings.maxBlastSize}
                  onChange={(e) => handleChange('maxBlastSize', e.target.value)}
                >
                  <option value="50">50 kontak</option>
                  <option value="100">100 kontak</option>
                  <option value="200">200 kontak</option>
                  <option value="500">500 kontak</option>
                </Select>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="semibold">Pengaturan Auto Reply</Text>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Aktifkan Auto Reply</FormLabel>
                <Switch
                  isChecked={settings.autoReply}
                  onChange={(e) => handleChange('autoReply', e.target.checked)}
                />
              </FormControl>

              <FormControl isDisabled={!settings.autoReply}>
                <FormLabel>Pesan Auto Reply</FormLabel>
                <Input
                  value={settings.autoReplyMessage}
                  onChange={(e) => handleChange('autoReplyMessage', e.target.value)}
                  placeholder="Masukkan pesan auto reply"
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="semibold">Pengaturan Notifikasi</Text>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Suara Notifikasi</FormLabel>
                <Switch
                  isChecked={settings.notificationSound}
                  onChange={(e) => handleChange('notificationSound', e.target.checked)}
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Button
          colorScheme="green"
          isLoading={saving}
          loadingText="Menyimpan..."
          onClick={handleSave}
        >
          Simpan Pengaturan
        </Button>
      </VStack>
    </Box>
  )
}

export default Settings