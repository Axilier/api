/** @format */
import { Logger } from 'winston';
import { Pool } from 'promise-mysql';
import * as Bluebird from 'bluebird';
import { Auth } from 'googleapis';
import { S3 } from '@aws-sdk/client-s3';

export type UserResponse = Express.User & {
    email: string;
};

export interface Local {
    local_id: number;
    entry_connection_id: number;
    email_id: number;
    password: string;
}

export interface Error {
    message: string;
    logInfo: string;
}

export interface Google {
    google_id: number;
    storage_connection_id?: number;
    entry_connection_id?: number;
    email_id: number;
    google_account_id: string;
    refresh_token: string;
}

export type Done = (error?: Error | string | null, user?: UserResponse | false, info?: Record<string, unknown>) => void;

export type DbResponse<T> = Array<T> | string;

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        export interface User {
            user_id: number;
            is_admin: boolean;
            email: string;
            date_joined: string;
            googleAuth: Auth.OAuth2Client | null;
        }

        export interface Request {
            clientUrl: string;
            logger: Logger;
            pool: Bluebird<Pool>;
            aws: S3;
        }
    }
}
