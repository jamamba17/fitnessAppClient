import { useContext } from 'react';
import { Navbar as BootstrapNavbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import UserContext from '../UserContext';

export default function Navbar() {
    const { user, unsetUser } = useContext(UserContext);
    const navigate = useNavigate();

    const logout = () => {
        unsetUser();
        navigate('/login');
    };

    return (
        <BootstrapNavbar bg="dark" variant="dark" expand="lg">
            <Container>
                <BootstrapNavbar.Brand as={Link} to="/">Fitness Tracker</BootstrapNavbar.Brand>
                <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
                <BootstrapNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {user.id ? (
                            <>
                                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                                <Button variant="outline-light" onClick={logout}>Logout</Button>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                <Nav.Link as={Link} to="/register">Register</Nav.Link>
                            </>
                        )}
                    </Nav>
                </BootstrapNavbar.Collapse>
            </Container>
        </BootstrapNavbar>
    );
}