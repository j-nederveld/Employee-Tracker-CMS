var mysql = require("mysql");
var inquirer = require("inquirer");
const { isIntersectionTypeAnnotation, inheritInnerComments } = require("@babel/types");
const { ConsoleWriter } = require("istanbul-lib-report");
const { get } = require("http");
const { stringify } = require("querystring");
let departments = [];
let roles = [];
let employees = [];
let departmentID = '';
let roleID = '';
const logo = require("asciiart-logo");

const logoText = logo({ name: "Employee Manager" }).render();
    console.log(logoText);

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Thisisadream",
  database: "staff_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
init();

});



function init(){
    getDepartments();
    getRoles();
    getEmployees()
    inquirer.prompt([
      {
          type: "list",
          message: "What do you want to do?",
          choices: ["View All Employees", "View All Employees By Department", "Add Employee", "Add Role", "Add Department", "Remove Employee", "Remove Role", "Update Employee Role", "Update Employee Manager", "View All Roles"],
          name: "option"
      }
      ])
      .then(function(res){
        switch (res.option) {
            // BONUS - How could you use * + etc. inside the app.get()?
            case "View All Employees":
                viewEmployees();
            break;
            case "View All Employees By Department":
                viewByDepartment();
            break;
            case "Add Employee":
                addEmployee();
            break;
            case "Add Role":
                addRole();
            break;
            case "Add Department":
                addDepartment();
            break;
            case "Remove Employee":
                removeQuery();
            break;
            case "Remove Role":
                removeRole();
            break;
            case "Update Employee Role":
                updateEmployeeRole();
            break;
            case "View All Roles":     
                viewRoles();
            break;
        }
    })
}

//view all employees
function viewEmployees(){
    connection.query(
        "SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name FROM employee INNER JOIN role on role_id = role.id INNER JOIN department on department_id = department.id", 
        function(err, res) {
        if (err) throw err;
        console.table(res);
    init();
      });
}

//choose department to view employees by
function viewByDepartment(){
    inquirer.prompt([
        {
            type: "list",
            message: "Choose Department:",
            choices: departments,
            name: "option"
        }
        ])
        .then(function(res){
            getDepartmentID(res.option)

        });
}

//view all current roles
function viewRoles(){
    connection.query(
        "SELECT * FROM role", 
        function(err, res) {
        if (err) throw err;
        console.table(res)
        init();
      });
}

//make an array of department names for inquirer prompts
function getDepartments(){
departments = [];
connection.query(
    "SELECT * FROM department", 
    function(err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++){
        departments.push(res[i].name)
    }
  });
}

//make an array of role titles for inquirer prompts
function getRoles(){
    roles = [];
    connection.query(
        "SELECT role.title FROM role", 
        function(err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++){
            roles.push(res[i].title)
        }
      });
    }

//make an array of employee names for inquirer prompts
function getEmployees(){
    employees = [];
    connection.query(
        "SELECT employee.first_name, employee.last_name FROM employee", 
        function(err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++){
            employee = res[i].first_name + ' ' + res[i].last_name;
            employees.push(employee)
        }
        });
    }

//gets the department ID for listing employees by department
function getDepartmentID(dep){
    connection.query(
        "SELECT * FROM department WHERE department.name= ?",
        [dep],
        function(err, res) {
        if (err) throw err;
        departmentID = res[0].id;
        getEmployeeByDepartment(departmentID);
      });
}

//takes in the department ID and returns the list of employees based on that
function getEmployeeByDepartment(id){
    connection.query(
        "SELECT department.name, employee.first_name, employee.last_name, role.title, role.salary FROM department INNER JOIN role on department_id = department.id INNER JOIN employee on role_id = role.id where department.id = (?)",
        [id], 
        function(err, res) {
        if (err) throw err;
        console.table(res)
        init();
})
}

//set employee information and pass it into the insert function
function addEmployee(){
    inquirer.prompt([
        {
            type: "list",
            message: "Choose Role:",
            choices: roles,
            name: "role"
        },
        {
            type: "input",
            message: "What is the employees first name?",
            name: "fname"

        },
        {
            type: "input",
            message: "What is the employees last name?",
            name: "lname"
        }

        ])
        .then(function(res){
            let firstName = res.fname;
            let lastName = res.lname;
            connection.query("SELECT role.id FROM role WHERE role.title = (?)", [res.role],
            function(err, res){
                if (err) throw err;
                roleID = res[0].id;
                insertEmployee(firstName, lastName);
            })
        });
}


//name the new department and add it to the db
function addDepartment(){
    inquirer.prompt([
        {
            type: "input",
            message: "What department would you like to add?",
            name: "department"
        }
        ])
        .then(function(res){
            connection.query(
                "INSERT INTO department (name) VALUES (?)",
                [res.department],
                function(err, res) {
                if (err) throw err;
                console.log("Department created!")
                    init();
              });
        });
}

//set role params and pass them to the insertRole function
function addRole(){
    inquirer.prompt([
        {
            type: "input",
            message: "What role are you adding?",
            name: "role"
        },
        {
            type: "input",
            message: "What is the salary for this role?",
            name: "salary"
        },
        {
            type: "list",
            message: "What department does this role belong to?",
            choices: departments,
            name: "department"
        }
        ])
        .then(function(res){
            let title = res.role;
            let salary = res.salary;
            connection.query(
                "SELECT * FROM department WHERE department.name= ?",
                [res.department],
                function(err, res) {
                if (err) throw err;
                departmentID = res[0].id;
                insertRole(title, salary);
              });
        });
}

//add new role based on the prompts from addRole
function insertRole(title, salary){
    connection.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [title, salary, departmentID],
    function(err, res){
        if (err) throw err;
        
        init();
    })
}

//remove role based on prompt
function removeRole(){
    inquirer.prompt([
        {
            type: "list",
            message: "Which role would you like to remove?",
            choices: roles,
            name: "role"
        }
        ])
        .then(function(res){
            connection.query("DELETE FROM role WHERE (role.title) = (?)",[ res.role ], 
            function(err, res) {
            if (err) throw err;
            console.log("Role has been removed.")
        init();
        });
        });
}

//add employee
function insertEmployee(firstname, lastname){
    connection.query("INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)",[ firstname, lastname, roleID ], 
    function(err, res) {
    if (err) throw err;
    viewEmployees();
  });
}

//choose which employee to delete
function removeQuery(){
    inquirer.prompt([
        {
            type: "list",
            message: "Which employee would you like to remove?",
            choices: employees,
            name: "employee"
        }
        ])
        .then(function(res){
            removeEmployee(res.employee)
        });
}

//delete employee
function removeEmployee(name){
    var first_name = name.split(' ').slice(0, -1).join(' ');
    var last_name = name.split(' ').slice(-1).join(' ');

    connection.query("DELETE FROM employee WHERE (first_name, last_name) = (?, ?)",[ first_name, last_name ], 
    function(err, res) {
    if (err) throw err;
    console.log(name + " has been removed.")
    init();
  });
}

//select the employee to update, as well as their new role
function updateEmployeeRole(){
    inquirer.prompt([
        {
            type: "list",
            message: "Which employee would you like to update?",
            choices: employees,
            name: "employee"
        },
        {
            type: "list",
            message: "Which is their new role?",
            choices: roles,
            name: "role"
        }
        ])
        .then(function(res){
        var first_name = res.employee.split(' ').slice(0, -1).join(' ');
        var last_name = res.employee.split(' ').slice(-1).join(' ');

            connection.query("SELECT role.id FROM role WHERE role.title = (?)", [res.role],
            function(err, res){
                if (err) throw err;
                roleID = res[0].id;
                updateEmployee(first_name, last_name, roleID);
            })
        });
}

//update employee based on the prompts from updateEmployeeRole
function updateEmployee(fname, lname, id){
    connection.query("UPDATE employee SET role_id = ? WHERE (first_name, last_name) = (?, ?)",[ id, fname, lname ], 
    function(err, res) {
    if (err) throw err;
    console.log(fname + ' ' + lname + " has been updated!")
    init();
  });
}