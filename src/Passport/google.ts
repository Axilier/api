import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import ApiError from '../Utils/ApiError';
import { getEmail, getGoogleAccount, getUserById, insert } from '../Utils/mysql';
import { getNeatDate, googleInit, recordValidationPassport } from '../Utils';

export default new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: '/user/google/callback',
        passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done): Promise<void> => {
        if (!profile.emails || profile.emails[0].value === '') return done(new ApiError('No email passed back from google', 422));
        const { type } = JSON.parse(req.query.state as string);
        if (!type || (type !== 'connect' && type !== 'entry')) return done(new ApiError('Bad body values', 422));
        const existingEmail = await getEmail(req.pool, profile.emails[0].value);
        const existingGoogleAccount = await getGoogleAccount(req.pool, profile.emails[0].value);

        const connection = await (await req.pool).getConnection();
        try {
            const googleAuth = googleInit(refreshToken);
            if (type === 'entry' && existingGoogleAccount.length > 0 && existingGoogleAccount[0].entry_connection_id) {
                if (req.user) return done(new ApiError('User already logged in', 422));
                const user = await getUserById(req.pool, existingGoogleAccount[0].entry_connection_id);
                recordValidationPassport(user, done, 'user');
                return done(undefined, {
                    ...user[0],
                    email: profile.emails[0].value,
                    googleAuth,
                });
            }
            const emailId =
                existingEmail.length > 0
                    ? existingEmail[0].emailId
                    : (await insert(connection, 'email', { email: profile.emails[0].value })).insertId;
            if (type === 'entry') {
                const user = (await insert(connection, 'user', { is_admin: 0 })).insertId;
                await insert(connection, 'google', {
                    entry_connection_id: user,
                    email_id: emailId,
                    google_account_id: profile.id,
                    refresh_token: refreshToken,
                });
                return done(undefined, {
                    user_id: user,
                    email: profile.emails[0].value,
                    is_admin: false,
                    date_joined: getNeatDate(),
                    googleAuth,
                });
            }
            if (type === 'connect') {
                if (!req.user) return done(new ApiError('Must be logged in to connect google account', 422));
                await insert(connection, 'google', {
                    entry_connection_id: req.user.user_id,
                    email_id: emailId,
                    google_account_id: profile.id,
                    refresh_token: refreshToken,
                });
                return done(undefined, { ...req.user, googleAuth });
            }
            return undefined;
        } catch (err) {
            connection.rollback();
            if (!err.code) {
                err.code = 500;
            }
            return done(err);
        }
    },
);
