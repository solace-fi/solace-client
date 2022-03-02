/* later on we can do it in a better way, or create these documents by hand, but for now this is fine

what we have:
line 1: name
line 2: role
line 3?: twitter

what we want:
{
	name: 'name',
	role: 'role',
	twitter: 'twitter'
	profilePic: 'profilePic'
}
*/

import { Person } from '../../types'
import advisors from './advisors'
import individualInvestors from './individualInvestors'

function addPfpToOnePerson(person: Person): Person {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pfp = require('../individualImages/' + person.name.split(' ')[0] + '.png').default as string
  return {
    ...person,
    profilePic: pfp,
  }
}

// the only ones who want pfps right now are individualInvestors and advisors, so let's export them here

export const peeps = {
  pfpdIndividualInvestors: individualInvestors.map(addPfpToOnePerson),
  pfpdAdvisors: advisors.map(addPfpToOnePerson),
}
