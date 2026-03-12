BEGIN;
DROP TYPE IF EXISTS role_enum, status_enum, category_enum CASCADE;
CREATE TYPE role_enum AS ENUM('parent', 'child', 'admin');
CREATE TYPE status_enum AS ENUM('pending', 'active', 'completed');
CREATE TYPE category_enum AS ENUM('chores', 'homework', 'errands', 'personal', 'other');

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS task CASCADE;
DROP TABLE IF EXISTS task_history CASCADE;
DROP TABLE IF EXISTS comments CASCADE;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(100),
    email VARCHAR(150),
    role role_enum,
    created_at DATE,
    password_hash TEXT
);

CREATE TABLE task (
    task_id SERIAL PRIMARY KEY NOT NULL,
    title VARCHAR(255),
    description TEXT,
    created_by INT REFERENCES users(user_id),
    assigned_to INT REFERENCES users(user_id),
    status status_enum,
    category category_enum,
    created_at DATE,
    due_date DATE
);

CREATE TABLE task_history (
    history_id SERIAL PRIMARY KEY NOT NULL,
    task_id INT REFERENCES task(task_id),
    changed_by INT REFERENCES users(user_id),
    changed_at DATE,
    old_status VARCHAR(50),
    new_status status_enum
);

CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY NOT NULL,
    task_id INT REFERENCES task(task_id),
    user_id INT REFERENCES users(user_id),
    content TEXT,
    created_at DATE
);
INSERT INTO users (name, email, password_hash, role) VALUES ('mom', 'email123@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uklCt7f5W', 'parent'), ('dad', 'emaildad@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uklCt7f5W', 'parent'), ('Micah', 'Micahkid@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uklCt7f5W', 'child'), ('Gabby', 'Gabby@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uklCt7f5W', 'child');
COMMIT;