import { useState, useEffect, useContext } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import { Notyf } from 'notyf';
import UserContext from '../UserContext';

export default function Login() {
    const notyf = new Notyf();
    const { user, setUser } = useContext(UserContext);

    // State hooks to store the values of the input fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // State to determine whether submit button is enabled or not
    const [isActive, setIsActive] = useState(true);

    function authenticate(e) {
        // Prevents page redirection via form submission
        e.preventDefault();
        fetch('https://fitnessapp.api.h8lu.onrender.com/users/login', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        .then(res => res.json())
        .then(data => {
            if(data.access !== undefined){
                // Set the token of the authenticated user in the local storage
                localStorage.setItem('token', data.access);
                retrieveUserDetails(data.access);

                // Clear input fields after submission
                setEmail('');
                setPassword('');

                notyf.success('Successful Login');
            } else if (data.message === "Incorrect email or password") {
                notyf.error('Incorrect Credentials. Try Again');
            } else {
                notyf.error('User Not Found. Try Again.');
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            notyf.error('An error occurred during login. Please try again.');
        });
    }

    function retrieveUserDetails(token){
        // The token will be sent as part of the request's header information
        fetch('https://fitnessapp.api.h8lu.onrender.com/users/details', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log('User details:', data);
            // Set user state with ID from response
            setUser({
                id: data._id
            });
        })
        .catch(error => {
            console.error('Error retrieving user details:', error);
            localStorage.removeItem('token');
            notyf.error('Failed to retrieve user details. Please login again.');
        });
    };

    useEffect(() => {
        // Validation to enable submit button when all fields are populated
        if(email !== '' && password !== ''){
            setIsActive(true);
        }else{
            setIsActive(false);
        }
    }, [email, password]);

    return (
        (user.id !== null) ?
            <Navigate to="/dashboard" />
            :
            <Container>
                <Row className="justify-content-md-center">
                    <Col md={6}>
                        <Card className="p-4 shadow">
                            <Card.Body>
                                <h1 className="text-center mb-4">Login</h1>
                                <Form onSubmit={(e) => authenticate(e)}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email address</Form.Label>
                                        <Form.Control 
                                            type="email" 
                                            placeholder="Enter email" 
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            placeholder="Password" 
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Button 
                                        variant={isActive ? "primary" : "secondary"} 
                                        type="submit" 
                                        id="loginBtn" 
                                        className="w-100"
                                        disabled={!isActive}
                                    >
                                        Login
                                    </Button>
                                    
                                    <p className="text-center mt-3">
                                        Don't have an account? <Link to="/register">Register here</Link>
                                    </p>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>      
    );
}