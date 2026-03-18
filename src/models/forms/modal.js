import db from "../db.js";

const updateRole = async (userId, role) => {
    const query = `UPDATE users SET role=$1 WHERE user_id=$2 RETURNING *`
    const result = await db.query(query, [userId, role])
    return result.rows[0];
}

export { updateRole }