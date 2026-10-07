const pantryModel = require('../models/pantryModel');
const categoryModel = require('../models/categoryModel');

function getPantry(req, res) {
    const userId = req.session.userId;

    pantryModel.getAllPantryItems(userId, (err, items) => {
        if (err) {
            console.error('Error getting pantry items:', err);
            return res.status(500).send('Database error');
        }

        res.render('pantry/pantry', {
            items: items
        });
    });
}

function showAddItem(req, res) {
    categoryModel.getAllCategories((err, categories) => {
        if (err) {
            console.error('Error getting categories:', err);
            return res.status(500).send('Database error');
        }

        res.render('pantry/add-item', {
            categories: categories
        });
    });
}

function addItem(req, res) {
    const userId = req.session.userId;

    const {
        name,
        category_id,
        quantity,
        purchase_date,
        expiration_date
    } = req.body;

    if (
        !name ||
        !category_id ||
        !quantity ||
        !purchase_date ||
        !expiration_date
    ) {
        return res.send('Please fill in all fields.');
    }

    if (quantity < 1) {
        return res.send('Quantity must be at least 1.');
    }

    pantryModel.createPantryItem(
        userId,
        category_id,
        name,
        quantity,
        purchase_date,
        expiration_date,
        (err, result) => {
            if (err) {
                console.error('Error adding pantry item:', err);
                return res.status(500).send('Database error');
            }

            res.redirect('/pantry');
        }
    );
}

function showEditItem(req, res) {
    const userId = req.session.userId;
    const itemId = req.params.id;

    pantryModel.getPantryItemById(
        itemId,
        userId,
        (err, items) => {
            if (err) {
                console.error('Error getting pantry item:', err);
                return res.status(500).send('Database error');
            }

            if (items.length === 0) {
                return res.status(404).send('Pantry item not found.');
            }

            categoryModel.getAllCategories((err, categories) => {
                if (err) {
                    console.error('Error getting categories:', err);
                    return res.status(500).send('Database error');
                }

                res.render('pantry/edit-item', {
                    item: items[0],
                    categories: categories
                });
            });
        }
    );
}

function updateItem(req, res) {
    const userId = req.session.userId;
    const itemId = req.params.id;

    const {
        name,
        category_id,
        quantity,
        purchase_date,
        expiration_date
    } = req.body;

    if (
        !name ||
        !category_id ||
        !quantity ||
        !purchase_date ||
        !expiration_date
    ) {
        return res.send('Please fill in all fields.');
    }

    if (quantity < 1) {
        return res.send('Quantity must be at least 1.');
    }

    pantryModel.updatePantryItem(
        itemId,
        userId,
        category_id,
        name,
        quantity,
        purchase_date,
        expiration_date,
        (err, result) => {
            if (err) {
                console.error('Error updating pantry item:', err);
                return res.status(500).send('Database error');
            }

            if (result.affectedRows === 0) {
                return res.status(404).send('Pantry item not found.');
            }

            res.redirect('/pantry');
        }
    );
}

function deleteItem(req, res) {
    const userId = req.session.userId;
    const itemId = req.params.id;

    pantryModel.deletePantryItem(
        itemId,
        userId,
        (err, result) => {
            if (err) {
                console.error('Error deleting pantry item:', err);
                return res.status(500).send('Database error');
            }

            if (result.affectedRows === 0) {
                return res.status(404).send('Pantry item not found.');
            }

            res.redirect('/pantry');
        }
    );
}

module.exports = {
    getPantry,
    showAddItem,
    addItem,
    showEditItem,
    updateItem,
    deleteItem
};