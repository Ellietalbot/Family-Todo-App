import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from '../models/db.js';

const pgSession = connectPgSimple(session);

//The session middleware uses postgress to store the session in a table . It connects to the 
// database using ssl. Signs the session key with the session secret, and doesn't save or store the session if nothing as changed.
//Sets the cookie to send only in production, http only ensures it can't be read by JS, and max age makes it last a day.

const sessionMiddleware = session({
    store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'changeme-dev-only',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
});

export default sessionMiddleware;