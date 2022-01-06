const express = require('express');
const User = require('../models/users');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const passport = require('passport');


// ---- register ---
router.get("/register", (req, res) => {
    res.render('users/register')
})

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registerUser = await User.register(user, password) //using the register method from password middleware
        req.login(registerUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Yelp Camp!")
            res.redirect('/campgrounds')
        })
    } catch (e) { 
        req.flash('error', e.message);
        res.redirect('register');
    }
    
}))

// --- login ----
router.get('/login',(req, res)=> {
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds'      //when user access to any page requires login, after login it will redirect to the current page
    delete req.session.returnTo                                     // keep no remnants(the url) in the session
    res.redirect(redirectUrl)
})

router.get('/logout', (req, res) => {
    req.logout();                   //logout is the helper from passport
    req.flash('success', 'Bye!!!')
    res.redirect('/campgrounds')
})

module.exports =router