/** @format */

import express from 'express';
import user from './user';
import aws from './aws';
import google from './google';

const router = express.Router();

router.use('/user', user);
router.use('/aws', aws);
router.use('/google', google);

export default router;
