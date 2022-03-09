import { Collective } from '../../types'

const collectiveStr = `parataxis
stablenode
capital
alchemy
1010capital
prycto`

// get individual investors, simply add .png to the end right now
const collectiveInvestors: Collective[] = collectiveStr.split('\n').map((altName) => {
  return {
    altName,
    fileName: `${altName}.png`,
  }
})

export default collectiveInvestors
