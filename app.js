const inquirer = require ('inquirer');
const cTable = require('console.table');
const { connectDB, disconnectDB, getJoinedEmployeeTable, getEmployeesByDepartment } = require('./utils/DButils');
const figlet = require('figlet');
const { mainQuestions } = require('./lib/questions');

// Start up App Intro Title
figlet('Employee Tracker', (err, result) => {
    console.log(err || result);
    console.log(('-').repeat(85));
})

connectDB();

getJoinedEmployeeTable().then(data => {
    console.table(data);
    askMainQuestions();
    // disconnectDB();
});

const askMainQuestions = () => {
    inquirer.prompt(mainQuestions).then(answer => {
        switch (answer.action) {
            case 'View all Employees':
                getJoinedEmployeeTable().then((data) => {
                    console.table(data);
                    askMainQuestions();
                });
                break;
            case 'View all Employees by Department':
                getEmployeesByDepartment().then(() => {
                    askMainQuestions();
                });
        }
    });
}
