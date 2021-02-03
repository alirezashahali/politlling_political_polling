import mongoose from 'mongoose'
import request from 'supertest'
import {ModelTypes} from '@politling_common/common'
import {app} from './../../app'

it('errors when you try to create comment not autherized', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issue = await global.createIssue(user)

  return await request(app).post('/api/comments/create').send({
    "parentType": "Issue",
    "parentId": issue.id,
    "description": "fuckers",
    "isASuggestedSolution": true
  }).expect(401)
})

it('errors when you try to comment on something that does not exists', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issue = await global.createIssue(user)

  return await request(app).post('/api/comments/create').set('Cookie', cookie).send({
    "parentType": "Issue",
    "parentId": mongoose.Types.ObjectId(),
    "description": "fuckers",
    "isASuggestedSolution": true
  }).expect(400)
})

it('errors when you try to comment with out parentType/id description or isASuggestedSolution',
  async() => {
    const user = await global.createUser()
    const cookie = global.cookieForUser(user)
    const issue = await global.createIssue(user)

    await request(app).post('/api/comments/create').set('Cookie', cookie).send({
      "parentId": issue.id,
      "description": "fuckers",
      "isASuggestedSolution": true
    }).expect(400)

    await request(app).post('/api/comments/create').set('Cookie', cookie).send({
      "parentType": "Issue",
      "description": "fuckers",
      "isASuggestedSolution": true
    }).expect(400)

    await request(app).post('/api/comments/create').set('Cookie', cookie).send({
      "parentType": "Issue",
      "parentId": issue.id,
      "isASuggestedSolution": true
    }).expect(400)

    return await request(app).post('/api/comments/create').set('Cookie', cookie).send({
      "parentType": "Issue",
      "parentId": issue.id,
      "description": "fuckers",
    }).expect(400)
})

it('errors when you try to build a comment with right id but wrong parentType', async () => {
    const user = await global.createUser()
    const cookie = global.cookieForUser(user)
    const issue = await global.createIssue(user)
    const solution = await global.createSolutionAndAddIt(user.id, issue.id)

    await request(app).post('/api/comments/create').set('Cookie', cookie).send({
      "parentType": "Issue",
      "parentId": solution.id,
      "description": "suckers",
      "isASuggestedSolution": true
    }).expect(400)

    return await request(app).post('/api/comments/create').set('Cookie', cookie).send({
      "parentType": "Solution",
      "parentId": issue.id,
      "description": "suckers",
      "isASuggestedSolution": true
    }).expect(400)
})

it('it creats comment correctly no matter issue or solution is the parent', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issue = await global.createIssue(user)
  const solution = await global.createSolutionAndAddIt(user.id, issue.id)

  await request(app).post('/api/comments/create').set('Cookie', cookie).send({
    "parentType": "Issue",
    "parentId": issue.id,
    "description": "suckers",
    "isASuggestedSolution": true
  }).expect(201)

  await request(app).post('/api/comments/create').set('Cookie', cookie).send({
    "parentType": "Solution",
    "parentId": solution.id,
    "description": "suckers",
    "isASuggestedSolution": true
  }).expect(201)
})