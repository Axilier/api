/** @format */
import { Router } from 'express';
import AWS from '../Aws';

const app = Router();

app.route('/list_files').get();
