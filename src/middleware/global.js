//Gets the current greeting based on time of day
const getCurrentGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
        return 'Good Morning';
    }

    if (currentHour < 18) {
        return 'Good Afternoon';
    }

    return 'Good Evening';
};

//Sets the local variables for the templates. 
//Adds the current year, the enviroment, the query parameters, and the greeting. 
//sets logged in the false as a default unless there is an active session and logged in user, then it sets 
//logged in to true and sets the currentuser to the session user.
const addLocalVariables = (req, res, next) => {
    res.locals.currentYear = new Date().getFullYear();
    res.locals.NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
    res.locals.queryParams = { ...req.query };
    res.locals.greeting = getCurrentGreeting();

    res.locals.isLoggedIn = false;
    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
        res.locals.currentUser = req.session.user;
    }

    next();
};
//Adds flash messages to the response local variables with a message object that has success, warning, and errors to use for templates
const addFlashMessages = (req, res, next) => {
    res.locals.messages = {
        success: req.flash('success'),
        warning: req.flash('warning'),
        error: req.flash('error')
    };
    next();
};


export { addLocalVariables, addFlashMessages };