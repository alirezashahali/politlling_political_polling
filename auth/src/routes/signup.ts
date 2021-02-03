import util from 'util';
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { artifitialValidateRequest, BadRequestError } from '@politling_common/common';
import { User } from '../models/user';
import {SignUpPublisher} from './../events/publishers/signUpPublisher'
import {natsWrapper} from './../nats-wrapper'

const router = express.Router();

//TODO look for other entries as well intrestedFields and make an enum for fields

router.post('/api/users/signup', [
  body('email').isEmail().withMessage("Email must be valid"),
  body('name').trim().isLength({min: 1}),
  body('password').trim().isLength({ min: 4, max: 20 })
    .withMessage("Password must be between 4 and 20 character"),
], artifitialValidateRequest, async (req: Request, res: Response, next: NextFunction) => {
  // res.send('Hi suckers');
  const { email, password, name, intrestedFields, activeFields, biography, image } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser != null) {
    return next(new BadRequestError('Email is in use'))
  }

  const user = User.build({email, password, name, intrestedFields, activeFields, biography, image})
  await user.save()

  // publish an event saying that a user has signedUp
  new SignUpPublisher(natsWrapper.client).publish({
    id: user.id,
    name: user.name,
    image: user.image,
    email: user.email,
    version: user.version
  })

  const privateKey = process.env.JWT_KEY!;

  const jwTokenify = util.promisify(jwt.sign);
  const jwToken = await jwTokenify({ id: user.id, email: user.email }, privateKey);

  if(typeof jwToken === 'string'){
    req.session = {jwt: jwToken}
  }

  res.status(201).send(user)
})

export { router as signUpRputer };