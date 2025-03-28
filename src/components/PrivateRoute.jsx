import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, token }) {
  return token ? children : <Navigate to="/login" />;
}

export default PrivateRoute;