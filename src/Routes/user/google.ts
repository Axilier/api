/** @format */

import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { google } from 'googleapis';
import ApiError from '../../Utils/ApiError';
import { getGoogleAccount } from '../../Utils/mysql';
import { handleError } from '../../Utils';

export const get = async (req: Request, res: Response): Promise<void | Response> => {
    if (!req.user) throw new ApiError('User not logged in', 401);
    const googleUser = await getGoogleAccount(req.pool, req.user.user_id);
    if (googleUser.length === 0) return res.status(422).send('No associated google account');
    if (googleUser.length !== 1) return res.status(500).send('More than 1 result returned');
    return res.send(googleUser[0]);
};

export const access = (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.query.type) return res.status(422).send('No google entry type provided');
    passport.authenticate('google', {
        state: JSON.stringify({ type: req.query.type }),
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file'],
        accessType: 'offline',
        prompt: 'consent',
    })(req, res, next);
    return undefined;
};

export const callback = (req: Request, res: Response, next: NextFunction): void =>
    passport.authenticate('google', (err, user): void | Response => {
        if (err) {
            if (err.code === 500 || err.code === undefined) {
                return handleError(req, err, res, next);
            }
            return res.status(err.code).send(err.message);
        }
        if (!user && !err) {
            res.status(500).send('Something unexpected went wrong');
            return next();
        }
        if (req.query.type === 'connect') {
            req.logger.info(`User ${req.user?.user_id} has connected google account`);
            return res.status(200).send('account connected');
        }
        req.login(user, loginErr => {
            if (loginErr) return next(loginErr);
            req.logger.info(`User ${req.user?.user_id} logged in`);
            return res.status(200).send(req.user);
        });
        return next();
    })(req, res, next);

export const profilePic = async (req: Request, res: Response): Promise<void | Response> => {
    if (!req.user) return res.status(401).send('User must be logged in.');
    if (!req.user.googleAuth) return res.status(401).send('No Google account linked');
    return res.status(200).send({
        content: await google
            .people({
                version: 'v1',
                auth: req.user.googleAuth,
            })
            .people.get({ resourceName: 'people/me', personFields: 'photos' }),
    });
};
