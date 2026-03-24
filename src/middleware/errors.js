const notFound = (req, res, next) => {
    res.status(404).render('errors/404', { title: 'Page Not Found' });
};

const serverError = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).render('errors/500', {
        title: 'Server Error',
        error: err.message,
        stack: err.stack
    });
};

export { notFound, serverError };