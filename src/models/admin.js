import db from "./db.js";

const countFamilies = async () => {
    const query = `
        SELECT COUNT(*) FROM family`;
    const result = await db.query(query);
    return result.rows[0];
};

const countUsers = async () => {
    const query = `
        SELECT COUNT(*) FROM users`;
    const result = await db.query(query)
    return result.rows[0];
}

const averageFamilySize = async () => {
    const query = `
        SELECT AVG(family_count) FROM (
        SELECT COUNT(*) AS family_count FROM users GROUP BY family_id) AS counts`;
    const result = await db.query(query);
    return result.rows[0];
}
const totalTasks = async () => {
    const query =`
        SELECT COUNT(*) FROM task`
    const result = await db.query(query);
    return result.rows[0];
}
const recentActivity = async () => {
    const query = `
    SELECT title, task.created_at, changed_at, name FROM task LEFT JOIN 
    task_history ON task.task_id = task_history.task_id LEFT JOIN users 
    ON users.user_id = task_history.changed_by`
    const result = await db.query(query);
    return result.rows;
}

const returnAllFamilies = async () => {
    const query = `
        SELECT * FROM family`
    ;
    const result = await db.query(query);
    return result.rows;
}
const getAllUsers = async () => {
    const query = `SELECT user_id, name, email, created_at, role FROM users ORDER BY created_at DESC`;
    const result = await db.query(query);
    return result.rows;
};

const updateUserRole = async (role, userId) => {
    const query = `
        UPDATE users SET role=$1
        WHERE user_id=$2
        RETURNING *`;
    const result = await db.query(query, [role, userId]);
    return result.rows[0];
}
const deleteFamily = async (familyId) => {
    const query = `DELETE FROM family WHERE family_id = $1 RETURNING family_id`;
    const result = await db.query(query, [familyId]);
    return result.rowCount > 0;
};
const updateFamily = async (familyId, familyName) => {
    const query = `
        UPDATE family SET family_name=$1
        WHERE family_id=$2
        RETURNING *`;
    const result = await db.query(query, [familyId, familyName]);
    return result.rows[0];
}
export { countFamilies, countUsers, averageFamilySize, totalTasks, recentActivity, returnAllFamilies, getAllUsers, updateUserRole, deleteFamily, updateFamily }