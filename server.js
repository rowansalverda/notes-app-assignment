const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const authRouter = require('./routes/authRouter');
const path = require('path');
const { Notes } = require('./models/models');

const app = express(); 
const PORT = 3000; 

const notesRouter = require('./routes/notesRouter'); 

// MIDDLEWARE

app.use(express.json());

app.use('/frontend', express.static(path.join(__dirname, 'frontend')));

const loggedInMiddleware = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.redirect('/frontend/html/login.html');
    }
}

// SESSION MIDDLEWARE SETUP
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(passport.initialize());
app.use(passport.session());

function requireAuth(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) return next();
    return res.status(401).json({ message: 'Unauthorized' });
}

// MONGODB CONNECTION

mongoose.connect('mongodb://localhost:27017/notes-app').then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});

app.use('/app', express.static('public'));

app.use('/auth', authRouter);

app.use('/notes', loggedInMiddleware, notesRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(res.status ?? 500).send(err.message || 'Internal error.');
});

// Serve the static content from the backend when someone accesses the root route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/frontend/html/index.html')
})


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});