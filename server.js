require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express()
const mongoose = require('mongoose')
const cors = require('cors');
const connectDB = require('./config/connectDB');
const errorHandler = require('./middleware/errorHandler');
const corsOption = require('./config/corsOptions');
const { logger, logEvents } = require("./middleware/logEvents");
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const multer = require('multer');
const PORT = process.env.PORT || 3500;
const upload = multer({ storage: multer.memoryStorage() })

// connect to mongooDB 
connectDB();
// custom middleware 
app.use(credentials)
app.use(cors(corsOption))
app.use(logger)

// middleware for form data
app.use(express.urlencoded({ extended: false }));
// middleware for json data 
app.use(express.json());
// middleware for cookie  
app.use(cookieParser())
app.use('/', express.static(path.join(__dirname, '/public')));

//routes
app.use('/', require('./routes/root'))
app.use('/franchise', require('./routes/api/franchise'))

app.use('/auth', require('./routes/api/auth'))
app.use('/refresh', require('./routes/api/refresh'))
app.use('/logout', require('./routes/api/logout'))
app.use('/reset-password', require('./routes/api/resetPassword'));
app.use('/view', require('./routes/api/view'))
// mobile app routes
app.use('/login', require('./routes/api/login'))
app.use('/lesson', require('./routes/api/lesson'))
app.use('/game', require('./routes/api/game'))


// protected routes 
app.use(verifyJWT)
app.use('/students', require('./routes/api/students'))
app.use('/users', require('./routes/api/users'))
app.use('/upload', upload.single('file'), require('./routes/api/upload'));
app.use('/download', require('./routes/api/download'));
app.use('/class', require('./routes/api/class'));

// 404 
app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ error: "404 Not Found" })
    } else {
        res.type('txt').send("404 Not Found")
    }
})
// error handlerr 
app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 server running on port ${PORT}`))
})
