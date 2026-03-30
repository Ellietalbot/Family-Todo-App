import db from '../db.js';

//counts all the comments attached to a specific task
const countComments = async (taskId) => {
    const query = `SELECT COUNT(*) AS comment_count FROM comments WHERE task_id = $1`;
    const result = await db.query(query, [taskId]);
    return result.rows[0].comment_count;
}

//returns the name of the author, the content, the date created, comment id and user id for the task
const returnTaskComments = async (taskId) => {
    const query = `SELECT users.name AS author_name, comments.content, comments.created_at, comments.comment_id, comments.user_id
                   FROM comments 
                   JOIN users ON comments.user_id = users.user_id
                   WHERE comments.task_id = $1
                   ORDER BY comments.created_at ASC`;
    const result = await db.query(query, [taskId]);
    return result.rows;
}

//saves the comment by inserting into the comments table
const saveComment = async (taskId, userID, content) => {
    const query = `INSERT INTO comments (task_id, user_id, content) 
                   VALUES ($1, $2, $3) 
                   RETURNING task_id, user_id, content`;
    const result = await db.query(query, [taskId, userID, content]);
    return result.rows[0];
};

//gets the comment that matches the comment id
const getCommentbyCommentId = async (commentId) => {
    const query =  `SELECT * FROM comments WHERE comment_id = $1`
    const result = await db.query(query, [commentId]);
    return result.rows[0];
}

//deletes the comment from where the comment id matches the parameter
const deleteComment = async (commentId) => {
    const query = `DELETE FROM comments WHERE comment_id = $1`
    const result = await db.query(query, [commentId])
    return result.rowCount > 0;
}
//updates the content of the comment where the comment id matches
const updateComment = async (content, commentId) => {
    const query = `UPDATE comments SET content = $1 WHERE comment_id = $2`;
    const result = await db.query(query, [content, commentId]);
   return result.rows[0];
}
export { countComments, saveComment, returnTaskComments, getCommentbyCommentId, deleteComment, updateComment }