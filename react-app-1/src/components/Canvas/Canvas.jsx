import React, { useRef, useState, useEffect } from 'react';
import './Canvas.css';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Canvas = ({ onClose }) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(5);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.8;

        const context = canvas.getContext('2d');
        context.lineCap = 'round';
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        contextRef.current = context;

        // Socket listeners
        socket.on('startDraw', onDrawingEvent);
        socket.on('draw', onDrawingEvent);
        socket.on('clearCanvas', onClearCanvas);

        return () => {
            socket.off('startDraw', onDrawingEvent);
            socket.off('draw', onDrawingEvent);
            socket.off('clearCanvas', onClearCanvas);
        };
    }, [color, lineWidth]);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);

        // Emit start drawing event to server
        socket.emit('startDraw', { type: 'startDraw', x: offsetX, y: offsetY, color, lineWidth });
    };

    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();

        // Emit draw event to server
        socket.emit('draw', { type: 'draw', x: offsetX, y: offsetY, color, lineWidth });
    };

    const clearCanvas = () => {
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Emit clear canvas event to server
        socket.emit('clearCanvas', { type: 'clearCanvas' });
    };

    // Socket event handlers
    const onDrawingEvent = (data) => {
        const { type, x, y, color, lineWidth } = data;
        contextRef.current.strokeStyle = color;
        contextRef.current.lineWidth = lineWidth;

        if (type === 'draw') {
            contextRef.current.lineTo(x, y);
            contextRef.current.stroke();
        } else if (type === 'startDraw') {
            contextRef.current.beginPath();
            contextRef.current.moveTo(x, y);
        }
    };

    const onClearCanvas = () => {
        clearCanvas();
    };

    return (
        <div className="canvas-container">
            <div className="toolbar">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(e.target.value)}
                />
                <button onClick={clearCanvas}>Clear</button>
            </div>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={finishDrawing}
                onMouseMove={draw}
            />
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default Canvas;
