import db from './db.js';

const returnFamilyMemberInfo = async (familyId) => {
    const query = `
        SELECT name, role, COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_tasks 
        FROM users 
        LEFT JOIN task ON task.assigned_to = users.user_id 
        WHERE users.family_id = $1
        GROUP BY users.name, users.user_id, users.role
    `;
    const result = await db.query(query, [familyId]);
    return result.rows;
};

const getFamilyById = async (familyId) => {
    const result = await db.query(
        `SELECT * FROM family WHERE family_id = $1`,
        [familyId]
    );
    return result.rows[0] || null;
};
export { returnFamilyMemberInfo, getFamilyById };