import { validationResult } from 'express-validator';
import { findUserByEmail, verifyPassword } from '../models/forms/login.js';
import { Router } from 'express';
import { loginValidation } from '../middleware/forms/validation.js';

const router = Router();
//displays the login form
const showLoginForm = (req, res) => {
    res.render('login/form', {
        title: 'User Login'
    });
};

/* Checks for validation errors and flashes them if any. Gets the email and password from the request body 
and checks to see if the email exists in the database. Then it checks if the password is valid and deletes the password and saves the users data to
the session. It then decides what to display based on the users role.  */
const processLogin = async (req, res, next) => {

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
        if (!user) {
            req.flash('error', 'Invalid email or password');
            return req.session.save(() => res.redirect('/login'));
        }

        const passwordIsValid = await verifyPassword(password, user.password_hash);
        if (!passwordIsValid) {
            req.flash('error', 'Invalid email or password');
            return req.session.save(() => res.redirect('/login'));
        }

        delete user.password_hash;
        req.session.user = user;
        req.session.save((err) => {
            if (err) return next(err); 
            req.flash('success', 'Successfully logged in');
            const redirectTo = user.role === 'admin' ? '/admin' : '/';
            return res.redirect(redirectTo);
        });

    } catch (error) {
        next(error);
    }
};

// If there isn't a session it redirects login. If there is an active session, it destroys it clears cookies and then redirects to login. 
const processLogout = (req, res, next) => {
    if (!req.session) {
        return res.redirect('/login');
    }

    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
};

router.get('/', showLoginForm);
router.post('/', loginValidation, processLogin);

export default router;
export { processLogout };