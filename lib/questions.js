mainQuestions = [
    {
        name: 'action',
        type: 'list',
        message: 'Would you like to do?',
        choices: ['View all Employees', 
                    'View all Employees by Department', 
                    'View all Employees by manager',
                    'Add Employee',
                    'Update Employee Role',
                    'Update Employee Manager',
                    'View All Roles',
                    'Add Role',
                    'Remove Role',
                    'Exit'
                ],
    }
];

module.exports = { mainQuestions };