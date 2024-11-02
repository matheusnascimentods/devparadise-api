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
const allowedOrigins = [
    process.env.VERCEL_URL,
];

app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));

app.use(cors({
    origin: function (origin, callback) {
      // Permite origens específicas
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(console.error('Not allowed by CORS'));
      }
    }
}));

//Folder for images
app.use(express.static('public'));

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