import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
  const email = credentials?.email?.toLowerCase().trim();
  const password = credentials?.password;

  console.log("INPUT:", credentials);
  console.log("EMAIL NORMALIZADO:", email);

  if (!email || !password) {
    console.log("EMAIL OU SENHA AUSENTES");
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  console.log("USER ENCONTRADO:", user?.email);

  if (!user) {
    console.log("USUÁRIO NÃO ENCONTRADO");
    return null;
  }

  if (!user.isActive) {
    console.log("USUÁRIO INATIVO");
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  console.log("PASSWORD MATCH:", passwordMatches);

  if (!passwordMatches) {
    console.log("SENHA INVÁLIDA");
    return null;
  }

  console.log("LOGIN OK");

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    partnerId: user.partnerId
  };
}
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.partnerId = user.partnerId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.partnerId = token.partnerId;
      }

      return session;
    }
  }
};
