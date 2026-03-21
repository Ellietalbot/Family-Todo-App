import bcrypt from 'bcrypt';
import db from '../db.js';

/**
 * 
 * @param {string} email 
 * @returns {Promise<Object|null>} 
 */
const findUserByEmail = async (email) => {
    const result = await db.query(
        `SELECT user_id, name, email, password_hash, role, family_id FROM users WHERE LOWER(email) = LOWER($1)`,
        [email]
    );
    return result.rows[0] || null;
};

/**
 * 
 * @param {string} plainPassword 
 * @param {string} hashedPassword 
 * @returns {Promise<boolean>} 
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
    const result = await bcrypt.compare(plainPassword, hashedPassword);
    return result;
};

export { findUserByEmail, verifyPassword };