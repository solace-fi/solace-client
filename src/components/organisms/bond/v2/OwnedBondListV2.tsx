/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

    OwnedBondListV2
      custom hooks
      useEffect hooks

  *************************************************************************************/

/* import packages */
import React, { useState, useMemo, useEffect } from 'react'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import constants */
import { BondTellerFullDetails, BondTokenV2 } from '../../../../constants/types'

/* import managers */
import { useGeneral } from '../../../../context/GeneralManager'
import { useProvider } from '../../../../context/ProviderManager'

/* import components */
import { Text } from '../../../atoms/Typography'
import { Button } from '../../../atoms/Button'
import { Flex } from '../../../atoms/Layout'
import { Card, CardContainer } from '../../../atoms/Card'
import { Scrollable, HeroContainer } from '../../../atoms/Layout'

/* import utils */
import { getTimeFromMillis } from '../../../../utils/time'
import { SOLACE_TOKEN } from '../../../../constants/mappings/token'

interface OwnedBondListV2Props {
  ownedBondTokens: BondTokenV2[]
  selectedBondDetail?: BondTellerFullDetails
  callRedeemBond: (bondId: BigNumber) => Promise<void>
}

export const OwnedBondListV2: React.FC<OwnedBondListV2Props> = ({
  ownedBondTokens,
  selectedBondDetail,
  callRedeemBond,
}) => {
  /* 
  
  custom hooks 
  
  */
  const { haveErrors } = useGeneral()
  const { latestBlock } = useProvider()

  const [timestamp, setTimestamp] = useState<number>(0)

  const pncplDecimals = useMemo(() => selectedBondDetail?.principalData.principalProps.decimals, [
    selectedBondDetail?.principalData.principalProps.decimals,
  ])

  /* 
  
  useEffect hooks 
  
  */
  useEffect(() => {
    if (!latestBlock.blockTimestamp) return
    setTimestamp(latestBlock.blockTimestamp)
  }, [latestBlock.blockTimestamp])

  return (
    <>
      {ownedBondTokens.length > 0 ? (
        <Scrollable maxMobileHeight={'45vh'} maxDesktopHeight={'45vh'} mt={20}>
          <CardContainer cardsPerRow={1}>
            {ownedBondTokens.map((token) => (
              <Card p={15} key={token.id.toString()}>
                <Flex stretch between mb={10}>
                  <Text>ID</Text>
                  <Text>{token.id.toString()}</Text>
                </Flex>
                <Flex stretch between mb={10}>
                  <Text>Paid Price</Text>
                  <Text textAlignRight>{formatUnits(token.principalPaid, pncplDecimals)}</Text>
                </Flex>
                <Flex stretch between mb={10}>
                  <Text>Payout</Text>
                  <Text textAlignRight>{`${formatUnits(token.payoutAmount, SOLACE_TOKEN.constants.decimals)}`}</Text>
                </Flex>
                {token.vestingStart + token.localVestingTerm > timestamp ? (
                  <Flex stretch between mb={10}>
                    <Text>Time Until Fully Vested</Text>
                    <Text>{getTimeFromMillis((token.vestingStart + token.localVestingTerm - timestamp) * 1000)}</Text>
                  </Flex>
                ) : (
                  <>
                    <Text textAlignCenter success mb={10}>
                      Fully Vested
                    </Text>
                    <Button widthP={100} info disabled={haveErrors} onClick={() => callRedeemBond(token.id)}>
                      Claim
                    </Button>
                  </>
                )}
              </Card>
            ))}
          </CardContainer>
        </Scrollable>
      ) : (
        <HeroContainer>
          <Text t2 textAlignCenter>
            You do not have any bond tokens.
          </Text>
        </HeroContainer>
      )}
    </>
  )
}
