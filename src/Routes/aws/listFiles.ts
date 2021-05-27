import { NextFunction, Request, Response } from 'express';
import toDate from 'date-fns/toDate';
import { getNeatDateForFile, handleError } from '../../Utils';

export default async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        if (!req.user) return res.status(401).send('User must be logged in.');
        const { user_id } = req.user;
        const date = getNeatDateForFile(toDate(Date.parse(req.user.date_joined)));
        const listResponse = await req.aws.getObject({
            Bucket: 'axilier-maps',
            Key: `${user_id}-(${date})`,
        });
        return res.status(200).send({ content: listResponse });
    } catch (e) {
        if (e.name === 'NoSuchKey') return res.status(404).send('No files exist');
        return handleError(req, e, res, next);
    }
};
