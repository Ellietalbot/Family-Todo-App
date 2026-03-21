

const requireLogin = (req, res, next) => {
    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
        next();
    } else {
        res.redirect('/login');
    }
};

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