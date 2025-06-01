import { useState } from 'react'
import { Box, VStack, HStack, Stack, Text, Button, Select, Input, Table, Thead, Tbody, Tr, Th, Td, useToast } from '@chakra-ui/react'
import nomer from '../lib/nomer'

function getAllPrefixes() {
  // Flatten all prefix arrays from nomer.js
  return Object.values(nomer).flat()
}

function generateRandomNumbers(prefixes, count) {
  const numbers = []
  for (let i = 0; i < count; i++) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    // Pastikan prefix sudah format 62, dan tidak ada 0 di depan
    let cleanPrefix = prefix.replace(/^0/, '62')
    if (!cleanPrefix.startsWith('62')) {
      cleanPrefix = '62' + cleanPrefix.replace(/^\+?/, '')
    }
    // Generate random number dengan panjang digit total 12-13 (contoh: 6285213971656)
    const digitLength = Math.floor(Math.random() * 2) + 12 // 12 atau 13
    const randomDigits = Array.from({ length: digitLength - cleanPrefix.length }, () => Math.floor(Math.random() * 10)).join('')
    numbers.push(cleanPrefix + randomDigits)
  }
  return numbers
}

export default function GenerateNumber() {
  const [jumlah, setJumlah] = useState(10)
  const [result, setResult] = useState([])
  const [digit, setDigit] = useState(8)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleGenerate = async () => {
    const prefixes = getAllPrefixes()
    if (!jumlah || jumlah < 1) {
      toast({ title: 'Jumlah tidak valid', status: 'error', duration: 2000, isClosable: true })
      return
    }
    setLoading(true)
    let verified = []
    let attempts = 0
    const maxAttempts = 20 // batasi percobaan agar tidak infinite loop
    while (verified.length < Number(jumlah) && attempts < maxAttempts) {
      const numbers = generateRandomNumbers(prefixes, Number(jumlah) * 2, digit) // generate lebih banyak untuk peluang lebih besar
      try {
        const response = await fetch('http://localhost:5000/api/check-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ numbers })
        })
        const data = await response.json()
        if (data.success) {
          const newVerified = data.results.filter(r => r.exists).map(r => r.number)
          // Gabungkan dan hilangkan duplikat
          verified = Array.from(new Set([...verified, ...newVerified]))
        } else {
          toast({ title: 'Gagal verifikasi nomor', description: data.error, status: 'error', duration: 2000, isClosable: true })
          break
        }
      } catch (err) {
        toast({ title: 'Gagal verifikasi nomor', description: err.message, status: 'error', duration: 2000, isClosable: true })
        break
      }
      attempts++
    }
    verified = verified.slice(0, Number(jumlah))
    setResult(verified)
    if (verified.length === 0) {
      toast({ title: 'Tidak ada nomor yang terdaftar di WhatsApp', status: 'warning', duration: 2500, isClosable: true })
    } else {
      toast({ title: `${verified.length} nomor terverifikasi WhatsApp`, status: 'success', duration: 2000, isClosable: true })
    }
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.join('\n'))
    toast({ title: 'Disalin ke clipboard', status: 'success', duration: 1500, isClosable: true })
  }

  const handleSaveToContacts = async () => {
    try {
      const contacts = result.map((num, idx) => ({ name: `Random ${idx + 1}`, phone: num }))
      const response = await fetch('http://localhost:5000/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contacts)
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Berhasil disimpan ke kontak', status: 'success', duration: 2000, isClosable: true })
      } else {
        throw new Error(data.error || 'Gagal menyimpan kontak')
      }
    } catch (err) {
      toast({ title: 'Gagal simpan ke kontak', description: err.message, status: 'error', duration: 2000, isClosable: true })
    }
  }

  return (
    <Box bg="white" p={[2, 4, 8]} borderRadius="lg" shadow="md" maxW="100vw" overflowX="hidden">
      <VStack spacing={6} align="stretch">
        <Text fontSize={['xl', '2xl']} fontWeight="bold">Generate Random Nomor WhatsApp</Text>
        <Stack direction={['column', 'row']} spacing={[2, 4]} align={['stretch', 'center']}>
          <Select
            value={jumlah}
            onChange={e => setJumlah(e.target.value)}
            maxW={['100%', '150px']}
            fontSize={['sm', 'md']}
          >
            {[10, 20, 50, 100, 200, 500, 1000].map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
            <option value="custom">Custom</option>
          </Select>
          {jumlah === 'custom' ? (
            <Input
              type="number"
              min={1}
              max={10000}
              value={typeof jumlah === 'number' ? jumlah : ''}
              onChange={e => setJumlah(Number(e.target.value))}
              maxW={['100%', '100px']}
              placeholder="Jumlah"
              fontSize={['sm', 'md']}
            />
          ) : null}
          <Input
            type="number"
            min={11}
            max={13}
            value={digit}
            onChange={e => setDigit(Number(e.target.value))}
            maxW={['100%', '100px']}
            placeholder="Digit Akhir"
            isDisabled
            fontSize={['sm', 'md']}
          />
          <Button colorScheme="teal" onClick={handleGenerate} isLoading={loading} fontSize={['sm', 'md']} width={['100%', 'auto']}>
            Generate
          </Button>
          <Button colorScheme="blue" variant="outline" onClick={handleCopy} isDisabled={result.length === 0} fontSize={['sm', 'md']} width={['100%', 'auto']}>
            Copy
          </Button>
          <Button colorScheme="green" variant="solid" onClick={() => handleSaveToContacts()} isDisabled={result.length === 0} fontSize={['sm', 'md']} width={['100%', 'auto']}>
            Simpan ke Kontak
          </Button>
        </Stack>
        <Box overflowX="auto" maxH="400px" width="100%">
          <Table size={['xs', 'sm']} minWidth="350px">
            <Thead>
              <Tr>
                <Th fontSize={['xs', 'sm']}>No</Th>
                <Th fontSize={['xs', 'sm']}>Nomor WhatsApp</Th>
              </Tr>
            </Thead>
            <Tbody>
              {result.map((num, idx) => (
                <Tr key={num}>
                  <Td fontSize={['xs', 'sm']}>{idx + 1}</Td>
                  <Td fontSize={['xs', 'sm']}>{num}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  )
}
