import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import ApiError from '../Utils/ApiError';
import { getEmail, getGoogleAccount, getUserById, insert } from '../Utils/mysql';

export default new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: '/user/google/callback',
        passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done): Promise<void> => {
        if (!profile.emails || profile.emails[0].value === '')
            return done(new ApiError('No email passed back from google', 422));
        if (!req.body.action || (req.body.action !== 'connect' && req.body.action !== 'entry'))
            return done(new ApiError('Bad body values', 422));
        const existingEmail = await getEmail(req.pool, profile.emails[0].value);
        const existingGoogleAccount = await getGoogleAccount(req.pool, profile.emails[0].value);
        if (existingGoogleAccount.length !== 0 && req.body.action === 'connect')
            return done(new ApiError('A user with this google account linked already exists', 409));
        if (req.user && req.body.action === 'entry')
            return done(new ApiError('User already logged in', 422));
        if (!req.user && req.body.action === 'connect')
            return done(new ApiError('Cannot connect google account when not logged in', 422));
        const connection = await (await req.pool).getConnection();
        try {
            const emailId =
                existingEmail.length > 0
                    ? existingEmail[0].emailId
                    : (await insert(connection, 'email', { email: profile.emails[0].value }))
                          .insertId;
            const newGoogleAccount = await insert(connection, 'google', {
                email_id: emailId,
                google_account_id: profile.id,
                refresh_token: refreshToken,
            });
            if (req.user) {
                // Doc connecting google account to user
                await connection.query(
                    `
                        UPDATE user
                        SET user.google_acc_id = ?
                        WHERE user.user_id = ?
                    `,
                    [newGoogleAccount.insertId, req.user.user_id],
                );
                return done(undefined, {
                    ...req.user,
                    google_acc_id: newGoogleAccount.insertId,
                });
            }
            const existingUser: Array<Express.User> = await connection.query(
                `
                    SELECT *
                    FROM user,
                         google
                    WHERE google.google_account_id = ?
                      AND user.google_acc_id = google.google_id
                `,
                [profile.id],
            );
            if (existingUser.length > 1)
                return done(
                    new ApiError('Multiple accounts linked to this google account exist', 500),
                );
            if (existingUser.length !== 0) return done(undefined, existingUser[0]);
            // Doc creating new user based on google account
            const newUser = await getUserById(
                req.pool,
                (
                    await insert(connection, 'user', {
                        google_acc_id: newGoogleAccount.insertId,
                    })
                ).insertId,
            );
            return done(undefined, newUser[0]);
        } catch (error) {
            connection.rollback();
            return done(error, undefined);
        }
    },
);
