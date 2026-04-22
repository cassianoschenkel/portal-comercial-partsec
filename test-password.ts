// test-password.ts
import bcrypt from "bcryptjs";

const hash = "$COLE_AQUI_O_PASSWORD_HASH_DO_PRISMA";

async function test() {
  const ok = await bcrypt.compare("admin123", hash);
  console.log("Senha válida?", ok);
}

test();
