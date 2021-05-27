import express from 'express';
import listFiles from './listFiles';
import createFile from './createFile';
import deleteFile from './deleteFile';

const google = express.Router();

/**
 * @api {post} /google/file New google file
 * @apiName CreateGoogleFile
 * @apiGroup Google
 *
 * @apiParam {String} filename The expected name of the new file.
 * @apiParam {String} content The expected content of the new file
 *
 * @apiSuccess (Success 201) {Object} file Standard google file object
 * @apiError (401 ) {String} response Error description
 * @apiSampleRequest off
 */
google.post('/file', createFile);

/**
 * @api {delete} /google/file Delete google file
 * @apiName DeleteGoogleFile
 * @apiGroup Google
 *
 * @apiParam {String} fileId The id of the file to be deleted
 *
 * @apiSuccess (Success 201) {Object} response File deleted
 * @apiError (401 ) {String} response Error description
 * @apiSampleRequest off
 */
google.delete('/file', deleteFile);

/**
 * @api {get} /google/files Get List of files
 * @apiName ListGoogleFiles
 * @apiGroup Google
 *
 * @apiSuccess (Success 201) {Object} content List of files from drive
 * @apiError (401 ) {String} response Error description
 * @apiSampleRequest off
 */
google.get('/files', listFiles);

export default google;
