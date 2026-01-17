#!/usr/bin/env node
/**
 * Script para criar usuário super_admin
 * Uso: node scripts/create-super-admin.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { users } from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não está definida');
  process.exit(1);
}

async function createSuperAdmin() {
  console.log('🔄 Conectando ao banco de dados...');
  
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    const username = 'gfranceschi';
    const password = 'gabriel';
    const name = 'Gabriel Franceschi';
    const email = 'gabriel@taetter.com.br';

    // Verificar se usuário já existe
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser) {
      console.log(`⚠️  Usuário '${username}' já existe`);
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Role: ${existingUser.role}`);
      
      // Atualizar senha se necessário
      const passwordHash = await bcrypt.hash(password, 10);
      await db
        .update(users)
        .set({ passwordHash, role: 'super_admin' })
        .where(eq(users.username, username));
      
      console.log(`✅ Senha atualizada para '${username}'`);
      return;
    }

    // Criar hash da senha
    console.log('🔐 Gerando hash da senha...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Inserir usuário
    console.log('👤 Criando usuário super_admin...');
    const [result] = await db.insert(users).values({
      username,
      passwordHash,
      name,
      email,
      role: 'super_admin',
      loginMethod: 'custom',
    });

    console.log('✅ Usuário super_admin criado com sucesso!');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: super_admin`);
    console.log(`   ID: ${result.insertId}`);
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

createSuperAdmin()
  .then(() => {
    console.log('\n🎉 Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
