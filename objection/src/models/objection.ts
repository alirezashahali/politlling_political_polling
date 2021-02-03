import mongoose from 'mongoose'
import {updateIfCurrentPlugin} from 'mongoose-update-if-current'
import {ModelTypes} from '@politling_common/common'
import {Solution, SolutionDoc} from './solution'
import {UserDoc} from '@politling_common/common'
// import {} from ''

interface ObjectionAttrs {
  userId: string,
  parentType: ModelTypes,
  parentId: string,
  description: string,
  references?: string[],
}

export interface ObjectionDoc extends mongoose.Document {
  userId: string,
  parentType: ModelTypes,
  parentId: string,
  description: string,
  references: string[],
  children: {id: string, type: ModelTypes}[],
  timeOfCreation: Date,
  timeOfLastUpdate: Date,
  version: number

  // TODO add methods like, like ...
}

interface ObjectionModel extends mongoose.Model<ObjectionDoc>{
  build(attrs: ObjectionAttrs): ObjectionDoc
}

const objectionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  parentId: {
    type: String,
    required: true
  },
  parentType: {
    type: ModelTypes,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  references: {
    type: Array,
    default: []
  },
  children: {
    type: [{id: String, type: ModelTypes}],
    default: []
  },
  timeOfCreation: {
    type: Date,
    required: true
  }, 
  timeOfLastUpdate: {
    type: Date,
  }
}, {
  toJSON: {
    transform(doc, ret){
      ret.id = ret._id
      delete ret._id
    }
  }
})

objectionSchema.set('versionKey', 'version')
objectionSchema.plugin(updateIfCurrentPlugin)

objectionSchema.pre('save', async function(){
  //@ts-ignore
  this.timeOfLastUpdate = new Date()
})

objectionSchema.statics.build = (attrs: ObjectionAttrs) => {
  const nowTime = new Date()
  return new Objection({
    ...attrs, timeOfCreation: nowTime
  })
}

const Objection = mongoose.model<ObjectionDoc, ObjectionModel>('Objection', objectionSchema)

export {Objection}