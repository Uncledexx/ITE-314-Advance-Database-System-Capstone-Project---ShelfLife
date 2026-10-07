const bcrypt = require('bcrypt');

const userModel = require('../models/userModel');

function showRegister(req, res) {
    res.render('auth/register');
}

function showLogin(req, res) {
    res.render('auth/login');
}

async function register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.send('Please fill in all fields.');
    }

    userModel.findUserByEmail(email, async (err, users) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).send('Database error');
        }

        if (users.length > 0) {
            return res.send('An account with that email already exists.');
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            userModel.createUser(
                name,
                email,
                hashedPassword,
                (err, result) => {
                    if (err) {
                        console.error('Error creating user:', err);
                        return res.status(500).send('Database error');
                    }

                    res.redirect('/login');
                }
            );
        } catch (error) {
            console.error('Password hashing error:', error);
            res.status(500).send('Server error');
        }
    });
}

async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.send('Please enter your email and password.');
    }

    userModel.findUserByEmail(email, async (err, users) => {
        if (err) {
            console.error('Error finding user:', err);
            return res.status(500).send('Database error');
        }

        if (users.length === 0) {
            return res.send('Invalid email or password.');
        }

        const user = users[0];

        try {
            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatch) {
                return res.send('Invalid email or password.');
            }

            req.session.userId = user.id;
            req.session.userName = user.name;
            req.session.userEmail = user.email;

            res.redirect('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).send('Server error');
        }
    });
}

function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Could not log out.');
        }

        res.redirect('/login');
    });
}

module.exports = {
    showRegister,
    showLogin,
    register,
    login,
    logout
};