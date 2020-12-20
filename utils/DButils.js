// All databse access and queiry utilites are in this file
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
    multipleStatements: true
  });

  // Connect to the DB
const connectDB = () => {
    connection.connect((err) => {
        if (err) throw err;
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
            resolve(res);
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
    if (search === 'none') param = selection + ' IS NULL'; // if search for manager is 'none' set query string to IS NULL
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

const getDepartments = () => {
    return new Promise((resolve, reject) => {
        const newQuery = `SELECT id, department FROM department;`
        connection.query(newQuery, (err, res) => {
            if (err) throw err;
            resolve(res);
        });
    });
}

const addDeleteUpdateInTable = (item, action, table) => {
    let paramToNull = '';
    return new Promise((resolve, reject) => {
        let newQuery = '';
        // Select different queries based on action chosen
        switch (action) {
            case 'add':
                newQuery = `INSERT INTO ${table} SET ?`;
                break;
            case 'remove':
                // On remove - form query to null reference values in different tables to avoid errors when item deleted
                switch (table) {
                    case 'employee':
                        tableToNull = 'employee';
                        paramToNull = 'manager'
                        break;
                    case 'role':
                        tableToNull = 'employee';
                        paramToNull = 'role_id'
                        break;
                    case 'department':
                        tableToNull = 'role';
                        paramToNull = 'department_id'
                        break;
                }
                newQuery = ` UPDATE ${tableToNull} SET ${paramToNull}=NULL WHERE ${paramToNull}= ${item.id};
                SET FOREIGN_KEY_CHECKS=0;
                DELETE FROM ${table} WHERE id = ${item.id};
                SET FOREIGN_KEY_CHECKS=1;`;
                break;
            case 'update':
                if (item.manager === 'none') item.manager = null;
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

const viewBudgetByDepartment = () => {
    return new Promise((resolve, reject) => {
        const newQuery = `SELECT department.department AS 'Department', 
        COUNT(employee.first_name) AS 'Employees in department', SUM(role.salary) AS 'Total Budget utilized'
        FROM employee
        LEFT JOIN role ON role_id = role.id
        LEFT JOIN department ON  department.id = role.department_id
        GROUP BY department.department
        ORDER BY SUM(role.salary) DESC;`
        connection.query(newQuery, (err, res) => {
            if (err) throw err;
            resolve(res);
        });
    });
};

module.exports = { connectDB, getJoinedEmployeeTable, disconnectDB, getDepartments, viewBudgetByDepartment,
    getCurrentDepartmentsOrManagers, getDepartmentOrManagerEmployees, getRoles, addDeleteUpdateInTable };
