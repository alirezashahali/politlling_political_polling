import request from 'supertest'
import {app} from './../../app'
import {natsWrapper} from './../../nats-wrapper'

it('returns a 201 on successful signup', async () => {
  return await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '918273645',
      name: 'test'
    })
    .expect(201)
})

it('returns a 400 if you try to signup with a used email', async () => {
  await request(app).post('/api/users/signup').send({
    email: 'test@test.com',
    password: 'password',
    name: 'test'
  }).expect(201)

  return request(app).post('/api/users/signup').send({
    email: 'test@test.com',
    password: 'password',
    name: 'test'
  }).expect(400)
})

it('returns a responce with a cookie set when you sign up', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
      name: 'test'
    }).expect(201)

    return expect(response.get('Set-Cookie')).toBeDefined()
})

it('returns with error when you don\'t include name or email or password', async () => {
  await request(app).post('/api/users/signup').send({
    name: 'test',
    password: 'password'
  }).expect(400)

  await request(app).post('/api/users/signup').send({
    email: 'test@test.com',
    name: 'password'
  }).expect(400)

  return await request(app).post('/api/users/signup').send({
    email: 'test@test.com',
    password: 'password'
}).expect(400)
})