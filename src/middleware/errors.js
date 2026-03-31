// Sets the HTTP status to 404 and renders the 404 error page.
const notFound = (req, res, next) => {
    res.status(404).render('errors/404', { title: 'Page Not Found' });
};

// Logs the errors to the console. Sets the HTTP status to 500 and displays the 500 page
const serverError = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).render('errors/500', {
        title: 'Server Error',
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

export { notFound, serverError };