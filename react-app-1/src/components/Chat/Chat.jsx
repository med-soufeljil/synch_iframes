import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Canvas from '../Canvas/Canvas';
import { socket } from '../../socket';

function Chat({ username, email, toUser }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState('');
    const [sendDisabled, setSendDisabled] = useState(true);
    const [showCanvas, setShowCanvas] = useState(false);
    const messagesEndRef = useRef(null);

    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video'
    ];

    useEffect(() => {
        const handleReceiveMessage = (data) => {
            setMessages(prevMessages => [...prevMessages, data]);

            if (Notification.permission === 'granted' && data.from !== username) {
                let notificationMessage = data.isPhoto ? `${data.from} sent a photo` : `${data.from}: ${data.message.replace(/<\/?[^>]+(>|$)/g, "")}`;
                new Notification(notificationMessage);
            }
        };

        socket.on('receivePrivateMessage', handleReceiveMessage);

        return () => {
            socket.off('receivePrivateMessage', handleReceiveMessage);
        };
    }, [username]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!toUser.trim()) {
            setError('Please select the receiver');
            return;
        }
        if (message.trim() === '') {
            setError('Please write your message');
            return;
        }

        const msgData = { to: toUser, message, from: username };
        socket.emit('sendPrivateMessage', msgData);
        setMessage('');
        setSendDisabled(true);
        setError('');
    };

    const handleMessageChange = (value) => {
        setMessage(value);
        setError('');
        setSendDisabled(value.trim() === '');
    };

    const handleToggleCanvas = () => {
        setShowCanvas(!showCanvas);
    };

    const handleCanvasClose = () => {
        setShowCanvas(false);
    };

    return (
        <div className="chat">
            <h1>Chat App 1</h1>
            {error && <div className="error">{error}</div>}
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.from === username ? 'my-message' : 'other-message'}`}>
                        <div className="message-bubble">
                            <span>{msg.from === username ? 'me' : msg.from}: </span>
                            <div dangerouslySetInnerHTML={{ __html: msg.message }} />
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="input">
                <ReactQuill
                    value={message}
                    onChange={handleMessageChange}
                    placeholder="Type your message..."
                    modules={modules}
                    formats={formats}
                />
                <button onClick={sendMessage} disabled={sendDisabled} className={`send-button ${sendDisabled ? 'disabled' : ''}`}>
                    Send
                </button>
            </div>
            {!showCanvas && <button onClick={handleToggleCanvas}>Canvas</button>}
            {showCanvas && (
                <div>
                    <Canvas socket={socket} onClose={handleCanvasClose} />
                    <button onClick={handleToggleCanvas}>Return to Chat</button>
                </div>
            )}
        </div>
    );
}

export default Chat;
