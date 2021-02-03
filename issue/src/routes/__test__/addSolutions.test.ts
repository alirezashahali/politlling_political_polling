import request from 'supertest'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import {app} from './../../app'
import {User, UserDoc} from './../../models/user'
import {Issue} from './../../models/issue'
import {natsWrapper} from './../../nats-wrapper'

const createUser : () => Promise<UserDoc> = async () => {
  const user: UserDoc = User.build({id: mongoose.Types.ObjectId().toHexString(),
    name: "test", email: "test@test.com", image: undefined})
  await user.save()
  return user
}

const createAnotherUser : () => Promise<UserDoc> = async () => {
  const user: UserDoc = User.build({id: mongoose.Types.ObjectId().toHexString(),
    name: "king", email: "tes@test.com", image: undefined})
  await user.save()
  return user
}

const cookieForUser : (user: UserDoc) => string[] = (user: UserDoc) => {
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

it('errors when trys to access not authorized', async () => {
  return await request(app).post('/api/issues/addsolutions').send({}).expect(401)
})

it('errors when the id is not currect', async () => {
  const user = await createUser()
  const issueId = await global.createIssue(user)

  const cookie = await global.signin()
  return await request(app).post('/api/issues/addsolutions').set('Cookie', cookie).send({
    "id": mongoose.Types.ObjectId().toHexString(),
    "solutions": [
        {
            "title": "more sucker",
            "description": "even more"
        }
    ] 
  }).expect(400)
})

it('errors when the solution does not have name or description', async () => {
  const user = await createUser();
  const cookie = cookieForUser(user);
  
  const issueId = await global.createIssue(user)

  await request(app).post('/api/issues/addsolutions').set('Cookie', cookie).send({
    "id": issueId,
    "solutions": [
        {
            "title": "sicker",
            "description": ""
        }
    ] 
  }).expect(400)

  return await request(app).post('/api/issues/addsolutions').set('Cookie', cookie).send({
    "id": issueId,
    "solutions": [
        {
            "title": "",
            "description": "even more"
        }
    ]
  }).expect(400)
})

it('errors when you are not the one who made the issue', async () => {
  const user = await createUser();
  const issueId = await global.createIssue(user)

  const newUser = await createAnotherUser()
  const cookie = cookieForUser(newUser)

  return await request(app).post('/api/issues/addsolutions').set('Cookie', cookie).send({
    "id": issueId,
    "solutions": [
        {
            "title": "sucker",
            "description": "even more"
        }
    ]
  }).expect(400)
})

it('adds the solutions to the issue when every thing is rosy', async () => {
  const user = await createUser()
  const issueId = await global.createIssue(user)

  const cookie = cookieForUser(user)

  return await request(app).post('/api/issues/addsolutions').set('Cookie', cookie).send({
    "id": issueId,
    "solutions": [
        {
            "title": "sucker",
            "description": "even more"
        }
    ]
  }).expect(201)
})

it('the return of the request is correctly formated', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issueId = await global.createIssue(user)

  const recievedIssue = await request(app).post('/api/issues/addsolutions').set('Cookie', cookie)
    .send({
      "id": issueId,
      "solutions": [
        {
          "title": "sucker",
          "description": "even more"
        }
      ]
    }).expect(201)

  const contender = recievedIssue.body
  
  const newIssue = await Issue.findById(issueId)

  expect(newIssue.title).toBe(contender.title)
  expect(newIssue.description).toBe(contender.description)
  expect(newIssue.solutions.length).toBe(contender.solutions.length)
  expect(newIssue.version).toBe(contender.version)
})

it('emits a solution creation event', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issueId = await global.createIssue(user)

  await request(app).post('/api/issues/addsolutions').set('Cookie', cookie).send({
    "id": issueId,
    "solutions": [
      {
        "title": "sucker",
        "description": "even more"
      }
    ]
  }).expect(201)

  return expect(natsWrapper.client.publish).toHaveBeenCalled()
})