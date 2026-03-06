import express from 'express';

const app = express();

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('./src/public'));

app.get('/', (req, res) => {
    const title = 'Dashboard';
    res.render('dashboard/dashboard', { title });
});
app.get('/family', (req, res) =>{
    const title ='My Family';
    res.render('family/family', {title})
});

app.get('/login', (req, res) => {
        const title = 'Login';
    res.render('auth/login', { title });
});
app.get('/register', (req, res) => {
    const title = 'Register';
    res.render('auth/register', { title });
});
app.get('/tasks', (req, res) => {
    const title = 'Tasks';
    res.render('tasks/task-list', { title });
    });
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});