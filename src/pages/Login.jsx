import { useState } from 'react';
import { Box, Flex, Input, Button, Text, VStack, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Periksa password
    if (password === 'usindomaju01') {
      // Simpan status login di sessionStorage
      sessionStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } else {
      toast({
        title: 'Error',
        description: 'Password salah',
        status: 'error',
        duration: 3000,
        isClosable: true,
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
            />
            <Button
              type="submit"
              colorScheme="green"
              size="lg"
              width="full"
              isLoading={isLoading}
            >
              Login
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
}
