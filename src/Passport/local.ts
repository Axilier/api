import bcrypt from 'bcrypt';
import { Strategy as LocalStrategy } from 'passport-local';
import { getGoogleAccount, getLocalAccount, getUserById } from '../Utils/mysql';
import { googleInit, recordValidationPassport } from '../Utils';

export default new LocalStrategy(
    { usernameField: 'email', passReqToCallback: true },
    async (req, email, password, done): Promise<void> => {
        try {
            const localUser = await getLocalAccount(req.pool, email);
            recordValidationPassport(localUser, done, 'localUser');
            const passwordMatches = await bcrypt.compare(password, localUser[0].password.toString()).catch(err => done(err));
            const user = await getUserById(req.pool, localUser[0].entry_connection_id);
            recordValidationPassport(user, done, 'user');
            const googleUser = await getGoogleAccount(req.pool, localUser[0].entry_connection_id);
            if (passwordMatches) {
                return done(undefined, {
                    ...user[0],
                    email,
                    googleAuth: googleUser.length === 1 ? googleInit(googleUser[0].refresh_token) : null,
                });
            }
            return done(undefined, undefined);
        } catch (err) {
            if (!err.code) {
                err.code = 500;
            }
            return done(err);
        }
    },
);
