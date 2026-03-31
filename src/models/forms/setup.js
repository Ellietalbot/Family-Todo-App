import db from "../db.js";

//updates the users role
const updateRole = async (userId, role) => {
    const query = `UPDATE users SET role=$1 WHERE user_id=$2 RETURNING *`
    const result = await db.query(query, [role, userId])
    return result.rows[0];
}
export { updateRole }