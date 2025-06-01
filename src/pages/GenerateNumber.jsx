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
    // Generate random number with random digit length between 11-13
    const digitLength = Math.floor(Math.random() * 3) + 11 // 11, 12, or 13
    const randomDigits = Array.from({ length: digitLength - prefix.length }, () => Math.floor(Math.random() * 10)).join('')
    numbers.push(prefix + randomDigits)
  }
  return numbers
}

export default function GenerateNumber() {
  const [jumlah, setJumlah] = useState(10)
  const [result, setResult] = useState([])
  const [digit, setDigit] = useState(8)
  const toast = useToast()

  const handleGenerate = () => {
    const prefixes = getAllPrefixes()
    if (!jumlah || jumlah < 1) {
      toast({ title: 'Jumlah tidak valid', status: 'error', duration: 2000, isClosable: true })
      return
    }
    const numbers = generateRandomNumbers(prefixes, Number(jumlah), digit)
    setResult(numbers)
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
          <Button colorScheme="teal" onClick={handleGenerate} fontSize={['sm', 'md']} width={['100%', 'auto']}>
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
