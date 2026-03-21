import { Router } from 'express';
import { requireLogin, requireRole } from '../middleware/auth.js';
import { countFamilies, countUsers, averageFamilySize, totalTasks, recentActivity, returnAllFamilies, getAllUsers, updateUserRole, updateFamily, deleteFamily } from '../models/admin.js';
import { deleteUser, createFamily, generateUniqueInviteCode } from '../models/forms/registration.js';

const router = Router();
const showAdminDashboard = async (req, res) => {
    try {
        const [familyCount, userCount, AverageSize, taskTotal, recentTaskActivity, allFamilies] = await Promise.all([
            countFamilies(),
            countUsers(),
            averageFamilySize(),
            totalTasks(),
            recentActivity(),
            returnAllFamilies(),

        ]);

        return res.render('admin/admin', {
            title: 'Admin Dashboard',
            familyCount, 
            userCount,
            AverageSize,
            taskTotal,
            recentTaskActivity,
            allFamilies
        });
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        console.error('Full error:', error.message);
        return res.render('admin/admin', {
            title: 'Dashboard',
            users: [],
            familyCount: 0,
            userCount: 0,
            AverageSize: 0,
            taskTotal: 0,
            recentTaskActivity: [],
            allFamilies: []
        });
    }
};
const showManageUsers = async (req, res) => {
    try {
        const users = await getAllUsers();

        return res.render('admin/users', {
            title: 'Manage Users',
            users
        });
    } catch (error) {
        console.error('Error loading manage users:', error);
        console.error('Full error:', error.message);
        return res.render('admin/users', {
            title: 'Manage Users',
            users: []
        });
    }
};
const processUpdateRole = async (req, res) =>{
    const { id } = req.params;
    const { role } = req.body;
    try{
        const updateUsersRole = await updateUserRole(role, id);;
        req.flash('success', 'Update role successful!');
        res.redirect('/admin/users');
    } catch (error){
        console.error('Error updating role:', error);
        console.error('Full error:', error.message);
        res.redirect('/admin/users');
    }
}

const processDeleteUser = async (req, res) => {
    const { id } = req.params;
    const currentUser = req.session.user;
    
    if (parseInt(id) === currentUser.user_id){
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/admin/users');
    }
    try {
        await deleteUser(id);
        req.flash('success', '...');
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.redirect('/admin/users');
    }
};

const processCreateFamily = async (req, res) => {
    const { familyName } = req.body;
    const inviteCode = await generateUniqueInviteCode(familyName);

    try{
        await createFamily(familyName, inviteCode);
        req.flash('success', `Family created! Your invite code is: ${inviteCode}`);
        return res.redirect('/admin/families');
    } catch (error){
        console.error('Error creating family:', error);
        return res.redirect('/admin/families');
    }
}

const processUpdateFamily = async (req, res) => {
    const { id } = req.params;
    const { familyName } = req.body;

    try{
        await updateFamily(id, familyName);
        req.flash('success', `Family updated!`);
        return res.redirect('/admin/families');
    } catch (error){
        console.error('Error updating family:', error);
        return res.redirect('/admin/families');
    }
}

const processDeleteFamily = async (req, res) => {
    const { id } = req.params;
    try{
        await deleteFamily(id);
        req.flash('success', `Family deleted!`);
        return res.redirect('/admin/families');
    } catch (error){
        console.error('Error deleting family:', error);
        res.redirect('/admin/families');
    }
}

const showFamilies = async (req, res) => {
    try{
        const families = await returnAllFamilies()

        return res.render('admin/families', {
            title: 'Manage Families',
            families
        });

    } catch (error){
        console.error('Error returning all families:', error);
        return res.render('admin/families', {
            title: 'Manage Families',
            users: []
        });
        
    }
}
router.get('/', requireLogin, requireRole("admin"), showAdminDashboard);
router.get('/users', requireLogin, requireRole("admin"), showManageUsers)
router.post('/users/:id/role', requireLogin, requireRole("admin"), processUpdateRole);
router.post('/users/:id/delete', requireLogin, requireRole("admin"), processDeleteUser);
router.get('/families', requireLogin, requireRole("admin"), showFamilies)
router.post('/families', requireLogin, requireRole("admin"), processCreateFamily)
router.post('/families/:id/edit', requireLogin, requireRole("admin"), processUpdateFamily)
router.post('/families/:id/delete', requireLogin, requireRole("admin"), processDeleteFamily)

export default router;