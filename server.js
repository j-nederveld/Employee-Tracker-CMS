var mysql = require("mysql");
var inquirer = require("inquirer");
const { isIntersectionTypeAnnotation, inheritInnerComments } = require("@babel/types");
const { ConsoleWriter } = require("istanbul-lib-report");
const { get } = require("http");
let departments = [];
let roles = [];
let departmentID = '';

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
    inquirer.prompt([
      {
          type: "list",
          message: "What do you want to do?",
          choices: ["View All Employees", "View All Employees By Department", "Add Employee", "Remove Employee", "Update Employee Role", "Update Employee Manager", "View All Roles"],
          name: "option"
      }
      ])
      .then(function(res){
        switch (res.option) {
            // BONUS - How could you use * + etc. inside the app.get()?
            case "View All Employees":
                console.log("View All Employees")
                viewEmployees();
            break;
            case "View All Employees By Department":
                console.log("View All Employees By Department")
                viewByDepartment();
            break;
            case "Add Employee":
                addEmployee();
                console.log("Add Employee")
            break;
            case "Remove Employee":
                console.log("Remove Employee")
            break;
            case "Update Employee Role":
                console.log("Update Employee Role")
            break;
            case "Update Employee Manager":
                console.log("Update Employee Manager")
            break;
            case "View All Roles":
                
                viewRoles();
                console.log("View All Roles")
            break;
        }
    })
}

// SELECT Orders.OrderID, Customers.CustomerName, Orders.OrderDate
// FROM Orders
// INNER JOIN Customers ON Orders.CustomerID=Customers.CustomerID;

function viewEmployees(){
    connection.query(
        "SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee INNER JOIN role ON employee.role_id=role.id", 
        function(err, res) {
        if (err) throw err;
        console.table(res) 
    init();
      });
}

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
            console.log(res.option);
            getDepartmentID(res.option)

        });
}

function viewRoles(){
    inquirer.prompt([
        {
            type: "list",
            message: "Choose Role:",
            choices: roles,
            name: "option"
        }
        ])
        .then(function(res){
            console.log(res.option);
            getDepartmentID(res.option)

        });
}

function getDepartments(){
connection.query(
    "SELECT * FROM department", 
    function(err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++){
        departments.push(res[i].name)
    }
  });
}

function getRoles(){
    connection.query(
        "SELECT * FROM role", 
        function(err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++){
            roles.push(res[i].title)
        }
      });
    }


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

function getEmployeeByDepartment(id){
    connection.query(
        "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.department_id FROM employee INNER JOIN role ON department_id=?",
        [id], 
        function(err, res) {
        if (err) throw err;
        console.table(res)
        init();
})
}

function addEmployee(){
    inquirer.prompt([
        {
            type: "list",
            message: "Choose Role:",
            choices: roles,
            name: "option"
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
            console.log(res);
            connection.query(
                "INSERT INTO employee SET ?",
                {
                  first_name: res.fname,
                  last_name: res.lname,
                },
                function(err, res) {
                if (err) throw err;
                console.log(res)
                viewEmployees();
                
              });

        });
}