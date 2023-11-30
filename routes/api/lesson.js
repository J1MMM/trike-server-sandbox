const express = require('express')
const router = express.Router()
const { getAllLessons } = require('../../controllers/lessonController')
router.route('/')
	.post(getAllLessons)
	
module.exports = router