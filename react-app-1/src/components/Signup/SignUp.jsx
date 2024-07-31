import React, { useState } from 'react';
import './SignUp.css';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const validateForm = () => {
        if (!username) {
            setError('Username is required');
            return false;
        }
        if (!email) {
            setError('Email is required');
            return false;
        }
        if (!password) {
            setError('Password is required');
            return false;
        }
        // Additional validation for email format and password strength can be added here
        return true;
    };

    const handleSignUp = () => {
        if (!validateForm()) {
            return;
        }

        fetch('http://localhost:5000/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'User added successfully') {
                setSuccess('User registered successfully! You can now log in.');
                setError('');
                // Optionally, redirect to login page
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.message);
                setSuccess('');
            }
        })
        .catch(error => {
            console.error('Error during sign-up:', error);
            setError('Failed to register. Please try again later.');
            setSuccess('');
        });
    };

    return (
        <div className="signup-container">
            <h1>Sign Up</h1>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <input
                type="text"
                placeholder="Enter your username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Enter your password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleSignUp}>Sign Up</button>
        </div>
    );
};

export default SignUp;
