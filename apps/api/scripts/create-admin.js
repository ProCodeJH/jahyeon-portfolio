// 관리자 계정 생성 스크립트
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const email = 'louispetergu@naver.com';
    const password = 'a12b45132A!';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.upsert({
        where: { email },
        update: {},
        create: {
            email,
            passwordHash: hashedPassword,
            name: 'Jahyeon Admin',
            role: 'SUPER_ADMIN',
        },
    });

    console.log('✅ Admin created:', admin.email);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
