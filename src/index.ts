import mysql, {MysqlError} from 'mysql'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import session from 'express-session';
import cookieParser from "cookie-parser";
import passport from "passport";
import bcrypt from "bcrypt"
import passportLocal from 'passport-local'
import {User} from "./Types";

dotenv.config()
const localStrategy = passportLocal.Strategy
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "Axilier"
})

connection.connect((err: MysqlError) => {
    if (err) throw err;
    console.log("Connected to Axilier database")
})

const app = express();
app.use(express.json());
app.use(cors({origin: process.env.ORIGIN, credentials: true}));
app.use(session({
    name: "Axilier-sessionId",
    secret: process.env.SECRET || "secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: true
    }
}))
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
//PASSPORT
passport.use(new localStrategy({usernameField: "email"}, (email, password, done) => {
    connection.query(`
        SELECT user.*, local.password as password, email.email
        FROM email,
             account,
             local,
             user
        WHERE email = ?
          AND email.email_id = account.email_id
          AND local.account_id = account.account_id
          AND user.main_acc_id = account.account_id
          AND type = 'LOCAL'
    `, [email], ((err, results: Array<User>) => {
        if (err) throw err;
        if (results.length <= 0) return done(null, false)
        bcrypt.compare(password, results[0].password.toString(), (err, result) => {
            if (err) throw err;
            if (result) {
                return done(null, results[0])
            } else {
                return done(null, false);
            }
        })
    }))
}))

passport.serializeUser((user: any, done) => {
    done(null, user.user_id)
});

passport.deserializeUser((id: string, cb) => {
    connection.query(`
        SELECT *
        FROM user
        WHERE user_id = ?
    `, [id], (err, results) => {
        cb(err, results[0])
    })
});

//ROUTES -- LOCAL
app.post('/register', async (req, res) => {
    const {email, password} = req?.body
    const hashedPass = await bcrypt.hash(password, 10)

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
        res.send("Bad body values")
        return;
    }

    await connection.query('SELECT email_id FROM `email` WHERE `email` = ?', [email], ((err, results) => {
        if (err) {
            res.send(err)
            return;
        } else if (results.length > 0) {
            res.send("User with this email already exists")
            return;
        } else {
            connection.query('INSERT INTO email SET ?', {email}, (err, {insertId}) => {
                    if (err) {
                        res.send(err)
                        return;
                    }
                    connection.query('INSERT INTO account SET ?', {email_id: insertId, type: "LOCAL"}, (err, {insertId}) => {
                        if (err) {
                            res.send(err)
                            return;
                        }
                        connection.query('INSERT INTO local SET ?', {account_id: insertId, password: hashedPass}, (err) => {
                            if (err) {
                                res.send(err)
                                return;
                            }
                        })
                        connection.query('INSERT INTO user SET ?', {main_acc_id: insertId}, (err) => {
                            if (err) {
                                res.send(err)
                                return;
                            }
                        })
                        res.send(200)
                    })
                }
            )
        }
    }))
})
app.post('/login', passport.authenticate("local"), (req, res) => {
    res.send(200)
})
app.post('/logout', ((req, res) => {
    req.logout();
    res.send(200)
}))

app.listen(4000, () => {
    console.log("Server Started")
})
