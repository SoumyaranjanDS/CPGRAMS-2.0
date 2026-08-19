import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  console.log('================================================================');
  console.log('🏛️  CPGRAMS 2.0 (Public Grievance Assistant) Backend Service');
  console.log('    Mission: Reimagining India\'s Public Digital Infrastructure');
  console.log('================================================================');

  // Attempt database connection
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    console.log(`📡 Health Check URL: http://localhost:${env.PORT}/api/v1/health`);
    console.log(`🌍 Client URL: ${env.CLIENT_URL}`);
  });

  // Graceful shutdown handling
  const shutdown = (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('🔒 HTTP Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
