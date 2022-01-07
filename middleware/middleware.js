const ExpressError = require('../utils/ExpressError');

const { campgroundSchema } = require('../SchemaValidate.js'); // joi-express to validate inputs for campground
const { reviewSchema } = require("../SchemaValidate.js");     //  joi-express to validate inputs for reviews

const Campground = require('../models/campground');
const Review = require('../models/review');


// the function make sure that user have to login before using 
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {                       //isAuthenticate is helper method from passport use to require authentication before user create a new campground
        req.session.returnTo = req.originalUrl;         //this session returnto help us to save the path which use to redirect to the current page when login
        req.flash('error', 'you must be signed in!!!')
        return res.redirect('/login')
    }
    next();
}

//----midlleware for validateCampground
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;                    //we use the id(campgroundId) to redirect to campground
    const review = await Review.findById(reviewId);         //reviewId to find the review that you own
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// -- middleware isAuthor is determine the current user have the permission to access and change data of the campground.the purpose of this middleware is protect the route prevent unpermitted access
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You dont have permission')
        res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//----midleware to validateReview( give the error if the user dont input review)
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}



