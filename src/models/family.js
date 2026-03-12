import db from './db.js';

const returnFamilyMemberInfo = async () => {
    const query = `SELECT name, role, COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_tasks FROM users LEFT JOIN task ON task.assigned_to = users.user_id GROUP BY users.name, users.user_id, users.role`
    const result = await db.query(query);
    return result.rows;
}

export { returnFamilyMemberInfo };