if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();             //we are running in development mode
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session =require('express-session')
const flash = require('connect-flash')
const LocalStrategy = require('passport-local');
const passport = require('passport');

const User = require('./models/users.js') // requires the model with Passport-Local Mongoose plugged in

const ExpressError = require('./utils/ExpressError');

const userRouter = require('./routers/users.js')
const campgroundRouter = require('./routers/campgrounds.js')
const reviewRouter = require('./routers/reviews.js');


//-- connect to mongoose ---
const MongoDBStore = require("connect-mongo")(session);

//const dbUrl = process.env.DB_URL
 const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
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

//--session--

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,               // to prevent the Deprecation pop-up in command promt when using session
    saveUninitialized: true,     // to prevent the Deprecation pop-up in command promt when using session
    cookie: {
        httpOnly: true,
       // secure: true,
        exprires: Date.now() + 1000 * 60 * 60 * 24 * 7 , // set the time exprire for one week
        maxAge: 1000 * 60 * 60 * 24 * 7 ,
    }
}

app.use(session(sessionConfig))

app.use(express.urlencoded({ extended: true })); // because the req.body was not parsered lead to we need to use express.urlencoded to parse the request body 
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); // express static to access public folder

//--passport --- app.use session must be executed before passport session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // use static authenticate method of model in LocalStrategy

passport.serializeUser(User.serializeUser()); //store in the session
passport.deserializeUser(User.deserializeUser()) // unstore in the session



//-- middleware for flash(special area of the session used for storing messages. Messages are written to the flash and cleared after being displayed to the user.)
app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;      //we using this middleware(not belong to flash) to check who is a current user.
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})

// ----Route ---
app.use("/", userRouter)
app.use("/campgrounds", campgroundRouter);
app.use('/campgrounds/:id/reviews', reviewRouter) // we using mergeparams in router/reviews.js file to take the id

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

const port = processs.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})