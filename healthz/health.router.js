const {checkHealth} = require('./health.controller')

const router = require('express').Router();
router.get('/', checkHealth)
module.exports = router