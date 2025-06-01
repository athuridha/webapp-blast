import { Box, Flex } from '@chakra-ui/react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Blast from './pages/Blast'
import Contacts from './pages/Contacts'
import History from './pages/History'
import Settings from './pages/Settings'

function App() {
  return (
    <Flex minH="100vh">
      <Sidebar />
      <Box flex={1} bg="gray.50" p={8}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blast" element={<Blast />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </Flex>
  )
}

export default App