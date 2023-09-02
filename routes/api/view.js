const express = require('express')
const { upload, viewFile, getAllLessons, editLesson, deleteLesson } = require('../../controllers/uploadController')
const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
const router = express.Router()

	
router.get('/:filename', viewFile)

module.exports = router