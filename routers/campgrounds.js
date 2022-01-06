const express = require("express");
const router = express.Router();

const Campground = require('../models/campground');

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn,validateCampground,isAuthor } = require("../middleware/middleware.js");


//--Router--

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

router.get('/new',isLoggedIn ,(req, res) => {
    res.render('campgrounds/new');
})


router.post('/',isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;                           // we need to add the campground's owner
    await campground.save();
    req.flash("success", "Congratulations on successfully creating a new campground!!!")
    res.redirect(`/campgrounds/${campground._id}`)
}))


router.get('/:id', catchAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate("reviews").populate('author');
    //populate is the function of mongoose use to extract the data as ObjectId.
    //We need to use this method to extract all the reviews which is stored as ObjectId in the campground
    console.log(campground)
    if (!campground) {
        req.flash('error', 'cannot find the campground')
        return( res.redirect('/campgrounds'))
    }
    res.render('campgrounds/show', { campground });
}));


router.get('/:id/edit',isLoggedIn,isAuthor ,catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))


router.put('/:id',isLoggedIn,isAuthor, validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash("success", "Updated successfully!!!")
    res.redirect(`/campgrounds/${campground._id}`)
}));

//when we delete the campground it would be led to the problem that all the reviews of the campground will be "orphan"
//that mean the review associated with campground still exist in the database
//in order to deleting all the reviews we need to trigger(findByIdAndDelete) the middleware of mongoose which is implemented in campground model.
router.delete('/:id',isLoggedIn,isAuthor ,catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted a campground!!!")
    res.redirect('/campgrounds');
}));


module.exports = router;