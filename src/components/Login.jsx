import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  Fade,
} from '@mui/material';
import toast from 'react-hot-toast';
import { styled } from '@mui/system';

// Custom styled components for a formal design
const StyledBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: '#f5f6f5', // Light gray background
  padding: '1rem',
});

const FormContainer = styled(Box)({
  padding: '2rem',
  width: '360px',
  backgroundColor: '#ffffff', // White card
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
  border: '1px solid #e0e0e0', // Light border
});

const FormalTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#d0d0d0', // Light gray border
    },
    '&:hover fieldset': {
      borderColor: '#757575', // Darker gray on hover
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2', // Professional blue on focus
    },
  },
  '& .MuiInputLabel-root': {
    color: '#616161', // Medium gray for labels
  },
  '& .MuiInputBase-input': {
    color: '#212121', // Dark text
  },
});

const FormalButton = styled(Button)({
  backgroundColor: '#1976d2', // Professional blue
  color: '#ffffff',
  padding: '10px 0',
  fontWeight: '500',
  textTransform: 'none',
  fontSize: '16px',
  borderRadius: '6px',
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: '#1565c0', // Slightly darker blue on hover
  },
});

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
    <StyledBox>
      <Fade in timeout={500}>
        <FormContainer>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: '#212121', // Dark gray text
              fontWeight: '500',
              textAlign: 'center',
              mb: 3,
            }}
          >
            Giriş
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormalTextField
              label="İstifadəçi Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              fullWidth
            />
            <FormalTextField
              label="Parol"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              fullWidth
            />
            <FormalButton
              variant="contained"
              onClick={handleLogin}
              fullWidth
            >
              Giriş
            </FormalButton>
          </Box>
        </FormContainer>
      </Fade>
    </StyledBox>
  );
}

export default Login;