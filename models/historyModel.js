const db = require('../config/database');

function createHistory(
    pantryItemId,
    userId,
    foodName,
    quantity,
    callback
) {
    const sql = `
        INSERT INTO consumption_history
        (
            pantry_item_id,
            user_id,
            food_name,
            quantity
        )
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            pantryItemId,
            userId,
            foodName,
            quantity
        ],
        callback
    );
}

function getHistoryByUser(userId, callback) {
    const sql = `
        SELECT
            id,
            food_name,
            quantity,
            consumed_at
        FROM consumption_history
        WHERE user_id = ?
        ORDER BY consumed_at DESC
    `;

    db.query(
        sql,
        [userId],
        callback
    );
}

module.exports = {
    createHistory,
    getHistoryByUser
};