import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  Fade,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import toast from 'react-hot-toast';
import { styled } from '@mui/system';

// Custom styled components
const StyledBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: '#f5f6f5',
  padding: '1rem',
});

const FormContainer = styled(Box)({
  padding: '2rem',
  width: '360px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e0e0e0',
});

const FormalTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#d0d0d0',
    },
    '&:hover fieldset': {
      borderColor: '#757575',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#616161',
  },
  '& .MuiInputBase-input': {
    color: '#212121',
  },
});

const FormalButton = styled(Button)({
  backgroundColor: '#1976d2',
  color: '#ffffff',
  padding: '10px 0',
  fontWeight: '500',
  textTransform: 'none',
  fontSize: '16px',
  borderRadius: '6px',
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: '#1565c0',
  },
});

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        const token = data.token;
        setToken(token);
        localStorage.setItem('token', token); // Tokeni localStorage-a yazırıq

        // 1 dəqiqə (60 saniyə) sonra tokeni silirik
        setTimeout(() => {
          localStorage.removeItem('token');
          setToken(null);
          toast.error('Tokenin vaxtı bitdi, yenidən giriş edin');
          navigate('/login', { replace: true });
        }, 12 * 50 * 50 * 1000);

        toast.success('Uğurlu giriş!', { duration: 3000 });
        navigate('/table', { replace: true });
      } else {
        toast.error(data.message || 'İstifadəçi adı və ya parol səhvdir');
      }
    } catch (err) {
      toast.error('Xəta baş verdi, yenidən cəhd edin');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <StyledBox>
      <Fade in timeout={500}>
        <FormContainer>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: '#212121',
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
              onKeyDown={handleKeyDown}
            />
            <FormalTextField
              label="Parol"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              fullWidth
              onKeyDown={handleKeyDown}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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