const express = require('express');

const router = express.Router();

const pantryController = require('../controllers/pantryController');
const requireLogin = require('../middleware/authMiddleware');

router.get(
    '/',
    requireLogin,
    pantryController.getPantry
);

router.get(
    '/add',
    requireLogin,
    pantryController.showAddItem
);

router.post(
    '/',
    requireLogin,
    pantryController.addItem
);

router.get(
    '/edit/:id',
    requireLogin,
    pantryController.showEditItem
);

router.post(
    '/edit/:id',
    requireLogin,
    pantryController.updateItem
);

router.post(
    '/delete/:id',
    requireLogin,
    pantryController.deleteItem
);

module.exports = router;