import { Router } from 'express';
import { updateRole } from '../models/forms/modal.js';
import { requireLogin } from '../middleware/auth.js';

const router = Router();

const showModal = (req, res) => {
    res.render('partials/modal', {title: 'Setup'}) 
};

const processModal = async (req, res) => {
    const user_id = req.session.user.user_id;
    const { role } = req.body;

    try {
        await updateRole(user_id, role);
        req.session.user.role = role;
        req.flash('success', 'Setup complete');
        return res.redirect('/');
    } catch (error){
        console.error("Error with Setup", error)
        req.flash('success', 'Setup complete');
        return res.redirect('/');
    }

}


router.get('/', requireLogin, showModal);
router.post('/', requireLogin, processModal);
export default router;