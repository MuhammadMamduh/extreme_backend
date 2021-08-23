const express = require('express');
require('./db/mongoose'); // MUST get loaded 
const cors = require('cors');

const userRouter = require('./routers/user');
const monumentRouter = require('./routers/monument');

const app = express();

app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(monumentRouter);


module.exports = app