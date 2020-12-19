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
        const sqlQueryAll = `SELECT a.id, a.first_name, a.last_name, role.title, department.department, role.salary, 
        CONCAT(b.first_name, ' ', b.last_name) AS manager
        FROM employee a
        LEFT JOIN role ON role_id = role.id
        LEFT JOIN department ON  department.id = role.department_id
        LEFT JOIN employee b ON a.manager = b.id;`;
        
        connection.query(sqlQueryAll, (err, res) => {
            if (err) throw err;
            // Log all results of the SELECT statement
            resolve(res);
            // connection.end();
        });
    });
};

const getCurrentDepartmentsOrManagers = (group) => {
    return new Promise((resolve, reject) => {
        const newQuery = `SELECT a.id, a.first_name, a.last_name, role.title, department.department, role.salary, 
                a.manager, CONCAT(b.first_name, ' ', b.last_name) AS manager_name
                FROM employee a
                LEFT JOIN role ON role_id = role.id
                LEFT JOIN department ON  department.id = role.department_id
                LEFT JOIN employee b ON a.manager = b.id
                GROUP BY ${group};`;

        connection.query(newQuery, (err, res) => {
            if (err) throw err;
            resolve(res);
        });
    });
};

const getDepartmentOrManagerEmployees = (selection, search) => {
    let param = null;
    if (search === 'none') param = selection + ' IS NULL'; // if search for manager is none set query string to IS NULL
    return new Promise((resolve, reject) => {
        const newQuery = `SELECT a.id, a.first_name, a.last_name, role.title, department.department, role.salary, 
        a.manager, CONCAT(b.first_name, ' ', b.last_name) AS manager_name
        FROM employee a
        LEFT JOIN role ON role_id = role.id
        LEFT JOIN department ON  department.id = role.department_id
        LEFT JOIN employee b ON a.manager = b.id
        WHERE ${param || '?'}`; // if param is set then apply param string to query otherwise use ? placehlder for sql query
        connection.query(newQuery, { [selection]: search }, (err, res) => {
            if (err) throw err;
            resolve(res);
        });
    });
}

const getRoles = () => {
    return new Promise((resolve, reject) => {
        const newQuery = `SELECT role.id, role.title, role.salary, department.department, department_id FROM role
                        LEFT JOIN department ON  department.id = role.department_id;`
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
                newQuery = `UPDATE ${table} SET ? WHERE id = ${item.id}`;
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
    getCurrentDepartmentsOrManagers, getDepartmentOrManagerEmployees, getRoles, addDeleteUpdateInTable };
