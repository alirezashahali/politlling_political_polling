import request from 'supertest'
import {app} from './../../app'
import {authenticator} from './../../services/authenticator'

const password = "password"
const wrongPassword = "wrongPassword"
const name = "test"
const wrongName = 'wrongTest'
const email = "test@test.com"

const signUp = async () => {
  await request(app).post('/api/users/signup').send({
    email: email,
    password: password,
    name: name
  }).expect(201)
}

it('returns 400 error when password or username is not provided', async () => {
  await signUp();

  await request(app).post('/api/users/signin').send({
    emailOrUserName: email,
  }).expect(400)

  return await request(app).post('/api/users/signin').send({
    password: password
  }).expect(400)
})

it('returns 400 error when password is not correct', async () => {
  await signUp();

  return await request(app).post('/api/users/signin').send({
    emailOrUserName: email,
    password: wrongPassword
  }).expect(400)
})

it('returns 400 error email or username is not correct', async () => {
  await signUp();
  
  return request(app).post('/api/users/signin').send({
    emailOrUserName: wrongName,

  })
})

it('sets correct cookie when every thing is done right', async () => {
  await signUp();

  const response = await request(app).post('/api/users/signin').send({
    emailOrUserName: name,
    password: password
  }).expect(200)

  return expect(response.get('Set-Cookie')).toBeDefined()
})