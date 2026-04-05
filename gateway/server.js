const gateway = require('express-gateway');

gateway()
  .load('./config')   
  .run();