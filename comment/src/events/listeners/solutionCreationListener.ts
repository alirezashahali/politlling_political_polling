// import {Message} from 'node-nats-streaming'
// import {Listener, Subjects, SolutionCreationEvent} from '@politling_common/common'
// import {Solution} from '../../models/solution'
// import {queueGroupName} from './queue-group-name'

// export class SolutionCreationListener extends Listener<SolutionCreationEvent>{
//   subject: Subjects.solutionCreation = Subjects.solutionCreation
//   queueGroupName = queueGroupName

//   async onMessage(data: SolutionCreationEvent['data'], msg: Message){
//     const {userId, issueId, solutions} = data
//     const solutionDocs = Solution.build({userId, issueId, solutions})

//     // written to check if jest has problems with handeling promises in main code

//     // for (const i in solutionDocs){
//     //   const solution = solutionDocs[i]

//     //   await solution.save()
//     // }

//     // console.log('list of solutions', solutionDocs, data)

//     // msg.ack()

//     const promises = [];
//     for(const solution of solutionDocs){
//       promises.push(new Promise((resolve, reject) => {
//         resolve(solution.save())
//       }))
//     }

//     await Promise.all(promises).then(async (values) => {
//       msg.ack()
//     })
//   }
// }

import {Message, Stan} from 'node-nats-streaming'
import mongoose from 'mongoose'
import {Listener, Subjects, SolutionCreationEvent} from '@politling_common/common'
// import {Listener} from './../events/base-listener'
// import {Subjects} from './../events/subjects'
// import {SolutionCreationEvent} from './../events/solutionCreationEvent'
// import {SolutionModel} from './../services/secondarySolution'
// import {Solution} from '../../models/solution'
// import {queueGroupName} from './queue-group-name'

export class SolutionCreationListener extends Listener<SolutionCreationEvent>{
  subject: Subjects.solutionCreation = Subjects.solutionCreation
  
  constructor(client: Stan, public queueGroupName: string, public Solution: any){
    super(client)
  }

  async onMessage(data: SolutionCreationEvent['data'], msg: Message){
    const {userId, issueId, solutions} = data
    const solutionDocs = this.Solution.build({userId, issueId, solutions})

    // written to check if jest has problems with handeling promises in main code

    // for (const i in solutionDocs){
    //   const solution = solutionDocs[i]

    //   await solution.save()
    // }

    // console.log('list of solutions', solutionDocs, data)

    // msg.ack()

    const promises = [];
    for(const solution of solutionDocs){
      promises.push(new Promise((resolve, reject) => {
        resolve(solution.save())
      }))
    }

    await Promise.all(promises).then(async (values) => {
      msg.ack()
    })
  }
}