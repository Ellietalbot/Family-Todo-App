import { returnFamilyMemberInfo, getFamilyById } from "../models/family.js";
import { getAllTasksByFamily } from "../models/forms/task.js";

const returnFamilyMembers = async (req, res, next) => {
    const familyId = req.session.user.family_id;
    
    try {
        const [info, family, tasks] = await Promise.all([
            returnFamilyMemberInfo(familyId),
            getFamilyById(familyId),
            getAllTasksByFamily(familyId)
        ]);

        if (!info) {
            req.flash('error', 'No family members to display');
            return res.redirect('/family');
        }

        return res.render('family/family', { title: 'My Family', users: info, family, tasks });
        
    } catch (error) {
        next(error);
    }
};


export { returnFamilyMembers }