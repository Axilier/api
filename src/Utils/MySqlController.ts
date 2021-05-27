/** @format */

import mysql, { Connection } from 'promise-mysql';
import * as Bluebird from 'bluebird';
import { Logger } from 'winston';
import { Google, Local, UserResponse } from '../Types';
import { getNeatDate } from './Utils';

export default class MySqlController {
    readonly connection: Bluebird<Connection>;

    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB,
        });
    }

    getLocalUser(selector: string | number): Promise<Array<Local & UserResponse>> {
        const whereCondition =
            typeof selector === 'string' ? 'email.email = ?' : 'user.user_id = ?';
        return this.connection
            .then(
                (connection): Bluebird<Array<Local & UserResponse>> =>
                    connection.query(
                        `
                        SELECT user.*, local.*, email.*
                        FROM email,
                             local,
                             user
                        WHERE ${whereCondition}
                          AND email.email_id = local.email_id
                          AND user.local_acc_id = local.local_id
                    `,
                        [selector],
                    ),
            )
            .catch(err => {
                const log = `${selector}:getLocalUser:${getNeatDate()}`;
                this.logger.error(`name:${log} \n ${err.message}`);
                throw new Error(log);
            });
    }

    getGoogleUser(selector: string | number): Promise<Array<Google & UserResponse>> {
        const whereCondition =
            typeof selector === 'string' ? 'email.email = ?' : 'user.user_id = ?';
        return this.connection
            .then(
                (connection): Bluebird<Array<Google & UserResponse>> =>
                    connection.query(
                        `
                        SELECT user.*, google.*, email.*
                        FROM email,
                             google,
                             user
                        WHERE ${whereCondition}
                            AND email.email_id = google.email_id
                            AND user.google_acc_id = google.google_id
                    `,
                        [selector],
                    ),
            )
            .catch(err => {
                const log = `${selector}:getGoogleUser:${getNeatDate()}`;
                this.logger.error(`name:${log} \n ${err.message}`);
                throw new Error(log);
            });
    }

    getUserById(id: number): Promise<Array<Express.User>> {
        return this.connection
            .then(connection =>
                connection.query(
                    `
                        SELECT user.*
                        FROM user
                        WHERE user.user_id = ?
                    `,
                    [id],
                ),
            )
            .catch(err => {
                const log = `${id}:getUserById:${getNeatDate()}`;
                this.logger.error(`name:${log} \n ${err.message}`);
                throw new Error(log);
            });
    }

    // NOTE USE THIS -- this.connection.escape

    insert(table: string, values: Record<string, string | number>): Promise<{ insertId: number }> {
        return this.connection
            .then(connection =>
                connection.query(
                    `
                        INSERT INTO ${table}
                        SET ?
                    `,
                    [values],
                ),
            )
            .catch(err => {
                const log = `${table}:insert:${getNeatDate()}`;
                this.logger.error(`name:${log} \n Error: ${err.message} \n SQL: ${err.sql}`);
                throw new Error(log);
            });
    }
}
