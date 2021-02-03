import { Request, Response, NextFunction } from 'express';
import { validationResult } from "express-validator";
import { RequestValidationError, CustomError } from '@politling_common/common';

export const validateRequest = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log('do you enter here')
  if(err instanceof CustomError){
    return next(err);
  }
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return next(new RequestValidationError(errors.array()))
  }
  next()
}