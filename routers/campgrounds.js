const express = require("express");
const router = express.Router();

const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn,validateCampground,isAuthor } = require("../middleware/middleware.js");
const multer = require('multer')    // multer is a framework of nodejs using to handle multipart/form-data when upload file
const { storage } = require('../cloudinary')
const upload =multer({storage}) // using multer to upload the file into cloudinary

//--Router--

router.get('/', catchAsync(campgrounds.index));

router.get('/new',isLoggedIn , campgrounds.renderFormNew )


router.post('/',isLoggedIn,upload.array('image') ,validateCampground, catchAsync(campgrounds.createNewCampground))


router.get('/:id', catchAsync(campgrounds.renderShowPage));


router.get('/:id/edit',isLoggedIn,isAuthor ,catchAsync(campgrounds.renderFormEdit))


router.put('/:id',isLoggedIn,isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.editCampground));


router.delete('/:id',isLoggedIn,isAuthor ,catchAsync(campgrounds.deleteCampground));


module.exports = router;