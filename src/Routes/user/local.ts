/** @format */

import { Request, Response } from 'express';
import ApiError from '../../Utils/ApiError';
import { getLocalAccount } from '../../Utils/mysql';

export default async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new ApiError('User not logged in', 401);
    if (!req.user.local_acc_id) throw new ApiError('No associated local account', 422);
    const localUser = await getLocalAccount(req.pool, req.user.user_id);
    if (localUser.length !== 1) throw new ApiError('More than 1 result returned', 500);
    res.send(localUser[0]);
};

export const login = (error: ApiError, user: any) => {
    console.log(error.message);
};
