const express = require('express')
const router = express.Router()
const { getAllData } = require('../../controllers/franchiseController')

router.route('/')
	.get(getAllData)
	
module.exports = router