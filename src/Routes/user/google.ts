/** @format */

import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import ApiError from '../../Utils/ApiError';
import { getGoogleAccount } from '../../Utils/mysql';
import { handleError } from '../../Utils';

export const get = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new ApiError('User not logged in', 401);
    if (!req.user.google_acc_id) throw new ApiError('No associated google account', 422);
    const googleUser = await getGoogleAccount(req.pool, req.user.user_id);
    if (googleUser.length !== 1) throw new ApiError('More than 1 result returned', 500);
    res.send(googleUser[0]);
};

export const access = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body.type) throw new ApiError('No google entry type provided', 422);
    passport.authenticate('google', {
        state: JSON.stringify({ type: req.body.type }),
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file'],
        accessType: 'offline',
        prompt: 'consent',
    })(req, res, next);
};

export const callback = (req: Request, res: Response, next: NextFunction): void =>
    passport.authenticate('google', (err, user): void => {
        if (err) return handleError(req.logger, err, res);
        if (!req.body.type)
            return handleError(req.logger, new ApiError('No google entry type provided', 422), res);
        if (!user && !err) {
            res.sendStatus(500).send('Something unexpected went wrong');
            return next();
        }
        req.login(user, loginErr => {
            if (loginErr) return next(loginErr);
            return res.sendStatus(200).send(req.user);
        });
        return next();
    })(req, res, next);
