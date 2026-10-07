const db = require('../config/database');

function getAllPantryItems(userId, callback) {
    const sql = `
        SELECT 
            pantry_items.id,
            pantry_items.name,
            pantry_items.quantity,
            pantry_items.purchase_date,
            pantry_items.expiration_date,
            categories.name AS category_name
        FROM pantry_items
        INNER JOIN categories
            ON pantry_items.category_id = categories.id
        WHERE pantry_items.user_id = ?
        ORDER BY pantry_items.expiration_date ASC
    `;

    db.query(sql, [userId], callback);
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

module.exports = {
    getAllPantryItems,
    getPantryItemById,
    createPantryItem,
    updatePantryItem,
    deletePantryItem
};