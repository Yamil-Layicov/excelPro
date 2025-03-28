import axios from 'axios';


const instance = axios.create({
  baseURL: 'http://192.168.100.123:5051/api/',
});

function getTokenFromJson(jsonString) {
  const parsed = JSON.parse(jsonString);
  return parsed.token;
}

instance.interceptors.request.use(
  function(config) {
    const tokenJson = localStorage.getItem('user');
    if (tokenJson) {
      const token = getTokenFromJson(tokenJson);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);


instance.interceptors.response.use(
  function(response) {
    return response;
  },
  function(error) {
    if (error.response && error.response.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;