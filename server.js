
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const pantryRoutes = require('./routes/pantryRoutes');
const requireLogin = require('./middleware/authMiddleware');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

const PORT = 3000;

app.get('/', (req, res) => {
    res.render('home');
});
app.use('/', authRoutes);


app.get('/dashboard', requireLogin, (req, res) => {
    res.render('dashboard/dashboard', {
        user: {
            name: req.session.userName
        }
    });
});


app.use('/categories', categoryRoutes);
app.use('/pantry', pantryRoutes);



app.listen(PORT, () => {
    console.log(`ShelfLife server running at http://localhost:${PORT}`);
});
