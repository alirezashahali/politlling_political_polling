import mongoose from 'mongoose'
import { natsWrapper } from './nats-wrapper'
import {app} from './app'
import { SignUpListener } from './events/listeners/signUpListener'
import { IssueCreationListener } from './events/listeners/issueCreationListener'
import { SolutionCreationListener } from './events/listeners/solutionCreationListener'
import { IssueDeletionListener } from './events/listeners/issueDeletionListener'
import { SolutionDeletionListener } from './events/listeners/solutionDeletionListener'
import {queueGroupName} from './events/listeners/queue-group-name'
import {Solution} from './models/solution'


const start = async () => {
  if(!process.env.JWT_KEY){
    throw new Error('JWT_KEY is not defined define it with the right params please!')
  }
  if(!process.env.MONGO_URI){
    throw new Error("MONGO_URI is not defined please check your deployment file and check it twice")
  }
  if(!process.env.NATS_CLIENT_ID){
    throw new Error("NATS_CLIENT_ID is not defined check your deployment file and check it twice")
  }
  if(!process.env.NATS_CLUSTER_ID){
    throw new Error('NATS_CLUSTER_ID is not defined check your deployment file and check it twice')
  }
  try{
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID,
      process.env.NATS_URL!)
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

    new SignUpListener(natsWrapper.client).listen()
    new IssueCreationListener(natsWrapper.client).listen()
    new IssueDeletionListener(natsWrapper.client).listen()
    new SolutionCreationListener(natsWrapper.client, queueGroupName, Solution).listen()
    new SolutionDeletionListener(natsWrapper.client).listen()

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    console.log('connected to mongodb')

  }catch(err){
    console.log(err)
  }

  app.listen(3000, () => {
    console.log('the comments is on 3000')
  })
}

start()