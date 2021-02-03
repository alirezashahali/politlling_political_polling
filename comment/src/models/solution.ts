import {secondarySolution, SolutionDoc} from '@politling_common/common'

const Solution = new secondarySolution('CommentSolution').Solution

export {Solution, SolutionDoc}
// import mongoose from 'mongoose'
// import {updateIfCurrentPlugin} from 'mongoose-update-if-current'

// interface SolutionAttrs{
//   userId: string,
//   issueId: string,
//   solutions: {id: string, title: string, description: string}[]
// }

// export interface SolutionDoc extends mongoose.Document{
//   userId: string,
//   issueId: string,
//   title: string,
//   description: string
// }

// interface SolutionModel extends mongoose.Model<SolutionDoc>{
//   build(attrs: SolutionAttrs): SolutionDoc[],
//   findByEvent(event: {id: string, version: number}) : Promise<SolutionDoc | null>
// }

// const solutionSchema = new mongoose.Schema({
//   userId:{
//     type: String,
//     required: true
//   },
//   issueId: {
//     type: String,
//     required: true
//   },
//   title: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String,
//     required: true,
//   }
// },
// {
//   toJSON: {
//     transform(doc, ret){
//       ret.id = ret._id
//       delete ret._id
//     }
//   }
// })

// solutionSchema.set('versionKey', 'version')
// solutionSchema.plugin(updateIfCurrentPlugin)

// solutionSchema.statics.findByEvent = (event: {id: string, version: number}) => {
//   return Solution.findOne({
//     _id: event.id,
//     version: event.version
//   })
// }

// solutionSchema.statics.build = (attrs: SolutionAttrs) => {
//   // TODO search to see if you nee any sort of sanitization for nats streaming services
//   // TODO write a promise.all to save the members of solutions in a for loop and then resolves
//   const solutions = attrs.solutions
//   const solutionDocs = []
//   for(const solution of solutions){
//     solutionDocs.push(new Solution({
//       _id: solution.id, userId: attrs.userId, issueId: attrs.issueId,
//       title: solution.title, description: solution.description
//     }))
//   }
//   return solutionDocs
// }

// const Solution = mongoose.model<SolutionDoc, SolutionModel>('CommentSolution', solutionSchema)

// export { Solution }