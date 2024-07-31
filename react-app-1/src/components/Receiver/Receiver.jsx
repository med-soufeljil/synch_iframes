import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Receiver = ({ onReceiverSelected }) => {
    const [toUser, setToUser] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSelectReceiver = () => {
        if (toUser.trim()) {
            onReceiverSelected(toUser.trim());
            setError('');
            navigate('/chat');
        } else {
            setError('Please select the receiver');
        }
    };

    return (
        <div className="select-receiver">
            <h1>Select Receiver</h1>
            <input
                type="text"
                placeholder="Enter receiver's name..."
                value={toUser}
                onChange={(e) => setToUser(e.target.value)}
            />
            <button onClick={handleSelectReceiver}>Select Receiver</button>
            {error && <div className="error">{error}</div>}
        </div>
    )
}