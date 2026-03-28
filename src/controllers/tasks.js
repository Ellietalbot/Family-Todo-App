import { Router } from 'express';
import { requireLogin } from '../middleware/auth.js';
import { saveTask, getTaskbyTaskId, getTaskByUserId, deleteTask, updateTask, completeTask, getPendingTasksForUser, acceptTask, denyTask, getTasksCreatedByUser } from '../models/forms/task.js';
import { returnFamilyMemberInfo } from '../models/family.js';
import { getComments, postComment, handleUpdateComment, handleDeleteComment } from '../controllers/comments.js';
import { taskValidation, commentValidation } from '../middleware/forms/validation.js';
import { validationResult } from 'express-validator';

const router = Router();

//processes the creation of a task. Gets the data from the request session and body, and plug them into the save task function from the modal. 
const processTask = async (req, res, next) => {
    const isValid = validationResult(req)
    if (!isValid.isEmpty()) {
        isValid.array().forEach(error => {
            req.flash('warning', error.msg);
        });
        return res.redirect('/');
    }

    const { title, description, category } = req.body;
    const createdBy = req.session.user.user_id;
    const familyId = req.session.user.family_id;
    const assignedTo = req.body['assign-to'] || createdBy;
    const status = assignedTo == createdBy ? 'active' : 'pending';
    const due_date = req.body.due_date || null;

    try {
        await saveTask(title, description, due_date, category, assignedTo, createdBy, familyId, status);
        req.flash('success', 'Task created successfully!');
        res.redirect('/');
    } catch (error) {
        next(error);
    }
};

//Gets the task id from the request parameters and the task details from the request body. Then it updates the task with the new data.
const editTask = async (req, res, next) => {
   try {
        const taskId = req.params.id;
        const { title, description, due_date, category, assigned_to } = req.body;
        const task = await getTaskbyTaskId(taskId);

        if (!task){
            req.flash('error', 'Task does not exist')
            return res.redirect('/tasks');
        }

        const isAllowed = task.created_by == req.session.user.user_id || req.session.user.role == 'parent' || req.session.user.role == 'admin';

        if (!isAllowed){
            req.flash('error', 'You are unauthorized to edit this task')
            return res.redirect('/tasks');
        }
        
        await updateTask(taskId, title, description, due_date, category, assigned_to);
        req.flash('success', 'Task updated successfully.');
        res.redirect('/tasks');
    } catch (error) {
        next(error);
    }
};

//Marks the task as complete
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

//Deletes the task
const deleteUserTask = async (req, res, next) => {
    try {
        const taskId = req.params.id;
        const redirectTo = req.body.redirect || '/tasks';
        const task = await getTaskbyTaskId(taskId);
       

        if (!task){
            req.flash('error', 'Task does not exist')
            return res.redirect(redirectTo);
        }

        const isAllowed = task.created_by == req.session.user.user_id || req.session.user.role == 'parent' || req.session.user.role == 'admin';
        
        if (!isAllowed){
            req.flash('error', 'You are unauthorized to delete this task')
            return res.redirect(redirectTo);
        }
        

        await deleteTask(taskId);
        req.flash('success', 'Task deleted.');
        res.redirect(redirectTo);
    } catch (error) {
        next(error);
    }
};

//Accepts the pending task and adds it to the user's task list.
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

//Denys the pending task and sends it back to the creator's task list. 
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

//Gets the all tasks associated with the user. Filters the tasks by status, and adds comments to the pending and delegated tasks.
//Passes that data to the view with res.render.
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
router.post('/', requireLogin, taskValidation, processTask);
router.post('/:id/complete', requireLogin, markTaskComplete);
router.post('/:id/edit', requireLogin, editTask);
router.post('/:id/delete', requireLogin, deleteUserTask);
router.post('/:id/accept', requireLogin, acceptUserTask);
router.post('/:id/deny', requireLogin, denyUserTask);
router.post('/:id/comment', requireLogin, commentValidation, postComment);
router.post('/:id/comment/delete', requireLogin, handleDeleteComment)
router.post('/:id/comment/edit', requireLogin, handleUpdateComment)

export default router;
export { showUsersTasks, processTask, markTaskComplete, editTask, deleteUserTask };