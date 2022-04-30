/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import managers
    import components
    import utils

    BondOptionsV1
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
import { Flex } from '../../../atoms/Layout'
import { Text } from '../../../atoms/Typography'
import { Button, ButtonWrapper } from '../../../atoms/Button'
import { CheckboxOption } from '../../PoolModalRouter'
import { StyledGraphDown, StyledSendPlane } from '../../../atoms/Icon'

/* import utils */
import { accurateMultiply, shortenAddress } from '../../../../utils/formatting'

interface BondOptionsV1Props {
  isBondTellerErc20: boolean
  selectedBondDetail?: BondTellerDetails
  isStaking: boolean
  shouldUseNativeToken: boolean
  approval: boolean
  func: FunctionName
  isAcceptableAmount: boolean
  slippagePrct: string
  bondRecipient: string | undefined
  setIsStaking: React.Dispatch<React.SetStateAction<boolean>>
  setShouldUseNativeToken: React.Dispatch<React.SetStateAction<boolean>>
  approve: () => Promise<void>
  callDepositBond: (stake: boolean) => Promise<void>
}

export const BondOptionsV1: React.FC<BondOptionsV1Props> = ({
  isBondTellerErc20,
  selectedBondDetail,
  isStaking,
  shouldUseNativeToken,
  approval,
  func,
  isAcceptableAmount,
  slippagePrct,
  bondRecipient,
  setIsStaking,
  setShouldUseNativeToken,
  approve,
  callDepositBond,
}) => {
  /*  
  
  custom hooks 
  
  */
  const { haveErrors } = useGeneral()

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
        <CheckboxOption isChecked={isStaking} setChecked={setIsStaking} text={'Autostake and receive xSOLACE'} />
      </Flex>
      {!selectedBondDetail?.metadata.cannotBuy ? (
        <ButtonWrapper isColumn>
          {!approval && func != FunctionName.BOND_DEPOSIT_ETH_V1 && (
            <Button widthP={100} info disabled={!isAcceptableAmount || haveErrors} onClick={approve}>
              Approve
            </Button>
          )}
          <Button
            widthP={100}
            info
            disabled={!isAcceptableAmount || haveErrors || (!approval && func != FunctionName.BOND_DEPOSIT_ETH_V1)}
            onClick={() => callDepositBond(isStaking)}
          >
            Bond
          </Button>
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
