import { NextFunction, Request, Response } from 'express';
import toDate from 'date-fns/toDate';
import { getNeatDateForFile, handleError } from '../../Utils';

export default async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        if (!req.user) return res.status(401).send('User must be logged in.');
        if (!req.body.filename || typeof req.body.filename !== 'string') return res.status(412).send('Bad body values.');
        const date = getNeatDateForFile(toDate(Date.parse(req.user.date_joined)));
        const listResponse = await req.aws.getObject({
            Bucket: 'axilier-maps',
            Key: `${req.user.user_id}-(${date})/${req.body.filename}`,
        });
        return res.status(200).send({ content: listResponse });
    } catch (e) {
        if (e.name === 'NoSuchKey') return res.status(404).send('File does not exist.');
        return handleError(req, e, res, next);
    }
};
