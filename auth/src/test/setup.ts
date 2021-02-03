import {MongoMemoryServer} from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import {UserDoc, User} from './../models/user'

declare global{
  namespace NodeJS{
    interface Global{
      createUser(name: string, email: string, password: string): Promise<UserDoc>
      cookieFromUser(user: UserDoc): string[]
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


global.createUser = async (name: string, email: string, password: string) => {
  const user = new User({name, email, password})
  await user.save()
  return user
}

global.cookieFromUser = (user: UserDoc) => {
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