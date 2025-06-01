import { Box, Flex, VStack, Text, Link, Divider } from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import { FaHome, FaComments, FaUserFriends, FaHistory, FaCog, FaComments as FaChat } from 'react-icons/fa'

export default function Sidebar() {
  return (
    <Box w="250px" bg="white" h="100vh" borderRightWidth="1px" p={4}>
      <Flex direction="column" h="full">
        <Text fontSize="xl" fontWeight="bold" mb={8} color="green.600">Admin WA Blast</Text>
        
        <VStack spacing={2} align="stretch" flex={1}>
          <NavItem to="/" icon={FaHome} label="Dashboard" />
          <NavItem to="/contacts" icon={FaUserFriends} label="Kontak" />
          <NavItem to="/blast" icon={FaComments} label="Blast Message" />
          <NavItem to="/history" icon={FaHistory} label="Riwayat" />
          <Divider my={4} />
          <NavItem to="/settings" icon={FaCog} label="Pengaturan" />
        </VStack>
      </Flex>
    </Box>
  )
}

function NavItem({ to, icon: Icon, label }) {
  return (
    <Link 
      as={NavLink}
      to={to}
      p={2}
      borderRadius="md"
      _hover={{ bg: 'green.50' }}
      _activeLink={{ 
        bg: 'green.100',
        color: 'green.700',
        fontWeight: 'semibold'
      }}
      exact
    >
      <Flex align="center">
        <Icon size="20px" />
        <Text ml={3} fontSize="md">{label}</Text>
      </Flex>
    </Link>
  )
}