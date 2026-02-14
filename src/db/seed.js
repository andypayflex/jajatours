#!/usr/bin/env node
/**
 * Password hash generator for admin authentication.
 * Usage: node src/db/seed.js
 * Prompts for a password and outputs the bcrypt hash to set in .env
 */
import bcrypt from 'bcryptjs';
const { hashSync } = bcrypt;
import { createInterface } from 'node:readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question('Enter admin password: ', (password) => {
  if (!password || password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }
  const hash = hashSync(password, 12);
  console.log('\nAdd this to your .env file:\n');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log();
  rl.close();
});
