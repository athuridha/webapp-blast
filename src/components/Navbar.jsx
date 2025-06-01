import { Box, Flex, Link, Heading, Button } from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated')
    navigate('/login')
  }
  return (
    <Box bg="green.500" px={4} color="white">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Heading size="md">WA Blast</Heading>
        <Flex gap={6} alignItems="center">
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
          <Button
            colorScheme="red"
            variant="outline"
            size="sm"
            ml={4}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

export default Navbar