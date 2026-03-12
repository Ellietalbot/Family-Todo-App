import { returnFamilyMemberInfo } from "../models/family.js";


const returnFamilyMembers = async (req, res) => {


    try {

        const info = await returnFamilyMemberInfo();

        if(!info){
            req.flash('error', 'No family members to display')
            return res.redirect('/dashboard');
        }

        return res.render('family/family', { title: 'My Family', users: info })
        
    } catch (error) {
        console.error("Error returning family info:", error)
        req.flash('error', 'Error during family info retrival')
        return res.redirect('/dashboard');
    }
};

export { returnFamilyMembers }