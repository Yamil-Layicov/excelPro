import { useState, useEffect } from 'react'; // Added useEffect
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

// Custom styled components remain the same
const StyledBox = styled(Box)({
  // ... same as before
});

const FormContainer = styled(Box)({
  // ... same as before
});

const FormalTextField = styled(TextField)({
  // ... same as before
});

const FormalButton = styled(Button)({
  // ... same as before
});

// Helper functions to manage token with expiration
const setTokenWithExpiry = (token, expiryInHours = 12) => {
  const now = new Date();
  const expiryTime = now.getTime() + expiryInHours * 60 * 60 * 1000;
  const tokenData = {
    value: token,
    expiry: expiryTime,
  };
  localStorage.setItem('token', JSON.stringify(tokenData));
};

const getToken = () => {
  const tokenString = localStorage.getItem('token');
  if (!tokenString) return null;
  
  const tokenData = JSON.parse(tokenString);
  const now = new Date();
  
  if (now.getTime() > tokenData.expiry) {
    localStorage.removeItem('token');
    return null;
  }
  return tokenData.value;
};

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check token expiration on component mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      setToken(token);
      navigate('/table', { replace: true });
    }
  }, [setToken, navigate]);

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
        setTokenWithExpiry(data.token, 12); 
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