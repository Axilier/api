import { NextFunction, Request, Response } from 'express';
import toDate from 'date-fns/toDate';
import { sendFile } from './uploadFile';
import { getNeatDateForFile, handleError } from '../../Utils';

export default async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        if (!req.user) return res.status(401).send('User must be logged in.');
        if (!req.body.filename || !req.body.content || typeof req.body.filename !== 'string' || typeof req.body.content !== 'string')
            return res.status(412).send('Bad body values');
        const date = getNeatDateForFile(toDate(Date.parse(req.user.date_joined)));
        await sendFile(`${req.user.user_id}-(${date})/${req.body.filename}-updating`, req.body.content, req.aws, req.logger);
        await req.aws.deleteObject({
            Bucket: 'axilier-maps',
            Key: `${req.user.user_id}-(${date})/${req.body.filename}`,
        });
        await req.aws.copyObject({
            Bucket: 'axilier-maps',
            CopySource: encodeURIComponent(`axilier-maps/${req.user.user_id}-(${date})/${req.body.filename}-updating`),
            Key: `${req.user.user_id}-(${date})/${req.body.filename}`,
        });
        await req.aws.deleteObject({
            Bucket: 'axilier-maps',
            Key: `${req.user.user_id}-(${date})/${req.body.filename}-updating`,
        });
        req.logger.info(`File: ${req.body.filename} was successfully uploaded.`);
        return res.status(200).send('File successfully updated.');
    } catch (e) {
        return handleError(req, e, res, next);
    }
};
