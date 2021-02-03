export const isEmail = (email: string) => {
  const atSeperator = email.split('@');
  if(atSeperator.length !== 2){
    return false;
  }

  const dotSeperator = email.split('.');
  
  if(dotSeperator.length !== 2){
    return false;
  }else{
    return true
  }
}