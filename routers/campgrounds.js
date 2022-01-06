const express = require("express");
const router = express.Router();

const { campgroundSchema } = require('../SchemaValidate.js'); // joi-express to validate inputs for campground
const Campground = require('../models/campground');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');


//----midlleware for validateCampground
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//--Router--

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})


router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "Congratulations on successfully creating a new campground!!!")
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate("reviews")
    //populate is the function of mongoose use to extract the data as ObjectId
    if (!campground) {
        req.flash('error', 'cannot find the campground')
        return( res.redirect('/campgrounds'))
    }
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}))

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash("success", "Updated successfully!!!")
    res.redirect(`/campgrounds/${campground._id}`)
}));

//when we delete the campground it would be led to the problem that all the reviews of the campground will be "orphan"
//that mean the review associated with campground still exist in the database
//in order to deleting all the reviews we need to trigger(findByIdAndDelete) the middleware of mongoose which is implemented in campground model.
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted a campground!!!")
    res.redirect('/campgrounds');
}));


module.exports = router;