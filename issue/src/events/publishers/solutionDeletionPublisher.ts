import { Publisher, Subjects, SolutionDeletionEvent } from '@politling_common/common'

export class solutionDeletionPublisher extends Publisher<SolutionDeletionEvent>{
  subject: Subjects.solutionDeletion = Subjects.solutionDeletion
}