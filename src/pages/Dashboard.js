import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Badge } from 'react-bootstrap';
import { Notyf } from 'notyf';
import UserContext from '../UserContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const notyf = new Notyf();
    const { user } = useContext(UserContext);
    
    // State for workouts
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        totalDuration: 0,
        weeklyData: []
    });
    
    // State for add workout modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newWorkout, setNewWorkout] = useState({
        name: '',
        duration: '',
        status: 'Pending'
    });
    
    // Fetch workouts on component mount
    useEffect(() => {
        fetchWorkouts();
    }, []);
    
    // Calculate statistics whenever workouts change
    useEffect(() => {
        if (workouts.length > 0) {
            calculateStats();
        }
    }, [workouts]);
    
    // Function to fetch workouts
    const fetchWorkouts = () => {
        setLoading(true);
        
        fetch('https://fitnessapp.api.h8lu.onrender.com/workouts/getMyWorkouts', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log('Workouts data:', data);
            if (Array.isArray(data)) {
                // Sort workouts by date (newest first)
                const sortedWorkouts = data.sort((a, b) => 
                    new Date(b.dateAdded) - new Date(a.dateAdded)
                );
                setWorkouts(sortedWorkouts);
            } else {
                setWorkouts([]);
            }
            setLoading(false);
        })
        .catch(error => {
            console.error('Error fetching workouts:', error);
            notyf.error('Failed to load workouts. Please try again.');
            setLoading(false);
        });
    };
    
    // Calculate workout statistics
    const calculateStats = () => {
        const completed = workouts.filter(w => w.status === 'Completed').length;
        const pending = workouts.filter(w => w.status === 'Pending').length;
        
        // Calculate total duration (convert string durations to numbers)
        const totalDuration = workouts.reduce((total, workout) => {
            const duration = parseInt(workout.duration) || 0;
            return total + duration;
        }, 0);
        
        // Create weekly data for chart
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const workoutsOnDay = workouts.filter(workout => {
                const workoutDate = new Date(workout.dateAdded);
                workoutDate.setHours(0, 0, 0, 0);
                return workoutDate.getTime() === date.getTime();
            });
            
            const totalDurationOnDay = workoutsOnDay.reduce((total, workout) => {
                const duration = parseInt(workout.duration) || 0;
                return total + duration;
            }, 0);
            
            last7Days.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                workouts: workoutsOnDay.length,
                duration: totalDurationOnDay
            });
        }
        
        setStats({
            total: workouts.length,
            completed,
            pending,
            totalDuration,
            weeklyData: last7Days
        });
    };
    
    // Function to handle input changes in add workout form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewWorkout({
            ...newWorkout,
            [name]: value
        });
    };
    
    // Function to add a new workout
    const addWorkout = (e) => {
        e.preventDefault();
        
        fetch('https://fitnessapp.api.h8lu.onrender.com/workouts/addWorkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: newWorkout.name,
                duration: newWorkout.duration,
                status: newWorkout.status
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log('Add workout response:', data);
            if (data._id) {
                notyf.success('Workout added successfully!');
                // Reset form and close modal
                setNewWorkout({
                    name: '',
                    duration: '',
                    status: 'Pending'
                });
                setShowAddModal(false);
                // Refresh workouts list
                fetchWorkouts();
            } else {
                notyf.error(data.message || 'Failed to add workout. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error adding workout:', error);
            notyf.error('Failed to add workout. Please try again.');
        });
    };
    
    // Function to mark a workout as completed
    const completeWorkout = (id) => {
        fetch(`https://fitnessapp.api.h8lu.onrender.com/workouts/completeWorkoutStatus/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log('Complete workout response:', data);
            if (data.message === "Status updated to complete") {
                notyf.success('Workout marked as completed!');
                // Refresh workouts list
                fetchWorkouts();
            } else {
                notyf.error('Failed to update workout status. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error completing workout:', error);
            notyf.error('Failed to update workout status. Please try again.');
        });
    };
    
    // Function to delete a workout
    const deleteWorkout = (id) => {
        if (window.confirm('Are you sure you want to delete this workout?')) {
            fetch(`https://fitnessapp.api.h8lu.onrender.com/workouts/deleteWorkout/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(res => res.json())
            .then(data => {
                console.log('Delete workout response:', data);
                if (data.message === "Delete successful") {
                    notyf.success('Workout deleted successfully!');
                    // Refresh workouts list
                    fetchWorkouts();
                } else {
                    notyf.error('Failed to delete workout. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error deleting workout:', error);
                notyf.error('Failed to delete workout. Please try again.');
            });
        }
    };
    
    // Function to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>My Fitness Tracker</h1>
                <Button variant="primary" id="addWorkout" onClick={() => setShowAddModal(true)}>
                    Add Workout
                </Button>
            </div>
            
            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                <>
                    {/* Stats Overview */}
                    <Row className="mb-4">
                        <Col md={3}>
                            <Card className="shadow-sm text-center h-100">
                                <Card.Body>
                                    <h2>{stats.total}</h2>
                                    <Card.Text>Total Workouts</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="shadow-sm text-center h-100 border-success">
                                <Card.Body>
                                    <h2>{stats.completed}</h2>
                                    <Card.Text>Completed</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="shadow-sm text-center h-100 border-warning">
                                <Card.Body>
                                    <h2>{stats.pending}</h2>
                                    <Card.Text>Pending</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="shadow-sm text-center h-100 border-info">
                                <Card.Body>
                                    <h2>{stats.totalDuration}</h2>
                                    <Card.Text>Total Minutes</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    
                    {/* Weekly Progress Chart */}
                    {workouts.length > 0 && (
                        <Card className="shadow-sm mb-4">
                            <Card.Body>
                                <h3 className="mb-3">Weekly Activity</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={stats.weeklyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                        <Tooltip />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="workouts" name="Number of Workouts" fill="#8884d8" />
                                        <Bar yAxisId="right" dataKey="duration" name="Duration (minutes)" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    )}
                    
                    {/* Workouts List */}
                    <h3 className="mb-3">Your Workouts</h3>
                    {workouts.length === 0 ? (
                        <div className="text-center py-5 bg-light rounded">
                            <h4>No workouts found. Start by adding your first workout!</h4>
                            <Button 
                                variant="primary" 
                                className="mt-3" 
                                onClick={() => setShowAddModal(true)}
                            >
                                Add Your First Workout
                            </Button>
                        </div>
                    ) : (
                        <Row>
                            {workouts.map(workout => (
                                <Col md={4} className="mb-4" key={workout._id}>
                                    <Card className="h-100 shadow-sm workout-card">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-start">
                                                <Card.Title>{workout.name}</Card.Title>
                                                <Badge bg={workout.status === 'Completed' ? 'success' : 'warning'}>
                                                    {workout.status}
                                                </Badge>
                                            </div>
                                            <Card.Subtitle className="mb-2 text-muted">
                                                {workout.duration} minutes
                                            </Card.Subtitle>
                                            <Card.Text>
                                                <small className="text-muted">
                                                    Added on {formatDate(workout.dateAdded)}
                                                </small>
                                            </Card.Text>
                                        </Card.Body>
                                        <Card.Footer className="bg-white d-flex justify-content-between">
                                            {workout.status !== 'Completed' && (
                                                <Button 
                                                    variant="outline-success" 
                                                    size="sm"
                                                    onClick={() => completeWorkout(workout._id)}
                                                >
                                                    Mark Complete
                                                </Button>
                                            )}
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                onClick={() => deleteWorkout(workout._id)}
                                                className={workout.status !== 'Completed' ? 'ms-auto' : ''}
                                            >
                                                Delete
                                            </Button>
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </>
            )}
            
            {/* Add Workout Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Workout</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={addWorkout}>
                        <Form.Group className="mb-3">
                            <Form.Label>Workout Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={newWorkout.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Morning Run, Weight Training"
                                required
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Duration (minutes)</Form.Label>
                            <Form.Control
                                type="number"
                                name="duration"
                                value={newWorkout.duration}
                                onChange={handleInputChange}
                                placeholder="e.g., 30"
                                required
                                min="1"
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                name="status"
                                value={newWorkout.status}
                                onChange={handleInputChange}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                            </Form.Select>
                        </Form.Group>
                        
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Add Workout
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}