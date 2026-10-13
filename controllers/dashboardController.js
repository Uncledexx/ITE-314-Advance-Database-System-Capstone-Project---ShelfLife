const dashboardModel = require('../models/dashboardModel');

async function getDashboard(req, res) {
    try {
        const userId = req.session.userId;

        const data = await dashboardModel.getDashboardData(userId);

        res.render('dashboard/dashboard', {
            user: {
                name: req.session.userName
            },
            stats: data.stats,
            historyStats: data.historyStats,
            recentItems: data.recentItems,
            recentHistory: data.recentHistory
        });

    } catch (error) {
        console.error('Error loading dashboard:', error);

        res.status(500).send(
            'Unable to load dashboard data.'
        );
    }
}

module.exports = {
    getDashboard
};