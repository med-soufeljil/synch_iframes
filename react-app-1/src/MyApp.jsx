import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from 'react';
import { Login } from "./components/Login/Login";
import './App.css';
import SignUp from "./components/Signup/SignUp";
import Chat from "./components/Chat/Chat";
import { Receiver } from "./components/Receiver/Receiver";

export const MyApp = () => {
    const [loggedInUser, setLoggedInUser] = useState({
        username: '',
        email: '',
    });
    const [receiver, setReceiver] = useState('');

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login onLogin={setLoggedInUser}/>}/>
                <Route path="/signup" element={<SignUp />}/>
                <Route path="/login" element={<Login onLogin={setLoggedInUser}/>}/>
                {loggedInUser.username && loggedInUser.email ? <Route path="/select-receiver" element={<Receiver onReceiverSelected={setReceiver}/>}/> : null}
                {loggedInUser.username && loggedInUser.email && receiver ? <Route path="/chat" element={<Chat username={loggedInUser.username} toUser={receiver} email={loggedInUser.email}/>}/> : null}
                <Route path="*" element={<h1>Page Not Found</h1>}/>
            </Routes>
        </BrowserRouter>
    )
}