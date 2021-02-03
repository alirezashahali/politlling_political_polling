import mongoose from 'mongoose'
import request from 'supertest'
import {app} from './../../app'
import {Issue} from './../../models/issue'

it('errors when the user is not authenticated', async () => {
  return await request(app).post('/api/issues/issue').send({}).expect(401)
})

it('errors when the issueId is not correct', async () => {
  const cookie = await global.signin()
  const issue = await request(app).post('/api/issues/create').set('Cookie', cookie).send({
    "title": "sucker",
    "description": "sucker",
  }).expect(201)
  return await request(app).post('/api/issues/issue').set('Cookie', cookie).send(
    {
      id: mongoose.Types.ObjectId()
    }
  ).expect(400)
})

it('does add the userId to the likes and then removes it from array of likes', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issueRes = await request(app).post('/api/issues/create').set('Cookie', cookie).send({
    "title": "sucker",
    "description": "sucker",
  }).expect(201)
  await request(app).post('/api/issues/issue').set('Cookie', cookie).send(
    {
      id: issueRes.body.id
    }
  ).expect(200)

  const issue = await Issue.findById(issueRes.body.id)
  const userId = user.id

  return expect(issue.likes[issue.likes.length - 1]).toBe(userId.toString())
})

// TODO test to see how efficient it is when multiple users does like and remove likes