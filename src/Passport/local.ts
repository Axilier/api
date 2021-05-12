import bcrypt from 'bcrypt';
import { Strategy as LocalStrategy } from 'passport-local';
import { getLocalAccount } from '../Utils/mysql';
import ApiError from '../Utils/ApiError';

export default new LocalStrategy(
    { usernameField: 'email', passReqToCallback: true },
    async (req, email, password, done): Promise<void> => {
        try {
            const user = await getLocalAccount(req.pool, email);
            if (user.length === 0) return done(new ApiError('No user found', 404));
            if (user.length > 1)
                return done(new ApiError('Multiple users of same account found', 500));
            const passwordMatches = await bcrypt
                .compare(password, user[0].password.toString())
                .catch(err => done(err));
            if (passwordMatches) return done(undefined, user[0]);
            return done(undefined, undefined);
        } catch (err) {
            return done(err);
        }
    },
);
