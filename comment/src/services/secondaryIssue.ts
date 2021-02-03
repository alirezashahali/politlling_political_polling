import mongoose from 'mongoose'
import {updateIfCurrentPlugin} from 'mongoose-update-if-current'

interface IssueAttrs{
  id: string,
  userId: string,
  title: string,
  description: string
}

export interface IssueDoc extends mongoose.Document{
  userId: string,
  title: string,
  description: string
}

interface IssueModel extends mongoose.Model<IssueDoc>{
  build(attrs: IssueAttrs): IssueDoc
  findByEvent(event: {id: string, version: number}): Promise<IssueDoc | null>
}

export class SecondaryIssue{
  private IssueSchema: any
  public Issue : IssueModel

  constructor(private modelName : string){
    this.IssueSchema = new mongoose.Schema({
      userId: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      }
    },{
      toJSON: {
        transform(doc, ret){
          ret.id = ret._id;
          delete ret._id
        }
      }
    })
    
    this.IssueSchema.set('versionKey', 'version')
    this.IssueSchema.plugin(updateIfCurrentPlugin)
    
    this.IssueSchema.statics.findByEvent = (event: {id: string, version: number}) => {
      return this.Issue.findOne({
        _id: event.id,
        version: event.version - 1
      })
    }
    
    this.IssueSchema.statics.build = (attrs: IssueAttrs) => {
      return new this.Issue({ _id: attrs.id, userId: attrs.userId, title: attrs.title,
        description: attrs.description })
    }
    
    this.Issue = mongoose.model<IssueDoc, IssueModel>('CommentIssue', this.IssueSchema)
  }
}