require('dotenv').config();

const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const port = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Connect to Redis
    await connectRedis();

    // 3. Import app AFTER Redis connected
    const app = require('./app');

    // 4. Start Express server
    server = app.listen(port, () => {
      console.log(`App running on port ${port} in ${process.env.NODE_ENV} mode...`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});