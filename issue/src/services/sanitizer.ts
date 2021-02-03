import sanitize from 'mongo-sanitize'

// const sanitizeOne = (in: string) => {
//   retrun sanitize(in);
// }

export const sanitizeOne = function (input: string): string {
  return sanitize(input)
};

export const sanitizeList = function (input: Array<string>) : Array<string> {
  let returnie: Array<string> = []

  for (const i of input) {
    returnie.push(sanitize(i))
  }
  return returnie
}