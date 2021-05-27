/** @format */

import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { getEmail, insert } from '../../Utils/mysql';

export default async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req?.body;
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        res.status(412).send('Bad body values');
        return undefined;
    }

    try {
        const pool = await req.pool;
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        const localEmailExistCheck = await connection.query(
            `
                SELECT local.local_id
                FROM local,
                     email
                WHERE email = ?
                  AND local.email_id = email.email_id
            `,
            [email],
        );
        if (localEmailExistCheck.length > 0) {
            res.status(409).send('Local user with this email already exists');
            return undefined;
        }
        const generalEmailId = await getEmail(req.pool, email);
        const emailId = generalEmailId.length === 1 ? generalEmailId[0].emailId : (await insert(connection, 'email', { email })).insertId;
        const hashedPass = await bcrypt.hash(password, 10);
        const userId = await insert(connection, 'user', { is_admin: 0 });
        await insert(connection, 'local', {
            entry_connection_id: userId.insertId,
            email_id: emailId,
            password: hashedPass,
        });
        connection.commit();
        req.logger.info(`user ${email} created`);
        res.status(201).send(`User ${email} created`);
    } catch (e) {
        return next(e);
    }
    return undefined;
};
