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

const saveUser = async (name, email, hashedPassword, role, familyId) => {
    const query = `INSERT INTO users (name, email, password_hash, role, family_id) 
                   VALUES ($1, $2, $3, $4, $5) 
                   RETURNING user_id, name, email, created_at`;
    const result = await db.query(query, [name, email, hashedPassword, role, familyId]);
    return result.rows[0];
};



// @param {number} userId
// @returns {Promise<Boolean>}
const deleteUser = async (userId) => {
    const query = `DELETE FROM users WHERE user_id = $1 RETURNING user_id`;
    const result = await db.query(query, [userId]);
    return result.rowCount > 0;
};

//generates the invite code by getting the first 5 or less characters of the family name and the attaching random letters and numbers.
//Claude helped with this
const generateInviteCode = (familyName) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const part1 = familyName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    let part2 = '';
    for (let i = 0; i < 4; i++){
        part2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${part1}-${part2}`;
}

//returns a unique family it calls generateInviteCode checks if it already exists and if not it returns it.
const generateUniqueInviteCode = async (familyName) => {
    let code;
    let exists = true;

    while (exists) {
        code = generateInviteCode(familyName);
        const result = await db.query(
            `SELECT 1 FROM family WHERE invite_code = $1`,
            [code]
        );
        exists = result.rows.length > 0;
    }
    return code;
};

//Inserts the family info into the database
const createFamily = async (familyName, inviteCode) => {
    const result = await db.query(
        `INSERT INTO family (family_name, invite_code) 
         VALUES ($1, $2) 
         RETURNING *`,
        [familyName, inviteCode]
    );
    return result.rows[0];
};

// finds the family by the invite code
const findFamilyByInviteCode = async (inviteCode) => {
    const result = await db.query(
        `SELECT * FROM family WHERE invite_code = $1`,
        [inviteCode.toUpperCase().trim()]
    );
    return result.rows[0] || null;
};

export { emailExists, saveUser, deleteUser, generateUniqueInviteCode, findFamilyByInviteCode, createFamily };