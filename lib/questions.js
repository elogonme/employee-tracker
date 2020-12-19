const mainQuestions = [
    {
        name: 'action',
        type: 'list',
        message: 'Would you like to do?',
        choices: ['View all Employees', 
                    'View all Employees by Department', 
                    'View all Employees by manager',
                    'Add Employee',
                    'Remove Employee'
                    'Update Employee Role',
                    'Update Employee Manager',
                    'View All Roles',
                    'Add Role',
                    'Remove Role',
                    'Exit'
                ],
    }
];

const addEmployeeQuestions = [{
        name: 'first_name',
        type: 'input',
        message: "What is the employee's first name? ",
        validate: (value) => {
            if (value) {
                return true;
            } else {
                return 'Name cannot be empty!'
            }
        }
    },
    {
        name: 'last_name',
        type: 'input',
        message: "What is the employee's last name? ",
        validate: (value) => {
            if (value) {
                return true;
            } else {
                return 'Last name cannot be empty!'
            }
        }
    },
]

module.exports = { mainQuestions, addEmployeeQuestions };