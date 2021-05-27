import { Auth, drive_v3, google } from 'googleapis';
import Schema$FileList = drive_v3.Schema$FileList;

export default async (name: string, type: 'folder' | 'file', googleAuth: Auth.OAuth2Client): Promise<Schema$FileList> =>
    (
        await google
            .drive({
                version: 'v3',
                auth: googleAuth,
            })
            .files.list({
                q: `name='${name}' and mimeType='${
                    type === 'folder' ? 'application/vnd.google-apps.folder' : 'text/plain'
                }' and not trashed=true`,
                fields: 'nextPageToken, files(id, name, trashed, createdTime, modifiedTime, owners)',
            })
    ).data;
