import { getNeatDate } from '../Utils';

export const listFiles(req,res) => {
    if (!req.user) {
        res.send(401);
        return;
    }
    const { user_id, date_joined } = req.user;
    try {
        const listResponse = aws.s3.getObject({
            Bucket: 'axilier-maps',
            Key: `${user_id}-${date_joined}`,
        });
        res.send({ content: listResponse, error: false });
    } catch (err) {
        const logInfo = `${
            req.user?.user_id || 'user_id'
        }:aws_list_files:${getNeatDate()} \n Error: ${err}`;
        logger.error(logInfo);
        res.send({ message: 'Something went wrong', error: true });
    }
}
