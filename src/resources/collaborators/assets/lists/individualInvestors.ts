import getPeopleFromString from '../../getPeopleFromString'

const teamStr = `Illia Polosukhin
NEAR
@ilblackdragon

Jeffrey Zirlin
Axie Infinity
@Jihoz_Axie

Julien Bouteloup
StakeDAO & rekt.news
@bneiluj

Evgeny Yurtaev
Zerion
@evgeth_

Alex Shevchenko
Aurora
@AlexAuroraDev

Sandeep Nailwal
Polygon
@sandeepnailwal

Kiril Nikolov
Nexo
@KryptoKiril

Seth Ginns
CoinFund
@sethginns

Aleksander Larsen
Axie Infinity
@Psycheout86

Quentin Milne
Stake Capital
@Kyuu_______`

// line 1: name, line 2: role, line 3: twitter
export default getPeopleFromString(teamStr)
