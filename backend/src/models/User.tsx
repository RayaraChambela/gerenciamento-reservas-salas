// Modelo gerenciado pelo Prisma — ver prisma/schema.prisma
// Role: USER | ADMIN
// Campos: id, name, email, passwordHash, role, createdAt
import sqlite from 'sqlite';

export { };
const Userschema = new sqlite.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true}, //evitar zika de conflitos de nomes
    password: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    createdAt: { type: Date, default: Date.now},
});
export default sqlite.model('User', Userschema);
