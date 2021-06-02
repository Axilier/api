import { format } from 'date-fns';
import { nanoid } from 'nanoid';
import { NextFunction, Response } from 'express';
import { VerifyCallback } from 'passport-google-oauth20';
import { Auth, google } from 'googleapis';
import ApiError from './ApiError';

export const getNeatDate = (date?: Date): string => format(date || new Date(), 'dd/MM/y HH:mm:ss');

export const getNeatDateForFile = (date?: Date): string => format(date || new Date(), 'dd-MM-y HH:mm:ss');

export const handleError = (request: Express.Request, error: ApiError | Error, res: Response, next: NextFunction): void => {
    if (res.headersSent) {
        return next(error);
    }
    const id = nanoid(10);
    const errorCode = error instanceof ApiError ? error.code : 500;
    request.logger.error(`TIMESTAMP: ${getNeatDate()}, ID: ${id}, CODE: ${errorCode}, MESSAGE: ${error.message}, STACK: ${error.stack}`);
    res.status(errorCode).send(`Something went wrong and has been logged ::ID::${id}`);
    return next(error);
};

export const recordValidationPassport = (response: Array<unknown>, done: VerifyCallback, recordName: string): void => {
    if (response.length === 0) throw new ApiError(`No ${recordName} found`, 404);
    if (response.length > 1) throw new ApiError(`Multiple ${recordName}s of same account found`, 500);
    return undefined;
};

export const googleInit = (refreshToken: string): Auth.OAuth2Client => {
    const oauth2Client = new google.auth.OAuth2({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
    oauth2Client.setCredentials({
        refresh_token: refreshToken,
    });
    return oauth2Client;
};
