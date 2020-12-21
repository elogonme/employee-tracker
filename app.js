// Required packages, dependencies
const inquirer = require ('inquirer');
const cTable = require('console.table'); // npm package to printout table from json
// DB utilities methods separated into DButils.js
const { connectDB, disconnectDB, getJoinedEmployeeTable, getCurrentDepartmentsOrManagers, getDepartments,
    getDepartmentOrManagerEmployees, getRoles, addDeleteUpdateInTable, viewBudgetByDepartment } = require('./utils/DButils');
// npm package used for ascii intro title
const figlet = require('figlet');
const { mainQuestions, employeeQuestions } = require('./lib/questions');

// Start up App Intro Title
figlet('Employee Tracker', (err, result) => {
    console.log(err || result);
})

// Establish connection to database
connectDB();

// Most of functions have self explanatory names
// Function to output json object in formatted table with two horizontal lines at start and end
const printTable = (data) => {
    console.log(('-').repeat(85));
    console.table(data);
    console.log(('-').repeat(85));
};

// Functon to start app by displaying all employees in formatted table
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
                start();
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
            case 'EXIT':
                disconnectDB();
                break;
            default:
                askMainQuestions();
        };
    });
};

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
            getDepartmentOrManagerEmployees('department', answer.choice).then(results => {
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
    inquirer.prompt(employeeQuestions).then(ans => {
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
                        choiceArray.unshift({ name: 'CANCEL', value: 0 });
                        return choiceArray;
                      },
                }
            ])
            .then(ans1 => {
                getJoinedEmployeeTable().then((results) => {
                    inquirer.prompt([
                        {
                            name: 'manager',
                            type: 'list',
                            message: "Who is  the employee's manager? ",
                            when: (ans1.role_id !== 0),
                            choices() {
                                const choiceArray = [];
                                results.forEach(({ id, first_name, last_name }) => {
                                  choiceArray.push({ name: `${first_name} ${last_name}`, value: id });
                                });
                                choiceArray.unshift({ name: 'CANCEL', value: 0 });
                                return choiceArray;
                            },
                        }
                        ])

                    .then(ans2 => {
                        // If in any question 'CANCEL' was selected abort and go to start
                        if (ans1.role_id === 0 || ans2.manager === 0) {
                            start();
                        } else {
                            // Join all answers to form new Employee object
                            const newEmployee = {...ans, ...ans1, ...ans2}; 
                            addDeleteUpdateInTable(newEmployee, 'add', 'employee');
                            start();
                        }
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
                    choiceArray.unshift({ name: 'CANCEL', value: 0 });
                    return choiceArray;
                },
            }
        ]).then(answers => {
            // If in any question 'CANCEL' was selected abort and go to start
            if (answers.id === 0) {
                start();
            } else {
            const employee = {...answers}; // Join all answers to form new Employee object
            addDeleteUpdateInTable(employee, 'remove', 'employee');
            start();
            };
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
                    choiceArray.unshift({ name: 'CANCEL', value: 0 });
                    return choiceArray;
                },
            }
        ]).then(ans => {
            getRoles().then(results => {
                inquirer.prompt([
                    {
                        name: 'role_id',
                        type: 'list',
                        message: "What is the employee's role? ",
                        when: (ans.id !== 0), 
                        choices() {
                            const choiceArray = [];
                            results.forEach(({ title, id }) => {
                              choiceArray.push({ name: title, value: id });
                            });
                            choiceArray.unshift({ name: 'CANCEL', value: 0 });
                            return choiceArray;
                          },
                    }
                ])
                .then(ans1 => {
                    // If in any question 'CANCEL' was selected abort and go to start
                    if (ans.id === 0 || ans1.role_id === 0) {
                        start();
                    } else {
                    const newEmployee = {...ans, ...ans1}; // Join all answers to form new Employee object
                    addDeleteUpdateInTable(newEmployee, 'update', 'employee');
                    start();
                    };
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
                    choiceArray.unshift({ name: 'CANCEL', value: 0 });
                    return choiceArray;
                },
            }
        ]).then(ans => {
            getJoinedEmployeeTable().then(results => {
                inquirer.prompt([
                    {
                        name: 'manager',
                        type: 'list',
                        message: "Who is the employee's manager? ",
                        default: 'none',
                        when: (ans.id !== 0),
                        choices() {
                            const choiceArray = [];
                            choiceArray.push({ name: 'None', value: 'none' })
                            results.forEach(({ id, first_name, last_name }) => {
                              choiceArray.push({ name: `${first_name} ${last_name}`, value: id });
                            });
                            choiceArray.unshift({ name: 'CANCEL', value: 0 });
                            return choiceArray;
                          },
                    }
                ])
                .then(ans1 => {
                    // If in any question 'CANCEL' was selected abort and go to start
                    if (ans.id === 0 || ans1.manager === 0) {
                        start();
                    } else {
                    const newEmployee = {...ans, ...ans1}; // Join all answers to form new Employee object
                    addDeleteUpdateInTable(newEmployee, 'update', 'employee');
                    start();
                    };
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
            message: 'Add, Delete or Update Role?',
            choices: ['ADD', 'REMOVE', 'UPDATE', 'Cancel']
        },
        {
            name: 'id',
            type: 'list',
            message: 'Select role: ',
            when: (answers) => answers.addOrDelete === 'REMOVE' || answers.addOrDelete === 'UPDATE',
            choices() {
                const choiceArray = [];
                roles.forEach(({ id, title }) => {
                    choiceArray.push({ name: title, value: id });
                });
                choiceArray.unshift({ name: 'CANCEL', value: 0 });
                return choiceArray;
            },
        },
        {
            name: 'title',
            type: 'input',
            message: 'What is the new title of the role? ',
            when: (answers) => answers.addOrDelete === 'ADD' || answers.addOrDelete === 'UPDATE' && answers.id !== 0,
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
            when: (answers) => answers.addOrDelete === 'ADD' || answers.addOrDelete === 'UPDATE' && answers.id !== 0,
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
                        when: ans.addOrDelete === 'ADD' || ans.addOrDelete === 'UPDATE' && ans.id !== 0,
                        choices() {
                            const choiceArray = [];
                            departments.forEach(({ id, department }) => {
                              choiceArray.push({ name: department, value: id });
                            });
                            choiceArray.unshift({ name: 'CANCEL', value: 0 });
                            return choiceArray;
                        },
                    }
                ]).then(ans1 => {
                    // If in any question 'CANCEL' was selected abort and go to start
                    if (ans.id === 0 || ans1.department_id === 0 || ans.addOrDelete === 'Cancel') {
                        start();
                    } else {
                    answers = {...ans, ...ans1};
                    const action = answers.addOrDelete.toLowerCase();
                    delete answers.addOrDelete;
                    addDeleteUpdateInTable(answers, action ,'role');
                    start();
                    };
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
            type: 'list',
            message: 'Select department: ',
            when: (answers) => answers.addOrDelete === 'REMOVE' || answers.addOrDelete === 'UPDATE',
            choices() {
                const choiceArray = [];
                departments.forEach(({ id, department }) => {
                    choiceArray.push({ name: department, value: id });
                });
                choiceArray.unshift({ name: 'CANCEL', value: 0 });
                return choiceArray;
            },
        },
        {
            name: 'department',
            type: 'input',
            message: 'What is the new name of Department? ',
            when: (answers) => answers.addOrDelete === 'ADD' || answers.addOrDelete === 'UPDATE' && answers.id !== 0,
            validate: (value) => {
                if (value) {
                    return true;
                } else {
                    return 'Name cannot be empty!'
                }
            },
        }
        ]).then(answers => {
            if (answers.addOrDelete === 'Cancel' || answers.id === 0) {
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
