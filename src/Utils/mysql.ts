import * as Bluebird from 'bluebird';
import { Connection, Pool, PoolConnection } from 'promise-mysql';
import { Google, Local, UserResponse } from '../Types';

// region getLocalAccount
export const getLocalAccount = (
    pool: Bluebird<Pool>,
    selector: string | number,
): Promise<Array<Local & UserResponse>> => {
    const whereCondition = typeof selector === 'string' ? 'email.email = ?' : 'user.user_id = ?';
    return pool.then(
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
    );
};
// endregion
// region getGoogleAccount
export const getGoogleAccount = (
    pool: Bluebird<Pool>,
    selector: string | number,
): Promise<Array<Google & UserResponse>> => {
    const whereCondition = typeof selector === 'string' ? 'email.email = ?' : 'user.user_id = ?';
    return pool.then(
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
    );
};
// endregion
// region getEmail
export const getEmail = (
    pool: Bluebird<Pool>,
    email: string,
): Promise<Array<{ emailId: number }>> =>
    pool.then(
        (connection): Bluebird<Array<{ emailId: number }>> =>
            connection.query(
                `
                    SELECT email.email_id
                    FROM email
                    WHERE email.email = ?
                `,
                [email],
            ),
    );
// endregion
// region getUser
export const getUserById = (pool: Bluebird<Pool>, id: number): Promise<Array<Express.User>> =>
    pool.then(
        (connection): Bluebird<Array<Express.User>> =>
            connection.query(
                `
                SELECT user.*
                FROM user
                WHERE user.user_id = ?
            `,
                [id],
            ),
    );

// endregion
// region insert
export const insert = (
    connection: Connection | PoolConnection,
    table: string,
    values: Record<string, string | number>,
): Promise<{ insertId: number }> =>
    connection.query(
        `
                        INSERT INTO ${table}
                        SET ?
                    `,
        [values],
    );
// endregion
