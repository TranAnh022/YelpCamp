const express = require("express");
const router = express.Router({ mergeParams:true }) // express Router keep params separate. when we using mergeParams:true will merge params in the review file and app.js file

const ExpressError = require('../utils/ExpressError');

const Review = require('../models/review.js')
const Campground = require('../models/campground.js')

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn,validateReview, isReviewAuthor } = require("../middleware/middleware.js");


//----Router for review----

router.post("/",isLoggedIn,validateReview,catchAsync(async (req,res)=>{
    const{ id } =req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review); // we push new review into the campgroundschema
    await review.save();
    await campground.save();
    req.flash("success", "Congratulations on successfully creating a new review!!!")
    res.redirect(`/campgrounds/${id}`)
}));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor ,catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //we using pull method from mongoose to remove(take of) the review from campground but the review still exist in the database
    await Review.findByIdAndDelete(reviewId); // this method will delete the review that the campground remove above
    req.flash("success", "Deleted a review!!")
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;