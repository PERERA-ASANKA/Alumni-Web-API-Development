require('dotenv').config();
const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 3000;

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );

  await connection.end();
}

async function start() {
  try {
    await ensureDatabaseExists();

    const app = require('./app');
    const { sequelize } = require('./models');
    const { startScheduler } = require('./services/schedulerService');
    
    await sequelize.authenticate();
    console.log('MySQL connected successfully');

    await sequelize.sync({ alter: true });
    console.log('All tables synced');

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`API docs at http://localhost:${PORT}/api-docs`);
    });

    startScheduler();
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();