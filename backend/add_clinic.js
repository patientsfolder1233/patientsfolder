import readline from 'readline';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }
});

async function addClinic() {
  rl.question('Enter clinic/hospital name: ', async (clinic_name) => {
    rl.question('Enter username: ', async (username) => {
      rl.question('Enter password: ', async (password) => {
        const password_hash = await bcrypt.hash(password, 10);
        try {
          const result = await pool.query(
            'INSERT INTO users (username, password_hash, clinic_name) VALUES ($1, $2, $3) RETURNING *',
            [username, password_hash, clinic_name]
          );
          console.log('Clinic/hospital added:', result.rows[0]);
        } catch (error) {
          console.error('Error adding clinic/hospital:', error.message);
        }
        rl.close();
        pool.end();
      });
    });
  });
}

addClinic();
