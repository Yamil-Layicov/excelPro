import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { staticData as initialData } from './data/staticData';
import Login from './components/Login';
import TablePage from './components/TablePage';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  const [data, setData] = useState(initialData);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const handleAddData = (newData) => {
    setData((prevData) => [...prevData, newData]);
  };

  const handleDelete = (id) => {
    setData((prevData) => prevData.filter((item) => item.id !== id));
  };

  const handleUpdate = (updatedRow) => {
    setData((prevData) =>
      prevData.map((item) => (item.id === updatedRow.id ? updatedRow : item))
    );
  };

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} /> {/* Toast üçün */}
      <Routes>
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/table" />
            ) : (
              <Login setToken={setToken} />
            )
          }
        />
        <Route
          path="/table"
          element={
            <PrivateRoute token={token}>
              <TablePage
                data={data}
                onAddData={handleAddData}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to={token ? "/table" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;