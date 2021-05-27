/** @format */

import { CompletedPart, CreateMultipartUploadCommandOutput, S3 } from '@aws-sdk/client-s3';
import { CompleteMultipartUploadCommandInput } from '@aws-sdk/client-s3/commands/CompleteMultipartUploadCommand';
import { Logger } from 'winston';
import { getNeatDate } from './Utils';

interface Part {
    Body: Buffer;
    Bucket: string;
    Key: string;
    PartNumber: number;
    UploadId: string | undefined;
}

// FROM https://gist.github.com/sevastos/5804803

export default class Aws {
    readonly s3: S3;

    private readonly logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
        this.s3 = new S3({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
            region: 'eu-west-2',
        });
    }

    uploadFile(fileName: string, contents: string): string {
        const { s3 } = this;
        const buffer = Buffer.from(contents);
        const partSize = 1024 * 1024 * 5;
        const startTime = new Date().getUTCSeconds();
        let failed = false;
        let partNum = 0;
        let tryNum = 0;
        const multiMap: Array<CompletedPart> = [];
        const partsLeft = Math.ceil(buffer.length / partSize);
        const { info, error, warn } = this.logger;

        function completeMultipart(params: CompleteMultipartUploadCommandInput) {
            s3.completeMultipartUpload(params)
                .then(res => {
                    info(`Completed upload in ${new Date().getUTCSeconds() - startTime}, seconds`);
                    info(`Final upload data: ${res}`);
                })
                .catch(err => {
                    error('An error occurred while completing the multipart upload');
                    error(err);
                });
        }

        function uploadPart(part: Part, createResponse: CreateMultipartUploadCommandOutput) {
            tryNum += 1;
            s3.uploadPart(part)
                .then(res => {
                    multiMap[partNum - 1] = {
                        ETag: res.ETag,
                        PartNumber: part.PartNumber,
                    };
                    info(`Completed part: ${part.PartNumber.toString()} fileName: ${fileName}`);
                    if (partsLeft - 1 > 0) return;
                    completeMultipart({
                        Bucket: part.Bucket,
                        Key: part.Key,
                        MultipartUpload: { Parts: multiMap },
                        UploadId: part.UploadId,
                    });
                })
                .catch(err => {
                    if (err) {
                        error(`multiErr, upload part error: ${err}`);
                        if (tryNum <= 3) {
                            uploadPart(part, createResponse);
                        } else {
                            warn('Failed uploading part: #', part.PartNumber.toString());
                            failed = true;
                        }
                    }
                });
        }

        s3.createMultipartUpload({
            Bucket: 'axilier-maps',
            Key: fileName,
            ContentType: 'text/plain',
        }).then(res => {
            for (let rangeStart = 0; rangeStart < buffer.length; rangeStart += partSize) {
                partNum += 1;
                const partParams: Part = {
                    Body: buffer.slice(rangeStart, Math.min(rangeStart + partSize, buffer.length)),
                    Bucket: 'axilier-maps',
                    Key: fileName,
                    PartNumber: partNum,
                    UploadId: res.UploadId,
                };
                info(
                    `Uploading part: #${partParams.PartNumber.toString()}, Range start: ${rangeStart}`,
                );
                uploadPart(partParams, res);
            }
        });
        if (failed) warn(`Upload failed fileName: ${fileName}`);
        return failed ? 'Upload failed' : 'Upload Successful';
    }

    async updateFile(fileName: string, newContents: string): Promise<string | true> {
        const newFile = this.uploadFile(`${fileName}-updating`, newContents);
        if (newFile !== 'Upload Successful') return 'File failed to upload';
        try {
            await this.s3.deleteObject({
                Bucket: 'axilier-maps',
                Key: fileName,
            });
            await this.s3.copyObject({
                Bucket: 'axilier-maps',
                CopySource: `${fileName}-updating`,
                Key: fileName,
            });
            this.logger.info(`File: ${fileName} was successfully uploaded `);
            return true;
        } catch (err) {
            const logInfo = `${fileName}:aws_update_file:${getNeatDate()} \n Error: ${err}`;
            this.logger.error(logInfo);
            return 'Something went wrong';
        }
    }

    async deleteFile(fileName: string): Promise<string | true> {
        try {
            await this.s3.deleteObject({
                Bucket: 'axilier-maps',
                Key: fileName,
            });
            return true;
        } catch (err) {
            const logInfo = `${fileName}:aws_delete_file:${getNeatDate()} \n Error: ${err}`;
            this.logger.error(logInfo);
            return 'Something went wrong';
        }
    }
}
