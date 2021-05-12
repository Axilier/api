import { format } from 'date-fns';
import { Logger } from 'winston';
import { nanoid } from 'nanoid';
import { Response } from 'express';
import ApiError from './ApiError';

export const getNeatDate = () => {
    const date = new Date();
    return format(date, 'dd/MM/y HH:mm:ss');
};

export const handleError = (logger: Logger, error: ApiError | Error, res: Response): void => {
    const id = nanoid(10);
    const errorCode = error instanceof ApiError ? error.code : 500;
    logger.error(
        `TIMESTAMP: ${getNeatDate()}, ID: ${id}, CODE: ${errorCode}, MESSAGE: ${error.message}`,
    );
    res.sendStatus(errorCode).send(`Something went wrong and has been logged ::ID::${id}`);
};
