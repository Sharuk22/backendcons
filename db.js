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

const pool = new Pool({
  host: "pgm-zf88260fyr2nijpmvo.rwlb.kualalumpur.rds.aliyuncs.com",
  user: "cerpuser",
  port: 5432,
  password: "Ati@987K",
  database: "cerp"
});

export default pool;
