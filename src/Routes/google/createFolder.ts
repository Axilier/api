import { Auth, google, drive_v3 } from 'googleapis';
import { Request, Response } from 'express';
import Schema$File = drive_v3.Schema$File;

const createFolder = async (folderName: string, googleAuth: Auth.OAuth2Client): Promise<Schema$File> =>
    (
        await google
            .drive({
                version: 'v3',
                auth: googleAuth,
            })
            .files.create({
                requestBody: {
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder',
                },
            })
    ).data;

export const createFolderRequest = async (req: Request, res: Response): Promise<void | Response> => {
    if (!req.user) return res.status(401).send('User must be logged in.');
    if (!req.user.googleAuth) return res.status(401).send('No Google account linked');
    if (!req.body.name || typeof req.body.name !== 'string') return res.status(412).send('Bad body values');
    await createFolder(req.body.name, req.user.googleAuth);
    return res.status(201).send('Google folder created');
};

export default createFolder;
