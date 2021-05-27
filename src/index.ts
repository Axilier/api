/** @format */

import dotenv from 'dotenv';
import winston from 'winston';
import express, { NextFunction, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import WinstonCloudwatch from 'winston-cloudwatch';
import mysql from 'promise-mysql';
import { VerifyCallback } from 'passport-google-oauth20';
import { S3 } from '@aws-sdk/client-s3';
import ApiError from './Utils/ApiError';
import { handleError } from './Utils';
import Routes from './Routes';
import { ConfiguredGoogleStrategy, ConfiguredLocalStrategy } from './Passport';
import deserialize from './Passport/deserialize';

const environment = process.env.NODE_ENV || 'development';
dotenv.config();

const consoleTransport = new winston.transports.Console();
const cloudwatchErrorTransport = new WinstonCloudwatch({
    logGroupName: 'Axilier',
    logStreamName: 'Error-logs',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsRegion: 'eu-west-2',
    level: 'error',
});
const cloudwatchInfoTransport = new WinstonCloudwatch({
    logGroupName: 'Axilier',
    logStreamName: 'Info-logs',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsRegion: 'eu-west-2',
    level: 'info',
});

const logger = winston.createLogger({
    transports: [consoleTransport, cloudwatchErrorTransport, cloudwatchInfoTransport],
});
if (environment !== 'development') {
    logger.remove(consoleTransport);
}

const app = express();
const clientUrl = environment === 'development' ? 'http://localhost:3000' : 'https://axilier.com';

app.use((req: Express.Request, res, next) => {
    req.clientUrl = clientUrl;
    req.logger = logger;
    req.pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB,
        connectionLimit: 10,
    });
    req.aws = new S3({
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
        region: 'eu-west-2',
    });
    next();
});
app.use(
    cors({
        origin: clientUrl,
        credentials: true,
        optionsSuccessStatus: 200,
    }),
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
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
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user: Express.User, done) => done(null, user.user_id));
passport.deserializeUser((req: express.Request, id: number, done: VerifyCallback) => deserialize(req, id, done));
passport.use(ConfiguredGoogleStrategy);
passport.use(ConfiguredLocalStrategy);
app.use('/', Routes);
app.use((err: ApiError, req: Express.Request, res: Response, next: NextFunction) => handleError(req, err, res, next));

app.listen(4000, () => logger.info('Server Started'));
