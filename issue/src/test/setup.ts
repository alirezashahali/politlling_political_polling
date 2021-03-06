import {MongoMemoryServer} from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import {User, UserDoc} from './../models/user'
import {Issue} from './../models/issue'

declare global {
  namespace NodeJS {
      interface Global {
          signin(): Promise<string[]>;
          signInNoUserBuild() : string[];
          createIssue(user: UserDoc) : Promise<any>;
          createUser() : Promise<UserDoc>;
          createAnotherUser(): Promise<UserDoc>;
          cookieForUser(user: UserDoc): string[]
      }
  }
}

jest.mock('./../nats-wrapper')

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = process.env.SECRET_KEY;
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
})

beforeEach( async () => {
  const collections = await mongoose.connection.db.collections()

  jest.clearAllMocks()

  for(let collection of collections){
    await collection.deleteMany({});
  }
})

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
})

global.signin = async () => {
  const user = User.build({id: mongoose.Types.ObjectId().toHexString(),
    name: "test", email: "test@test.com", image: undefined})
  await user.save()
  const payload = {id: user.id, email: user.email}

  // Create the JWT
  const JWT = jwt.sign(payload, process.env.JWT_KEY!)

  // Build session Object, {jwt: MY_JWT}
  const session = {jwt: JWT}

  // Turn the session into json
  const jsonSession = JSON.stringify(session)

  // Take JSON and encode it as base64
  const encodedSession = Buffer.from(jsonSession).toString('base64')

  // return a string thats the cookie with the encoded data
  return [`express:sess=${encodedSession}`]
}


global.signInNoUserBuild = () => {
  // Build a JWT payload, {id, email}
  const payload = {id: mongoose.Types.ObjectId().toHexString(), email: 'test@test.com'}

  // Create the JWT
  const JWT = jwt.sign(payload, process.env.JWT_KEY!)

  // Build session Object, {jwt: MY_JWT}
  const session = {jwt: JWT}

  // Turn the session into json
  const jsonSession = JSON.stringify(session)

  // Take JSON and encode it as base64
  const encodedSession = Buffer.from(jsonSession).toString('base64')

  // return a string thats the cookie with the encoded data
  return [`express:sess=${encodedSession}`]
}

global.createIssue = async (user: UserDoc) => {
  const issue = Issue.build({title: "sucker", description: "sucks", user})
  await issue.save()
  return issue.id
}

global.createUser = async () => {
  const user: UserDoc = User.build({id: mongoose.Types.ObjectId().toHexString(),
    name: "test", email: "test@test.com", image: undefined})
  await user.save()
  return user
}

global.createAnotherUser = async () => {
  const user: UserDoc = User.build({id: mongoose.Types.ObjectId().toHexString(),
    name: "king", email: "tes@test.com", image: undefined})
  await user.save()
  return user
}

global.cookieForUser = (user: UserDoc) => {
  const payload = {id: user.id, email: user.email}

  // Create the JWT
  const JWT = jwt.sign(payload, process.env.JWT_KEY!)

  // Build session Object, {jwt: MY_JWT}
  const session = {jwt: JWT}

  // Turn the session into json
  const jsonSession = JSON.stringify(session)

  // Take JSON and encode it as base64
  const encodedSession = Buffer.from(jsonSession).toString('base64')

  const cookie = [`express:sess=${encodedSession}`]
  return cookie;
}