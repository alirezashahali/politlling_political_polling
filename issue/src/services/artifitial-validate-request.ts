import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from "express-validator";
import {ArtificialRequestValidationError, ArtificialValidationError} from '@politling_common/common'
// import { RequestValidationError } from './../errors/request-validation-error';
// import {CustomError} from './../errors/custom-error'

export const artifitialValidateRequest = (req: Request, res: Response, next: NextFunction) => {
  let outieErrors: (ArtificialValidationError)[] = [];
  let errors = validationResult(req)
  if(req.customErrors){
    outieErrors = req.customErrors;
    // errors = [...]
  }
  if(!errors.isEmpty()){
    let errArr: ArtificialValidationError[] = errors.array().map((err) => {
      return {msg: err.msg, param: err.param}
    })
    outieErrors = [...errArr, ...outieErrors]
    // outieErrors = [errArr, ...outieErrors]
  }
  if(outieErrors.length > 0){
    return next(new ArtificialRequestValidationError(outieErrors))
  }
  next()
}