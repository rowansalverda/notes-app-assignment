const express = require('express');
const router = express.Router();
const { User } = require('../models/models'); 

const passport = require('passport'); 
const LocalStrategy = require('passport-local').Strategy;

const crypto = require('crypto');

passport.use(new LocalStrategy(async function verify(username, password, callback) {
    try {
        const user = await User.findOne({ username });
        if (!user) { return callback(null, false, { message: 'Incorrect username or password.' }); }

        crypto.pbkdf2(password, Buffer.from(user.passwordSalt, 'base64'), 310000, 32, 'sha256', function (err, hashedPassword) {
            if (err) { return callback(err); }
            if (!crypto.timingSafeEqual(Buffer.from(user.hashedPassword, 'base64'), hashedPassword)) {
                return callback(null, false, { message: 'Incorrect username or password.' });
            }
            return callback(null, user);
        });
    } catch (err) {
        return callback(err);
    }
}));

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, {
            id: user._id,
            username: user.username
        });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

// REGISTERING A NEW USER
router.post('/register', async (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        return next({ message: 'Username and password are required.' });
    }

    const user = await User.findOne({ username: req.body.username });
    if (user) {
        return next({ message: 'Sorry, this username already exists. Please choose a different username!' });
    }

    const salt = crypto.randomBytes(12);

    // *makes a random password so no one can steal information from the database*
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function (err, hashedPassword) {
        if (err) {
            return next('Error while encrypting password');
        }

        try {
            const newUser = await User.create({
                username: req.body.username,
                hashedPassword: hashedPassword.toString('base64'),
                passwordSalt: salt.toString('base64'),
            });

            if (!newUser) {
                return next({ message: 'Sorry, there was an error while creating your user. Please try again later!' });
            }

            res.status(201).json({ message: 'You have registered successfully! Please login to continue.' });

        } catch (error) {
            return next(error);
        }

    });
});

// USER - LOGIN

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).send(info?.message || 'Login failed');
        
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.status(200).json({
                message: 'Logged in',
                user: { id: user._id, username: user.username }
            });
        });
    })(req, res, next);
});

// USER - LOGOUT

router.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/app/login.html'); //res.send()
    });
});

module.exports = router;