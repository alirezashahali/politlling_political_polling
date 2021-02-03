import mongoose from 'mongoose'
import { app } from './app'
import { natsWrapper } from './nats-wrapper'
import {SignUpListener} from './events/listeners/signUpListener'
import {User} from './models/user'
import {queueGroupName} from './events/listeners/queue-group-name'

const errorCheckerForStart: () => void = () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY is not defined get your shits together please!')
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined get your shits together please!')
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL is not defined get your shits together please!')
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID is not defined get your shits together please!')
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID is not defined get your shits together please!')
  }
}

const start = async () => {
  errorCheckerForStart();

  try {
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID!,
      process.env.NATS_CLIENT_ID!, process.env.NATS_URL!)
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!')
      process.exit()
    })
    process.on('SIGINT', () => {
      natsWrapper.client.close()
    })
    process.on('SIGTERM', () => {
      natsWrapper.client.close()
    })

    new SignUpListener(natsWrapper.client, queueGroupName, User).listen()

    await mongoose.connect(process.env.MONGO_URI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log('connected to mongodb')
  } catch (err) {
    console.error(err)
  }
  app.listen(3000, () => { console.log('listening on port 3000!') });
}

start()