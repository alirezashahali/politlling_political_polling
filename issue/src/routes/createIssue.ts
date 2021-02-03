import express, { Request, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import {
  userChecker, artifitialValidateRequest,
  ArtificialValidationError
} from '@politling_common/common'
// import {artifitialValidateRequest} from './../services/artifitial-validate-request'
// import {validateRequest} from './../services/requestValidateError'
import { Issue } from '../models/issue'
import { User } from '../models/user'
import { Solution, SolutionDoc } from '../models/solution'
import { solutionsChecker, referencesChecker } from './../services/solutionsChecker'
import { currentUser } from './../services/currentuser'
import { sanitizeOne, sanitizeList } from './../services/sanitizer'
import { IssueCreationPublisher } from './../events/publishers/issueCreationPublisher'
import { natsWrapper } from './../nats-wrapper'
import { SolutionCreationPublisher } from './../events/publishers/solutionCreationPublisher'

declare global {
  namespace Express {
    interface Request {
      customErrors?: ArtificialValidationError[];
    }
  }
}

const router = express.Router()
//@ts-ignore
router.post('/api/issues/create', currentUser, userChecker, [
  body('title').trim().isString().isLength({ min: 1, max: 500 })
    .withMessage('title should not be longer than 500 character or shorter than one character'),
  body('description').trim().isString().isLength({ min: 1, max: 5000 })
    .withMessage('the description of the issue should at least have 1 and at max 5000 members'),
  body('references').custom((value, { req }) => {
    if (value) {
      let listOfErrors: ArtificialValidationError[] = referencesChecker(value);
      if (listOfErrors.length > 0) {
        req.customErrors = listOfErrors
      }
    }
    return true
  }),
  body('solutions').custom((value, { req }) => {
    // if there are solutions then checks them to be correct
    if (value) {
      let listOfErrors: ArtificialValidationError[] = solutionsChecker(value);
      if (req.customErrors) {
        listOfErrors = [...req.customErrors, ...listOfErrors];
      }
      if (listOfErrors.length > 0) {
        req.customErrors = listOfErrors;
      }
    }
    return true;
  })
], artifitialValidateRequest, async (req: Request, res: Response, next: NextFunction) => {
  let { title, description, references, solutions } = req.body;
  // sanitizing one by one
  title = sanitizeOne(title)
  description = sanitizeOne(description)
  if (references) {
    references = sanitizeList(references)
  }
  const user = await User.findById(req.currentUser!.id);
  let issue = Issue.build({ title, description, references, user })
  new IssueCreationPublisher(natsWrapper.client).publish({
    id: issue.id,
    userId: user.id,
    title: issue.title,
    description: issue.description
  })
  var createdSolutions: SolutionDoc[] = [];
  // build all the solutions that were mentioned in solutions
  const promises: SolutionDoc[] = []
  if (solutions) {
    for (const solution of solutions) {
      let { title, description, references } = solution;
      title = sanitizeOne(title)
      description = sanitizeOne(description)
      if (references) {
        references = sanitizeList(references)
      }
      //@ts-ignore
      // kept warning that the type of title and ... are not string and are any
      const createdSolution = Solution.build({ parent: issue, title, description, user, references })
      promises.push(createdSolution)
      await createdSolution.save()
    }
  }

  Promise.all(promises).then(async (values) => {
    createdSolutions = values
    issue = await issue.addSolutions(createdSolutions)
    new SolutionCreationPublisher(natsWrapper.client).publish({
      userId: req.currentUser!.id,
      issueId: issue.id,
      solutions: createdSolutions.map(el => {
        return {
          id: el.id,
          title: el.title, description: el.description
        }
      })
    })
    res.status(201).send(issue)
  })
  // adds the created solutions to the issue and replace issue with the new issue that has solutions
  // on it
  // console.log('issueReferences', issue.references)
  // const issue = Issue.build({title, description, references});
}
)

export { router as createIssueRouter }