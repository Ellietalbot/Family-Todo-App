import bcrypt from 'bcrypt';

const password = 'P@$$w0rd!';
const saltRounds = 10;

const hash = await bcrypt.hash(password, saltRounds);
console.log(hash);