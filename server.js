import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { caCert } from './src/models/db.js';
import flash from 'connect-flash';
import { setupDatabase, testConnection } from './src/models/setup.js';
import registrationRouter from './src/controllers/registration.js';
import loginRouter from './src/controllers/login.js';
import dashboardRouter from './src/controllers/dashboard.js';
import taskRouter from './src/controllers/tasks.js';
import { processLogout } from './src/controllers/login.js';
import { requireLogin } from './src/middleware/auth.js';
import { returnFamilyMembers } from './src/controllers/family.js';
import { startSessionCleanup } from './src/utils/session-cleanup.js';
import { addLocalVariables } from './src/middleware/global.js';
import setupRouter from './src/controllers/modal.js';
console.log(process.env.NODE_ENV)
console.log('SESSION_SECRET loaded:', !!process.env.SESSION_SECRET);
const app = express();

const pgSession = connectPgSimple(session);

app.use(session({
    store: new pgSession({
        conObject: {
            connectionString: process.env.DB_URL,
            
            ssl: {
                ca: caCert,
                rejectUnauthorized: true,
                checkServerIdentity: () => { return undefined; }
            }
        },
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'changeme-dev-only',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV?.includes('dev') === false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

startSessionCleanup();
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(addLocalVariables);
    app.use((req, res, next) => {
        res.locals.messages = {
            success: req.flash('success'),
            warning: req.flash('warning'),
            error: req.flash('error')
        };
        next();
    });


app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('./src/public'));


app.get('/family', requireLogin, returnFamilyMembers);

app.post('/logout', processLogout);

app.use('/login', loginRouter);
app.use('/register', registrationRouter);
app.use('/setup', setupRouter);
app.use('/', dashboardRouter); 
app.use('/tasks', taskRouter);


const PORT = 3000;

app.listen(PORT, async () => {
    await setupDatabase();
    await testConnection();
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});