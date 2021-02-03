import {Publisher, SolutionCreationEvent, Subjects} from '@politling_common/common'

export class SolutionCreationPublisher extends Publisher<SolutionCreationEvent>{
  subject: Subjects.solutionCreation = Subjects.solutionCreation
}