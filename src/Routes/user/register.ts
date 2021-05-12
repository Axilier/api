/** @format */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import ApiError from '../../Utils/ApiError';
import { insert } from '../../Utils/mysql';

export default async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req?.body;
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string')
        throw new ApiError('Bad body values', 412);
    const hashedPass = await bcrypt.hash(password, 10);
    req.pool.then(
        async (pool): Promise<void> => {
            pool.getConnection().then(async connection => {
                await connection.beginTransaction();
                const emailExistsCheck = await connection.query(
                    `
                    SELECT email_id
                    FROM email
                    WHERE email = ?
                `,
                    [email],
                );
                if (emailExistsCheck.length > 0) {
                    res.send({ message: 'User with this email already exists' });
                    return;
                }
                const emailId = await insert(connection, 'email', { email });
                const localId = await insert(connection, 'local', {
                    email_id: emailId.insertId,
                    password: hashedPass,
                });
                await insert(connection, 'user', {
                    local_acc_id: localId.insertId,
                });
                connection.commit();
                req.logger.info(`user ${email} added`);
                res.sendStatus(201).send(`User ${email} created`);
            });
        },
    );
};
