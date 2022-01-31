const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,
    fileName: String,
})
//'https://res.cloudinary.com/dirbmyqcl/image/upload/w_200/v1642598942/YelpCamp/rprjvpmzsmnieeuiaeqq.jpg'
//adding virtual schema to resize the img to 200px
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload','/upload/w_200')
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author:
    {
        type: Schema.Types.ObjectId, ref : 'User'  
    },
    reviews :[
    {
        type: Schema.Types.ObjectId, ref: 'Review' 
    }]
},opts );

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
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