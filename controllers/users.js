const User = require('../models/users');

// ---- Register ----
module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
}

module.exports.createUser = async (req, res, next) => {
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
    
}

// -----Login ----
module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
};

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds'      //when user access to any page requires login, after login it will redirect to the current page
    delete req.session.returnTo                                     // keep no remnants(the url) in the session
    res.redirect(redirectUrl)
}
// ----Logout ----
module.exports.logout = (req, res) => {
    req.logout();                   //logout is the helper from passport
    req.flash('success', 'Bye!!!')
    res.redirect('/campgrounds')
}