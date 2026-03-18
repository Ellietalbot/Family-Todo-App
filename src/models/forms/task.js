import db from '../db.js';

const saveTask = async (title, description, due_date, category, assigned_to, created_by, family_id, status = 'pending') => {
    const query = `INSERT INTO task (title, description, category, due_date, assigned_to, created_by, family_id, status) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                   RETURNING task_id, title, description, category, due_date, assigned_to`;
    const result = await db.query(query, [title, description, category, due_date, assigned_to, created_by, family_id, status]);
    return result.rows[0];
};

const getTaskByUserId = async (user_id) => {
    const query = `
        SELECT task.*, users.name AS assigner_name 
        FROM task 
        JOIN users ON task.created_by = users.user_id 
        WHERE task.assigned_to = $1`;
    const result = await db.query(query, [user_id]);
    return result.rows;
};

const getAllTasksByFamily = async (family_id) => {
    const query = `
        SELECT task.*, users.name AS assigner_name 
        FROM task 
        JOIN users ON task.created_by = users.user_id 
        WHERE task.family_id = $1`;
    const result = await db.query(query, [family_id]);
    return result.rows;
};

const deleteTask = async (taskId) => {
    const query = `DELETE FROM task WHERE task_id = $1 RETURNING task_id`;
    const result = await db.query(query, [taskId]);
    return result.rowCount > 0;
};

const getTaskAssigner = async (taskId) => {
    const query = `SELECT users.name FROM users JOIN task ON task.created_by = users.user_id WHERE task.task_id = $1`;
    const result = await db.query(query, [taskId]);
    return result.rows[0];
}
const updateTask = async (taskId, title, description, due_date, category, assigned_to) => {
    const query = `
        UPDATE task SET title=$1, description=$2, due_date=$3, category=$4, assigned_to=$5
        WHERE task_id=$6
        RETURNING *`;
    const result = await db.query(query, [title, description, due_date, category, assigned_to, taskId]);
    return result.rows[0];
};
const acceptTask = async (taskId) => {
    const query = `UPDATE task SET status='active' WHERE task_id=$1 RETURNING *`;
    const result = await db.query(query, [taskId]);
    return result.rows[0];
};

const denyTask = async (taskId) => {
    // Reassign back to creator and set active
    const query = `
        UPDATE task SET assigned_to=created_by, status='active' 
        WHERE task_id=$1 RETURNING *`;
    const result = await db.query(query, [taskId]);
    return result.rows[0];
};


const completeTask = async (taskId) => {
    const query = `UPDATE task SET status='completed' WHERE task_id=$1 RETURNING *`;
    const result = await db.query(query, [taskId]);
    return result.rows[0];
};

const getTasksCreatedByUser = async (user_id) => {
    const query = `
        SELECT task.*, 
               creator.name AS assigner_name,
               assignee.name AS assigned_name
        FROM task 
        JOIN users AS creator ON task.created_by = creator.user_id
        JOIN users AS assignee ON task.assigned_to = assignee.user_id
        WHERE task.created_by = $1 AND task.assigned_to != $1 AND task.status != 'completed'`;
    const result = await db.query(query, [user_id]);
    return result.rows;
};
const getPendingTasksForUser = async (user_id) => {
    const query = `
        SELECT task.*, 
               creator.name AS assigner_name,
               assignee.name AS assigned_name
        FROM task
        JOIN users AS creator ON task.created_by = creator.user_id
        JOIN users AS assignee ON task.assigned_to = assignee.user_id
        WHERE task.assigned_to = $1 AND task.status = 'pending'`;
    const result = await db.query(query, [user_id]);
    return result.rows;
};

export { saveTask, getTaskByUserId, deleteTask, getAllTasksByFamily, getTaskAssigner, updateTask, completeTask, getTasksCreatedByUser, acceptTask, denyTask, getPendingTasksForUser }

