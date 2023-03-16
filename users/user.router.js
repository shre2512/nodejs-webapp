const { createUser, getUsersById, updateUser } = require('./user.controller')
const router = require('express').Router();
const {checkUserRouter} = require('../auth/validation');

router.post('/', createUser);
router.get('/:id', checkUserRouter, getUsersById);
router.put('/:id', checkUserRouter, updateUser);

module.exports = router;