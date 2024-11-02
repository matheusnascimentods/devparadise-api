const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const showLogs = require('./helpers/show-logs');

const port = process.env.API_PORT;
const app = express();

//Config JSON response
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//CORS
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));

//Folder for images
app.use(express.static('public'));

// //Logs
// app.use(showLogs);

//Routes
const UserRoutes = require('./routes/UserRoutes');
app.use('/user', UserRoutes);

const ProjectRoutes = require('./routes/ProjectRoutes');
app.use('/project', ProjectRoutes);

const ConnectionRoutes = require('./routes/ConnectionRoutes');
app.use('/connection', ConnectionRoutes);

app.listen(port, () => {
    console.log(`Running in port ${port}`);
});