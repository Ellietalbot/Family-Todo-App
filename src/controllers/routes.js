import { Router } from 'express';
import { requireLogin } from '../middleware/auth.js';
import { returnFamilyMembers } from './family.js';
import { processLogout } from './login.js';
import registrationRouter from './registration.js';
import loginRouter from './login.js';
import dashboardRouter from './dashboard.js';
import taskRouter from './tasks.js';
import adminRouter from './admin.js';
import setupRouter from './setup.js';


const router = Router();

router.get('/family', requireLogin, returnFamilyMembers);
router.post('/logout', processLogout);


router.use('/login', loginRouter);
router.use('/register', registrationRouter);
router.use('/setup', setupRouter);
router.use('/tasks', taskRouter);
router.use('/admin', adminRouter);
router.use('/', dashboardRouter);


export default router;