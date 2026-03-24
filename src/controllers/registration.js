import { Router } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, generateUniqueInviteCode, findFamilyByInviteCode, createFamily } from '../models/forms/registration.js';
import { registrationValidation } from '../middleware/forms/validation.js';

const router = Router();

const showRegistrationForm = (req, res) => {
    res.render('registration/form', { title: 'User Registration' });
};

const processRegistration = async (req, res, next) => {
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
        next(error);
    }
};

router.get('/', showRegistrationForm);
router.post('/', registrationValidation, processRegistration);

export default router;