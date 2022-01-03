const express = require("express");
const router = express.Router({ mergeParams:true }) // express Router keep params separate. when we using mergeParams:true will merge params in the review file and app.js file
 
const { reviewSchema } = require("../SchemaValidate.js");

const Review = require('../models/review.js')
const Campground = require('../models/campground.js')

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');


//----midleware to validateReview( give the error if the user dont input review)
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//----Router for review----

router.post("/",validateReview,catchAsync(async (req,res)=>{
    const{ id } =req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review); // we push new review into the campgroundschema
    campground.save();
    review.save();
    req.flash("success", "Congratulations on successfully creating a new review!!!")
    res.redirect(`/campgrounds/${id}`)
}));

router.delete("/:reviewId", catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //we using pull method from mongoose to remove(take of) the review from campground but the review still exist in the database
    await Review.findByIdAndDelete(reviewId); // this method will delete the review that the campground remove above
    req.flash("success", "Deleted a revie!!")
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;