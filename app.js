// Required packages, dependencies
const inquirer = require ('inquirer');
const cTable = require('console.table');
const { connectDB, disconnectDB, getJoinedEmployeeTable, getCurrentDepartmentsOrManagers, getDepartments,
    getDepartmentOrManagerEmployees, getRoles, addDeleteUpdateInTable, viewBudgetByDepartment } = require('./utils/DButils');
const figlet = require('figlet');
const { mainQuestions, employeeQuestions } = require('./lib/questions');

// Start up App Intro Title
figlet('Employee Tracker', (err, result) => {
    console.log(err || result);
})

// Establish connection to database
connectDB();

// Most of functions have self explanatory names
// Function to out put json object in formatted table
const printTable = (data) => {
    console.log(('-').repeat(85));
    console.table(data);
    console.log(('-').repeat(85));
};

// Functon to start app
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
            case 'View Total utilized Budget by Department':
                totalBudgets();
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
            case 'View|Add|Remove|Update Roles':
                viewAddDeleteRoles();
                break;
            case 'View|Add|Remove|Update Departments':
                viewAddDeleteDepartments();
                break;
            case 'Exit':
                disconnectDB();
                break;
            default:
                askMainQuestions();
        }
    });
}

// Function to view employees by department
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
                        if (!department) {
                            department = 'none';
                        }
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
};

// Functon to view employees by managers
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
                        default: 'none',
                        choices() {
                            const choiceArray = [];
                            choiceArray.push({ name: 'None', value: 'none' })
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

const viewAddDeleteRoles = () => {
    getRoles().then(roles => {
        printTable(roles);
        inquirer.prompt([{
            name: 'addOrDelete',
            type: 'list',
            message: 'Add or Delete Role?',
            choices: ['ADD', 'REMOVE', 'UPDATE', 'Cancel']
        },
        {
            name: 'id',
            type: 'rawlist',
            message: 'Select role: ',
            when: (answers) => answers.addOrDelete === 'REMOVE' || answers.addOrDelete === 'UPDATE',
            choices() {
                const choiceArray = [];
                roles.forEach(({ id, title }) => {
                    choiceArray.push({ name: title, value: id });
                });
                return choiceArray;
            },
        },
        {
            name: 'title',
            type: 'input',
            message: 'What is the new title of the role? ',
            when: (answers) => answers.addOrDelete === 'ADD' || answers.addOrDelete === 'UPDATE',
            validate: (value) => {
                if (value) {
                    return true;
                } else {
                    return 'Name cannot be empty!'
                }
            }
        },
        {
            name: 'salary',
            type: 'number',
            message: "What is the title salary? ",
            when: (answers) => answers.addOrDelete === 'ADD' || answers.addOrDelete === 'UPDATE',
            validate: (value) => {
                if (/\d/.test(value)) {
                  return true;
                }
                return 'Please enter a valid salary as a number!';
            },
        },
        ]).then(ans => {
            getDepartments().then(departments => {
                inquirer.prompt([
                    {
                        name: 'department_id',
                        type: 'list',
                        message: "Which department is this role in? ",
                        when: ans.addOrDelete === 'ADD' || ans.addOrDelete === 'UPDATE',
                        choices() {
                            const choiceArray = [];
                            departments.forEach(({ id, department }) => {
                              choiceArray.push({ name: department, value: id });
                            });
                            return choiceArray;
                        },
                    }
                ]).then(answers1 => {
                    answers = {...ans, ...answers1}
                    if (answers.addOrDelete === 'Cancel') {
                        start();
                    } else {
                        const action = answers.addOrDelete.toLowerCase();
                        delete answers.addOrDelete;
                        addDeleteUpdateInTable(answers, action ,'role');
                        start();
                    }
                });
            });
        });
    });
};

const viewAddDeleteDepartments = () => {
    getDepartments().then(departments => {
        printTable(departments);
        inquirer.prompt([{
            name: 'addOrDelete',
            type: 'list',
            message: 'Add or Delete Department?',
            choices: ['ADD', 'REMOVE', 'UPDATE', 'Cancel']
        },
        {
            name: 'id',
            type: 'rawlist',
            message: 'Select department: ',
            when: (answers) => answers.addOrDelete === 'REMOVE' || answers.addOrDelete === 'UPDATE',
            choices() {
                const choiceArray = [];
                departments.forEach(({ id, department }) => {
                    choiceArray.push({ name: department, value: id });
                });
                return choiceArray;
            },
        },
        {
            name: 'department',
            type: 'input',
            message: 'What is the new name of Department? ',
            when: (answers) => answers.addOrDelete === 'ADD' || answers.addOrDelete === 'UPDATE',
            validate: (value) => {
                if (value) {
                    return true;
                } else {
                    return 'Name cannot be empty!'
                }
            },
        }
        ]).then(answers => {
            if (answers.addOrDelete === 'Cancel') {
                start();
            } else {
                const action = answers.addOrDelete.toLowerCase();
                delete answers.addOrDelete;
                addDeleteUpdateInTable(answers, action ,'department');
                start();
            }
            
        });
    });
};

// Function to show total utilized budgets by departments
const totalBudgets = () => {
    viewBudgetByDepartment().then(results => {
        printTable(results);
        askMainQuestions();
    });
};

// Start application
start();
