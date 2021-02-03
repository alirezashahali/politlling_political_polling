import express, {Request, Response, NextFunction} from 'express'
import {json} from 'body-parser'
import cookieSession from 'cookie-session'
import {NotFoundError, errorHandler} from '@politling_common/common'
import {createIssueRouter} from './routes/createIssue'
import {addSolutionRouter} from './routes/addSolutions'
import {likeIssueRouter} from './routes/likeIssue'
import {likeSolutionRouter} from './routes/likeSolution'
import {deleteIssueRouter} from './routes/deleteIssue'
import {deleteSolutionRouter} from './routes/deleteSolution'
import {showOneIssueRouter} from './routes/showOneIssue'
import {showOneSolutionRouter} from './routes/showOneSolution'

const app = express();

app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV != 'test',
  })
)

app.use(createIssueRouter)
app.use(addSolutionRouter)
app.use(likeIssueRouter)
app.use(likeSolutionRouter)
app.use(deleteIssueRouter)
app.use(deleteSolutionRouter)
app.use(showOneIssueRouter)
app.use(showOneSolutionRouter)

app.get("*", (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError());
})

app.use(errorHandler)

export {app}