
//Checks there is an active session and logged in user, if that is true then it sets the local variable isLoggedIn to true. 
const requireLogin = (req, res, next) => {
    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
        next();
    } else {
        res.redirect('/login');
    }
};

//if a user tries to access a page without being logged in this will redirect to login. 
// Then it checks if the user's role is equal to the required role that is passed as a parameter.
const requireRole = (roleName) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            req.flash('error', 'You must be logged in to access this page.');
            return res.redirect('/login');
        }

        if (req.session.user.role !== roleName) {
            req.flash('error', 'You do not have permission to access this page.');
            return res.redirect('/');
        }
        next();
    };
};

//Checks if the user is logged in then checks if the user has a child role and blocks then from accessing the page.
const requireParent = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access this page.');
        return res.redirect('/login');
    }

    if (req.session.user.role !== 'parent' && req.session.user.role !== 'admin') {
        req.flash('error', 'You do not have permission to access this page.');
        return res.redirect('/tasks');
    }
    next();
}
export { requireLogin, requireRole, requireParent };