import {Message} from 'node-nats-streaming'
import {Listener, Subjects, IssueDeletionEvent} from '@politling_common/common'
import {queueGroupName} from './queue-group-name'
import {Issue} from '../../models/issue'
import {Solution} from '../../models/solution'

export class IssueDeletionListener extends Listener<IssueDeletionEvent>{
  subject: Subjects.IssueDeletion = Subjects.IssueDeletion
  queueGroupName = queueGroupName

  async onMessage(data: IssueDeletionEvent['data'], msg: Message){
    const {id} = data
    await Issue.deleteOne({_id: id})
    await Solution.deleteMany({issueId: id})
    msg.ack()
    // can't use promise.all because solutionProm might not get resolved at all
    // Promise.all([issueProm, solutionProm]).then((_) => {
    //   msg.ack()
    // })
  }
}