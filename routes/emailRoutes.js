const express = require('express');
const emailController = require('../controllers/emailController');

const router = express.Router();

router.get('/getMailSet', emailController.getMailData);

module.exports = router;