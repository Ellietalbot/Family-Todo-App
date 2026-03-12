import bcrypt from 'bcrypt';
import db from '../db.js';

/**
 * 
 * @param {string} email 
 * @returns {Promise<Object|null>} 
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT 
            user_id AS id,
            name,
            email,
            password_hash AS password,
            role,
            created_at
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
    `;
    const result = await db.query(query, [email]);
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