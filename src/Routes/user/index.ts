/** @format */

import express from 'express';
import passport from 'passport';
import * as local from './local';
import * as google from './google';
import register from './register';

const user = express.Router();

/**
 * @api {post} /user/local Register User
 * @apiName PostUser
 * @apiGroup User
 *
 * @apiParam {String} email The new users email, must be unique.
 * @apiParam {String} password The users password
 *
 * @apiSuccess (Success 201) {String} email Email of created user
 * @apiSampleRequest off
 */
user.post('/local', register);

/**
 * @api {post} /user/local/login Login Users
 * @apiName PostLogin
 * @apiGroup User
 *
 * @apiParam {String} email The users Email
 * @apiParam {String} password The users Password
 *
 * @apiSuccess {Object} body The User object
 * @apiSampleRequest off
 */
user.post('/local/login', passport.authenticate('local'), local.login);

/**
 * @api {get} /user/google Access via Google
 * @apiName GetGoogleEntry
 * @apiGroup User
 *
 * @apiParam {String} type The type of entry request, must be connect or entry
 * @apiSampleRequest off
 */
user.get('/google', google.access);

/**
 * @api {get} /user/google/callback Handles the result of the access request
 * @apiName GoogleAccessResponse
 * @apiGroup User
 *
 * @apiParam {String} type The type of entry request, must be connect or entry
 *
 * @apiSuccess {Object} body The User object
 * @apiSampleRequest off
 */
user.get('/google/callback', google.callback);

/**
 * @api {get} /user/me Logged in user
 * @apiName GetUserMe
 * @apiGroup User
 *
 * @apiSuccess {Object} body The User object
 * @apiSampleRequest off
 */
user.get('/me', (req, res) => {
    res.send(req.user);
});

/**
 * @api {get} /user/me/local Get associated local account
 * @apiName GetUserMeLocal
 * @apiGroup User
 *
 * @apiSuccess {Object} body The Local User object
 * @apiSampleRequest off
 */
user.get('/me/local', local.default);

/**
 * @api {get} /user/me/google Get associated google account
 * @apiName GetUserMeGoogle
 * @apiGroup User
 *
 * @apiSuccess {Object} body The Google User object
 * @apiSampleRequest off
 */
user.get('/me/google', google.get);

/**
 * @api {delete} /user/me/logout Log the user out (Delete their session)
 * @apiName DeleteUserSession
 * @apiGroup User
 *
 * @apiSuccess {String} body User logged out
 * @apiSampleRequest off
 */
user.delete('/me/logout', (req, res) => {
    req.logOut();
    res.sendStatus(200).send('User logged out');
});

export default user;
