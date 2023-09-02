const express = require('express');
const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
const { getStudent, getAllStudents, createNewStudent, updateStudent, deleteStudent } = require('../../controllers/studentsController');
const router = express.Router()

router.route('/')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Teacher), getAllStudents)
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Teacher), createNewStudent)
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Teacher), updateStudent)
    .delete(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Teacher), deleteStudent)

router.route('/:id')
    .get(getStudent)

module.exports = router