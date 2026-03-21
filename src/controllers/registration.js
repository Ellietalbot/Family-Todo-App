import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, deleteUser, generateUniqueInviteCode, findFamilyByInviteCode, createFamily } from '../models/forms/registration.js';
import { requireLogin, requireRole } from '../middleware/auth.js';
import { registrationValidation } from '../middleware/forms/validation.js';
const router = Router();


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

    const { name, email, password, familyAction } = req.body;

    try {
        const emailAlreadyExists = await emailExists(email);
        if (emailAlreadyExists) {
            req.flash('warning', 'An account with this email already exists.');
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (familyAction === 'create') {
            const inviteCode = await generateUniqueInviteCode(req.body.family_name);
            const family = await createFamily(req.body.family_name, inviteCode);
            const newUser = await saveUser(name, email, hashedPassword, 'parent', family.family_id);
            req.session.user = { user_id: newUser.user_id, name, email, role: 'parent', family_id: family.family_id };
            req.flash('success', `Family created! Your invite code is: ${inviteCode}`);
            return res.redirect('/setup');
        }

        if (familyAction === 'join') {
            const family = await findFamilyByInviteCode(req.body.invite_code);
            if (!family) {
                req.flash('error', 'Invalid invite code.');
                return res.redirect('/register');
            }
            const newUser = await saveUser(name, email, hashedPassword, 'child', family.family_id);
            req.session.user = { user_id: newUser.user_id, name, email, role: 'child', family_id: family.family_id };
            req.flash('success', 'Registration successful!');
            return res.redirect('/setup');
        }
        req.flash('error', 'Please select whether you are creating or joining a family.');
        return res.redirect('/register');

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

    if (currentUser.role !== 'admin') {
        req.flash('error', 'You do not have permission to delete accounts.');
        return res.redirect('/admin/manage-users');
    }
    if (currentUser.user_id === targetUserId){
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
router.get('/list', requireLogin, showAllUsers);
router.get('/:id/edit', requireLogin, showEditAccountForm);
router.post('/:id/edit', requireLogin, updateAccountValidation, processEditAccount);
router.post('/:id/delete', requireLogin, requireRole('admin'), processDeleteAccount);

export default router;