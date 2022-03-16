/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    PublicBondInfo
      custom hooks
      useEffect hooks

  *************************************************************************************/

/* import packages */
import React, { useMemo, useState, useEffect } from 'react'
import { formatUnits } from '@ethersproject/units'

/* import managers */
import { useContracts } from '../../../context/ContractsManager'

/* import constants */
import { BondTellerDetails } from '../../../constants/types'

/* import components */
import { Text } from '../../atoms/Typography'
import { Flex } from '../../../components/atoms/Layout'

/* import hooks */
import { useReadToken } from '../../../hooks/contract/useToken'

/* import utils */
import { getLongtimeFromMillis } from '../../../utils/time'
import { ZERO } from '../../../constants'

interface PublicBondInfoProps {
  selectedBondDetail?: BondTellerDetails
}

export const PublicBondInfo: React.FC<PublicBondInfoProps> = ({ selectedBondDetail }) => {
  /*

  custom hooks

  */

  const { keyContracts } = useContracts()
  const { solace } = useMemo(() => keyContracts, [keyContracts])
  const readSolaceToken = useReadToken(solace)

  const [vestingTermInMillis, setVestingTermInMillis] = useState<number>(0)

  /*

  useEffect hooks

  */

  useEffect(() => {
    if (!selectedBondDetail) return
    setVestingTermInMillis(selectedBondDetail.tellerData.vestingTermInSeconds * 1000)
  }, [selectedBondDetail])

  return (
    <>
      <Flex stretch between mb={10}>
        <Text t4>MAX You Can Buy</Text>
        <Text t4 info textAlignRight>
          {`${formatUnits(selectedBondDetail?.tellerData.maxPayout ?? ZERO, readSolaceToken.decimals)} ${
            readSolaceToken.symbol
          }`}
        </Text>
      </Flex>
      <Flex stretch between mb={10}>
        <Text t4>Vesting Term</Text>
        <Text t4 info textAlignRight>
          {getLongtimeFromMillis(vestingTermInMillis)}
        </Text>
      </Flex>
      {selectedBondDetail?.tellerData.bondFeeBps && (
        <Flex stretch between mb={24}>
          <Text t4>Bond Fee</Text>
          <Text t4 info textAlignRight>
            {parseInt(selectedBondDetail?.tellerData.bondFeeBps.toString()) / 100}%
          </Text>
        </Flex>
      )}
    </>
  )
}
