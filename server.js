import express from 'express';

const app = express();

const name = process.env.NAME; // <-- NEW

app.get('/', (req, res) => {
    res.send(`Hello, ${name}!`); // <-- UPDATED
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});