import { RequestValidationError, ArtificialValidationError,
  ArtificialRequestValidationError } from '@politling_common/common';
import validator from 'validator'
// returns zero for no error and returns a number for number of solutions that does not have all
// of their requirments

export interface Solution{
  title: string,
  description: string,
  references?: Array<string>,
  // origin?: {type: ModelTypes, id: string}
}

export function solutionsChecker(listOfSolutions: Solution[]): Array<ArtificialValidationError>{
  let listOfErrors: ArtificialValidationError[] = [];
  // let error;
  for (const i in listOfSolutions) {
    listOfErrors = errorThrower(listOfSolutions[i].title, 'title', listOfErrors, true, Number(i));
    listOfErrors = errorThrower(listOfSolutions[i].description, 'description', listOfErrors, true, Number(i));
    if(listOfSolutions[i].references){
      for(const j in listOfSolutions[i].references){
        // required is true beacause if there is a member
        // then it should be string(url or reference of a...)
        // or other kind of text
        listOfErrors = errorThrower(listOfSolutions[i].references![Number(j)], 'references', listOfErrors,
        true, Number(j))
      }
    }
  }

  // TODO implement origin as well if it is to be handled in this route
  return listOfErrors
}

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