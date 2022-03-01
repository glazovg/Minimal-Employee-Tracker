import { createRequire } from "module";
const require = createRequire(import.meta.url);
const mysql = require('mysql2');
const inquirer = require('inquirer');
import chalk from 'chalk';
const figlet = require("figlet");
require('console.table');

/**
 * port: If 3306 is already taken change port.
 * user: Change for your mysql username.
 * password: Change for your mysql password.
 */
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'employees'
});

connection.connect(err => {
    if (err) throw err;
    intro();
    init();
});

const options = [
    {
        message: "View All Departments",
        fn: () => viewAllDepartments()
    },
    {
        message: "View All Roles",
        fn: () => viewAllRoles()
    },
    {
        message: "View All Employees",
        fn: () => viewAllEmployees()
    },
    {
        message: "Add A Department",
        fn: () => addDepartment()
    },
    {
        message: "Add A Role",
        fn: () => addRole()
    },
    {
        message: "Add An Employee",
        fn: () => addEmployee()
    },
    {
        message: "Update Employee Role",
        fn: () => updateRole()
    },
    {
        message: 'Exit',
        fn: () => connection.end()
    }
];

function intro() {
    console.log(
        chalk.blue(
            figlet.textSync("Minimal Employee Tracker")
        )
    );
}

async function init() {
    const answer = await inquirer
        .prompt({
            name: 'action',
            type: 'list',
            message: 'What would you like to do?',
            choices: options.map(option => option.message)
        });

    const index = options.findIndex(option => option.message === answer.action)

    options[index].fn()
}

function viewAllDepartments() {
    const query = `SELECT department.name, department.id
    FROM department
    ORDER BY department.id;`;

    connection.promise().query(query)
        .then(([rows, fields]) => {
            console.log('ALL DEPARTMENTS');
            console.table(rows);
            init();
        })
        .catch(console.log);
}

function viewAllEmployees() {
    const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN employee manager on manager.id = employee.manager_id
    INNER JOIN role ON (role.id = employee.role_id)
    INNER JOIN department ON (department.id = role.department_id)
    ORDER BY employee.id;`;

    connection.promise().query(query)
        .then(([rows, fields]) => {
            console.log('ALL EMPLOYEES');
            console.table(rows);
            init();
        })
        .catch(console.log);
}

function viewAllRoles() {
    const query = `SELECT role.title, role.id, department.name AS department, role.salary
    FROM role
    LEFT JOIN department ON role.department_id = department.id
    ORDER BY role.id;`;

    connection.promise().query(query)
        .then(([rows, fields]) => {
            console.log('ALL ROLES');
            console.table(rows);
            init();
        })
        .catch(console.log);
}

async function addDepartment() {
    const answer = await inquirer.prompt([
        {
            name: "department",
            type: "input",
            message: "What is the name of the new department? "
        }
    ]);

    const query = `INSERT INTO department (name) VALUES (?);`;

    connection.promise().query(query, answer.department)
        .then(() => {
            console.log('NEW DEPARTMENT ADDED TO THE DATABASE!');
            init();
        })
        .catch(console.log);
};

async function addRole() {
    const departmentsQuery = `SELECT department.name, department.id
    FROM department
    ORDER BY department.name;`;
    const [departments] = await connection.promise().query(departmentsQuery);
    const answer = await inquirer.prompt([
        {
            name: "role",
            type: "input",
            message: "What is the name of the new role? "
        },
        {
            name: "salary",
            type: "input",
            message: "What is the salary of the new role? "
        },
        {
            name: "department",
            type: "list",
            message: "Which department does the new role belong to?",
            choices: departments.map(department => department.name)
        },
    ]);

    const index = departments.findIndex(department => department.name === answer.department);
    const departmentId = departments[index].id;
    const query = `INSERT INTO role (title, salary, department_id ) VALUES (?, ?, ?);`;

    connection.promise().query(query, [answer.role, answer.salary, departmentId])
        .then(() => {
            console.log('NEW ROLE ADDED TO THE DATABASE!');
            init();
        })
        .catch(console.log);
};

async function addEmployee() {
    const rolesQuery = `SELECT role.title, role.id
    FROM role
    ORDER BY role.title;`;
    const managersQuery = `SELECT CONCAT(employee.first_name, ' ', employee.last_name) as name, employee.id
    FROM employee
    ORDER BY employee.first_name;`;
    const [roles] = await connection.promise().query(rolesQuery);
    const [managers] = await connection.promise().query(managersQuery);
    const managerChoices = managers.map(manager => manager.name);

    managerChoices.unshift('None');

    const answer = await inquirer.prompt([
        {
            name: "firstName",
            type: "input",
            message: "What is the name of the new employee? "
        },
        {
            name: "lastName",
            type: "input",
            message: "What is the last name of the new employee? "
        },
        {
            name: "role",
            type: "list",
            message: "What is the role of the new employee?",
            choices: roles.map(role => role.title)
        },
        {
            name: "manager",
            type: "list",
            message: "Who is the manager of the new employee?",
            choices: managerChoices
        },
    ]);

    const indexRole = roles.findIndex(role => role.title === answer.role);
    const indexManager = managers.findIndex(manager => manager.name === answer.manager);
    const roleId = roles[indexRole].id;
    const managerId = indexManager >= 0 ? managers[indexManager].id : null;
    const query = `INSERT INTO employee 
    (first_name, last_name, role_id, manager_id)
    VALUES (?, ?, ?, ?);`;

    connection.promise().query(query, [answer.firstName, answer.lastName, roleId, managerId])
        .then(() => {
            console.log(`${answer.firstName} ${answer.lastName} ADDED TO THE DATABASE!`);
            init();
        })
        .catch(console.log);
};

async function updateRole() {
    const employeeQuery = `SELECT CONCAT(employee.first_name, ' ', employee.last_name) as name, employee.id
    FROM employee
    ORDER BY employee.first_name;`;
    const rolesQuery = `SELECT role.title, role.id
    FROM role
    ORDER BY role.title;`;
    const [employees] = await connection.promise().query(employeeQuery);
    const [roles] = await connection.promise().query(rolesQuery);
    const answer = await inquirer.prompt([
        {
            name: "employee",
            type: "list",
            message: "Which employee's role do you want to update?",
            choices: employees.map(employee => employee.name)
        },
        {
            name: "role",
            type: "list",
            message: "Which role do you want to assing to the selected employee?",
            choices: roles.map(role => role.title)
        },
    ]);

    const indexEmployee = employees.findIndex(employee => employee.name === answer.employee);
    const indexRole = roles.findIndex(role => role.title === answer.role);
    const employeeId = employees[indexEmployee].id;
    const roleId = roles[indexRole].id;
    const query = `UPDATE employee
    SET role_id = ?
    WHERE employee.id = ?;`;

    connection.promise().query(query, [roleId, employeeId])
        .then(() => {
            console.log(`UPDATED EMPLOYEE'S ROLE!`);
            init();
        })
        .catch(console.log);
}
