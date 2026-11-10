import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, adminProfiles, customerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UserRole } from "./types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sgei-shein-angola-dev-secret-change-in-production"
);
const COOKIE_NAME = "sgei_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export interface SessionPayload {
  userId: number;
  role: UserRole;
  email?: string;
  name: string;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Response("Não autorizado", { status: 401 });
  }
  return session;
}

export async function getSessionOptional(): Promise<SessionPayload | null> {
  return getSession();
}

export async function findOrCreateCustomerByPhone(
  phone: string,
  name: string,
  whatsapp?: string | null,
  email?: string | null
) {
  let user;
  const existingByPhone = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);
  if (existingByPhone.length > 0) {
    user = existingByPhone[0];
  } else if (email) {
    const existingByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingByEmail.length > 0) {
      user = existingByEmail[0];
      // Atualiza telefone se existir email sem telefone
      if (!user.phone) {
        await db.update(users).set({ phone }).where(eq(users.id, user.id));
      }
    }
  }
  if (!user) {
    const created = await db
      .insert(users)
      .values({
        email: email || null,
        phone,
        role: "customer",
      })
      .returning();
    user = created[0];
    await db.insert(customerProfiles).values({
      userId: user.id,
      name,
      whatsapp: whatsapp || null,
    });
  } else {
    // Garante que existe customerProfile
    const existingProfile = await db
      .select()
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, user.id))
      .limit(1);
    if (existingProfile.length === 0) {
      await db.insert(customerProfiles).values({
        userId: user.id,
        name,
        whatsapp: whatsapp || null,
      });
    }
  }
  return user;
}

export async function authenticateAdmin(email: string, password: string) {
  const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (found.length === 0) return null;
  const user = found[0];
  if (user.role !== "admin" || !user.passwordHash) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  const profile = await db
    .select()
    .from(adminProfiles)
    .where(eq(adminProfiles.userId, user.id))
    .limit(1);
  const name = profile[0]?.name || "Administrador";
  return { userId: user.id, role: "admin" as const, email: user.email || undefined, name };
}

export async function authenticateCustomer(emailOrPhone: string, password: string) {
  const isEmail = /^[^@]+@[^@]+\.[^@]+$/.test(emailOrPhone);
  let found;
  if (isEmail) {
    found = await db.select().from(users).where(eq(users.email, emailOrPhone)).limit(1);
  } else {
    found = await db.select().from(users).where(eq(users.phone, emailOrPhone)).limit(1);
  }
  if (found.length === 0) return null;
  const user = found[0];
  if (!user.passwordHash) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  const profile = await db
    .select()
    .from(customerProfiles)
    .where(eq(customerProfiles.userId, user.id))
    .limit(1);
  return {
    userId: user.id,
    role: user.role,
    email: user.email || undefined,
    name: profile[0]?.name || "Cliente",
  };
}
