const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');

// Database connection
connectDB();
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log("Server is running on port ", port);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  server.close(() => {
    console.log("Server Stopped");
    process.exit(0);
  });
});

