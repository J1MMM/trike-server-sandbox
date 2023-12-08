const express = require('express');
const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
const { getTotalStudents, getAllStudents, createNewStudent, updateStudent, deleteStudent, archiveStudent } = require('../../controllers/studentsController');
const router = express.Router()

router.route('/')
    .get(verifyRoles(ROLES_LIST.Teacher), getTotalStudents)
    .patch(verifyRoles(ROLES_LIST.Teacher), archiveStudent)
    .delete(verifyRoles(ROLES_LIST.Teacher), deleteStudent)
    .post(verifyRoles(ROLES_LIST.Teacher), createNewStudent)
    .put(verifyRoles(ROLES_LIST.Teacher), updateStudent)

router.route('/:classID')
    .get(verifyRoles(ROLES_LIST.Teacher), getAllStudents)


// router.route('/:classID/:id')
//     .get(getStudent)

module.exports = router