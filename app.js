const inquirer = require ('inquirer');
const mysql = require ('mysql');
const cTable = require('console.table');
const dotenv = require('dotenv').config();

const connection = mysql.createConnection({
    host: 'localhost',
    // Your port; if not 3306
    port: 3306,
    // Your username
    user: 'root',
    // Be sure to update with your own MySQL password!
    password: process.env.SECRET_KEY,
    database: 'company_db',
  });

  // Connect to the DB
connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);

    connection.end();
  });
