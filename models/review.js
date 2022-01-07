
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const reviewSchema = Schema({
    body : String,
    rating: Number,
    author:
    {
        type: Schema.Types.ObjectId, ref : 'User'  
    },
})

const review = mongoose.model("Review", reviewSchema);

module.exports = review;