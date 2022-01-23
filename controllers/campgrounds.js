const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");
//--- Show all the campgrounds ---
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
};

//--- Create new Campground ----
module.exports.renderFormNew = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createNewCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f =>({url: f.path, fileName : f.filename})) //map all the img files(multer) and add to campground
    campground.author = req.user._id;                           // we need to add the campground's owner
    await campground.save();
    console.log(campground.images)
    req.flash("success", "Congratulations on successfully creating a new campground!!!")
    res.redirect(`/campgrounds/${campground._id}`)
}
// --- Show campground ----
module.exports.renderShowPage =async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({      //this is a nested populate. We populate all the review from the campground that we are finding
        path: "reviews",                                                        // there are many reviews which were written by many user. We also need to populate the author in every reviews
        populate: {
            path:"author",
        }
        }).populate('author');                                                  //populate is the function of mongoose use to extract all the reviews which is stored as ObjectId in the campground
    if (!campground) {
        req.flash('error', 'cannot find the campground')
        return( res.redirect('/campgrounds'))
    }
    res.render('campgrounds/show', { campground });
}
// ---- Edit campground ----
module.exports.renderFormEdit =async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.editCampground =async (req, res) => {
    const { id } = req.params;
  
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });// using rest operator(...) to take all input for updating
    const imgs =req.files.map(f =>({url: f.path, fileName : f.filename}))   //create an imgs array 
    campground.images.push(...imgs) //using spread oparator(...) take the data from the array, pass that into push..
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);        //using uploader.destroy method from cloudinary to revome the file in cloudinary
        }
        await campground.updateOne({ $pull: { images: { fileName: { $in: req.body.deleteImages } } } }) //Pull from the images array, all images where the filename of that image is in the request
    }
    req.flash("success", "Updated successfully!!!")
    res.redirect(`/campgrounds/${campground._id}`)
}
// ----- Delete Campground -----
//when we delete the campground it would be led to the problem that all the reviews of the campground will be "orphan"
//that mean the review associated with campground still exist in the database
//in order to deleting all the reviews we need to trigger(findByIdAndDelete) the middleware of mongoose which is implemented in campground model.
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted a campground!!!")
    res.redirect('/campgrounds');
}