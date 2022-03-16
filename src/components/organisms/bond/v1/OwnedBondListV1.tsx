/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

    OwnedBondListV1
      custom hooks
      useEffect hooks

  *************************************************************************************/

/* import packages */
import React, { useState, useMemo, useEffect } from 'react'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import constants */
import { BondTellerDetails, BondTokenV1 } from '../../../../constants/types'

/* import managers */
import { useGeneral } from '../../../../context/GeneralManager'
import { useContracts } from '../../../../context/ContractsManager'
import { useProvider } from '../../../../context/ProviderManager'

/* import components */
import { Text } from '../../../atoms/Typography'
import { Button } from '../../../atoms/Button'
import { Card, CardContainer } from '../../../atoms/Card'
import { Scrollable, HeroContainer, Flex } from '../../../atoms/Layout'

/* import hooks */
import { useReadToken } from '../../../../hooks/contract/useToken'

/* import utils */
import { getTimeFromMillis } from '../../../../utils/time'

interface OwnedBondListV1Props {
  ownedBondTokens: BondTokenV1[]
  selectedBondDetail?: BondTellerDetails
  callRedeemBond: (bondId: BigNumber) => Promise<void>
}

export const OwnedBondListV1: React.FC<OwnedBondListV1Props> = ({
  ownedBondTokens,
  selectedBondDetail,
  callRedeemBond,
}) => {
  /* 
  
  custom hooks 
  
  */
  const { haveErrors } = useGeneral()
  const { keyContracts } = useContracts()
  const { latestBlock } = useProvider()

  const [timestamp, setTimestamp] = useState<number>(0)
  const { solace } = useMemo(() => keyContracts, [keyContracts])
  const readSolaceToken = useReadToken(solace)

  const pncplDecimals = useMemo(() => selectedBondDetail?.principalData.principalProps.decimals, [
    selectedBondDetail?.principalData.principalProps.decimals,
  ])

  /* 
  
  useEffect hooks 
  
  */
  useEffect(() => {
    if (!latestBlock) return
    setTimestamp(latestBlock.timestamp)
  }, [latestBlock])

  return (
    <>
      {ownedBondTokens.length > 0 ? (
        <Scrollable maxMobileHeight={45} maxDesktopHeight={45} mt={20}>
          <CardContainer cardsPerRow={1}>
            {ownedBondTokens.map((token) => (
              <Card p={15} key={token.id.toString()}>
                <Flex stretch between mb={10}>
                  <Text>ID</Text>
                  <Text>{token.id.toString()}</Text>
                </Flex>
                <Flex stretch between mb={10}>
                  <Text>Paid Price</Text>
                  <Text textAlignRight>{formatUnits(token.pricePaid, pncplDecimals)}</Text>
                </Flex>
                <Flex stretch between mb={10}>
                  <Text>Payout</Text>
                  <Text textAlignRight>
                    {`${formatUnits(token.payoutAmount, readSolaceToken.decimals)} ${token.payoutToken}`}
                  </Text>
                </Flex>
                {token.maturation.toNumber() > timestamp ? (
                  <Flex stretch between mb={10}>
                    <Text>Time Until Fully Vested</Text>
                    <Text>{getTimeFromMillis((token.maturation.toNumber() - timestamp) * 1000)}</Text>
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
