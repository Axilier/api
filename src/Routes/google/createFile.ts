import { Request, Response } from 'express';
import { google } from 'googleapis';
import getObject from './getObject';
import createFolder from './createFolder';

export default async (req: Request, res: Response): Promise<Response | void> => {
    if (!req.user) return res.status(401).send('User must be logged in.');
    if (!req.user.googleAuth) return res.status(401).send('No Google account linked');
    if (!req.body.filename || !req.body.content || typeof req.body.filename !== 'string' || typeof req.body.content !== 'string')
        return res.status(412).send('Bad body values');
    const axilierFolderExists = await getObject('Axilier', 'folder', req.user.googleAuth);
    const axilierFolder: string =
        axilierFolderExists.files && axilierFolderExists.files.length === 1
            ? axilierFolderExists.files[0].id || ''
            : (await createFolder('Axilier', req.user.googleAuth)).id || '';
    const file = await google
        .drive({
            version: 'v3',
            auth: req.user.googleAuth,
        })
        .files.create({
            requestBody: {
                name: `${req.body.filename}`,
                parents: [axilierFolder],
            },
            media: {
                body: req.body.content,
                mimeType: 'text/plain',
            },
        });
    return res.status(201).send(file.data);
};
