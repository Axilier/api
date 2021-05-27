import { google } from 'googleapis';
import { NextFunction, Request, Response } from 'express';
import { handleError } from '../../Utils';

export default async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    if (!req.user) return res.status(401).send('User must be logged in.');
    if (!req.user.googleAuth) return res.status(401).send('No Google account linked');
    if (!req.body.fileId || typeof req.body.fileId !== 'string') return res.status(412).send('Bad body values');
    try {
        await google
            .drive({
                version: 'v3',
                auth: req.user.googleAuth,
            })
            .files.delete({
                fileId: req.body.fileId,
            });
        return res.status(200).send('File deleted');
    } catch (err) {
        if (err.code === 404) {
            return res.status(404).send('File not found');
        }
        return handleError(req, err, res, next);
    }
};
