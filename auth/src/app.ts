import express, {Response, Request, NextFunction} from 'express';
import {json} from 'body-parser';

import {currentUserRouter} from './routes/currentuser'
import {signInRouter} from './routes/signin'
import {signOutRouter} from './routes/signout'
import {signUpRputer} from './routes/signup'
import {editAccountRouter} from './routes/editAccount'
import {addFollowerRouter} from './routes/addFolower'
import {errorHandler, NotFoundError} from '@politling_common/common'

import cookieSession from 'cookie-session'

const app = express();
// set trust proxy to true to stop erroring ingress proxy
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV != 'test',
  })
)

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRputer);
app.use(editAccountRouter)
app.use(addFollowerRouter)

app.get("*", (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError());
})

app.use(errorHandler);

export {app};
