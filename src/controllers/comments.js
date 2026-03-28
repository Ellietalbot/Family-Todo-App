import { saveComment, countComments, returnTaskComments, getCommentbyCommentId, deleteComment, updateComment } from "../models/forms/comments.js";
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
        isValid.array().forEach(error => {
            req.flash('warning', error.msg);
        });
        return res.redirect('/tasks');
    }
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.session.user.user_id;
    try {
        await saveComment(id, user_id, content);
        res.redirect('/tasks');
    } catch (error) {
        next(error);
    }
};

const deleteComment = async (req, res, next) => {
    try{
        const commentId = req.params.id;
        const redirectTo = req.body.redirect || '/tasks';
        const comment = await getCommentbyCommentId(commentId);


        if (!comment){
            req.flash('error', 'Comment does not exist')
            return res.redirect(redirectTo);
        }

        const isAllowed = comment.user_id == req.session.user.user_id || req.session.user.role == 'parent' || req.session.user.role == 'admin';
        
        if (!isAllowed){
            req.flash('error', 'You are unauthorized to delete this comment')
            return res.redirect(redirectTo);
        }
        
        await deleteComment(commentId);
        req.flash('success', 'Comment deleted.');
        res.redirect(redirectTo);
    } catch (error){
        next(error);
    }
}

const updateComment = async (req, res, next) => {
    try{
        const commentId = req.params.id;
        const redirectTo = req.body.redirect || '/tasks';
        const comment = await getCommentbyCommentId(commentId);
        const { content } = req.body;

        if (!comment){
            req.flash('error', 'Comment does not exist')
            return res.redirect(redirectTo);
        }

        const isAllowed = comment.user_id == req.session.user.user_id || req.session.user.role == 'parent' || req.session.user.role == 'admin';
        
        if (!isAllowed){
            req.flash('error', 'You are unauthorized to update this comment')
            return res.redirect(redirectTo);
        }
        
        await updateComment(content, commentId);
        req.flash('success', 'Comment updated.');
        res.redirect(redirectTo);
    } catch (error){
        next(error);
    }
}
export { getComments, postComment, deleteComment, updateComment };