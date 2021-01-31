DROP DATABASE Axilier;

CREATE DATABASE Axilier;

USE Axilier;

CREATE OR REPLACE TABLE email
(
    email_id INT AUTO_INCREMENT PRIMARY KEY,
    email    VARCHAR(254)
);

CREATE OR REPLACE TABLE account
(
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    email_id   INT,
    type       VARCHAR(10),
    CONSTRAINT fk_email_id
        FOREIGN KEY (email_id)
            REFERENCES email (email_id)
            ON DELETE CASCADE
            ON UPDATE RESTRICT
);

CREATE OR REPLACE TABLE user
(
    user_id     INT AUTO_INCREMENT PRIMARY KEY,
    main_acc_id INT,
    date_joined TIMESTAMP DEFAULT CURRENT_DATE,
    CONSTRAINT fk_main_acc_id
        FOREIGN KEY (main_acc_id)
            REFERENCES account (account_id)
            ON DELETE CASCADE
            ON UPDATE RESTRICT
);

CREATE OR REPLACE TABLE google
(
    google_id  INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT,
    auth_token VARCHAR(20),
    CONSTRAINT fk_google_acc_id
        FOREIGN KEY (account_id)
            REFERENCES account (account_id)
            ON DELETE CASCADE
            ON UPDATE RESTRICT
);

CREATE OR REPLACE TABLE local
(
    local_id   INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT,
    password   BINARY(60),
    CONSTRAINT fk_local_acc_id
        FOREIGN KEY (account_id)
            REFERENCES account (account_id)
            ON DELETE CASCADE
            ON UPDATE RESTRICT
);

INSERT INTO email (email)
VALUES ('tester.test@gmail.com'),
       ('john.doe@gmail.com'),
       ('trad.gif@yahoo.com'),
       ('joe.bloggs@btinternet.com'),
       ('kieran.lewin2000@gmail.com');

INSERT INTO account (email_id, type)
VALUES (1, 'GOOGLE'),
       (2, 'GOOGLE'),
       (3, 'LOCAL'),
       (4, 'LOCAL'),
       (5, 'LOCAL');

INSERT INTO local (account_id, password)
VALUES (3, 'test123'),
       (4, 'dfgbsdfg23'),
       (5, '$2b$10$iMZWuSLXDd0GZDphU8.1kOb1yuB3H3CJfpoknas.49VCMAtSM38Ke');

INSERT INTO google (account_id, auth_token)
VALUES (1, 'hfbsadnbnvadksnk'),
       (2, 'fvnadnsfvsadfgas');

INSERT INTO user (main_acc_id)
VALUES (5);
