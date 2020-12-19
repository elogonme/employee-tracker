const inquirer = require ('inquirer');
const cTable = require('console.table');
const { connectDB, disconnectDB, getJoinedEmployeeTable, getCurrentDepartments, 
    getDepartmentEmployees, getRoles, addEmployeeToDB } = require('./utils/DButils');
const figlet = require('figlet');
const { mainQuestions, addEmployeeQuestions } = require('./lib/questions');

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
                askDepartments();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Exit':
                disconnectDB();
                break;
        }
    });
}

const askDepartments = () => {
    getCurrentDepartments()
        .then((rows) => {
            inquirer.prompt([
                {
                    name: 'choice',
                    type: 'rawlist',
                    choices() {
                      const choiceArray = [];
                      rows.forEach(({ department }) => {
                        choiceArray.push(department);
                      });
                      return choiceArray;
                    },
                    message: 'What current Department would you like to see?',
                  },
            ])
            .then(answer => {
                getDepartmentEmployees(answer.choice).then(results =>{
                    console.table(results);
                    askMainQuestions();
                });
    });
});
}

const addEmployee = () => {
    inquirer.prompt(addEmployeeQuestions).then(answers => {
        getRoles().then(results => {
            inquirer.prompt([
                {
                    name: 'role_id',
                    type: 'list',
                    message: "What is the employee's role? ",
                    choices() {
                        const choiceArray = [];
                        results.forEach(({ title, id }) => {
                          choiceArray.push({ name: title, value: id });
                        });
                        return choiceArray;
                      },
                }
            ])
            .then(answer1 => {
                const newEmployee = {...answers, ...answer1}; // Join all answers to form new Employee object
                addEmployeeToDB(newEmployee);
                askMainQuestions();
            })
        });
        })
        
}