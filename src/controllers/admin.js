import { Router } from 'express';
import { requireLogin, requireRole } from '../middleware/auth.js';
import { countFamilies, countUsers, averageFamilySize, totalTasks, recentActivity, returnAllFamilies, getAllUsers, updateUserRole, updateFamily, deleteFamily } from '../models/admin.js';
import { deleteUser, createFamily, generateUniqueInviteCode } from '../models/forms/registration.js';

const router = Router();

// This function calls queries from the admin.js model all at once using Promise.all.
// Responds with the admin dashboard view 
const showAdminDashboard = async (req, res, next) => {
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
        next(error);
    }
};

// Gets all users from the model and then passes that to the manage users view it renders
const showManageUsers = async (req, res, next) => {
    try {
        const users = await getAllUsers();
        return res.render('admin/users', {
            title: 'Manage Users',
            users
        });
    } catch (error) {
        next(error);
    }
};

// Updates a users role and then once done redirects back to the users page
const processUpdateRole = async (req, res, next) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
        await updateUserRole(role, id);
        req.flash('success', 'Update role successful!');
        res.redirect('/admin/users');
    } catch (error) {
        next(error);
    }
};

// Deletes a user, safeguards a user from deleting their own account and redirects back to the users page. 
const processDeleteUser = async (req, res, next) => {
    const { id } = req.params;
    const currentUser = req.session.user;

    if (parseInt(id) === currentUser.user_id) {
        req.flash('error', 'You cannot delete your own account.');
        return req.session.save(() => res.redirect('/admin/users'));
    }
    try {
        await deleteUser(id);
        req.flash('success', 'User deleted successfully.');
        res.redirect('/admin/users');
    } catch (error) {
        next(error);
    }
};

//Allows admins to create families, generates an invite code for the family and redirects to the families page.
const processCreateFamily = async (req, res, next) => {
    const { familyName } = req.body;
    try {
        const inviteCode = await generateUniqueInviteCode(familyName);
        await createFamily(familyName, inviteCode);
        req.flash('success', `Family created! Your invite code is: ${inviteCode}`);
        return res.redirect('/admin/families');
    } catch (error) {
        next(error);
    }
};

// Allows admin to update family info 
const processUpdateFamily = async (req, res, next) => {
    const { id } = req.params;
    const { familyName } = req.body;
    try {
        await updateFamily(id, familyName);
        req.flash('success', 'Family updated!');
        return res.redirect('/admin/families');
    } catch (error) {
        next(error);
    }
};

// Allows admins to delete families. 
const processDeleteFamily = async (req, res, next) => {
    const { id } = req.params;
    try {
        await deleteFamily(id);
        req.flash('success', 'Family deleted!');
        return res.redirect('/admin/families');
    } catch (error) {
        next(error);
    }
};

// Returns all families and renders the family page
const showFamilies = async (req, res, next) => {
    try {
        const families = await returnAllFamilies();
        return res.render('admin/families', {
            title: 'Manage Families',
            families
        });
    } catch (error) {
        next(error);
    }
};


router.get('/', requireLogin, requireRole("admin"), showAdminDashboard);
router.get('/users', requireLogin, requireRole("admin"), showManageUsers);
router.post('/users/:id/role', requireLogin, requireRole("admin"), processUpdateRole);
router.post('/users/:id/delete', requireLogin, requireRole("admin"), processDeleteUser);
router.get('/families', requireLogin, requireRole("admin"), showFamilies);
router.post('/families', requireLogin, requireRole("admin"), processCreateFamily);
router.post('/families/:id/edit', requireLogin, requireRole("admin"), processUpdateFamily);
router.post('/families/:id/delete', requireLogin, requireRole("admin"), processDeleteFamily);

export default router;