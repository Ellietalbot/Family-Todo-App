import { Router } from 'express';
import { requireLogin } from '../middleware/auth.js';
import { saveTask, getTaskByUserId, deleteTask, updateTask, completeTask, getPendingTasksForUser, acceptTask, denyTask, getTasksCreatedByUser } from '../models/forms/task.js';
import { returnFamilyMemberInfo } from '../models/family.js';
import { getComments, postComment } from '../controllers/comments.js';

const router = Router();

const processTask = async (req, res, next) => {
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
        next(error);
    }
};

const editTask = async (req, res, next) => {
    const taskId = req.params.id;
    const { title, description, due_date, category, assigned_to } = req.body;
    try {
        await updateTask(taskId, title, description, due_date, category, assigned_to);
        req.flash('success', 'Task updated successfully.');
        res.redirect('/tasks');
    } catch (error) {
        next(error);
    }
};

const markTaskComplete = async (req, res, next) => {
    const taskId = req.params.id;
    const redirectTo = req.body.redirect || '/tasks';
    
    try {
        await completeTask(taskId, req.session.user.user_id);
        req.flash('success', 'Task marked as complete.');
        res.redirect(redirectTo);
    } catch (error) {
        next(error);
    }
};

const deleteUserTask = async (req, res, next) => {
    const taskId = req.params.id;
    const redirectTo = req.body.redirect || '/tasks';
    try {
        await deleteTask(taskId);
        req.flash('success', 'Task deleted.');
        res.redirect(redirectTo);
    } catch (error) {
        next(error);
    }
};

const acceptUserTask = async (req, res, next) => {
    const taskId = req.params.id;
    const redirectTo = req.body.redirect || '/tasks';
    try {
        await acceptTask(taskId, req.session.user.user_id);
        req.flash('success', 'Task accepted.');
        res.redirect(redirectTo);
    } catch (error) {
        next(error);
    }
};

const denyUserTask = async (req, res, next) => {
    const taskId = req.params.id;
    const redirectTo = req.body.redirect || '/tasks';
    try {
        await denyTask(taskId, req.session.user.user_id);
        req.flash('success', 'Task sent back to creator.');
        res.redirect(redirectTo);
    } catch (error) {
        next(error);
    }
};

const showUsersTasks = async (req, res, next) => {
    const user_id = req.session.user.user_id;
    const familyId = req.session.user.family_id;

    try {
        const [allTasks, pendingTasks, delegatedTasks, users] = await Promise.all([
            getTaskByUserId(user_id),
            getPendingTasksForUser(user_id),
            getTasksCreatedByUser(user_id),
            returnFamilyMemberInfo(familyId)
        ]);

        const activeTasks = allTasks.filter(t => t.status === 'active');
        const completedTasks = allTasks.filter(t => t.status === 'completed');

        for (const task of pendingTasks) {
            const { comments, comment_count } = await getComments(task.task_id);
            task.comments = comments;
            task.comment_count = comment_count;
        }
        
        for (const task of delegatedTasks) {
            const { comments, comment_count } = await getComments(task.task_id);
            task.comments = comments;
            task.comment_count = comment_count;
        }       

        return res.render('tasks/task-list', {
            title: 'My Tasks',
            users,
            currentUser: req.session.user,
            activeTasks,
            completedTasks,
            pendingTasks,
            delegatedTasks
        });
    } catch (error) {
        next(error);
    }
};
router.get('/', requireLogin, showUsersTasks);
router.post('/', requireLogin, processTask);
router.post('/:id/complete', requireLogin, markTaskComplete);
router.post('/:id/edit', requireLogin, editTask);
router.post('/:id/delete', requireLogin, deleteUserTask);
router.post('/:id/accept', requireLogin, acceptUserTask);
router.post('/:id/deny', requireLogin, denyUserTask);
router.post('/:id/comment', requireLogin, postComment);

export default router;
export { showUsersTasks, processTask, markTaskComplete, editTask, deleteUserTask };