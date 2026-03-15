import { returnFamilyMemberInfo, getFamilyById } from "../models/family.js";

const returnFamilyMembers = async (req, res) => {
    const familyId = req.session.user.family_id;

    try {
        const info = await returnFamilyMemberInfo(familyId);
        const family = await getFamilyById(familyId);

        if(!info){
            req.flash('error', 'No family members to display')
            return res.redirect('/');
        }

        return res.render('family/family', { title: 'My Family', users: info, family })
        
    } catch (error) {
        console.error("Error returning family info:", error)
        req.flash('error', 'Error during family info retrival')
        return res.redirect('/dashboard');
    }
};


export { returnFamilyMembers }