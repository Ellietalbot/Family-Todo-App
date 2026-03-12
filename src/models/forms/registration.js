import db from "../db.js";

// @param {string} email
// @returns {Promise<Boolean>}
const emailExists = async (email) => {
    const query = `SELECT EXISTS (SELECT 1 FROM users WHERE email = $1) as exists`;
    const result = await db.query(query, [email]);
    return result.rows[0].exists;
};

// @param {string} name
// @param {string} email
// @param {string} hashedPassword
// @returns {Promise<Object>}

const saveUser = async (name, email, hashedPassword) => {
    const query = `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, created_at`;
    const result = await db.query(query, [name, email, hashedPassword, 'child']);
    return result.rows[0];
};


// @returns {Promise<Array>}
const getAllUsers = async () => {
    const query = `SELECT user_id, name, email, created_at FROM users ORDER BY created_at DESC`;
    const result = await db.query(query);
    return result.rows;
};

// @param {number} userId
// @returns {Promise<Boolean>}
const deleteUser = async (userId) => {
    const query = `DELETE FROM users WHERE user_id = $1 RETURNING user_id`;
    const result = await db.query(query, [userId]);
    return result.rowCount > 0;
};

export { emailExists, saveUser, getAllUsers, deleteUser };
