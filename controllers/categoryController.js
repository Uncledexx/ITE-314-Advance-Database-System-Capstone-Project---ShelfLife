const categoryModel = require('../models/categoryModel');

function getCategories(req, res) {
    categoryModel.getAllCategories((err, categories) => {
        if (err) {
            console.error('Error getting categories:', err);
            return res.status(500).send('Database error');
        }

        res.render('categories/categories', {
            categories: categories
        });
    });
}

module.exports = {
    getCategories
};