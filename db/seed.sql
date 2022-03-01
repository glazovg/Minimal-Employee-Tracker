INSERT INTO department
    (name)
VALUES
    ('Business Analyst'),
    ('Scrum Master'),
    ('Development'),
    ('QA');

INSERT INTO role
    (title, salary, department_id)
VALUES
    ('BA Manager', 70000, 1),
    ('BA Sr', 50000, 1),
    ('Tech Lead', 150000, 3),
    ('Team Lead', 90000, 4),
    ('Dev Senior', 90000, 3),
    ('Scrum Master Sr', 70000, 2),
    ('QA Automation', 80000, 4),
    ('QA Analyst', 50000, 4);

INSERT INTO employee
    (first_name, last_name, role_id, manager_id)
VALUES
    ('Harry', 'Potter', 1, NULL),
    ('Sirius', 'Black', 2, 1),
    ('Hermione', 'Granger', 3, NULL),
    ('Draco', 'Malfoy', 4, 3),
    ('Ron', 'Wesley', 5, NULL),
    ('Luna', 'Lovegood', 6, 5),
    ('Ginny', 'Wesley', 7, NULL),
    ('Neville', 'Longbottom', 8, 7);
    
