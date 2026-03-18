import { Router } from 'express';
import { requireLogin } from '../middleware/auth.js';
import { getTaskByUserId, getTasksCreatedByUser } from '../models/forms/task.js';
import { returnFamilyMemberInfo } from '../models/family.js';
import { processTask } from './tasks.js';

const router = Router();
const showDashboard = async (req, res) => {
    const user_id = req.session.user.user_id;
    const familyId = req.session.user.family_id;

    try {
        const [allTasks, delegatedTasks, users] = await Promise.all([
            getTaskByUserId(user_id),
            getTasksCreatedByUser(user_id),
            returnFamilyMemberInfo(familyId)
        ]);

        const tasks = allTasks.filter(t => t.status !== 'completed' && t.assigned_to == user_id);
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
        console.error('Error loading dashboard:', error);
        return res.render('dashboard/dashboard', {
            title: 'Dashboard',
            users: [],
            currentUser: req.session.user,
            tasks: [],
            completedTasks: [],
            delegatedTasks: []
        });
    }
};
router.get('/', requireLogin, showDashboard);
router.post('/', requireLogin, processTask);

export default router;