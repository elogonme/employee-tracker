const mainQuestions = [
    {
        name: 'action',
        type: 'list',
        message: 'Would you like to do?',
        choices: [
                    'View all Employees',
                    'View all Employees by manager',
                    'View all Employees by Department', 
                    'View Total utilized Budget by Department',
                    'Add Employee',
                    'Remove Employee',
                    'Update Employee Role',
                    'Update Employee Manager',
                    'View All Roles',
                    'Add Role',
                    'Remove Role',
                    'View|Add|Remove|Update Departments',
                    'Exit'
                ],
    }
];

const employeeQuestions = [{
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
];

const roleQuestions = [{
        name: 'title',
        type: 'input',
        message: "What is the role's title? ",
        validate: (value) => {
            if (value) {
                return true;
            } else {
                return 'Title cannot be empty!'
            }
        }
    },
    {
        name: 'salary',
        type: 'number',
        message: "What is the title salary? ",
        validate: (value) => {
            if (/\d/.test(value)) {
              return true;
            }
            return 'Please enter a valid salary as a number!';
        },
    },
];

module.exports = { mainQuestions, employeeQuestions, roleQuestions };
