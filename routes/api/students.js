const express = require('express');
const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
const { getStudent, getAllStudents, createNewStudent, updateStudent, deleteStudent, archiveStudent } = require('../../controllers/studentsController');
const router = express.Router()

router.route('/')
    .get(verifyRoles(ROLES_LIST.Teacher), getAllStudents)
    .post(verifyRoles( ROLES_LIST.Teacher), createNewStudent)
    .put(verifyRoles(ROLES_LIST.Teacher), updateStudent)
    .delete(verifyRoles(ROLES_LIST.Teacher), deleteStudent)
    .patch(verifyRoles(ROLES_LIST.Teacher), archiveStudent)

router.route('/:id')
    .get(getStudent)

module.exports = router