import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import { UserProvider } from './UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'notyf/notyf.min.css';

function App() {
    const [user, setUser] = useState({
        id: null,
    });

    const unsetUser = () => {
      localStorage.clear();
    };

    useEffect(() => {
        // Check if user is logged in via token
        const token = localStorage.getItem('token');
        if (token) {
            fetch('https://fitnessapp.api.h8lu.onrender.com/users/details', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data._id) {
                    setUser({
                        id: data._id,
                    });
                } else {
                    setUser({
                        id: null,
                    });
                    localStorage.removeItem('token');
                }
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
                setUser({
                    id: null,
                });
                localStorage.removeItem('token');
            });
        }
    }, []);

    return (
        <UserProvider value={{user, setUser, unsetUser}}>
            <Router>
                <Navbar />
                <div className="container mt-5">
                    <Routes>
                        <Route path="/" element={user.id ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
                        <Route path="/login" element={user.id ? <Navigate to="/dashboard" /> : <Login />} />
                        <Route path="/register" element={user.id ? <Navigate to="/dashboard" /> : <Register />} />
                        <Route path="/dashboard" element={user.id ? <Dashboard /> : <Navigate to="/login" />} />
                    </Routes>
                </div>
            </Router>
        </UserProvider>
    );
}

export default App;
