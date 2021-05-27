import { VerifyCallback } from 'passport-google-oauth20';
import { googleInit, recordValidationPassport } from '../Utils';
import { getGoogleAccount, getUserById } from '../Utils/mysql';

export default async (req: Express.Request, id: number, done: VerifyCallback): Promise<void> => {
    try {
        const user = await getUserById(req.pool, id);
        recordValidationPassport(user, done, 'user');
        const connection = await req.pool;
        const email = await connection.query(
            `
                SELECT email.email
                FROM local,
                     email
                WHERE local.email_id = email.email_id
                  AND local.entry_connection_id = ?
                UNION
                SELECT email.email
                FROM google,
                     email
                WHERE google.email_id = email.email_id
                  AND google.entry_connection_id = ?
            `,
            [id, id],
        );
        recordValidationPassport(email, done, 'email');
        const existingGoogleAccount = await getGoogleAccount(req.pool, id);
        recordValidationPassport(existingGoogleAccount, done, 'googleAccount');
        return done(undefined, {
            ...user[0],
            email: email[0].email,
            googleAuth: googleInit(existingGoogleAccount[0].refresh_token),
        });
    } catch (e) {
        return done(e);
    }
};
