import util from 'util'
import express, {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken'
import {body} from 'express-validator'
import {validateRequest, BadRequestError} from '@politling_common/common'
import {User} from './../models/user'
import {Password} from './../services/password'
import {isEmail} from './../services/isEmail'

const router = express.Router();

router.post('/api/users/signin', [
  body('emailOrUserName').trim().notEmpty().withMessage('Email or userName must be provided!'),
  body("password").trim().notEmpty().withMessage("password must be provided!")
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  const {emailOrUserName, password} = req.body;
  let desUser;

  if(isEmail(emailOrUserName)){
    desUser = await User.findOne({email: emailOrUserName})
  }else{
    desUser = await User.findOne({name: emailOrUserName})
  }

  if(!desUser || !(await Password.compare(password, desUser.password))){
    return next(new BadRequestError('emailOrUserName or password is not currect'))
  }

  const privateKey = process.env.JWT_KEY!;
  // const jwTokenify = util.promisify(jwt.sign);
  const jwTokenify = util.promisify(jwt.sign);

  const jwToken = await jwTokenify({id: desUser.id, email: desUser.email}, privateKey)

  if(typeof jwToken === 'string'){
    req.session = {jwt: jwToken}
  }

  res.send('Hi amazing user')
})

export {router as signInRouter};