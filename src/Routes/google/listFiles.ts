import { Request, Response } from 'express';
import { google } from 'googleapis';

export default async (req: Request, res: Response): Promise<Response | void> => {
    if (!req.user) return res.status(401).send('User must be logged in.');
    if (!req.user.googleAuth) return res.status(401).send('No Google account linked');
    return res.status(200).send({
        content: await google
            .drive({
                version: 'v3',
                auth: req.user.googleAuth,
            })
            .files.list({
                pageSize: 10,
                fields: 'nextPageToken, files(id, name, trashed, createdTime, modifiedTime, owners)',
            }),
    });
};
