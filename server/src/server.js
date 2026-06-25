const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

const start = async () => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

start();
