import { RequestValidationError, ArtificialValidationError,
  ArtificialRequestValidationError } from '@politling_common/common';
import validator from 'validator'

export function ndFixer (num: number): string {
  switch(num) { 
    case 0: { 
       return '1st'
       break; 
    } 
    case 1: { 
       return '2nd'; 
       break; 
    }
    case 2: { 
      return '3rd'; 
      break; 
    } 
    default: { 
       return num.toString() + 'th';
       break; 
    } 
 } 
}

// returns true when it includes error and false otherwise
const TextIncludeError = (innie: string | undefined, required: boolean) => {
  // for now all are some how required
  if(!innie){
    return true;
  }
  return !validator.isAlpha
}

function errorThrower(inward: string | undefined, field: string,
  listOfErrors: Array<ArtificialValidationError>,
  required: boolean, index: number): ArtificialValidationError[]{
    // console.log('errorThrowerConsole',inward, field, listOfErrors, required, index)
    if(TextIncludeError(inward, required)){
      let newError: ArtificialValidationError;
      switch(field) {
        case 'references': { 
          newError= {msg: 'The ' + 
            ndFixer(Number(index)) + ' reference is empty or is not acceptable', param: field};
          break; 
        }  
        default: { 
          newError= {msg: field + ' of the ' + 
            ndFixer(Number(index)) + ' solution is empty or is not acceptable', param: field};
          break; 
        } 
     }
     return [...listOfErrors, newError]
    }else{
      return listOfErrors
    }
}

export function referencesChecker( references : Array<string> ) : Array<ArtificialValidationError> {
  let listOfErrors : Array<ArtificialValidationError> = [];
  for(const i in references){
    listOfErrors = errorThrower(references[Number(i)], 'references', listOfErrors, true, Number(i));
  }
  return listOfErrors
}