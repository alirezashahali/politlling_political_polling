import express, {Request, Response, NextFunction, request} from 'express'
import {body} from 'express-validator'
import {userChecker, BadRequestError,
  ArtificialValidationError} from '@politling_common/common'
import {artifitialValidateRequest} from './../services/artifitial-validate-request'
import {Solution} from './../models/solution'
import {Issue} from './../models/issue'
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

router.post('/api/issues/solution', currentUser, userChecker, [
  body('id').isString().withMessage("id is not valid for a solution")
],artifitialValidateRequest, async (req: Request, res: Response, next: NextFunction) => {
  let {id} = req.body
  id = sanitizeOne(id)
  let solution = await Solution.findById(id)
  
  // console.log('solution', solution)

  if(!solution){
    return next(new BadRequestError('such a solution does not exist!'))
  }
  await solution.like(req.currentUser!.id)
  // because issue has solution in it as a ref could not do this the other way as well
  // had to do it by hand

  const issue = await Issue.findById(solution.parent)
  await issue.solutionLike(req.currentUser!.id)

  // console.log(solution, issue)

  res.send('the solution was successfully liked')
})

export {router as likeSolutionRouter}