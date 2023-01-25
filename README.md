# infylink
A basic tool enabling users to have multiple links in their Instagram Bio https://infylink.herokuapp.com

## Details about tech stack
1. The basic tech stack is Node/Express/MongoDB/Bootstrap
2. I've implemented the MVC model to keep things organised and efficient
3. Implement user authentication and authorization (routes protection). Used bcrypt to store hashed passwords.
4. Added an admin user who can see all the resisted users and their details.
5. Added email support. Using Sendgrid to send emails when a user signs up.
6. Password reset via email. Used nodejs built in crypto to generate random token with expiration.
7. Did a lot of testing. Duplicate emails, duplicate usernames, password match, etc.
8. Added CSRFProtection using csurf. Also used express-session to manage sessions.
9. Using MongoDB Atlas to manage my MongoDB Database
10. Deployed the node/express app using heroko
11. The UI/UX isn't that amazing because I focused on backend and used plain simple bootstrap for the frontend.
12. I've also added Helmet - It secures web app by adding HTTPS Headers
13. I did setup important ENV Variables on Heroku instead of hard coding them
14. Added Cloudflare's Free SSL/TSL even on a free Heroku plan!
