import express from 'express';
import flash from 'connect-flash';
import { setupDatabase, testConnection } from './src/models/setup.js';
import { startSessionCleanup } from './src/utils/session-cleanup.js';
import { addLocalVariables, addFlashMessages } from './src/middleware/global.js';
import sessionMiddleware from './src/middleware/session.js';
import { notFound, serverError } from './src/middleware/errors.js';
import router from './src/controllers/routes.js';
import db from './src/models/db.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(sessionMiddleware);
startSessionCleanup();

app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(addLocalVariables);
app.use(addFlashMessages);


app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static(join(__dirname, 'src/public')));


app.use(router);


app.use(notFound);
app.use(serverError);

const PORT = process.env.PORT || 3000;

async function start() {
    await setupDatabase();
    await testConnection();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

process.on('SIGTERM', async () => { await db.end(); process.exit(0); });
process.on('SIGINT', async () => { await db.end(); process.exit(0); });

start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});