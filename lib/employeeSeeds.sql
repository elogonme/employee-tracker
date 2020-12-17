-- Company Database Schema --
DROP DATABASE IF EXISTS companyDB;

CREATE DATABASE companyDB;

USE companyDB;

-- Table for departments --
CREATE TABLE department (
    id INT AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

-- Table for roles within company --
CREATE TABLE role (
  id INT AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INT NOT NULL,
  FOREIGN KEY (department_id) REFERENCES department (id),
  PRIMARY KEY (id)
);

-- Employee table --
CREATE TABLE employee (
  id INT AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id INT,
  FOREIGN KEY (role_id) REFERENCES role (id),
  PRIMARY KEY (id)
);
-- Intitial seeds for testing --
INSERT INTO department (name)
VALUES ('Sales'), ('Engineering'), ('Finance'), ('Legal');

INSERT INTO role (title, salary, department_id)
VALUES ('Accountant', 100000, 3), ('Manager', 180000, 1), ('Software Engineer', 150000, 2), ('Salesperson', 80000, 1), ('Lawyer', 190000, 4);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ('John', 'Doe', 4), ('Mike', 'Chan', 2), ('Ashley', 'Rodriguez', 3), ('Kevin', 'Brown', 1), ('Sara', 'Lourd', 2), ('Tom', 'Allen', 5);
