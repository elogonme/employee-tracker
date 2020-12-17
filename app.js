const inquirer = require ('inquirer');
const cTable = require('console.table');
const { connectDB, disconnectDB, getJoinedEmployeeTable } = require('./utils/DButils')

connectDB();
const employees = getJoinedEmployeeTable().then(data => {
    console.table(data);
    disconnectDB();
});

