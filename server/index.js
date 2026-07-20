require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');
const { initSchedulerJob } = require('./jobs/publishScheduled');

const PORT = process.env.PORT || 3000;

// Start Server
const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Initialize background automation workers
  initSchedulerJob();

  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer();
