import {validationResult } from 'express-validator';
import { findUserByEmail, verifyPassword } from '../models/forms/login.js';
import { Router } from 'express';
import { loginValidation } from '../middleware/forms/validation.js';

const router = Router();

/**
 * Display the login form.
 */
const showLoginForm = (req, res) => {
    res.render('login/form', {
        title: 'User Login'
    })
};

const processLogin = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
        req.flash('error', error.msg);
        });
        return res.redirect('/login');
    }

    const { email, password } = req.body;

    try {

        const user = await findUserByEmail(email);

        if(!user){
            req.flash('error', 'Invalid email or password')
            return res.redirect('/login');
        }

        const passwordIsValid = await verifyPassword(password, user.password_hash);

        if(!passwordIsValid){
            req.flash('error', 'Invalid email or password')
            return res.redirect('/login');
        }


        delete user.password_hash;
        req.flash('success', 'Successfully logged in')
        req.session.user = user;
        return res.redirect('/')
        
    } catch (error) {
        console.error("Error during login:", error)
        req.flash('error', 'Error during login')
        return res.redirect('/login');
    }
};

const processLogout = (req, res) => {

    if (!req.session) {
        return res.redirect('/login');
    }

    req.session.destroy((err) => {
        if (err) {

            console.error('Error destroying session:', err);

            res.clearCookie('connect.sid');

            return res.redirect('/login');
        }

        res.clearCookie('connect.sid');

        res.redirect('/login');
    });
};



// Routes
router.get('/', showLoginForm);
router.post('/', loginValidation, processLogin);

// Export router as default, and specific functions for root-level routes
export default router;
export { processLogout };