const db = require('../config/database');

async function getDashboardData(userId) {
    const connection = db.promise();

    // Get pantry statistics.
    const [statsRows] = await connection.query(
        `
        SELECT
            COUNT(*) AS total_items,

            COALESCE(SUM(quantity), 0) AS total_quantity,

            COALESCE(SUM(
                CASE
                    WHEN expiration_date >= CURDATE()
                    AND expiration_date <= DATE_ADD(
                        CURDATE(),
                        INTERVAL 7 DAY
                    )
                    THEN 1
                    ELSE 0
                END
            ), 0) AS expiring_soon,

            COALESCE(SUM(
                CASE
                    WHEN expiration_date < CURDATE()
                    THEN 1
                    ELSE 0
                END
            ), 0) AS expired_items

        FROM pantry_items
        WHERE user_id = ?
        `,
        [userId]
    );

    // Get consumption statistics.
    const [historyRows] = await connection.query(
        `
        SELECT
            COUNT(*) AS consumption_records,
            COALESCE(SUM(quantity), 0) AS total_consumed
        FROM consumption_history
        WHERE user_id = ?
        `,
        [userId]
    );

    // Get the five most recently added pantry items.
    const [recentItems] = await connection.query(
        `
        SELECT
            pantry_items.id,
            pantry_items.name,
            pantry_items.quantity,
            pantry_items.expiration_date,
            categories.name AS category_name
        FROM pantry_items

        INNER JOIN categories
            ON pantry_items.category_id = categories.id

        WHERE pantry_items.user_id = ?

        ORDER BY pantry_items.created_at DESC
        LIMIT 5
        `,
        [userId]
    );

    // Get the five most recent consumption records.
    const [recentHistory] = await connection.query(
        `
        SELECT
            food_name,
            quantity,
            consumed_at
        FROM consumption_history
        WHERE user_id = ?
        ORDER BY consumed_at DESC
        LIMIT 5
        `,
        [userId]
    );

    return {
        stats: statsRows[0],
        historyStats: historyRows[0],
        recentItems,
        recentHistory
    };
}

module.exports = {
    getDashboardData
};