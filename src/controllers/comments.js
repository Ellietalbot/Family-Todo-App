import { saveComment, countComments, returnTaskComments } from "../models/forms/comments.js";
import { validationResult } from "express-validator";

//Returns the date the comment was posted
const datePosted = (date) => {
    return new Date(date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

/* This function fetches the comments for each task, and the number of comments each task has, 
then it returns an array of comment objects with an additional attribute of date_posted which 
formats the date the comment was posted in a readable format, then it gets the comment count and 
makes it an int because the query returns a string */

const getComments = async (taskId) => {
    const [comments, comment_count] = await Promise.all([
        returnTaskComments(taskId),
        countComments(taskId)
    ]);
    return {
        comments: comments.map(c => ({ ...c, date_posted: datePosted(c.created_at) })),
        comment_count: parseInt(comment_count)
    };
};

//This function posts the comment by using the models saveComment function to save it to the database
const postComment = async (req, res, next) => {
    const isValid = validationResult(req)
    if (!isValid.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('warning', error.msg);
        });
        return res.redirect('/register');
    }
    const { id } = req.params;
    const { comment } = req.body;
    const user_id = req.session.user.user_id;
    try {
        await saveComment(id, user_id, comment);
        res.redirect('/tasks');
    } catch (error) {
        next(error);
    }
};

export { getComments, postComment };