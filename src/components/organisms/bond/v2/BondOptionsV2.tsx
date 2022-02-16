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
import { BondTellerDetails } from '../../../../constants/types'
import { FunctionName } from '../../../../constants/enums'

/* import managers */
import { useGeneral } from '../../../../context/GeneralManager'

/* import components */
import { FlexCol } from '../../../atoms/Layout'
import { Text } from '../../../atoms/Typography'
import { Button, ButtonWrapper } from '../../../atoms/Button'
import { CheckboxOption } from '../../PoolModalRouter'
import { FlexRow } from '../../../atoms/Layout'
import { StyledGraphDown, StyledSendPlane } from '../../../atoms/Icon'

/* import utils */
import { accurateMultiply, shortenAddress } from '../../../../utils/formatting'
import { useTellerConfig } from '../../../../hooks/useDetectTeller'
import { useNetwork } from '../../../../context/NetworkManager'

interface BondOptionsV2Props {
  isBondTellerErc20: boolean
  selectedBondDetail?: BondTellerDetails
  isStaking: boolean
  shouldUseNativeToken: boolean
  approval: boolean
  func: FunctionName
  isAcceptableAmount: boolean
  slippagePrct: string
  bondRecipient: string | undefined
  cannotApproveAmount: boolean
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
  cannotApproveAmount,
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
      <FlexCol style={{ margin: 'auto' }}>
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
        <CheckboxOption isChecked={isStaking} setChecked={setIsStaking} text={'Autostake and create a lock'} />
      </FlexCol>
      {!selectedBondDetail?.tellerData.teller.cannotBuy ? (
        <ButtonWrapper isColumn>
          {!approval && func != bondDepositFunctionName && (
            <Button widthP={100} info disabled={cannotApproveAmount || haveErrors} onClick={approve}>
              Approve
            </Button>
          )}
          <Button
            widthP={100}
            info
            disabled={!isAcceptableAmount || haveErrors || (!approval && func != bondDepositFunctionName)}
            onClick={() => callDepositBond(isStaking)}
          >
            Bond
          </Button>
          <FlexRow>
            <StyledGraphDown size={15} />
            <Text t4 ml={5}>
              {parseInt(accurateMultiply(slippagePrct, 2)) / 100}%
            </Text>
            {bondRecipient && (
              <FlexRow ml={10}>
                <StyledSendPlane size={15} />
                <Text t4 ml={5}>
                  {shortenAddress(bondRecipient)}
                </Text>
              </FlexRow>
            )}
          </FlexRow>
        </ButtonWrapper>
      ) : (
        <ButtonWrapper>
          <Button disabled>Not on sale</Button>
        </ButtonWrapper>
      )}
    </>
  )
}
