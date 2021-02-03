import express, {Request, Response, NextFunction, request} from 'express'
import {body} from 'express-validator'
import {userChecker, BadRequestError,
  ArtificialValidationError} from '@politling_common/common'
import {artifitialValidateRequest} from './../services/artifitial-validate-request'
import {Issue} from '../models/issue'
import {currentUser} from './../services/currentuser'
import {sanitizeOne} from './../services/sanitizer'

declare global {
  namespace Express {
    interface Request {
      customErrors?: ArtificialValidationError[];
    }
  }
}

const router = express.Router()

router.post('/api/issues/issue', currentUser, userChecker, [
  body('id').isString().withMessage("id is not valid for an issue")
], artifitialValidateRequest, async (
  req: Request, res: Response, next: NextFunction
) => {
  let {id} = req.body
  id = sanitizeOne(id)
  const issue = await Issue.findById(id)
  if(!issue){
    return next(new BadRequestError('such an issue does not exist!'))
  }
  await issue.like(req.currentUser!.id);
  res.status(200).send('the issue was successfully liked');
})

export {router as likeIssueRouter}