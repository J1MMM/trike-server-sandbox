const express = require('express')
const router = express.Router()
const { updateStudents } = require('../../controllers/gameController')
router.route('/')
    .post(updateStudents)

module.exports = router