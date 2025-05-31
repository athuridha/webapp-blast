import { Box, Flex, Link, Heading } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

function Navbar() {
  return (
    <Box bg="green.500" px={4} color="white">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Heading size="md">WA Blast</Heading>
        <Flex gap={6}>
          <Link as={RouterLink} to="/" _hover={{ color: 'green.200' }}>
            Home
          </Link>
          <Link as={RouterLink} to="/blast" _hover={{ color: 'green.200' }}>
            Blast
          </Link>
          <Link as={RouterLink} to="/contacts" _hover={{ color: 'green.200' }}>
            Kontak
          </Link>
          <Link as={RouterLink} to="/history" _hover={{ color: 'green.200' }}>
            Riwayat
          </Link>
        </Flex>
      </Flex>
    </Box>
  )
}

export default Navbar