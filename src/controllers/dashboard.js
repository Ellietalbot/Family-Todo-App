import { Router } from 'express';
import { requireLogin, requireParent } from '../middleware/auth.js';
import { returnFamilyMemberInfo } from '../models/family.js';
import { processTask } from './tasks.js';
import { taskValidation } from '../middleware/forms/validation.js';

const router = Router();

//Gets the users id and family id from the user session object, calls the dashboard.js model functions and assigns them to variables
//Renders the dashboard view and passes the variables so the view can access them.
const showDashboard = async (req, res, next) => {
    const familyId = req.session.user.family_id;

    try {
        const users = await returnFamilyMemberInfo(familyId);

        return res.render('dashboard/dashboard', {
            title: 'Dashboard',
            users,
            currentUser: req.session.user,
        });
    } catch (error) {
        next(error);
    }
};

router.get('/', requireLogin, requireParent, showDashboard);
router.post('/', requireLogin, taskValidation, processTask);

export default router;