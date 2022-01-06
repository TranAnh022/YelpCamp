const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author:
    {
        type: Schema.Types.ObjectId, ref : 'User'  
    },
    reviews :[
    {
        type: Schema.Types.ObjectId, ref: 'Review' 
    }]
});

//--- middleware of deleting all the reviews associated with campgrounds when deleting campgrounds

CampgroundSchema.post('findOneAndDelete', async function (doc) { // doc is a campground that we deleted
 if (doc) {
      await review.deleteMany({
       _id: {                                                   // there are the id field(objectID) in the doc that was just deleted 
             $in:doc.reviews
          }
      })
  }
})


module.exports = mongoose.model('Campground', CampgroundSchema);