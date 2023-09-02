const express = require('express')
const { handleDownload } = require('../../controllers/downloadController')
const router = express.Router()

router.get('/:filename', handleDownload)

module.exports = router