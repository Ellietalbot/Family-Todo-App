import bcrypt from 'bcrypt';
const hash = await bcrypt.hash('P@$$w0rd!', 10);
console.log(hash);