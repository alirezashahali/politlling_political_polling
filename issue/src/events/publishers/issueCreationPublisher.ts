import {Publisher, IssueCreationEvent, Subjects} from '@politling_common/common'

export class IssueCreationPublisher extends Publisher<IssueCreationEvent>{
  subject: Subjects.IssueCreation = Subjects.IssueCreation
}