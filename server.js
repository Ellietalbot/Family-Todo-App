import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import { setupDatabase, testConnection } from './src/models/setup.js';
import registrationRouter from './src/controllers/registration.js';

const app = express();

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'changeme',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use(flash());

app.use((req, res, next) => {
    res.locals.messages = {
        success: req.flash('success'),
        warning: req.flash('warning'),
        error: req.flash('error')
    };
    next();
});

app.use(express.static('./src/public'));

app.get('/', (req, res) => {
    const title = 'Dashboard';
    res.render('dashboard/dashboard', { title });
});
app.get('/family', (req, res) => {
    const title = 'My Family';
    res.render('family/family', { title });
});
app.get('/login', (req, res) => {
    const title = 'Login';
    res.render('login/form', { title });
});
app.get('/tasks', (req, res) => {
    const title = 'Tasks';
    res.render('tasks/task-list', { title });
});

app.use('/register', registrationRouter);
const PORT = 3000;

app.listen(PORT, async () => {
    await setupDatabase();
    await testConnection();
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});