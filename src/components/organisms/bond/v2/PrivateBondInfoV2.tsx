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
import React, { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import constants */
import { FunctionName } from '../../../../constants/enums'
import { BondTellerDetails } from '../../../../constants/types'

/* import managers */
import { useNetwork } from '../../../../context/NetworkManager'
import { useWallet } from '../../../../context/WalletManager'
import { useContracts } from '../../../../context/ContractsManager'

/* import components */
import { FormCol, FormRow } from '../../../atoms/Form'
import { Text } from '../../../atoms/Typography'

/* import hooks */
import { useReadToken } from '../../../../hooks/useToken'
import { useTellerConfig } from '../../../../hooks/useDetectTeller'

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
  const { keyContracts } = useContracts()
  const { solace } = useMemo(() => keyContracts, [keyContracts])
  const readSolaceToken = useReadToken(solace)
  const { bondDepositFunctionName } = useTellerConfig(activeNetwork)
  return (
    <>
      {account && (
        <>
          <FormRow mt={40} mb={10}>
            <FormCol>
              <Text bold>My Balance</Text>
            </FormCol>
            <FormCol>
              <Text info textAlignRight bold>
                {formatUnits(assetBalance, pncplDecimals)}{' '}
                {func == bondDepositFunctionName
                  ? activeNetwork.nativeCurrency.symbol
                  : selectedBondDetail?.principalData.principalProps?.symbol}
              </Text>
            </FormCol>
          </FormRow>
          <FormRow mb={5}>
            <FormCol>
              <Text bold>You Will Get</Text>
            </FormCol>
            <FormCol>
              <Text info textAlignRight bold>
                {calculatedAmountOut
                  ? `${formatUnits(calculatedAmountOut, readSolaceToken.decimals)} ${readSolaceToken.symbol}`
                  : `-`}
              </Text>
            </FormCol>
          </FormRow>
        </>
      )}
    </>
  )
}
