## Project Description
This is a family task manager. Tasks can be created, delegated, commented on, and accepted or denied. I made it to help relieve some of the mental load carried by busy parents (especially moms).

## Database Schema
![ERD](https://github.com/user-attachments/assets/8ca44f6b-d101-422f-880a-48cdd14d5fe8)

## User Roles
- **Admin**:  
  Can create, edit, and delete families and users. Has special access to the admin dashboard with stats, history, and user and family data.

- **Parent**:  
  Can create, edit, and delete tasks, as well as create, edit, and delete comments. Can delegate tasks and accept or deny delegated tasks. Has access to the parental dashboard.

- **Child**:  
  Can accept or deny tasks, and create, edit, and delete comments.

## Test Account Credentials
- **Admin**: admin@familytodo.com  
- **Parent**: emailparent@gmail.com  
- **Child**: Emailkid@gmail.com

## Known Limitations
- No way for users to edit their own accounts  
  - Could be implemented with an additional account page
- Task history is not visible to users, except for completed tasks
- Admin visiting/family will crash if `family_id` is null  
  - Can be fixed by checking for null before the query
 
### Deployment URL
https://family-flow-sg6r.onrender.com/login
