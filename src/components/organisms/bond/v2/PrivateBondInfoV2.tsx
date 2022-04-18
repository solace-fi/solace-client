/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import managers
    import components
    import hooks

    PrivateBondInfoV2
      custom hooks

  *************************************************************************************/

/* import packages */
import React from 'react'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import constants */
import { FunctionName } from '../../../../constants/enums'
import { BondTellerDetails } from '../../../../constants/types'

/* import managers */
import { useNetwork } from '../../../../context/NetworkManager'
import { useWallet } from '../../../../context/WalletManager'

/* import components */
import { Flex } from '../../../atoms/Layout'
import { Text } from '../../../atoms/Typography'

import { useTellerConfig } from '../../../../hooks/bond/useDetectTeller'
import { SOLACE_TOKEN } from '../../../../constants/mappings/token'

interface PrivateBondInfoV2Props {
  func: FunctionName
  selectedBondDetail?: BondTellerDetails
  assetBalance: BigNumber
  pncplDecimals: number | undefined
  calculatedAmountOut?: BigNumber
}

export const PrivateBondInfoV2: React.FC<PrivateBondInfoV2Props> = ({
  func,
  selectedBondDetail,
  assetBalance,
  pncplDecimals,
  calculatedAmountOut,
}) => {
  /*

  custom hooks

  */

  const { account } = useWallet()
  const { activeNetwork } = useNetwork()
  const { bondDepositFunctionName } = useTellerConfig(activeNetwork)
  return (
    <>
      {account && (
        <>
          <Flex stretch between mt={40} mb={10}>
            <Text bold>My Balance</Text>
            <Text info textAlignRight bold>
              {formatUnits(assetBalance, pncplDecimals)}{' '}
              {func == bondDepositFunctionName
                ? activeNetwork.nativeCurrency.symbol
                : selectedBondDetail?.principalData.principalProps?.symbol}
            </Text>
          </Flex>
          <Flex stretch between mb={5}>
            <Text bold>You Will Get</Text>
            <Text info textAlignRight bold>
              {calculatedAmountOut
                ? `${formatUnits(calculatedAmountOut, SOLACE_TOKEN.constants.decimals)} ${
                    SOLACE_TOKEN.constants.symbol
                  }`
                : `-`}
            </Text>
          </Flex>
        </>
      )}
    </>
  )
}
