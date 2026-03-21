BEGIN;
DROP TYPE IF EXISTS role_enum, status_enum, category_enum CASCADE;
CREATE TYPE role_enum AS ENUM('parent', 'child', 'admin');
CREATE TYPE status_enum AS ENUM('pending', 'active', 'completed');
CREATE TYPE category_enum AS ENUM('chores', 'homework', 'errands', 'personal', 'other');

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS task CASCADE;
DROP TABLE IF EXISTS task_history CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS family CASCADE;

CREATE TABLE family (
    family_id SERIAL PRIMARY KEY NOT NULL,
    family_name VARCHAR(255),
    invite_code VARCHAR(50) UNIQUE,
    created_at DATE DEFAULT NOW()
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    role role_enum,
    created_at DATE DEFAULT NOW(),
    password_hash TEXT,
    family_id INT REFERENCES family(family_id) ON DELETE SET NULL
);

CREATE TABLE task (
    task_id SERIAL PRIMARY KEY NOT NULL,
    title VARCHAR(255),
    description TEXT,
    created_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    assigned_to INT REFERENCES users(user_id) ON DELETE SET NULL,
    status status_enum DEFAULT 'active',
    category category_enum,
    created_at DATE DEFAULT NOW(),
    due_date DATE,
    family_id INT REFERENCES family(family_id) ON DELETE SET NULL
);

CREATE TABLE task_history (
    history_id SERIAL PRIMARY KEY NOT NULL,
    task_id INT REFERENCES task(task_id) ON DELETE SET NULL,
    changed_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    changed_at DATE DEFAULT NOW(),
    old_status VARCHAR(50),
    new_status status_enum
);

CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY NOT NULL,
    task_id INT REFERENCES task(task_id) ON DELETE SET NULL,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    content TEXT,
    created_at DATE DEFAULT NOW()
);

INSERT INTO family (family_name, invite_code) VALUES ('The Smiths', 'SMITH-0001');

INSERT INTO users (name, email, password_hash, role, family_id) VALUES 
    ('mom', 'email123@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uklCt7f5W', 'parent', 1),
    ('dad', 'emaildad@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uklCt7f5W', 'parent', 1),
    ('Micah', 'Micahkid@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uklCt7f5W', 'child', 1),
    ('Gabby', 'Gabby@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uklCt7f5W', 'child', 1);

COMMIT;