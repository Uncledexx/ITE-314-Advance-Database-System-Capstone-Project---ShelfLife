const db = require('../config/database');

function getAllCategories(callback) {
    const sql = 'SELECT * FROM categories';

    db.query(sql, callback);
}

module.exports = {
    getAllCategories
};