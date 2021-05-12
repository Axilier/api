/** @format */
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import express from 'express';
import winston from 'winston';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passportLocal from 'passport-local';
import { Auth, google } from 'googleapis';
import { Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20';
import bodyParser from 'body-parser';
import MySqlController from '../src/Utils/MySqlController';
import { getNeatDate } from '../src/Utils';
import { Done, Google, Local, UserResponse } from '../src/Types';
import Aws from '../src/Utils/Aws';

const environment = process.env.NODE_ENV || 'development';
let googleAuth: Auth.OAuth2Client;
dotenv.config();
const LocalStrategy = passportLocal.Strategy;
const consoleTransport = new winston.transports.Console();
const logger = winston.createLogger({
    transports: [consoleTransport],
});

if (environment !== 'development') {
    logger.remove(consoleTransport);
}

const app = express();
const clientUrl = environment === 'development' ? 'http://localhost:3000' : process.env.ORIGIN;
const aws = new Aws(logger);
const mysqlController = new MySqlController(logger);

function googleInit(refreshToken: string): Auth.OAuth2Client {
    const oauth2Client = new google.auth.OAuth2({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
    oauth2Client.setCredentials({
        refresh_token: refreshToken,
    });
    return oauth2Client;
}

function DbResponseToUser(response: (Local | Google) & UserResponse): UserResponse {
    return {
        user_id: response.user_id,
        local_acc_id: response.local_acc_id,
        google_acc_id: response.google_acc_id,
        date_joined: response.date_joined,
        email: response.email,
    };
}

function somethingWentWrong(
    logInfo: string,
    done: VerifyCallback | Done,
    extraInfo?: Record<string, string>,
): void {
    done('Something went wrong', undefined, {
        message: 'Something went wrong',
        logInfo,
        error: true,
        ...extraInfo,
    });
}

// region -- API SETUP --
app.use((req: Express.Request) => {
    req.logger = logger;
});
app.use(express.json());
app.use(
    cors({
        origin: clientUrl,
        credentials: true,
        optionsSuccessStatus: 200,
    }),
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    session({
        name: 'Axilier-sessionId',
        secret: process.env.SECRET || 'secret',
        resave: true,
        saveUninitialized: true,
        cookie: {
            secure: environment !== 'development',
        },
    }),
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
// endregion
// region -- PASSPORT --
// region -- Local Strategy
passport.use(
    new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done: VerifyCallback): Promise<void> => {
            try {
                const user = await mysqlController.getLocalUser(email);
                if (user.length === 0)
                    return done(undefined, undefined, { message: 'No result found' });
                if (user.length > 1) {
                    const logInfo = `${email}:multiple_results_local:${getNeatDate()}`;
                    logger.error(logInfo);
                    return somethingWentWrong(logInfo, done);
                }
                const passwordMatches = await bcrypt
                    .compare(password, user[0].password.toString())
                    .catch(err => {
                        const log = `${user[0].user_id}:checkUserPass:${getNeatDate()}`;
                        logger.error(`name:${log} \n ${err.message}`);
                        return somethingWentWrong(log, done);
                    });
                if (passwordMatches) {
                    return done(undefined, DbResponseToUser(user[0]));
                }
                return done(undefined, undefined);
            } catch (err) {
                return somethingWentWrong(err.message, done);
            }
        },
    ),
);
// endregion
passport.serializeUser((user: Express.User, done) => done(null, user.user_id));
passport.deserializeUser(
    async (id: number, done: VerifyCallback): Promise<void> => {
        try {
            const user = await mysqlController.getUserById(id);
            if (user.length === 0)
                return done(undefined, undefined, { message: 'No result found' });
            if (user.length > 1) {
                const logInfo = `${id}:multiple_results_deserialize_user:${getNeatDate()}`;
                logger.error(logInfo);
                return somethingWentWrong(logInfo, done);
            }
            const googleUser =
                user[0].google_acc_id !== null
                    ? await mysqlController.getGoogleUser(user[0].user_id)
                    : [];
            if (googleUser.length > 1) {
                const logInfo = `${
                    user[0].google_acc_id
                }:multiple_results_deserialize_user_google:${getNeatDate()}`;
                logger.error(logInfo);
                return somethingWentWrong(logInfo, done);
            }
            if (googleUser[0] && googleUser[0].refresh_token) {
                googleAuth = googleInit(googleUser[0].refresh_token);
            }
            if (googleUser.length === 1) return done(undefined, DbResponseToUser(googleUser[0]));
            if (user[0].local_acc_id !== null) {
                const localUser = await mysqlController.getLocalUser(user[0].user_id);
                if (localUser.length !== 1) {
                    const logInfo = `${
                        user[0].local_acc_id
                    }:multiple_results_deserialize_user_local:${getNeatDate()}`;
                    logger.error(logInfo);
                    return somethingWentWrong(logInfo, done);
                }
                return done(undefined, DbResponseToUser(localUser[0]));
            }
            return done(undefined, undefined, { message: 'No Account associated with user' });
        } catch (err) {
            const logInfo = `${id}:deserialize:${getNeatDate()} \n Error: ${err}`;
            logger.error(logInfo);
            return somethingWentWrong(err.message, done);
        }
    },
);
// region Google Strategy
const googleStrategy = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: '/auth/google/callback',
        passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
        const email = profile.emails ? profile.emails[0].value : '';
        const info = JSON.parse(request.query.state as string);
        const requestUser: Express.User | null = request.user || null;
        mysqlController.connection.then(
            async (connection): Promise<void> => {
                try {
                    await connection.beginTransaction();
                    const user = await connection.query(
                        `
                            SELECT user.user_id
                            FROM user,
                                 google
                            WHERE google.google_account_id = ?
                              AND user.google_acc_id = google.google_id
                        `,
                        [profile.id],
                    );
                    if (info.type === 'connect') {
                        if (!requestUser)
                            return connection.rollback().then(() =>
                                done(undefined, undefined, {
                                    info,
                                    message: 'User is not logged in',
                                }),
                            );
                        if (user.length !== 0)
                            return connection
                                .rollback()
                                .then(() =>
                                    somethingWentWrong(
                                        `${
                                            profile.id
                                        }:google_connect_multiple_exists?:${getNeatDate()}`,
                                        done,
                                        info,
                                    ),
                                );
                        const emails = await connection.query(
                            `
                                SELECT email.email_id
                                FROM email
                                WHERE email.email = ?
                            `,
                            [email],
                        );
                        if (emails.length > 1)
                            return connection
                                .rollback()
                                .then(() =>
                                    somethingWentWrong(
                                        `${email}:google_connect_multi_emails:${getNeatDate()}`,
                                        done,
                                        info,
                                    ),
                                );
                        const emailId =
                            emails.length === 0
                                ? (await mysqlController.insert('email', { email })).insertId
                                : emails[0].email_id;
                        const googleAccount = await mysqlController.insert('google', {
                            email_id: emailId,
                            google_account_id: profile.id,
                            refresh_token: refreshToken,
                        });
                        await connection.query(
                            `
                                UPDATE user
                                SET user.google_acc_id = ?
                                WHERE user.user_id = ?
                            `,
                            [googleAccount.insertId, requestUser.user_id],
                        );
                        googleAuth = googleInit(refreshToken);
                        await connection.commit();
                        return done(undefined, { ...requestUser }, { info });
                    }
                    const existingUser = await connection.query(
                        `
                            SELECT user.user_id
                            FROM user,
                                 google
                            WHERE google.google_account_id = ?
                              AND user.google_acc_id = google.google_id
                        `,
                        [parseInt(profile.id, 10)],
                    );
                    if (existingUser.length === 1)
                        return done(undefined, existingUser[0], { info });
                    if (existingUser.length !== 0)
                        return somethingWentWrong(
                            `${email}:google_connect_multi_users:${getNeatDate()}`,
                            done,
                            info,
                        );
                    const getEmail = await connection.query(
                        `
                            SELECT email.email_id
                            FROM email
                            WHERE email.email = ?
                        `,
                        [email],
                    );
                    if (getEmail !== 0)
                        return done(undefined, undefined, {
                            info,
                            message: '401.Google',
                        });
                    await connection.beginTransaction();
                    const emailId = await mysqlController.insert('email', { email });
                    const googleId = await mysqlController.insert('google', {
                        email_id: emailId.insertId,
                        google_account_id: profile.id,
                        refresh_token: refreshToken,
                    });
                    const newUser = await mysqlController.insert('user', {
                        google_acc_id: googleId.insertId,
                    });
                    await connection.commit();
                    const insertedUser = await mysqlController.getUserById(newUser.insertId);
                    if (insertedUser.length !== 1)
                        return somethingWentWrong(
                            `${
                                insertedUser[0].user_id
                            }:multi_inserted_user_google:${getNeatDate()}`,
                            done,
                            info,
                        );
                    return done(undefined, insertedUser[0], { info });
                } catch (err) {
                    const logInfo = `${
                        profile.id
                    }:google_connect_account:${getNeatDate()} \n Error: ${err}`;
                    logger.error(logInfo);
                    return connection
                        .rollback()
                        .then(() => somethingWentWrong(logInfo, done, info));
                }
            },
        );
    },
);
passport.use(googleStrategy);
// refresh.use(googleStrategy);

// endregion
// endregion
// region -- API --
// region -- ACCOUNT --
app.get('/getLocalAccount', async (req, res) => {
    try {
        if (!req.user) return res.sendStatus(401);
        if (!req.user.local_acc_id) return res.send('No associated local account');
        const response = await mysqlController.getLocalUser(req.user.user_id);
        if (response.length !== 1) throw new Error('more than or less than 1 result returned');
        return res.send({
            email: response[0].email,
            accountId: response[0].user_id,
        });
    } catch (err) {
        const logInfo = `${
            req.user?.user_id || 'user_id'
        }:get_local_account:${getNeatDate()} \n Error: ${err}`;
        logger.error(logInfo);
        return res.send({ message: 'Something went wrong', error: true });
    }
});
app.get('/getGoogleAccount', async (req, res) => {
    try {
        if (!req.user) return res.sendStatus(401);
        if (!req.user.google_acc_id) return res.send('No associated google account');
        const response = await mysqlController.getGoogleUser(req.user.user_id);
        if (response.length !== 1) throw new Error('more than or less than 1 result returned');
        return res.send({
            email: response[0].email,
            accountId: parseInt(response[0].google_account_id, 10),
        });
    } catch (err) {
        const logInfo = `${
            req.user?.user_id || 'user_id'
        }:get_google_account:${getNeatDate()} \n Error: ${err}`;
        logger.error(logInfo);
        return res.send({ message: 'Something went wrong', error: true });
    }
});
app.get('/getUser', (req, res) => {
    res.send(req.user);
});
// endregion
// region -- AUTH --
// region ROUTES -- AUTH -- LOCAL
app.post(
    '/auth/local/register',
    async (req, res): Promise<void> => {
        const { email, password } = req?.body;
        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            res.send('Bad body values');
            return;
        }
        const hashedPass = await bcrypt.hash(password, 10);
        // TODO convert to batch transaction, if one fails nothing should change
        try {
            await mysqlController.connection.then(
                async (connection): Promise<void> => {
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
                    const emailId = await mysqlController.insert('email', { email });
                    const localId = await mysqlController.insert('local', {
                        email_id: emailId.insertId,
                        password: hashedPass,
                    });
                    await mysqlController.insert('user', {
                        local_acc_id: localId.insertId,
                    });
                    connection.commit();
                    logger.info(`user ${email} added`);
                    res.sendStatus(200);
                },
            );
        } catch (err) {
            const logInfo = `${email}:registerUser:${getNeatDate()} \n Error: ${err}`;
            logger.error(logInfo);
            res.send({ message: 'Something went wrong', error: true, logInfo });
        }
    },
);
app.post('/auth/local/login', passport.authenticate('local'), (req, res) => {
    res.sendStatus(200);
});
// // endregion
// region ROUTES -- AUTH -- GOOGLE
// region google auth
app.get('/auth/google', (req, res, next) =>
    passport.authenticate('google', {
        state: JSON.stringify({ type: req.query.type || 'login' }),
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file'],
        accessType: 'offline',
        prompt: 'consent',
    })(req, res, next),
);
// endregion
app.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', (err, user, responseInfo): void => {
        const { info, message } = responseInfo || { info: '', message: '' };
        const type = info.type === 'connect' ? 'account' : info.type || 'login';
        if (!user) {
            if (message) {
                const error = message !== '401.Google' ? '401' : '401.Google';
                res.redirect(`${clientUrl}/${type}?err=${error}`);
                return next();
            }
            res.redirect(`${clientUrl}/${type}`);
            return next();
        }
        req.login(user, loginErr => {
            if (loginErr) {
                return next(loginErr);
            }
            return res.redirect(`${clientUrl}/account`);
        });
        return next();
    })(req, res, next);
});
// app.get('/auth/google/refresh', (req, res) => {
//     const user = req.user as User | undefined
//     if (!user || !user.refreshToken) {
//         res.send(401)
//     } else {
//         refresh.requestNewAccessToken('google', user.refreshToken, (err, accessToken) => {
//             if (err) {
//                 return res.send(err)
//             }
//             req.user = {
//                 ...req.user,
//                 accessToken
//             }
//             return res.send(req.user)
//         })
//     }
// })
app.get('/auth/google/access_token', (req, res) => {
    googleAuth.getAccessToken().then(token => {
        if (token) {
            res.send(token);
        } else {
            res.send('Error: no token found');
        }
    });
});
// endregion
// region ROUTES -- AUTH -- GENERAL
app.get('/auth/logout', (req, res) => {
    req.logOut();
    res.sendStatus(200);
});
// endregion
// endregion
// region -- FILE OPERATIONS --
// region ROUTES -- AWS
app.get('/aws/list_files', async (req, res) => {
    if (!req.user) {
        res.send(401);
        return;
    }
    const { user_id, date_joined } = req.user;
    try {
        const listResponse = aws.s3.getObject({
            Bucket: 'axilier-maps',
            Key: `${user_id}-${date_joined}`,
        });
        res.send({ content: listResponse, error: false });
    } catch (err) {
        const logInfo = `${
            req.user?.user_id || 'user_id'
        }:aws_list_files:${getNeatDate()} \n Error: ${err}`;
        logger.error(logInfo);
        res.send({ message: 'Something went wrong', error: true });
    }
});
app.post('/aws/upload_file', (req, res) => {
    if (!req.user) return res.send(401);
    const { user_id, date_joined } = req.user;
    if (
        !req.body.name ||
        !req.body.file ||
        typeof req.body.name !== 'string' ||
        typeof req.body.file !== 'string'
    )
        return res.send('Bad Values');
    const response = aws.uploadFile(`${user_id}-${date_joined}/${req.body.name}`, req.body.file);
    return res.send({ message: response, error: response === 'Upload failed' });
});
app.post('/aws/update_file', async (req, res) => {
    if (!req.user) return res.send(401);
    const { user_id, date_joined } = req.user;
    if (
        !req.body.name ||
        !req.body.file ||
        typeof req.body.name !== 'string' ||
        typeof req.body.file !== 'string'
    )
        return res.send('Bad Values');
    const updateResponse = await aws.updateFile(
        `${user_id}-${date_joined}/${req.body.name}`,
        req.body.file,
    );
    return res.send(updateResponse === true ? 200 : { message: updateResponse, error: true });
});
app.get('/aws/delete_file', async (req, res) => {
    if (!req.user) return res.send(401);
    const { user_id, date_joined } = req.user;
    if (!req.body.name || typeof req.body.name !== 'string') return res.send('Bad Values');
    const deleteResponse = await aws.deleteFile(`${user_id}-${date_joined}/${req.body.name}`);
    return res.send(deleteResponse === true ? 200 : { message: deleteResponse, error: true });
});
// endregion
// region ROUTES -- GOOGLE
app.get('/google/list_files', async (req, res) => {
    try {
        const files = await google
            .drive({
                version: 'v3',
                auth: googleAuth,
            })
            .files.list({
                pageSize: 10,
                fields:
                    'nextPageToken, files(id, name, trashed, createdTime, modifiedTime, owners)',
            });
        res.send({ content: files, error: false });
    } catch (err) {
        const logInfo = `${
            req.user?.user_id || 'user_id'
        }:google_list_files:${getNeatDate()} \n Error: ${err}`;
        logger.error(logInfo);
        res.send({ message: 'Something went wrong', error: true });
    }
});
app.get('/google/get_user_profile_pic', async (req, res) => {
    try {
        const user = await google
            .people({
                version: 'v1',
                auth: googleAuth,
            })
            .people.get({ resourceName: 'people/me', personFields: 'photos' });
        res.send({ content: user, error: false });
    } catch (err) {
        const logInfo = `${
            req.user?.user_id || 'user_id'
        }:google_user_profile_pic:${getNeatDate()} \n Error: ${err}`;
        logger.error(logInfo);
        res.send({ message: 'Something went wrong', error: true });
    }
});
app.post('/google/create_file', async (req, res) => {
    try {
        const { name, contents } = req?.body;
        if (!name || !contents || typeof name !== 'string' || typeof contents !== 'string')
            res.send('Bad body values');
        const create = await google
            .drive({
                version: 'v3',
                auth: googleAuth,
            })
            .files.create({
                requestBody: {
                    name,
                },
                media: {
                    body: contents,
                    mimeType: 'text/plain',
                },
            });
        res.send({ content: create, error: false });
    } catch (err) {
        const logInfo = `${
            req.user?.user_id || 'user_id'
        }:google_create_file:${getNeatDate()} \n Error: ${err}`;
        logger.error(logInfo);
        res.send({ message: 'Something went wrong', error: true });
    }
});
// endregion
// endregion
// endregion

app.listen(4000, () => {
    logger.info('Server Started');
    // eslint-disable-next-line no-console
    console.log('Server Started');
});
