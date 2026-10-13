
const pantryModel = require('../models/pantryModel');
const categoryModel = require('../models/categoryModel');
const historyModel = require('../models/historyModel');

function getPantry(req, res) {
    const userId = req.session.userId;

    const filters = {
        search: req.query.search || '',
        categoryId: req.query.category || '',
        status: req.query.status || '',
        sort: req.query.sort || 'expiration_asc'
    };

    const allowedStatuses = ['', 'available', 'expiring', 'expired'];
    const allowedSorts = [
        'expiration_asc',
        'expiration_desc',
        'name_asc',
        'name_desc',
        'quantity_asc',
        'quantity_desc'
    ];

    if (!allowedStatuses.includes(filters.status)) {
        filters.status = '';
    }

    if (!allowedSorts.includes(filters.sort)) {
        filters.sort = 'expiration_asc';
    }

    // Ignore invalid category IDs instead of filtering by them.
    if (
        filters.categoryId &&
        !/^\d+$/.test(filters.categoryId)
    ) {
        filters.categoryId = '';
    }

    pantryModel.getAllPantryItems(userId, filters, (err, items) => {
        if (err) {
            console.error('Error getting pantry items:', err);
            return res.status(500).send('Database error');
        }

        categoryModel.getAllCategories((categoryErr, categories) => {
            if (categoryErr) {
                console.error('Error getting categories:', categoryErr);
                return res.status(500).send('Database error');
            }

            res.render('pantry/pantry', {
                items: items,
                categories: categories,
                filters: filters
            });
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

    const parsedQuantity = Number(quantity);

    if (
        !name ||
        !category_id ||
        !quantity ||
        !purchase_date ||
        !expiration_date
    ) {
        return res.status(400).send('Please fill in all fields.');
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
        return res.status(400).send('Quantity must be a whole number of at least 1.');
    }

    if (expiration_date < purchase_date) {
        return res.status(400).send('Expiration date cannot be before purchase date.');
    }

    pantryModel.createPantryItem(
        userId,
        category_id,
        name.trim(),
        parsedQuantity,
        purchase_date,
        expiration_date,
        (err) => {
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

    pantryModel.getPantryItemById(itemId, userId, (err, items) => {
        if (err) {
            console.error('Error getting pantry item:', err);
            return res.status(500).send('Database error');
        }

        if (items.length === 0) {
            return res.status(404).send('Pantry item not found.');
        }

        categoryModel.getAllCategories((categoryErr, categories) => {
            if (categoryErr) {
                console.error('Error getting categories:', categoryErr);
                return res.status(500).send('Database error');
            }

            res.render('pantry/edit-item', {
                item: items[0],
                categories: categories
            });
        });
    });
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

    const parsedQuantity = Number(quantity);

    if (
        !name ||
        !category_id ||
        !quantity ||
        !purchase_date ||
        !expiration_date
    ) {
        return res.status(400).send('Please fill in all fields.');
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
        return res.status(400).send('Quantity must be a whole number of at least 1.');
    }

    if (expiration_date < purchase_date) {
        return res.status(400).send('Expiration date cannot be before purchase date.');
    }

    pantryModel.updatePantryItem(
        itemId,
        userId,
        category_id,
        name.trim(),
        parsedQuantity,
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

    pantryModel.deletePantryItem(itemId, userId, (err, result) => {
        if (err) {
            console.error('Error deleting pantry item:', err);
            return res.status(500).send('Database error');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Pantry item not found.');
        }

        res.redirect('/pantry');
    });
}

function consumeItem(req, res) {
    const userId = req.session.userId;
    const itemId = req.params.id;
    const quantityToConsume = Number(req.body.quantity);

    if (!Number.isInteger(quantityToConsume) || quantityToConsume < 1) {
        return res.status(400).send('Quantity consumed must be a whole number of at least 1.');
    }

    pantryModel.getPantryItemById(itemId, userId, (err, items) => {
        if (err) {
            console.error('Error getting pantry item:', err);
            return res.status(500).send('Database error');
        }

        if (items.length === 0) {
            return res.status(404).send('Pantry item not found.');
        }

        const item = items[0];

        if (quantityToConsume > item.quantity) {
            return res.status(400).send(
                'You cannot consume more than the available quantity.'
            );
        }

        historyModel.createHistory(
            item.id,
            userId,
            item.name,
            quantityToConsume,
            (historyErr) => {
                if (historyErr) {
                    console.error('Error creating history:', historyErr);
                    return res.status(500).send('Database error');
                }

                const remainingQuantity = item.quantity - quantityToConsume;

                if (remainingQuantity === 0) {
                    pantryModel.deletePantryItemById(
                        item.id,
                        userId,
                        (deleteErr) => {
                            if (deleteErr) {
                                console.error('Error removing consumed item:', deleteErr);
                                return res.status(500).send('Database error');
                            }

                            res.redirect('/pantry');
                        }
                    );
                } else {
                    pantryModel.updateQuantity(
                        item.id,
                        userId,
                        remainingQuantity,
                        (updateErr) => {
                            if (updateErr) {
                                console.error('Error updating quantity:', updateErr);
                                return res.status(500).send('Database error');
                            }

                            res.redirect('/pantry');
                        }
                    );
                }
            }
        );
    });
}

module.exports = {
    getPantry,
    showAddItem,
    addItem,
    showEditItem,
    updateItem,
    deleteItem,
    consumeItem
};
