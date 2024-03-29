/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import managers
    import components
    import utils

    BondOptionsV2
      custom hooks

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import constants */
import { BondTellerFullDetails } from '../../../../constants/types'
import { FunctionName } from '../../../../constants/enums'

/* import managers */
import { useGeneral } from '../../../../context/GeneralManager'

/* import components */
import { Flex } from '../../../atoms/Layout'
import { Text } from '../../../atoms/Typography'
import { Button, ButtonWrapper } from '../../../atoms/Button'
import { CheckboxOption } from '../../../molecules/CheckboxOption'
import { StyledGraphDown, StyledSendPlane } from '../../../atoms/Icon'

/* import utils */
import { accurateMultiply, shortenAddress } from '../../../../utils/formatting'
import { useTellerConfig } from '../../../../hooks/bond/useDetectTeller'
import { useNetwork } from '../../../../context/NetworkManager'
import { BigNumber } from 'ethers'

interface BondOptionsV2Props {
  isBondTellerErc20: boolean
  selectedBondDetail?: BondTellerFullDetails
  isStaking: boolean
  shouldUseNativeToken: boolean
  approval: boolean
  func: FunctionName
  isAcceptableAmount: boolean
  slippagePrct: string
  bondRecipient: string | null | undefined
  calculatedAmountOut?: BigNumber
  setIsStaking: React.Dispatch<React.SetStateAction<boolean>>
  setShouldUseNativeToken: React.Dispatch<React.SetStateAction<boolean>>
  approve: () => Promise<void>
  callDepositBond: (stake: boolean) => Promise<void>
}

export const BondOptionsV2: React.FC<BondOptionsV2Props> = ({
  isBondTellerErc20,
  selectedBondDetail,
  isStaking,
  shouldUseNativeToken,
  approval,
  func,
  isAcceptableAmount,
  slippagePrct,
  bondRecipient,
  calculatedAmountOut,
  setIsStaking,
  setShouldUseNativeToken,
  approve,
  callDepositBond,
}) => {
  /*  
  
  custom hooks 
  
  */
  const { haveErrors } = useGeneral()
  const { activeNetwork } = useNetwork()
  const { bondDepositFunctionName } = useTellerConfig(activeNetwork)

  return (
    <>
      <Flex col style={{ margin: 'auto' }}>
        {!isBondTellerErc20 && (
          <>
            <CheckboxOption
              mb={10}
              isChecked={!shouldUseNativeToken}
              setChecked={() => setShouldUseNativeToken(!shouldUseNativeToken)}
              text={`Deposit ${selectedBondDetail?.principalData.principalProps.name ?? 'wrapped token'} instead`}
            />
          </>
        )}
        <CheckboxOption isChecked={isStaking} setChecked={setIsStaking} text={'Autostake and create a safe'} />
      </Flex>
      {!selectedBondDetail?.metadata.cannotBuy ? (
        <ButtonWrapper isColumn>
          {!approval && func != bondDepositFunctionName && (
            <Button widthP={100} info disabled={haveErrors} onClick={approve}>
              Approve
            </Button>
          )}
          {((approval && func != bondDepositFunctionName) || func == bondDepositFunctionName) && (
            <Button
              widthP={100}
              info
              disabled={!isAcceptableAmount || haveErrors || !calculatedAmountOut}
              onClick={() => callDepositBond(isStaking)}
            >
              Bond
            </Button>
          )}
          <Flex>
            <StyledGraphDown size={15} />
            <Text t4 ml={5}>
              {parseInt(accurateMultiply(slippagePrct, 2)) / 100}%
            </Text>
            {bondRecipient && (
              <Flex ml={10}>
                <StyledSendPlane size={15} />
                <Text t4 ml={5}>
                  {shortenAddress(bondRecipient)}
                </Text>
              </Flex>
            )}
          </Flex>
        </ButtonWrapper>
      ) : (
        <ButtonWrapper>
          <Button disabled>Not on sale</Button>
        </ButtonWrapper>
      )}
    </>
  )
}
