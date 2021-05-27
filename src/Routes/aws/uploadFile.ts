import { CompletedPart, S3 } from '@aws-sdk/client-s3';
import { CompleteMultipartUploadCommandInput } from '@aws-sdk/client-s3/commands/CompleteMultipartUploadCommand';
import { Logger } from 'winston';
import toDate from 'date-fns/toDate';
import { NextFunction, Request, Response } from 'express';
import { getNeatDateForFile, handleError } from '../../Utils';

interface Part {
    Body: Buffer;
    Bucket: string;
    Key: string;
    PartNumber: number;
    UploadId: string | undefined;
}

export const sendFile = async (fileName: string, contents: string, s3: S3, log: Logger): Promise<string> => {
    const buffer = Buffer.from(contents);
    const partSize = 1024 * 1024 * 5;
    const startTime = new Date().getUTCSeconds();
    const multiMap: Array<CompletedPart> = [];
    const partsLeft = Math.ceil(buffer.length / partSize);
    const uploadPromises = [];

    async function completeMultipart(params: CompleteMultipartUploadCommandInput) {
        const completeMulti = await s3.completeMultipartUpload(params);
        log.info(`Completed upload in ${new Date().getUTCSeconds() - startTime}, seconds`);
        log.info(`Final upload data: ${completeMulti}`);
        return undefined;
    }

    async function uploadPart(part: Part) {
        multiMap[part.PartNumber - 1] = {
            ETag: (await s3.uploadPart(part)).ETag,
            PartNumber: part.PartNumber,
        };
        log.info(`Completed part: ${part.PartNumber.toString()} fileName: ${fileName}`);
        if (partsLeft - 1 > 0) return;
        await completeMultipart({
            Bucket: part.Bucket,
            Key: part.Key,
            MultipartUpload: { Parts: multiMap },
            UploadId: part.UploadId,
        });
    }

    const multiUpload = await s3.createMultipartUpload({
        Bucket: 'axilier-maps',
        Key: fileName,
        ContentType: 'text/plain',
    });

    for (let rangeStart = 0; rangeStart < buffer.length; rangeStart += partSize) {
        const partParams: Part = {
            Body: buffer.slice(rangeStart, Math.min(rangeStart + partSize, buffer.length)),
            Bucket: 'axilier-maps',
            Key: fileName,
            PartNumber: rangeStart / partSize + 1,
            UploadId: multiUpload.UploadId,
        };
        uploadPromises.push(uploadPart(partParams));
    }

    await Promise.all(uploadPromises);
    return 'Upload Successful.';
};

export default async (req: Request, res: Response, next: NextFunction): Promise<string | void | Response> => {
    try {
        if (!req.user) return res.status(401).send('User must be logged in.');
        if (!req.body.filename || !req.body.content || typeof req.body.filename !== 'string' || typeof req.body.content !== 'string')
            return res.status(412).send('Bad body values');
        const date = getNeatDateForFile(toDate(Date.parse(req.user.date_joined)));
        const upload = await sendFile(`${req.user.user_id}-(${date})/${req.body.filename}`, req.body.content, req.aws, req.logger);
        return res.status(201).send(upload);
    } catch (e) {
        return handleError(req, e, res, next);
    }
};
