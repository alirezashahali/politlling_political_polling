import mongoose from 'mongoose'
import request from 'supertest'
import {app} from './../../app'
import {Solution} from './../../models/solution'
import {Issue} from './../../models/issue'

it('errors when you try to like unAuthorized', async () => {
  return await request(app).post('/api/issues/solution').send({}).expect(401)
})

it('errors when you try to like a solution with the wrong id', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issueRes = await request(app).post('/api/issues/create').set('Cookie', cookie).send({
    "title": "sucker",
    "description": "sucker",
    "solutions" : [
      {
        "title": "sucker",
        "description": "sickers"
      }
    ]
  }).expect(201)
  return await request(app).post('/api/issues/solution').set('Cookie', cookie).send({
    id: mongoose.Types.ObjectId()
  }).expect(400)
})

it('does add userId to the likes of the solution and then removes it', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issueRes = await request(app).post('/api/issues/create').set('Cookie', cookie).send({
    "title": "sucker",
    "description": "sucker",
    "solutions" : [
      {
        "title": "sucker",
        "description": "sickers"
      }
    ]
  }).expect(201)

  const solutionId = issueRes.body.solutions[0]._id
  await request(app).post('/api/issues/solution').set('Cookie', cookie).send({
    id: solutionId
  }).expect(200)

  let solution = await Solution.findById(solutionId)

  expect(solution.likes[solution.likes.length - 1]).toBe(user.id.toString())
  await request(app).post('/api/issues/solution').set('Cookie', cookie).send({
    id: solutionId
  }).expect(200)

  solution = await Solution.findById(solutionId)

  return expect(solution.likes[solution.likes.length - 1]).not.toEqual(user.id.toString())
})

it('does add userId to the solutionLikes of the issue that ownes the solution', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issueRes = await request(app).post('/api/issues/create').set('Cookie', cookie).send({
    "title": "sucker",
    "description": "sucker",
    "solutions" : [
      {
        "title": "sucker",
        "description": "sickers"
      }
    ]
  }).expect(201)

  const issueId = issueRes.body.id

  const solutionId = issueRes.body.solutions[0]._id

  await request(app).post('/api/issues/solution').set('Cookie', cookie).send({
    id: solutionId
  }).expect(200)

  const issue = await Issue.findById(issueId)
  // console.log('before err', issue)

  return expect(issue.solutionLikes[issue.solutionLikes.length - 1]).toEqual(user.id)
})