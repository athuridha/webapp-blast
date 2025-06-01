import { useState, useEffect } from 'react';
import { Box, Flex, Input, Button, Text, VStack, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backendPassword, setBackendPassword] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  // Ambil password dari backend saat komponen mount
  useEffect(() => {
    fetch('http://localhost:5000/api/settings/password')
      .then((res) => res.json())
      .then((data) => {
        setBackendPassword(data.password || 'usindomaju01');
      })
      .catch(() => setBackendPassword('usindomaju01'));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Ambil password dari backend, fallback ke default
    const savedPassword = backendPassword || 'usindomaju01';

    if (password === savedPassword) {
      sessionStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } else {
      toast({
        title: 'Password Salah',
        description: 'Silakan cek kembali password Anda.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
    setIsLoading(false);
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box bg="white" p={8} rounded="md" shadow="md" w="100%" maxW="400px">
        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              Admin WA Blast
            </Text>
            <Input
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="lg"
              isDisabled={backendPassword === null}
            />
            <Button
              type="submit"
              colorScheme="green"
              size="lg"
              width="full"
              isLoading={isLoading}
              isDisabled={backendPassword === null}
            >
              Login
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
}