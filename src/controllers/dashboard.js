import { Router } from 'express';
import { requireLogin, requireParent } from '../middleware/auth.js';
import { getTaskByUserId, getTasksCreatedByUser } from '../models/forms/task.js';
import { returnFamilyMemberInfo } from '../models/family.js';
import { processTask } from './tasks.js';
import { taskValidation } from '../middleware/forms/validation.js';

const router = Router();

// Gets the users id and family id from the user session object, calls the dashboard.js model functions and assigns them to variables
// Separates the tasks from the completed tasks using filter 
// Renders the dashboard view and passes the variables so the view can access them.  
const showDashboard = async (req, res, next) => {
    const user_id = req.session.user.user_id;
    const familyId = req.session.user.family_id;

    try {
        const [allTasks, delegatedTasks, users] = await Promise.all([
            getTaskByUserId(user_id),
            getTasksCreatedByUser(user_id),
            returnFamilyMemberInfo(familyId)
        ]);

        const tasks = allTasks.filter(t => t.status === 'active');
        const completedTasks = allTasks.filter(t => t.status === 'completed');

        return res.render('dashboard/dashboard', {
            title: 'Dashboard',
            users,
            currentUser: req.session.user,
            tasks,
            completedTasks,
            delegatedTasks
        });
    } catch (error) {
        next(error);
    }
};

router.get('/', requireLogin, requireParent, showDashboard);
router.post('/', requireLogin, taskValidation, processTask);

export default router;