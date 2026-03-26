import db from '../db.js';

const countComments = async (taskId) => {
    const query = `SELECT COUNT(*) AS comment_count FROM comments WHERE task_id = $1`;
    const result = await db.query(query, [taskId]);
    return result.rows[0].comment_count;
}

const returnTaskComments = async (taskId) => {
    const query = `SELECT users.name AS author_name, comments.content, comments.created_at 
                   FROM comments 
                   JOIN users ON comments.user_id = users.user_id
                   WHERE comments.task_id = $1
                   ORDER BY comments.created_at ASC`;
    const result = await db.query(query, [taskId]);
    return result.rows;
}

const saveComment = async (taskId, userID, content) => {
    const query = `INSERT INTO comments (task_id, user_id, content) 
                   VALUES ($1, $2, $3) 
                   RETURNING task_id, user_id, content`;
    const result = await db.query(query, [taskId, userID, content]);
    return result.rows[0];
};
export { countComments, saveComment, returnTaskComments }