import express from 'express';
import flash from 'connect-flash';
import { setupDatabase, testConnection } from './src/models/setup.js';
import { startSessionCleanup } from './src/utils/session-cleanup.js';
import { addLocalVariables, addFlashMessages } from './src/middleware/global.js';
import sessionMiddleware from './src/middleware/session.js';
import { notFound, serverError } from './src/middleware/errors.js';
import router from './src/controllers/routes.js';

const app = express();

app.use(sessionMiddleware);
startSessionCleanup();

app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(addLocalVariables);
app.use(addFlashMessages);


app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('./src/public'));


app.use(router);


app.use(notFound);
app.use(serverError);

const PORT = 3000;

app.listen(PORT, async () => {
    await setupDatabase();
    await testConnection();
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});