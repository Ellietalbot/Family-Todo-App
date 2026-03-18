import { Router } from 'express';
import { requireLogin } from '../middleware/auth.js';
import { saveTask, getTaskByUserId, deleteTask, updateTask, completeTask, getPendingTasksForUser, acceptTask, denyTask } from '../models/forms/task.js';
import { returnFamilyMemberInfo } from '../models/family.js';


const router = Router();

const processTask = async (req, res) => {
    const { title, description, due_date, category } = req.body;
    const createdBy = req.session.user.user_id;
    const familyId = req.session.user.family_id;
    const assignedTo = req.body['assign-to'] || createdBy;
    const status = assignedTo == createdBy ? 'active' : 'pending';

    try {
        await saveTask(title, description, due_date, category, assignedTo, createdBy, familyId, status);
        req.flash('success', 'Task created successfully!');
        res.redirect('/');
    } catch (error) {
        console.error('Error saving task:', error);
        req.flash('error', 'Could not save the task.');
        res.redirect('/');
    }
};

const editTask = async (req, res) => {
    const taskId = req.params.id;
    const { title, description, due_date, category, assigned_to } = req.body;
    try {
        await updateTask(taskId, title, description, due_date, category, assigned_to);
        req.flash('success', 'Task updated successfully.');
    } catch (error) {
        console.error('Error updating task:', error);
        req.flash('error', 'Could not update task.');
    }
    res.redirect('/tasks');
};

const markTaskComplete = async (req, res) => {
    const taskId = req.params.id;
    const redirectTo = req.body.redirect || '/tasks';
    try {
        await completeTask(taskId);
        req.flash('success', 'Task marked as complete.');
    } catch (error) {
        console.error('Error completing task:', error);
        req.flash('error', 'Could not complete task.');
    }
    res.redirect(redirectTo);
};

const deleteUserTask = async (req, res) => {
    const taskId = req.params.id;
    const redirectTo = req.body.redirect || '/tasks';
    try {
        await deleteTask(taskId);
        req.flash('success', 'Task deleted.');
    } catch (error) {
        console.error('Error deleting task:', error);
        req.flash('error', 'Could not delete task.');
    }
    res.redirect(redirectTo);
};

const acceptUserTask = async (req, res) => {
    const taskId = req.params.id;
    const redirectTo = req.body.redirect || '/tasks';
    try {
        await acceptTask(taskId);
        req.flash('success', 'Task accepted.');
    } catch (error) {
        console.error('Error accepting task:', error);
        req.flash('error', 'Could not accept task.');
    }
    res.redirect(redirectTo);
};

const denyUserTask = async (req, res) => {
    const taskId = req.params.id;
    const redirectTo = req.body.redirect || '/tasks';
    try {
        await denyTask(taskId);
        req.flash('success', 'Task sent back to creator.');
    } catch (error) {
        console.error('Error denying task:', error);
        req.flash('error', 'Could not deny task.');
    }
    res.redirect(redirectTo);
};

const showUsersTasks = async (req, res) => {
    const user_id = req.session.user.user_id;
    const familyId = req.session.user.family_id;

    try {
        const [allTasks, pendingTasks, users] = await Promise.all([
            getTaskByUserId(user_id),
            getPendingTasksForUser(user_id),
            returnFamilyMemberInfo(familyId)
        ]);

        const activeTasks = allTasks.filter(t => t.status === 'active');
        const completedTasks = allTasks.filter(t => t.status === 'completed');

        return res.render('tasks/task-list', {
            title: 'My Tasks',
            users,
            currentUser: req.session.user,
            activeTasks,
            completedTasks,
            pendingTasks
        });
    } catch (error) {
        console.error('Error returning task info:', error);
        return res.render('tasks/task-list', {
            title: 'My Tasks',
            users: [],
            currentUser: req.session.user,
            activeTasks: [],
            completedTasks: [],
            pendingTasks: []
        });
    }
};
router.get('/', requireLogin, showUsersTasks);
router.post('/', requireLogin, processTask);
router.post('/:id/complete', requireLogin, markTaskComplete);
router.post('/:id/edit', requireLogin, editTask);
router.post('/:id/delete', requireLogin, deleteUserTask);
router.post('/:id/accept', requireLogin, acceptUserTask);
router.post('/:id/deny', requireLogin, denyUserTask);
export default router;
export { showUsersTasks, processTask, markTaskComplete, editTask, deleteUserTask}
