import express, {Request, Response, NextFunction} from 'express'
import {userChecker,
  ArtificialValidationError,
  BadRequestError} from '@politling_common/common'
import {artifitialValidateRequest} from './../services/artifitial-validate-request'
// import {validateRequest} from './../services/requestValidateError'
import {Issue} from '../models/issue'
import {currentUser} from './../services/currentuser'
import {sanitizeOne} from './../services/sanitizer'
import {IssueDeletionPublisher} from './../events/publishers/issueDeletionPublisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

//TODO send notification when the issue gets deleted to the ones that like solutions of issue or the
// issue it self but not sure yet

router.delete("/api/issues/issue/:issueId", currentUser, userChecker,
  async (req: Request, res: Response, next: NextFunction) => {
  const {issueId} = req.params
  const id = sanitizeOne(issueId)
  const issue = await Issue.findById(id).populate('user')

  if(!issue){
    return next(new BadRequestError("such an issue does not exist"))
  }

  // errors if the user is not the user who built the shit it sends error and does not do the command
  if(req.currentUser!.id !== issue.user.id){
    return next(new BadRequestError('You do not have permission to decre such a command'))
  }

  await issue.delete()
  new IssueDeletionPublisher(natsWrapper.client).publish({
    id: issue.id
  })

  res.send('issue was deleted')
})

export {router as deleteIssueRouter}