import { saveComment, countComments, returnTaskComments } from "../models/forms/comments.js";

const timeAgo = (date) => {
    return new Date(date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};
const getComments = async (taskId) => {
    const [comments, comment_count] = await Promise.all([
        returnTaskComments(taskId),
        countComments(taskId)
    ]);
    return {
        comments: comments.map(c => ({ ...c, time_ago: timeAgo(c.created_at) })),
        comment_count: parseInt(comment_count)
    };
};

const postComment = async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    const user_id = req.session.user.user_id;
    await saveComment(id, user_id, comment);
    res.redirect('/tasks');
};
export { getComments, postComment };