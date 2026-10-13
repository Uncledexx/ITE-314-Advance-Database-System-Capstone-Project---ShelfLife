const historyModel = require('../models/historyModel');

function getHistory(req, res) {
    const userId = req.session.userId;

    historyModel.getHistoryByUser(
        userId,
        (err, history) => {

            if (err) {
                console.error(
                    'Error getting consumption history:',
                    err
                );

                return res.status(500).send(
                    'Database error'
                );
            }

            res.render(
                'history/history',
                {
                    history: history
                }
            );
        }
    );
}

module.exports = {
    getHistory
};