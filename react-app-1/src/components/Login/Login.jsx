import { useState } from 'react';
import { socket } from '../../socket';
import { Link, useNavigate } from 'react-router-dom';


export const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleLogin = () => {
        fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                onLogin({ 
                    username: username, 
                    email: email});
                setEmail(data.user.email);
                localStorage.setItem('chatApp1Name', username);
                localStorage.setItem('chatApp1Email', data.user.email);

                socket.emit('join', { username, email: data.user.email, password });

                navigate("/select-receiver");
            } else {
                setError(data.message);
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            setError('Failed to login. Please try again later.');
        });
    };

    return (
        <div className="login">
            <h1>Join Chat App 1</h1>
            {error && <div className="error">{error}</div>}
            <input
                type="text"
                placeholder="Enter your name..."
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
                    <button onClick={handleLogin}>Join the chat</button>
                    <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
                </div>
    )
}