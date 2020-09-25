const express = require('express');
const app = express('server');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(3001);
console.log("http://localhost:3001");
