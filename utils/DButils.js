const mysql = require ('mysql');
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
const connectDB = () => {
    connection.connect((err) => {
        if (err) throw err;
        // console.log(`connected as id ${connection.threadId}\n`);
      });
}

const disconnectDB = () => {
    connection.end();
}

const getJoinedEmployeeTable = () => {
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, (err, res) => {
            if (err) throw err;
            // Log all results of the SELECT statement
            resolve(res);
            // connection.end();
        });
    });
};
const getEmployeesByDepartment = () => {
    console.log('Employees by department');
};

const sqlQuery = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department, role.salary, manager
FROM employee
LEFT JOIN role ON employee.role_id = role.id
LEFT JOIN department ON  department.id = role.department_id;`

module.exports = { connectDB, getJoinedEmployeeTable, disconnectDB, getEmployeesByDepartment };
