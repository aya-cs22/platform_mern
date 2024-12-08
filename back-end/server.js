const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
dotenv.config({ path: 'config.env' });
const dbConnection = require('./config/db');
const userController = require('./controllers/userController');
const cron = require('node-cron');
const Groups = require('./models/groups.js');
const userGroups = require('./models/userGroups');
const cloudinary = require('cloudinary').v2;

// Connect with DB
dbConnection();

// express app
const app = express();

// middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log(`mode: ${process.env.NODE_ENV}`);
}



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Routes
const userRoutes = require('./routes/userRoutes');
const groupsRoutes = require('./routes/groupsRoutes');
const lectureRoutes = require('./routes/lectureRoutes.js');
const quizeRoutes = require('./routes/quizeRoutes.js');
const JoinRequestsRoutes = require('./routes/JoinRequestsRoutes.js')
const userGroupsRoutes = require('./routes/userGroupsRoutes.js')
app.use('/api/users', userRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/quize', quizeRoutes);
app.use('/api/JoinRequests', JoinRequestsRoutes);
app.use('/api/userGroups', userGroupsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


setInterval(() => {
    userController.checkVerificationTimeout();
}, 60 * 60 * 1000);
// require('./tasks/scheduler.js')

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});