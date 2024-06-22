const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const port = process.env.API_PORT;
const app = express();

//Config JSON response
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//CORS
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

//Folder for images
app.use(express.static('public'));

//Routes
const DevRoutes = require('./routes/DevRoutes');
app.use('/dev', DevRoutes);

const ProjectRoutes = require('./routes/ProjectRoutes');
app.use('/project', ProjectRoutes);

const ContractorRoutes = require('./routes/ContractorRoutes');
app.use('/contractor', ContractorRoutes);

app.listen(port, () => {
    console.log(`Running in port ${port}`);
});