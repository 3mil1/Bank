const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
// Import Routes
const routes = require('./routes');
const swagger = require("./swagger");
const {processTransactions} = require("./middlewares");

dotenv.config();

// Connect to DB
mongoose.connect(
    process.env.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true},
    () => console.log('connected to db!'));

//Middleware
processTransactions();
app.use(express.json());
// Route Middlewares
app.use('/', routes);

app.listen(3000, () => console.log('Server Up and running'));
