import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, getAllUsers, deleteUser } from '../models/forms/registration.js'; // Fix 1: corrected path (was ../../), added deleteUser
import { requireLogin } from '../middleware/auth.js';
const router = Router();

const registrationValidation = [
    body('name')
    .trim()
    .isLength({ min: 2})
    .withMessage("Name must be at least 2 characters."),
    body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Must be a valid email address."),
    body('emailConfirm')
    .trim()
    .isEmail()
    .normalizeEmail()
    .custom((value, { req }) => value === req.body.email)
    .withMessage("Emails must match."),
    body('password')
    .trim()
    .isLength({ min: 8 })
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*]/)
    .withMessage("Password must contain at least one special character"),
    body('password-confirm')
    .custom((value, {req}) => value === req.body.password)
    .withMessage("Passwords must match")
];

const showRegistrationForm = (req, res) => {
    res.render('registration/form', { title: 'User Registration' });
};

const processRegistration = async (req, res) => { 
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('warning', error.msg);
        });
        return res.redirect('/register');
    }
    const { name, email, password } = req.body;

    try {
        const emailAlreadyExists = await emailExists(email);
        if (emailAlreadyExists) {
            req.flash('warning', 'An account with this email already exists.');
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await saveUser(name, email, hashedPassword);

        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');

    } catch (error) {
        console.error('Error saving registration:', error);
        req.flash('error', 'Unable to complete registration. Please try again later.');
        res.redirect('/register');
    }
};

const showAllUsers = async (req, res) => {
    let users = [];

    try {
        users = await getAllUsers();
    } catch (error) {
        console.error('Error retrieving users:', error);
    }

    res.render('admin/manage-users', {
        title: 'Registered Users',
        users,
        user: req.session && req.session.user ? req.session.user : null
    });
};

const processDeleteAccount = async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;

    if (currentUser.roleName !== 'admin') {
        req.flash('error', 'You do not have permission to delete accounts.');
        return res.redirect('/admin/manage-users');
    }

    if (currentUser.id === targetUserId) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/admin/manage-users');
    }

    try {
        const deleted = await deleteUser(targetUserId); 

        if (deleted) {
            req.flash('success', 'User account deleted successfully.');
        } else {
            req.flash('error', 'User not found or already deleted.');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        req.flash('error', 'An error occurred while deleting the account.');
    }

    res.redirect('/admin/manage-users');
};


const showEditAccountForm = async (req, res) => {
    res.send('Edit account form - not yet implemented');
};

const updateAccountValidation = [];

const processEditAccount = async (req, res) => {
    res.send('Process edit account - not yet implemented');
};

router.get('/', showRegistrationForm);
router.post('/', registrationValidation, processRegistration);
router.get('/list', showAllUsers);
router.get('/:id/edit', requireLogin, showEditAccountForm);
router.post('/:id/edit', requireLogin, updateAccountValidation, processEditAccount);
router.post('/:id/delete', requireLogin, processDeleteAccount);

export default router;