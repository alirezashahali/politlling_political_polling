import {Message} from 'node-nats-streaming'
import {Listener, Subjects, SolutionDeletionEvent} from '@politling_common/common'
import {Solution} from '../../models/solution'
import {queueGroupName} from './queue-group-name'

export class SolutionDeletionListener extends Listener<SolutionDeletionEvent>{
  subject: Subjects.solutionDeletion = Subjects.solutionDeletion
  queueGroupName = queueGroupName

  async onMessage(data: SolutionDeletionEvent['data'], msg: Message){
    const {ids} = data
    await Solution.deleteOne({_id: ids})
    msg.ack()
  }
}