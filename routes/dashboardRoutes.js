const express = require('express');

const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const requireLogin = require('../middleware/authMiddleware');

router.get(
    '/',
    requireLogin,
    dashboardController.getDashboard
);

module.exports = router;