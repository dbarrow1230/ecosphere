// backend/scripts/hashPassword.js
import bcrypt from "bcryptjs";

const password="M@tthew633";
const hash=await bcrypt.hash(password,10);

console.log(hash);
