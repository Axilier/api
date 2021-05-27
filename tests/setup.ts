/** @format */
import fs from 'fs';
import dotenv from 'dotenv';
import mysql from 'promise-mysql';

export default async function setup(): Promise<boolean> {
    dotenv.config();
    const file = fs.readFileSync('./datamodel.ddl', { encoding: 'utf8' });
    const fixedFile = file.replace(/Axilier/g, 'AxilierTest');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true,
    });
    return connection.query(fixedFile);
}
