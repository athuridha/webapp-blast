import { Box, Flex, VStack, Text, Link, Divider, Button, IconButton, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, useDisclosure } from '@chakra-ui/react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaHome, FaComments, FaUserFriends, FaHistory, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa'
import { useState, useEffect } from 'react'

export default function Sidebar() {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Responsive handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  if (isMobile) {
    return (
      <>
        <IconButton
          icon={
            isOpen
              ? <FaTimes style={{ transition: 'transform 0.2s', color: '#2F855A' }} />
              : <FaBars style={{ transition: 'transform 0.2s', color: '#2F855A' }} />
          }
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          position="fixed"
          top={4}
          left={4}
          zIndex={1200}
          onClick={isOpen ? onClose : onOpen}
          size="lg"
          bg="white"
          color="green.600"
          shadow="md"
          borderRadius="full"
          _hover={{ bg: 'green.50' }}
          _active={{ bg: 'green.100' }}
        />
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
          <DrawerOverlay
            bg="blackAlpha.400"
            backdropFilter="blur(2px)"
          />
          <DrawerContent borderRightRadius="xl" boxShadow="2xl">
            <DrawerCloseButton mt={2} color="green.600" size="lg" />
            <DrawerHeader color="green.600" fontWeight="bold" fontSize="xl" borderBottomWidth="1px">
              Admin WA Blast
            </DrawerHeader>
            <DrawerBody p={0}>
              <VStack spacing={2} align="stretch" flex={1} px={2} pt={4}>
                <NavItem to="/" icon={FaHome} label="Dashboard" onClick={onClose} />
                <NavItem to="/blast" icon={FaComments} label="Blast Message" onClick={onClose} />
                <NavItem to="/contacts" icon={FaUserFriends} label="Kontak" onClick={onClose} />
                <NavItem to="/generate-number" icon={FaUserFriends} label="Generate Nomor" onClick={onClose} />
                <NavItem to="/history" icon={FaHistory} label="Riwayat" onClick={onClose} />
                <Divider my={4} />
                <NavItem to="/settings" icon={FaCog} label="Pengaturan" onClick={onClose} />
              </VStack>
              <Box px={4} pb={4} pt={2}>
                <Button
                  leftIcon={<FaSignOutAlt />}
                  colorScheme="red"
                  variant="outline"
                  w="full"
                  onClick={() => { onClose(); handleLogout(); }}
                  fontWeight="semibold"
                >
                  Logout
                </Button>
              </Box>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <Box w="250px" bg="white" h="100vh" borderRightWidth="1px" p={4}>
      <Flex direction="column" h="full">
        <Text fontSize="xl" fontWeight="bold" mb={8} color="green.600">Admin WA Blast</Text>
        
        <VStack spacing={2} align="stretch" flex={1}>
          <NavItem to="/" icon={FaHome} label="Dashboard" />
          <NavItem to="/blast" icon={FaComments} label="Blast Message" />
          <NavItem to="/contacts" icon={FaUserFriends} label="Kontak" />
          <NavItem to="/generate-number" icon={FaUserFriends} label="Generate Nomor" />
          <NavItem to="/history" icon={FaHistory} label="Riwayat" />
          <Divider my={4} />
          <NavItem to="/settings" icon={FaCog} label="Pengaturan" />
        </VStack>
        <Button
          leftIcon={<FaSignOutAlt />}
          colorScheme="red"
          variant="outline"
          mt={8}
          onClick={handleLogout}
          w="full"
        >
          Logout
        </Button>
      </Flex>
    </Box>
  )
}

function NavItem({ to, icon: Icon, label, onClick }) {
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
      onClick={onClick}
    >
      <Flex align="center">
        <Icon size="20px" />
        <Text ml={3} fontSize="md">{label}</Text>
      </Flex>
    </Link>
  )
}