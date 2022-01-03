
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const reviewSchema = Schema({
    body : String,
    rating : Number,
})

const review = mongoose.model("Review", reviewSchema);

module.exports = review;