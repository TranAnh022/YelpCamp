const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session =require('express-session')
const flash = require('connect-flash')

const ExpressError = require('./utils/ExpressError');
const campground = require('./routers/campgrounds.js')
const review = require('./routers/reviews.js')


//-- connect to mongoose
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true })); // because the req.body was not parsered lead to we need to use express.urlencoded to parse the request body 
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); // express static to access public folder

//--session--
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,               // to prevent the Deprecation pop-up in command promt when using session
    saveUninitialized: true,     // to prevent the Deprecation pop-up in command promt when using session
    cookie: {
        httpOnly: true,
        exprires: Date.now() + 1000 * 60 * 60 * 24 * 7 , // set the time exprire for one week
        maxAge: 1000 * 60 * 60 * 24 * 7 ,
    }
}

app.use(session(sessionConfig))

//-- middleware for flash(special area of the session used for storing messages. Messages are written to the flash and cleared after being displayed to the user.)
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})

app.use("/campgrounds", campground);
app.use('/campgrounds/:id/review', review) // we using mergeparams in router/reviews.js file to take the id

app.get('/', (req, res) => {
    res.render('home.ejs');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(4000, () => {
    console.log('Serving on port 4000')
})