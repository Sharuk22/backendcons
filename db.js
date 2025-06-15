// const { Pool } = require('pg');


// const pool = new Pool({
//   host: "pgm-zf88260fyr2nijpmvo.rwlb.kualalumpur.rds.aliyuncs.com",
//   user: "cerpuser",
//   port: 5432,
//   password: "Ati@987K",
//   database: "cerp"
// });
// export default pool;

// // module.exports = pool;

// db.js

import pkg from 'pg';   // 'pg' package එක import කර ගන්න
const { Pool } = pkg;   // destructure Pool class එක

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


// const pool = new Pool({
//   host: "pgm-zf88260fyr2nijpmvo.rwlb.kualalumpur.rds.aliyuncs.com",
//   user: "cerpuser",
//   port: 5432,
//   password: "Ati@987K",
//   database: "cerp"
// });

export default pool;
