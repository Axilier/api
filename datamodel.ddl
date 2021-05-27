DROP DATABASE IF EXISTS Axilier;

CREATE DATABASE Axilier;

USE Axilier;

CREATE OR REPLACE TABLE email
(
    email_id INT AUTO_INCREMENT PRIMARY KEY,
    email    VARCHAR(254) NOT NULL
);

CREATE OR REPLACE TABLE user
(
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    is_admin  BOOLEAN DEFAULT 0,
    date_joined TIMESTAMP
);

CREATE OR REPLACE TABLE google
(
    google_id         INT AUTO_INCREMENT PRIMARY KEY,
    storage_connection_id INT,
    entry_connection_id INT,
    email_id          INT,
    google_account_id BINARY(255),
    refresh_token     TEXT(512),
    CONSTRAINT fk_google_storage_connection_id
        FOREIGN KEY (storage_connection_id)
            REFERENCES user (user_id)
            ON DELETE CASCADE
            ON UPDATE RESTRICT,
    CONSTRAINT fk_google_entry_connection_id
        FOREIGN KEY (entry_connection_id)
            REFERENCES user (user_id)
            ON DELETE CASCADE
            ON UPDATE RESTRICT,
    CONSTRAINT fk_google_acc_id
        FOREIGN KEY (email_id)
            REFERENCES email (email_id)
            ON UPDATE RESTRICT
);

CREATE OR REPLACE TABLE local
(
    local_id INT AUTO_INCREMENT PRIMARY KEY,
    entry_connection_id INT NOT NULL,
    email_id INT NOT NULL,
    password BINARY(60) NOT NULL,
    CONSTRAINT fk_local_entry_connection_id
        FOREIGN KEY (entry_connection_id)
            REFERENCES user (user_id)
            ON DELETE CASCADE
            ON UPDATE RESTRICT,
    CONSTRAINT fk_local_acc_id
        FOREIGN KEY (email_id)
            REFERENCES email (email_id)
            ON UPDATE RESTRICT
);

CREATE OR REPLACE TABLE issue_type
(
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(32)
);

CREATE OR REPLACE TABLE issue
(
    issue_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type_id INT NOT NULL,
    title VARCHAR(64) NOT NULL,
    message VARCHAR(255) NOT NULL,
    CONSTRAINT fk_issues
        FOREIGN KEY (user_id)
            REFERENCES user (user_id)
            ON DELETE CASCADE
            ON UPDATE RESTRICT,
        FOREIGN KEY (type_id)
            REFERENCES issue_type (type_id)
            ON DELETE CASCADE
            ON UPDATE RESTRICT
);
