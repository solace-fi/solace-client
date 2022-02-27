import { Person } from './types'

// line 1: name, line 2: role, line 3: twitter
export default function getPeopleFromString(pplString: string): Person[] {
  const pplTuples = pplString.split('\n\n')
  const users: Person[] = pplTuples.map((tuple) => {
    const lines = tuple.split('\n')
    const user = {
      name: lines[0],
      role: lines[1],
    } as Person
    if (lines[2]) {
      user.twitter = lines[2].replace('@', '')
    }
    return user
  })
  return users
}
