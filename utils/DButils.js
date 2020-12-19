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
    console.log('Exiting app... Thank you for using Employee tracker!')
}

const getJoinedEmployeeTable = () => {
    return new Promise((resolve, reject) => {
        const sqlQueryAll = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department, role.salary, manager
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN department ON  department.id = role.department_id;`
        connection.query(sqlQueryAll, (err, res) => {
            if (err) throw err;
            // Log all results of the SELECT statement
            resolve(res);
            // connection.end();
        });
    });
};
const getCurrentDepartments = () => {
    return new Promise((resolve, reject) => {
        const newQuery = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department, role.salary, manager
                FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON  department.id = role.department_id
                GROUP BY Department;`;

        connection.query(newQuery, (err, res) => {
            if (err) throw err;
            resolve(res);
        });
    });
};

const getDepartmentEmployees = (dep) => {
    return new Promise((resolve, reject) => {
        const newQuery = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department, role.salary, manager
                FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON  department.id = role.department_id
                WHERE ?`;

        connection.query(newQuery, {department: dep}, (err, res) => {
            if (err) throw err;
            resolve(res);
        });
    });
}

const getRoles = () => {
    return new Promise((resolve, reject) => {
        const newQuery = `SELECT title, id FROM role`
        connection.query(newQuery, (err, res) => {
            if (err) throw err;
            resolve(res);
        });
    });
};

const addDeleteUpdateInTable = (item, action, table) => {
    return new Promise((resolve, reject) => {
        let newQuery = '';
        switch (action) {
            case 'add':
                newQuery = `INSERT INTO ${table} SET ?`;
                break;
            case 'remove':
                newQuery = `DELETE FROM ${table} WHERE id = ${item.id}`;
                break;
            case 'update':
                newQuery = `UPDATE ${table} WHERE id = ${item.id}`;
                break;
        }
        connection.query(newQuery, item, (err, res) => {
            if (err) throw err;
            console.log(`${action} item in ${table}`);
            resolve(true);
        });
    });
}

module.exports = { connectDB, getJoinedEmployeeTable, disconnectDB, 
    getCurrentDepartments, getDepartmentEmployees, getRoles, addDeleteUpdateInTable };
