import { Router } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, generateUniqueInviteCode, findFamilyByInviteCode, createFamily } from '../models/forms/registration.js';
import { registrationValidation } from '../middleware/forms/validation.js';

const router = Router();

//renders the registration form
const showRegistrationForm = (req, res) => {
    res.render('registration/form', { title: 'User Registration' });
};

/* The function displays a flash message for each validation error during registration. It then gets the data from the request body
It uses that data to check if the user is already in the data base. If the user doesn't exist the password is hashed and goes through 10 
salt rounds. Then it handles the different family options, if a family is created, a unique family invite code is generated, a new family is inserted in the database, 
a new user is added to the database, and then the user data is added to the session user. If a user tries to join a family, it checks if the invite code is valid. If the code is valid
it adds the user and their family info to the database and save the user info to the session. 

*/
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
            return res.redirect('/login');
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