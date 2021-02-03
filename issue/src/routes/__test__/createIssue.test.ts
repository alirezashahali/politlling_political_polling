import request from 'supertest'
import {app} from './../../app'
import {natsWrapper} from './../../nats-wrapper'

it('errors when you try to create issue unAuthorized', async () => {
  return await request(app).post('/api/issues/create').send({}).expect(401)
})

it('errors when the user has a token but it is not right', async () => {
  const cookie = global.signInNoUserBuild()
  return await request(app).post('/api/issues/create').set('Cookie', cookie)
    .send({}).expect(401)
})

it('errors when the title or description is empty or it trys to xss', async () => {
  const cookie = await global.signin()
  await request(app).post('/api/issues/create').set('Cookie', cookie).send({
    title: "$babe", description: ""
  }).expect(400)
  return await request(app).post('/api/issues/create').set('Cookie', cookie)
    .send({title: "", description: "sucks"}).expect(400)
  // TODO test the protection against xss
})

it('errors when the references has an empty member or it trys to xss', async () => {
  //TODO test the protection against xss
  const cookie = await global.signin()
  return await request(app).post('/api/issues/create').set('Cookie', cookie).send({
    title: 'sucker', description: 'sucks', references: ['sucks', '']
  }).expect(400)
})

it('errors when solutions are not rightly formatted', async () => {
  const cookie = await global.signin()
  await request(app).post('/api/issues/create').set('Cookie', cookie).send({
    title: 'sucker', description: 'sucks', references: ['suckers', 'sucks'],
    solutions: [{title: "suckers", description: "", references: ['suckers']}]
  }).expect(400)
  return await request(app).post('/api/issues/create').set('Cookie', cookie).send({
    title: 'sucker', description: 'sucks', references: ['suckers', 'sucks'],
    solutions: [{title: "suckers", description: "sucks", references: ['suckers', '']}]
  }).expect(400)
})

it('it creates an issue when everything is right', async () => {
  const cookie = await global.signin()
  return await request(app).post('/api/issues/create').set('Cookie', cookie).send({
    title: 'sucker', description: 'sucks', references: ['suckers', 'sucks'],
    solutions: [{title: "suckers", description: "sucks", references: ['suckers']}]
  }).expect(201)
})

it('it creates an issue with solutionst when they are rightly formatted and also it adds solutions to it',
async () => {
  const cookie = await global.signin()
  const resp = await request(app).post('/api/issues/create').set('Cookie', cookie).send({
    title: 'sucker', description: 'sucks', references: ['suckers', 'sucks'],
    solutions: [{title: "suckers", description: "sucks", references: ['suckers']}]
  }).expect(201)
  return expect(resp.body.solutions.length).toEqual(1)
})

it('emits an issue creation and a solutions creation event', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  
  const response = await request(app).post('/api/issues/create').set('Cookie', cookie).send({
    title: 'sucker', description: 'sucks', references: ['suckers', 'sucks'],
    solutions: [{title: "suckers", description: "sucks", references: ['suckers']}]
  }).expect(201)

  return expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2)
})