import { useState, useEffect, useContext } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import { Notyf } from 'notyf';
import UserContext from '../UserContext';

export default function Register() {
    const notyf = new Notyf();
    const { user } = useContext(UserContext);

    // State hooks to store the values of the input fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // State to determine whether submit button is enabled or not
    const [isActive, setIsActive] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    function registerUser(e) {
        // Prevents page redirection via form submission
        e.preventDefault();

        fetch('https://fitnessapp.api.h8lu.onrender.com/users/register', {
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
            console.log(data);

            if (data.message === "Registration successful") {
                notyf.success("Registration successful!");
                
                // Clear input fields after submission
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                
                // Redirect to login page after successful registration
                window.location.href = '/login';
            } else {
                notyf.error(data.message || "Something went wrong during registration.");
            }
        })
        .catch(error => {
            console.error('Error during registration:', error);
            notyf.error("An error occurred during registration. Please try again.");
        });
    }

    useEffect(() => {
        // Check if passwords match
        if (confirmPassword && password !== confirmPassword) {
            setPasswordsMatch(false);
        } else {
            setPasswordsMatch(true);
        }

        // Validation to enable submit button when all fields are populated and passwords match
        if (email !== '' && password !== '' && confirmPassword !== '' && password === confirmPassword && password.length >= 8) {
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    }, [email, password, confirmPassword]);

    return (
        (user.id !== null) ?
        <Navigate to="/dashboard" />
        :
        <Container>
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <Card className="p-4 shadow">
                        <Card.Body>
                            <h1 className="text-center mb-4">Register</h1>
                            <Form onSubmit={(e) => registerUser(e)}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        placeholder="Enter email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Form.Text className="text-muted">
                                        We'll never share your email with anyone else.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        placeholder="Password (minimum 8 characters)" 
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    {password && password.length < 8 && (
                                        <Form.Text className="text-danger">
                                            Password must be at least 8 characters long.
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        placeholder="Confirm Password" 
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    {!passwordsMatch && (
                                        <Form.Text className="text-danger">
                                            Passwords do not match.
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                {isActive ? 
                                    <Button variant="primary" type="submit" className="w-100">
                                        Register
                                    </Button>
                                    : 
                                    <Button variant="secondary" type="submit" className="w-100" disabled>
                                        Register
                                    </Button>
                                }
                                
                                <p className="text-center mt-3">
                                    Already have an account? <Link to="/login">Login here</Link>
                                </p>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}