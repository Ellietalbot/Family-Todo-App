import express from 'express';

const app = express();

const name = process.env.NAME; // <-- NEW

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('./src/public'));

app.get('/', (req, res) => {
    const title = 'Welcome Home';
    res.render('dashboard/dashboard', { title });
});
app.get('/family', (req, res) => {
    const title = 'My Family';
    res.render('family', { title });
});
app.get('/login', (req, res) => {
        const title = 'My Login';
    res.render('auth/login', { title });
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});