const express = require('express')
const { upload, viewFile, getAllLessons, editLesson, deleteLesson, archiveLesson } = require('../../controllers/uploadController')
const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
const router = express.Router()

router.route('/:classID')
	.get(verifyRoles(ROLES_LIST.Teacher, ROLES_LIST.Admin), getAllLessons)

router.route('/')
	.post(verifyRoles(ROLES_LIST.Teacher, ROLES_LIST.Admin), upload)
	.put(verifyRoles(ROLES_LIST.Teacher, ROLES_LIST.Admin), editLesson)
	.delete(verifyRoles(ROLES_LIST.Teacher, ROLES_LIST.Admin), deleteLesson)
	.patch(verifyRoles(ROLES_LIST.Teacher), archiveLesson)

module.exports = router