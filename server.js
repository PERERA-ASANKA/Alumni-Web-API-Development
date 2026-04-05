require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const { startScheduler } = require('./services/schedulerService');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    
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