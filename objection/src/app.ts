import express, {Request, Response, NextFunction} from 'express'
import {json} from 'body-parser'
import {NotFoundError, errorHandler} from '@politling_common/common'
import cookieSession from 'cookie-session'
import {writeObjectionRouter} from './routes/writeObjection'

const app = express()
app.set('trust proxy', true)

app.use(json())
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV != 'test'
}))

app.use(writeObjectionRouter)

app.get("*", (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError());
})

app.use(errorHandler)

export {app}