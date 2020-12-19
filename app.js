const inquirer = require ('inquirer');
const cTable = require('console.table');
const { connectDB, disconnectDB, getJoinedEmployeeTable, getCurrentDepartments, 
    getDepartmentEmployees, getRoles, addDeleteUpdateInTable } = require('./utils/DButils');
const figlet = require('figlet');
const { mainQuestions, employeeQuestions } = require('./lib/questions');

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
            case 'Remove Employee':
                removeEmployee();
                break;
            case 'Exit':
                disconnectDB();
                break;
            default:
                askMainQuestions();
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
    inquirer.prompt(employeeQuestions).then(answers => {
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
                addDeleteUpdateInTable(newEmployee, 'add', 'employee');
                askMainQuestions();
            });
        });
    });
        
}

const removeEmployee = () => {
    getJoinedEmployeeTable().then((results) => {
        inquirer.prompt([
            {
                name: 'id',
                type: 'list',
                message: "Which Employee Would you like to remove? ",
                choices() {
                    const choiceArray = [];
                    results.forEach(({ id, first_name, last_name }) => {
                      choiceArray.push({ name: `${first_name} ${last_name}`, value: id });
                    });
                    return choiceArray;
                  },
            }
        ]).then(answers => {
            const employee = {...answers}; // Join all answers to form new Employee object
                    addDeleteUpdateInTable(employee, 'remove', 'employee');
                    askMainQuestions();
        });
    });
    
}