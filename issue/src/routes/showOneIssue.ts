import express, {Request, Response, NextFunction} from 'express'
import {Issue} from './../models/issue'
import {sanitizeOne} from './../services/sanitizer'
import {BadRequestError} from '@politling_common/common'

const router = express.Router()

router.get('/api/issues/issue/:issueId', async (req: Request, res: Response, next: NextFunction) => {
  const {issueId} = req.params
  const id = sanitizeOne(issueId)
  const issue = await Issue.findById(id)
  if(!issue){
    return next(new BadRequestError('the issue that you ask for does not exist'))
  }
  // TODO does not populate at once and should a sort of stream if it wants to see solutions and comments and other goodies
  res.send(issue)
})

export {router as showOneIssueRouter}