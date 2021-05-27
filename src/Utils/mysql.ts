import * as Bluebird from 'bluebird';
import { Connection, Pool, PoolConnection } from 'promise-mysql';
import { Google, Local, UserResponse } from '../Types';

// region getLocalAccount
export const getLocalAccount = (pool: Bluebird<Pool>, selector: string | number): Promise<Array<Local>> => {
    const whereCondition = typeof selector === 'string' ? 'email.email = ?' : 'user.user_id = ?';
    return pool.then(
        (connection: Pool): Bluebird<Array<Local & UserResponse>> =>
            connection.query(
                `
                        SELECT local.*
                        FROM local,
                             ${typeof selector === 'string' ? 'email' : 'user'}
                        WHERE ${whereCondition}
                            ${
                                typeof selector === 'string'
                                    ? 'AND email.email_id = local.email_id'
                                    : 'AND user.user_id = local.entry_connection_id'
                            }
                    `,
                [selector],
            ),
    );
};
// endregion
// region getGoogleAccount
export const getGoogleAccount = (pool: Bluebird<Pool>, selector: string | number): Promise<Array<Google>> => {
    const whereCondition = typeof selector === 'string' ? 'email.email = ?' : 'user.user_id = ?';
    return pool.then(
        (connection: Pool): Bluebird<Array<Google & UserResponse>> =>
            connection.query(
                `
                        SELECT google.*
                        FROM google,
                             ${typeof selector === 'string' ? 'email' : 'user'}
                        WHERE ${whereCondition}
                            ${
                                typeof selector === 'string'
                                    ? 'AND email.email_id = google.email_id'
                                    : 'AND user.user_id = google.entry_connection_id'
                            }
                    `,
                [selector],
            ),
    );
};
// endregion
// region getEmail
export const getEmail = (pool: Bluebird<Pool>, email: string): Promise<Array<{ emailId: number }>> =>
    pool.then(
        (connection: Pool): Bluebird<Array<{ emailId: number }>> =>
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
        (connection: Pool): Bluebird<Array<Express.User>> =>
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
): Bluebird<{ insertId: number }> =>
    connection.query(
        `
            INSERT INTO ${table}
            SET ?
        `,
        [values],
    );
// endregion
