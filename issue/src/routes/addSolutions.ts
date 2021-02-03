import express, {Request, Response, NextFunction, request} from 'express'
import {body} from 'express-validator'
import {userChecker, BadRequestError,
  ArtificialValidationError} from '@politling_common/common'
import {artifitialValidateRequest} from './../services/artifitial-validate-request'
import {Issue} from '../models/issue'
import {User, UserDoc} from '../models/user'
import {Solution, SolutionDoc} from '../models/solution'
import {solutionsChecker, referencesChecker} from './../services/solutionsChecker'
import {currentUser} from './../services/currentuser'
import {SolutionCreationPublisher} from './../events/publishers/solutionCreationPublisher'
import { natsWrapper } from '../nats-wrapper'

// TODO put all of it in another service for editIssue and in a patch

declare global {
  namespace Express {
    interface Request {
      customErrors?: ArtificialValidationError[];
    }
  }
}

const router = express.Router()

router.post('/api/issues/addsolutions', currentUser, userChecker, [
  body('solutions').custom((value, {req}) => {
    // if there are solutions then checks them to be correct
    if(value){
      let listOfErrors: ArtificialValidationError[] = solutionsChecker(value);
      if(req.customErrors){
        listOfErrors = [...req.customErrors, ...listOfErrors];
      }
      if(listOfErrors.length > 0){
        req.customErrors = listOfErrors;
      }
    }
    return true;
  })
], artifitialValidateRequest, async (req: Request, res: Response, next: NextFunction) => {
  const {id, solutions} = req.body
  const user = await User.findById(req.currentUser!.id)
  let issue = await Issue.findById(id)
  // console.log('req.currentuser.id', req.currentUser!.id, 'UserDoc', user, 'issueUser', issue.user)
  if(issue === null){
    return next(new BadRequestError("such a issue is not currect it's probably deleted"))
  }
  
  // check if there are solutions and if the user is actually the one who made the issue
  if(req.currentUser!.id !== issue.user.toString()){
    return next(
      new BadRequestError('You are not the creator of this issue you can not post an issue for it!')
      )
  }
  const promises = []
  //TODO must use transaction for almost all of the rest shits
  if(solutions){
    // TODO write promise all to improve the fu***ng algorithm
    for (const solution of solutions) {
      const {title, description, references} = solution;
      //@ts-ignore
      // kept warning that the type of title and ... are not string and are any
      const createdSolution = Solution.build({parent: issue, title, description,
        user, references})
      promises.push(new Promise((resolve, reject) => {
        resolve(createdSolution.save())
      }))
    }
  }

  Promise.all(promises).then(async (values) => {
    console.log(values)
    issue = await issue.addSolutions(values)
    //@ts-ignore
    if(values.length > 0){
      new SolutionCreationPublisher(natsWrapper.client).publish({
        userId: req.currentUser!.id,
        issueId: issue.id,
        //@ts-ignore
        solutions: values.map(el => {return{title: el.title, description: el.description}})
      })

      const newIssue = await Issue.findById(issue.id)
      return res.status(201).send(newIssue)
    }
    // TODO add a sort of we fucked up error for this situation and replace it with next line
    return res.status(300).send(issue)
  })
  // console.log('issueReferences', issue.references)
  // const issue = Issue.build({title, description, references});
  // gets the new issue and sends it back
})

// TODO add a publish to send notification for users who liked this issue or the ones who like one of solutions

export {router as addSolutionRouter}