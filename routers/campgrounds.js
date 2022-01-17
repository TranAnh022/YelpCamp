const express = require("express");
const router = express.Router();

const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn,validateCampground,isAuthor } = require("../middleware/middleware.js");


//--Router--

router.get('/', catchAsync(campgrounds.index));

router.get('/new',isLoggedIn , campgrounds.renderFormNew )


router.post('/',isLoggedIn, validateCampground, catchAsync(campgrounds.createNewCampground))


router.get('/:id', catchAsync(campgrounds.renderShowPage));


router.get('/:id/edit',isLoggedIn,isAuthor ,catchAsync(campgrounds.renderFormEdit))


router.put('/:id',isLoggedIn,isAuthor, validateCampground, catchAsync(campgrounds.editCampground));


router.delete('/:id',isLoggedIn,isAuthor ,catchAsync(campgrounds.deleteCampground));


module.exports = router;