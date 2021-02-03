import {sanitizeOne, sanitizeList} from '@politling_common/common'

export const sanitizeAnObject = (input: object) => {
  const returnie = {}
  const keys = Object.keys(input);
  for(const key of keys){
    //@ts-ignore
    returnie[key] = sanitizeWithTypeChecking(input[key])
  }
  return returnie
}

const sanitizeWithTypeChecking = (input: any) => {
  if(typeof input === 'string'){
    return sanitizeOne(input)
  }else if(!input){
    return input
  }else{
    return sanitizeList(input)
  }
}