import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  password: '1995',
  database: 'tu_tienda_amiga',
  port: 5432,
});

export default pool;