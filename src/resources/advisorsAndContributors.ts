const teamStr = `Gustav Arentoft, Doo Wan Nam 
MakerDAO & StableNode
@StableNode

Julien Bouteloup
StakeDAO & rekt.news
@bneiluj

Evgeny Yurtaev
Zerion
@evgeth_

Preston Van Loon
Prysmatic Labs
@preston_vanloon

Alex Shevchenko
Aurora
@AlexAuroraDev

Sandeep Nailwal
Polygon
@sandeepnailwal

Cameron Dennis
Blockchain Acceleration Foundation
@Cameron_Dennis_

Kiril Nikolov
Nexo
@KryptoKiril

Seth Ginns
CoinFund
@sethginns

Arjun Kalsy
Polygon
@ArjunKalsy

Aleksander Larsen
Axie Infinity
@Psycheout86

Quentin Milne
Stake Capital
@StableNode

Illia Polosukhin
NEAR
@ilblackdragon

Jeffrey Zirlin
Axie Infinity
@StableNode

Jimmy Chang
Aave
@0xJim`

type User = {
  name: string
  role: string
  twitter?: string
}

// line 1: name, line 2: role, line 3: twitter
const userTuples = teamStr.split('\n\n')
const users = userTuples.map((tuple) => {
  const lines = tuple.split('\n')
  const user = {
    name: lines[0],
    role: lines[1],
  } as User
  if (lines[2]) {
    user.twitter = lines[2].replace('@', '')
  }
  return user
})

export default users
