from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from flask_mysqldb import MySQL

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# MySQL Configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'realtimechat'  # Your database name
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'  # Return results as dictionaries

mysql = MySQL(app)

users = {}

@app.route('/')
def index():
    return "Welcome to my Flask API!"

@app.route('/api/users', methods=['GET'])
def get_users():
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT * FROM users')
    users = cursor.fetchall()
    cursor.close()
    return jsonify(users)

@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    cursor = mysql.connection.cursor()
    cursor.execute('INSERT INTO users (username, mail, password) VALUES (%s, %s, %s)', (username, email, password))
    mysql.connection.commit()
    cursor.close()

    return jsonify({'message': 'User added successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT * FROM users WHERE username = %s', (username,))
    user = cursor.fetchone()
    cursor.close()

    if user:
        # Check if passwords match (you might need to adjust this depending on how passwords are stored)
        if user['password'] == password:
            return jsonify({'success': True, 'user': {'username': user['username'], 'email': user['mail']}})
        else:
            return jsonify({'success': False, 'message': 'Invalid password'}), 401
    else:
        return jsonify({'success': False, 'message': 'Invalid username'}), 401

@socketio.on('join')
def handle_join(data):
    username = data['username']
    email = data['email']
    users[request.sid] = username
    emit('userJoined', {'username': username}, broadcast=True)
    print(f"{username} joined the chat.")

@socketio.on('sendPrivateMessage')
def handle_send_message(data):
    message = data['message'].strip()  # Remove leading/trailing whitespace
    to_user = data['to']
    from_user = users.get(request.sid)

    if not message:
        emit('emptyMessageError', {'error': 'Please write your message.'}, room=request.sid)
        return

    # Find the session ID for the receiver
    to_sid = next((sid for sid, user in users.items() if user == to_user), None)

    if to_sid:
        # Check if the message is a photo URL (you can adjust the condition based on your requirements)
        is_photo = message.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))
        emit('receivePrivateMessage', {
            'message': message,
            'from': from_user,
            'isPhoto': is_photo
        }, room=to_sid)
        emit('receivePrivateMessage', {
            'message': message,
            'from': from_user,
            'isPhoto': is_photo
        }, room=request.sid)
    else:
        emit('userNotFoundError', {'error': f"User '{to_user}' not found."}, room=request.sid)

@socketio.on('startDraw')
def handle_start_draw(data):
    emit('draw', data, broadcast=True)

@socketio.on('draw')
def handle_draw(data):
    emit('draw', data, broadcast=True)

@socketio.on('clearCanvas')
def handle_clear_canvas():
    print("Clear canvas event received on server, broadcasting to all clients.")
    emit('clearCanvas', broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    username = users.pop(request.sid, 'Unknown user')
    emit('userLeft', {'username': username}, broadcast=True)
    print(f"{username} left the chat.")

if __name__ == '__main__':
    socketio.run(app, debug=True)
