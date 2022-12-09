const { Pool } = require('pg');
require('dotenv').config()
const urldb = process.env.DATABASE_NAME;
console.log(process.env.DATABASE_NAME)
const pool = new Pool({
  connectionString: urldb,
})

//  const { join } = require('path');
//  const { readFileSync } = require('fs');

//  create our temp table
// const fakedataSql = readFileSync(join(__dirname, '/chatDb.sql')).toString();
// async function name(){
//    console.log("ff",await pool.query(fakedataSql));
// } 
// name()
module.exports = pool
