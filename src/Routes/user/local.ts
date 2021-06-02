import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import ApiError from '../../Utils/ApiError';
import { getLocalAccount } from '../../Utils/mysql';
import { handleError } from '../../Utils';

export default async (req: Request, res: Response): Promise<void | Response> => {
    if (!req.user) throw new ApiError('User not logged in', 401);
    const localUser = await getLocalAccount(req.pool, req.user.user_id);
    if (localUser.length !== 1) return res.status(500).send('More than 1 result returned');
    return res.send({
        local_id: localUser[0].local_id,
        entry_connection_id: localUser[0].entry_connection_id,
        email_id: localUser[0].email_id,
    });
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    if (req.user) return res.status(409).send('User is already logged in');
    if (!req.body.email || !req.body.password || typeof req.body.email !== 'string' || typeof req.body.password !== 'string')
        return res.status(412).send('Bad body values');
    return passport.authenticate(
        'local',
        async (err, user): Promise<Response | void> => {
            if (err) {
                if (err.code === 500 || err.code === undefined) return handleError(req, err, res, next);
                return res.status(err.code || 0).send(err.message);
            }
            return req.login(user, async loginError => {
                if (loginError) return handleError(req, loginError, res, next);
                req.logger.info(`User ${user.user_id} logged in`);
                return res.status(200).send('Login Successful');
            });
        },
    )(req, res, next);
};
