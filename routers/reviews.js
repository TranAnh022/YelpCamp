const express = require("express");
const router = express.Router({ mergeParams:true }) // express Router keep params separate. when we using mergeParams:true will merge params in the review file and app.js file

const reviews = require('../controllers/reviews')

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn,validateReview, isReviewAuthor } = require("../middleware/middleware.js");


//----Router for review----

router.post("/",isLoggedIn,validateReview,catchAsync(reviews.createReview));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor ,catchAsync(reviews.deleteReview))

module.exports = router;