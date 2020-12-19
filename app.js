const inquirer = require ('inquirer');
const cTable = require('console.table');
const { connectDB, disconnectDB, getJoinedEmployeeTable, getCurrentDepartmentsOrManagers, 
    getDepartmentOrManagerEmployees, getRoles, addDeleteUpdateInTable } = require('./utils/DButils');
const figlet = require('figlet');
const { mainQuestions, employeeQuestions } = require('./lib/questions');

// Start up App Intro Title
figlet('Employee Tracker', (err, result) => {
    console.log(err || result);
})

connectDB();
const printTable = (data) => {
    console.log(('-').repeat(85));
    console.table(data);
    console.log(('-').repeat(85));
}
const start = () => {
    getJoinedEmployeeTable().then(data => {
        printTable(data);
        askMainQuestions();
    });
}

// Main Start menu choice questions function
const askMainQuestions = () => {
    inquirer.prompt(mainQuestions).then(answer => {
        switch (answer.action) {
            case 'View all Employees':
                getJoinedEmployeeTable().then((data) => {
                    printTable(data);
                    askMainQuestions();
                });
                break;
            case 'View all Employees by Department':
                askDepartments();
                break;
            case 'View all Employees by manager':
                askManagers();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Remove Employee':
                removeEmployee();
                break;
            case 'Update Employee Role':
                updateEmployeeRole();
                break;
            case 'Update Employee Manager':
                updateEmployeeManager();
                break;
            case 'View All Roles':
                viewAllRoles();
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
    getCurrentDepartmentsOrManagers('department')
        .then((rows) => {
            inquirer.prompt([
                {
                    name: 'choice',
                    type: 'list',
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
                getDepartmentOrManagerEmployees('department', answer.choice).then(results =>{
                    printTable(results);
                    askMainQuestions();
                });
        });
    });
}
const askManagers = () => {
    getCurrentDepartmentsOrManagers('manager')
        .then((rows) => {
            inquirer.prompt([
                {
                    name: 'choice',
                    type: 'rawlist',
                    choices() {
                      const choiceArray = [];
                      rows.forEach(({ manager_name, manager }) => {
                          if (!manager) {
                              manager = 'none';
                              manager_name = 'None';
                          }
                        choiceArray.push({ name: manager_name, value: manager });
                      });
                      return choiceArray;
                    },
                    message: 'Which manager employees would you like to see?',
                  },
            ])
            .then(answer => {
                getDepartmentOrManagerEmployees('a.manager', answer.choice).then(results => {
                    printTable(results);
                    askMainQuestions();
                });
        });
    });
};

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
                getJoinedEmployeeTable().then((results) => {
                    inquirer.prompt([
                        {
                            name: 'manager',
                            type: 'list',
                            message: "Who is  the employee's manager? ",
                            choices() {
                                const choiceArray = [];
                                results.forEach(({ id, first_name, last_name }) => {
                                  choiceArray.push({ name: `${first_name} ${last_name}`, value: id });
                                });
                                return choiceArray;
                            },
                        }
                        ])

                    .then(answer2 => {
                        // Join all answers to form new Employee object
                        const newEmployee = {...answers, ...answer1, ...answer2}; 
                        addDeleteUpdateInTable(newEmployee, 'add', 'employee');
                        start();
                    });
                });
            });
        });
    });
};


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
            start();
        });
    });
};

const updateEmployeeRole = () => {
    getJoinedEmployeeTable().then((results) => {
        inquirer.prompt([
            {
                name: 'id',
                type: 'list',
                message: "Which Employee's role Would you like to update? ",
                choices() {
                    const choiceArray = [];
                    results.forEach(({ id, first_name, last_name }) => {
                      choiceArray.push({ name: `${first_name} ${last_name}`, value: id });
                    });
                    return choiceArray;
                },
            }
        ]).then(answers => {
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
                    addDeleteUpdateInTable(newEmployee, 'update', 'employee');
                    start();
                });
            });
        });
    });
};

const updateEmployeeManager = () => {
    getJoinedEmployeeTable().then((results) => {
        inquirer.prompt([
            {
                name: 'id',
                type: 'list',
                message: "Which Employee's manager do you want to update? ",
                choices() {
                    const choiceArray = [];
                    results.forEach(({ id, first_name, last_name }) => {
                      choiceArray.push({ name: `${first_name} ${last_name}`, value: id });
                    });
                    return choiceArray;
                },
            }
        ]).then(answers => {
            getJoinedEmployeeTable().then(results => {
                inquirer.prompt([
                    {
                        name: 'manager',
                        type: 'list',
                        message: "Who is the employee's manager? ",
                        choices() {
                            const choiceArray = [];
                            results.forEach(({ id, first_name, last_name }) => {
                              choiceArray.push({ name: `${first_name} ${last_name}`, value: id });
                            });
                            return choiceArray;
                          },
                    }
                ])
                .then(answer1 => {
                    const newEmployee = {...answers, ...answer1}; // Join all answers to form new Employee object
                    addDeleteUpdateInTable(newEmployee, 'update', 'employee');
                    start();
                });
            });
        });
    });
};

const viewAllRoles = () => {
    getRoles().then(result => {
        printTable(result);
        askMainQuestions();
    });
}

// Start application
start();
