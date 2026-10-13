
const db = require('../config/database');

function getAllPantryItems(userId, filters, callback) {
    // Allow the old function call format to keep working if needed.
    if (typeof filters === 'function') {
        callback = filters;
        filters = {};
    }

    filters = filters || {};

    const search = (filters.search || '').trim();
    const categoryId = filters.categoryId || '';
    const status = filters.status || '';
    const sort = filters.sort || 'expiration_asc';

    let sql = `
        SELECT
            pantry_items.id,
            pantry_items.name,
            pantry_items.quantity,
            pantry_items.purchase_date,
            pantry_items.expiration_date,
            pantry_items.category_id,
            categories.name AS category_name,
            CASE
                WHEN pantry_items.expiration_date < CURDATE()
                    THEN 'expired'
                WHEN pantry_items.expiration_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
                    THEN 'expiring'
                ELSE 'available'
            END AS item_status
        FROM pantry_items
        INNER JOIN categories
            ON pantry_items.category_id = categories.id
        WHERE pantry_items.user_id = ?
    `;

    const params = [userId];

    // Search food names.
    if (search) {
        sql += ' AND pantry_items.name LIKE ?';
        params.push(`%${search}%`);
    }

    // Filter by category.
    if (categoryId) {
        sql += ' AND pantry_items.category_id = ?';
        params.push(categoryId);
    }

    // Filter by expiration status.
    if (status === 'expired') {
        sql += ' AND pantry_items.expiration_date < CURDATE()';
    } else if (status === 'expiring') {
        sql += `
            AND pantry_items.expiration_date >= CURDATE()
            AND pantry_items.expiration_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        `;
    } else if (status === 'available') {
        sql += `
            AND pantry_items.expiration_date > DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        `;
    }

    // Only allow known sort options.
    const sortOptions = {
        expiration_asc: 'pantry_items.expiration_date ASC',
        expiration_desc: 'pantry_items.expiration_date DESC',
        name_asc: 'pantry_items.name ASC',
        name_desc: 'pantry_items.name DESC',
        quantity_asc: 'pantry_items.quantity ASC',
        quantity_desc: 'pantry_items.quantity DESC'
    };

    sql += ` ORDER BY ${sortOptions[sort] || sortOptions.expiration_asc}`;

    db.query(sql, params, callback);
}

function getPantryItemById(id, userId, callback) {
    const sql = `
        SELECT *
        FROM pantry_items
        WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [id, userId], callback);
}

function createPantryItem(
    userId,
    categoryId,
    name,
    quantity,
    purchaseDate,
    expirationDate,
    callback
) {
    const sql = `
        INSERT INTO pantry_items
        (
            user_id,
            category_id,
            name,
            quantity,
            purchase_date,
            expiration_date
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            userId,
            categoryId,
            name,
            quantity,
            purchaseDate,
            expirationDate
        ],
        callback
    );
}

function updatePantryItem(
    id,
    userId,
    categoryId,
    name,
    quantity,
    purchaseDate,
    expirationDate,
    callback
) {
    const sql = `
        UPDATE pantry_items
        SET
            category_id = ?,
            name = ?,
            quantity = ?,
            purchase_date = ?,
            expiration_date = ?
        WHERE id = ? AND user_id = ?
    `;

    db.query(
        sql,
        [
            categoryId,
            name,
            quantity,
            purchaseDate,
            expirationDate,
            id,
            userId
        ],
        callback
    );
}

function deletePantryItem(id, userId, callback) {
    const sql = `
        DELETE FROM pantry_items
        WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [id, userId], callback);
}

function updateQuantity(id, userId, quantity, callback) {
    const sql = `
        UPDATE pantry_items
        SET quantity = ?
        WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [quantity, id, userId], callback);
}

function deletePantryItemById(id, userId, callback) {
    const sql = `
        DELETE FROM pantry_items
        WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [id, userId], callback);
}

module.exports = {
    getAllPantryItems,
    getPantryItemById,
    createPantryItem,
    updatePantryItem,
    deletePantryItem,
    updateQuantity,
    deletePantryItemById
};
