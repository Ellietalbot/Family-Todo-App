BEGIN;

CREATE TYPE role_enum AS ENUM('parent', 'child');
CREATE TYPE status_enum AS ENUM('pending', 'active', 'completed');
CREATE TYPE category_enum AS ENUM('chores', 'homework', 'errands', 'personal', 'other');

DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Task" CASCADE;
DROP TABLE IF EXISTS "Task_History" CASCADE;
DROP TABLE IF EXISTS "Comments" CASCADE;

CREATE TABLE "User" (
    user_id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(100),
    email VARCHAR(150),
    role role_enum,
    created_at DATE,
    password_hash TEXT
);

CREATE TABLE Task (
    task_id SERIAL PRIMARY KEY NOT NULL,
    title VARCHAR(255),
    description TEXT,
    created_by INT REFERENCES "User"(user_id),
    assigned_to INT REFERENCES "User"(user_id),
    status status_enum,
    category category_enum,
    created_at DATE,
    due_date DATE
);

CREATE TABLE Task_History (
    history_id SERIAL PRIMARY KEY NOT NULL,
    task_id INT REFERENCES Task(task_id),
    changed_by INT REFERENCES "User"(user_id),
    changed_at DATE,
    old_status VARCHAR(50),
    new_status status_enum
);

CREATE TABLE Comments (
    comment_id SERIAL PRIMARY KEY NOT NULL,
    task_id INT REFERENCES Task(task_id),
    user_id INT REFERENCES "User"(user_id),
    content TEXT,
    created_at DATE
);
COMMIT;