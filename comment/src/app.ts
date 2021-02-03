import express, {Request, Response, NextFunction} from 'express'
import {json} from 'body-parser'
import {NotFoundError, errorHandler} from '@politling_common/common'
import cookieSession from 'cookie-session'
import {writeCommentRouter} from './routes/writeComment'
import {readCommentRouter} from './routes/readComment'
import {likeCommentRouter} from './routes/likeComment'

const app = express()
// set trust proxy to true to stop it from erroring ingress proxy
app.set('trust proxy', true)

app.use(json())
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV != 'test'
}))

app.use(writeCommentRouter)
app.use(readCommentRouter)
app.use(likeCommentRouter)

app.get("*", (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError());
})

app.use(errorHandler)

export {app}