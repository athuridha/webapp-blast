import { Box, Flex } from '@chakra-ui/react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Blast from './pages/Blast'
import Contacts from './pages/Contacts'
import History from './pages/History'
import Settings from './pages/Settings'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import GenerateNumber from './pages/GenerateNumber'

function App() {
  return (
    <Flex minH="100vh">
      <Sidebar />
      <Box flex={1} bg="gray.50" p={8}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/blast" element={<ProtectedRoute><Blast /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/generate-number" element={<ProtectedRoute><GenerateNumber /></ProtectedRoute>} />
        </Routes>
      </Box>
    </Flex>
  )
}

export default App