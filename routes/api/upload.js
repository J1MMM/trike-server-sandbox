const express = require('express')
const { upload, viewFile, getAllLessons, editLesson, deleteLesson } = require('../../controllers/uploadController')
const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
const router = express.Router()

router.route('/')
	.get(verifyRoles(ROLES_LIST.Teacher, ROLES_LIST.Admin), getAllLessons)
	.post(verifyRoles(ROLES_LIST.Teacher, ROLES_LIST.Admin), upload)
	.put(verifyRoles(ROLES_LIST.Teacher, ROLES_LIST.Admin), editLesson)
	.delete(verifyRoles(ROLES_LIST.Teacher, ROLES_LIST.Admin), deleteLesson)
	
module.exports = router