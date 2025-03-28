import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import toast from 'react-hot-toast';

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.100.123:5051/api/Auth/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setToken(data.token); 
        toast.success('Uğurlu giriş!', { duration: 3000 });
        navigate('/table', { replace: true });
      } else {
        toast.error(data.message || 'İstifadəçi adı və ya parol səhvdir');
      }
    } catch (err) {
      toast.error('Xəta baş verdi, yenidən cəhd edin');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Giriş
      </Typography>
      <TextField
        label="İstifadəçi Adı"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        variant="outlined"
        sx={{ width: '300px' }}
      />
      <TextField
        label="Parol"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        variant="outlined"
        sx={{ width: '300px' }}
      />
      <Button variant="contained" onClick={handleLogin}>
        Giriş
      </Button>
    </Box>
  );
}

export default Login;