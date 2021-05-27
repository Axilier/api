import express from 'express';
import listFiles from './listFiles';
import deleteFile from './deleteFile';
import uploadFile from './uploadFile';
import updateFile from './updateFile';
import getFile from './getFile';

const aws = express.Router();

/**
 * @api {post} /aws/file Upload file to S3 bucket
 * @apiName CreateAwsFile
 * @apiGroup Aws
 *
 * @apiParam {String} filename Name of file to be created
 * @apiParam {String} content Content of new file
 *
 * @apiSuccess (Success 201) {String} response Upload Successful.
 * @apiError (401 ) {String} response User must be logged in.
 * @apiError (412 ) {String} response Bad body values.
 * @apiSampleRequest off
 */
aws.post('/file', uploadFile);

/**
 * @api {put} /aws/file Update file in S3 bucket
 * @apiName UpdateAwsFile
 * @apiGroup Aws
 *
 * @apiParam {String} filename Name of file to be updated
 * @apiParam {String} content Content of new file
 *
 * @apiSuccess (Success 201) {String} response File successfully updated.
 * @apiError (401 ) {String} response User must be logged in.
 * @apiError (412 ) {String} response Bad body values.
 * @apiSampleRequest off
 */
aws.put('/file', updateFile);

/**
 * @api {get} /aws/file Get file from S3 bucket
 * @apiName GetAwsFile
 * @apiGroup Aws
 *
 * @apiParam {String} filename Name of file to be found
 *
 * @apiSuccess (Success 201) {Object} content List of files
 * @apiError (401 ) {String} response User must be logged in.
 * @apiError (412 ) {String} response Bad body values.
 * @apiError (404 ) {String} response File does not exist.
 * @apiSampleRequest off
 */
aws.get('/file', getFile);

/**
 * @api {delete} /aws/file Delete file from S3 bucket
 * @apiName DeleteAwsFile
 * @apiGroup Aws
 *
 * @apiParam {String} filename Name of file to be deleted
 *
 * @apiSuccess (Success 201) {String} response File deleted.
 * @apiError (401 ) {String} response User must be logged in.
 * @apiError (412 ) {String} response Bad body values.
 * @apiError (404 ) {String} response File does not exist.
 * @apiSampleRequest off
 */
aws.delete('/file', deleteFile);

/**
 * @api {get} /aws/file Get list of files from S3 bucket
 * @apiName GetAwsFileList
 * @apiGroup Aws
 *
 * @apiSuccess (Success 201) {Object} content List of files
 * @apiError (401 ) {String} response User must be logged in.
 * @apiError (404 ) {String} response No files exist.
 * @apiSampleRequest off
 */
aws.get('/file/list', listFiles);

export default aws;
