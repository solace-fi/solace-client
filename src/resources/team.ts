const teamStr = `Nikita Buzov
Founder
@NikitaBuzovEth

Matt Ladin
COO
@MBLADIN

Tim H
Risk Assessment
@npcza

Andrew Leonard
Smart Contracts
@SolaceAndrew

Amir Alnadi
BD
@amiralnadi

Olaf Bieschke
Community Manager
@layersheikh

Danny Fung
Front End
@DannyFungEth

Haraldur Haraldsson
Research and Risk Assessment

Jefferson T
Smart Contracts

Selcuk Sozuer
Smart Contracts
@ssozuer

Kevin McDonald
Research and Risk Assessment
@i001962

Sebastian C
Front End

Ivan Andreev
Design
@andreevivan

Nima Cheraghi
Marketing & Content
@0xnimz

Petr Lipatov
Product Marketing`

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
