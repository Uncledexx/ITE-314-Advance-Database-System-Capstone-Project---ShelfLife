const express = require('express');

const router = express.Router();

const historyController = require('../controllers/historyController');
const requireLogin = require('../middleware/authMiddleware');

router.get(
    '/',
    requireLogin,
    historyController.getHistory
);

module.exports = router;