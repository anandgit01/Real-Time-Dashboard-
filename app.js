const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mysql = require('mysql2');
const cors = require('cors');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

app.use(cors());
// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dashboard',
});

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

// Create Socket.IO instance
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
  },
});

let queryObserver = null;

// Handle client WebSocket connections
io.on('connection', (socket) => {
  console.log('Client connected');

  // Fetch and emit initial data
  fetchData();

  // Clean up resources when client disconnects
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Fetch data from the database and emit updates
function fetchData() {
  const query = connection.query('SELECT * FROM dashboard_data');
  queryObserver = query.stream().on('data', (row) => {
    // Emit a WebSocket event to notify clients about the change
    io.sockets.emit('dataUpdate', row);
    console.log('Emitting update:', row);
  });
}

// Log server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Refresh the data every minute
setInterval(() => {
  if (connection.state === 'disconnected') {
    connection.connect();
  }
  console.log('Fetching data...');
  fetchData();
}, 1000);
