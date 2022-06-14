import { useWeb3React } from '@web3-react/core'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { ModalCloseButton } from '../../components/molecules/Modal'
import { useGeneral } from '../../context/GeneralManager'
import { CoverageLimitSelector2 } from '../soteria/CoverageLimitSelector'
import { Text } from '../../components/atoms/Typography'
import { FunctionName, InterfaceState } from '../../constants/enums'
import { useNetwork } from '../../context/NetworkManager'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { useCoverageFunctions } from '../../hooks/policy/useSolaceCoverProductV3'
import {
  accurateMultiply,
  convertSciNotaToPrecise,
  filterAmount,
  formatAmount,
  truncateValue,
} from '../../utils/formatting'
import { useCoverageContext } from './CoverageContext'
import { BalanceDropdownOptions, DropdownInputSection } from './Dropdown'
import { BigNumber } from 'ethers'
import { Flex, ShadowDiv } from '../../components/atoms/Layout'
import { GraySquareButton } from '../../components/atoms/Button'
import { GenericInputSection } from '../../components/molecules/InputSection'
import { ZERO } from '../../constants'
import { StyledArrowIosBackOutline, StyledArrowIosForwardOutline } from '../../components/atoms/Icon'
import { SolaceRiskScore } from '@solace-fi/sdk-nightly'
import { ChosenLimit } from '../../constants/enums'

const ChosenLimitLength = Object.values(ChosenLimit).filter((x) => typeof x === 'number').length

const nextChosenLimit = (chosenLimit: ChosenLimit) => ((chosenLimit + 1) % ChosenLimitLength) as ChosenLimit
const prevChosenLimit = (chosenLimit: ChosenLimit) =>
  ((chosenLimit - 1 + ChosenLimitLength) % ChosenLimitLength) as ChosenLimit

export const CldModal = () => {
  const { account } = useWeb3React()
  const { appTheme } = useGeneral()
  const { activeNetwork } = useNetwork()
  const { purchaseWithStable, purchaseWithNonStable, purchase } = useCoverageFunctions()
  const { intrface, portfolioKit, input, dropdowns, styles, policy } = useCoverageContext()
  const { userState, showCLDModal, handleShowCLDModal, transactionLoading, handleTransactionLoading } = intrface
  const {
    enteredDeposit,
    handleEnteredDeposit,
    enteredCoverLimit,
    handleEnteredCoverLimit,
    selectedCoin,
    handleSelectedCoin,
    selectedCoinPrice,
  } = input
  const { curPortfolio, importCounter } = portfolioKit
  const { batchBalanceData } = dropdowns
  const { bigButtonStyle, gradientStyle } = styles
  const { signatureObj, depositApproval, minReqAccBal, scpBalance } = policy

  const { handleToast, handleContractCallError } = useTransactionExecution()
  const [localCoinsOpen, setLocalCoinsOpen] = useState<boolean>(false)

  const curUserState = useMemo(() => [InterfaceState.CURRENT_USER].includes(userState), [userState])
  const newUserState = useMemo(() => [InterfaceState.NEW_USER].includes(userState), [userState])
  const returningUserState = useMemo(() => [InterfaceState.RETURNING_USER].includes(userState), [userState])

  const [chosenLimit, setChosenLimit] = useState<ChosenLimit>(ChosenLimit.Recommended)

  const [highestAmount, setHighestAmount] = useState<BigNumber>(ZERO)
  const [recommendedAmount, setRecommendedAmount] = useState<BigNumber>(ZERO)
  const [customInputAmount, setCustomInputAmount] = useState<string>('')

  const [localNewCoverageLimit, setLocalNewCoverageLimit] = useState<string>('')

  const highestPosition = useMemo(
    () =>
      curPortfolio?.protocols?.length && curPortfolio.protocols.length > 0
        ? curPortfolio.protocols.reduce((pn, cn) => (cn.balanceUSD > pn.balanceUSD ? cn : pn))
        : undefined,
    [curPortfolio]
  )

  const scpBalanceMeetsMrab = useMemo(() => {
    return minReqAccBal.lte(parseUnits(scpBalance, 18))
  }, [scpBalance, minReqAccBal])

  const lackingScp = useMemo(() => {
    const parsedScpBalance = parseUnits(scpBalance, 18)
    const float_enteredDeposit = parseFloat(formatAmount(enteredDeposit))
    const depositUSDEquivalent = float_enteredDeposit * selectedCoinPrice
    const BN_Scp_Plus_Deposit = parsedScpBalance.add(
      BigNumber.from(accurateMultiply(convertSciNotaToPrecise(`${depositUSDEquivalent}`), 18))
    )
    if (minReqAccBal.gt(BN_Scp_Plus_Deposit)) {
      return truncateValue(formatUnits(minReqAccBal.sub(BN_Scp_Plus_Deposit)), 2)
    }
    return '0'
  }, [scpBalance, minReqAccBal, enteredDeposit, selectedCoinPrice])

  const handleInputChange = (input: string) => {
    // allow only numbers and decimals
    const filtered = filterAmount(input, customInputAmount)

    // if filtered is only "0." or "." or '', filtered becomes '0.0'
    // const formatted = formatAmount(filtered)

    // if number has more than max decimal places, do not update
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 18) return

    // if number is greater than available cover capacity, do not update
    // if (parseUnits(formatted, 18).gt(availableCoverCapacity)) return

    const bnFiltered = BigNumber.from(accurateMultiply(filtered, 18))
    setLocalNewCoverageLimit(filtered)
    setCustomInputAmount(filtered)
    if (!recommendedAmount.eq(bnFiltered) && !highestAmount.eq(bnFiltered)) {
      setChosenLimit(ChosenLimit.Custom)
    }
  }

  const callPurchase = async () => {
    if (!account) return
    handleTransactionLoading(true)
    await purchase(account, parseUnits(localNewCoverageLimit, 18))
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callPurchase', err, FunctionName.COVER_PURCHASE))
  }

  const callPurchaseWithStable = async () => {
    if (!account) return
    handleTransactionLoading(true)
    await purchaseWithStable(
      account,
      parseUnits(localNewCoverageLimit, 18),
      selectedCoin.address,
      parseUnits(enteredDeposit, selectedCoin.decimals)
    )
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callPurchaseWithStable', err, FunctionName.COVER_PURCHASE_WITH_STABLE))
  }

  const callPurchaseWithNonStable = async () => {
    if (!account || !depositApproval || !signatureObj) return
    const signature = signatureObj.signatures[`${activeNetwork.chainId}`]
    const tokenSignature: any = Object.values(signature)[0]
    handleTransactionLoading(true)
    await purchaseWithNonStable(
      account,
      parseUnits(localNewCoverageLimit, 18),
      selectedCoin.address,
      parseUnits(enteredDeposit, selectedCoin.decimals),
      tokenSignature.price,
      tokenSignature.deadline,
      tokenSignature.signature
    )
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) =>
        _handleContractCallError('callPurchaseWithNonStable', err, FunctionName.COVER_PURCHASE_WITH_NON_STABLE)
      )
  }

  const handlePurchase = async () => {
    if (parseUnits(formatAmount(enteredDeposit), selectedCoin.decimals).isZero()) {
      callPurchase()
    } else if (selectedCoin.stablecoin) {
      callPurchaseWithStable()
    } else {
      callPurchaseWithNonStable()
    }
  }

  const _handleToast = (tx: any, localTx: any) => {
    handleTransactionLoading(false)
    handleToast(tx, localTx)
  }

  const _handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    handleContractCallError(functionName, err, txType)
    handleTransactionLoading(false)
  }

  useEffect(() => {
    if (!highestPosition) return
    /** Big Number Balance */ const bnBal = BigNumber.from(accurateMultiply(highestPosition.balanceUSD, 18))
    /** balance + 20% */ const bnHigherBal = bnBal.add(bnBal.div(BigNumber.from('5')))
    setHighestAmount(bnBal)
    setRecommendedAmount(bnHigherBal)
  }, [highestPosition])

  useEffect(() => {
    if (importCounter > 0) {
      setCustomInputAmount(formatUnits(enteredCoverLimit, 18))
      setLocalNewCoverageLimit(formatUnits(enteredCoverLimit, 18))
      setChosenLimit(ChosenLimit.Custom)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importCounter])

  useEffect(() => {
    switch (chosenLimit) {
      case ChosenLimit.Recommended:
        setLocalNewCoverageLimit(formatUnits(recommendedAmount, 18))
        break
      case ChosenLimit.MaxPosition:
        setLocalNewCoverageLimit(formatUnits(highestAmount, 18))
        break
      case ChosenLimit.Custom:
        setLocalNewCoverageLimit(customInputAmount)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenLimit, highestAmount, recommendedAmount, customInputAmount])

  return (
    // <Modal isOpen={show} modalTitle={'Set Cover Limit'} handleClose={() => handleShowCLDModal(false)}>
    //   <CoverageLimitSelector portfolioScore={curPortfolio} setNewCoverageLimit={handleEnteredCoverLimit} />
    //   <ButtonWrapper>
    //     <Button {...gradientStyle} {...bigButtonStyle} onClick={callPurchase} secondary noborder>
    //       Save
    //     </Button>
    //   </ButtonWrapper>
    //   <Flex col gap={12}>
    //     <div>
    //       <DropdownInputSection
    //         hasArrow
    //         isOpen={localCoinsOpen}
    //         placeholder={'Enter amount'}
    //         icon={<img src={`https://assets.solace.fi/${selectedCoin.name.toLowerCase()}`} height={16} />}
    //         text={selectedCoin.symbol}
    //         value={enteredDeposit}
    //         onChange={(e) => setEnteredDeposit(filterAmount(e.target.value, enteredDeposit))}
    //         onClick={() => setLocalCoinsOpen(!localCoinsOpen)}
    //       />
    //       <BalanceDropdownOptions
    //         isOpen={localCoinsOpen}
    //         searchedList={batchBalanceData}
    //         onClick={(value: string) => {
    //           handleSelectedCoin(value)
    //           setLocalCoinsOpen(false)
    //         }}
    //       />
    //     </div>
    //     <ButtonWrapper style={{ width: '100%' }} p={0}>
    //       <Button {...bigButtonStyle} {...gradientStyle} secondary noborder onClick={handlePurchase}>
    //         <Text>Deposit &amp; Save</Text>
    //       </Button>
    //     </ButtonWrapper>
    //   </Flex>
    // </Modal>
    <Flex col style={{ height: 'calc(100vh - 170px)', position: 'relative' }} justifyCenter>
      <Flex
        itemsCenter
        justifyCenter
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '50px',
          width: '50px',
        }}
      >
        <Flex onClick={() => handleShowCLDModal(false)}>
          <ModalCloseButton lightColor={appTheme == 'dark'} />
        </Flex>
      </Flex>
      <Flex justifyCenter mb={4}>
        <Text big3 mont semibold style={{ lineHeight: '29.26px' }}>
          Set Cover Limit
        </Text>
      </Flex>
      <Flex col stretch>
        <Flex justifyCenter>
          <Text t4s textAlignCenter>
            Maximum payout in the case of an exploit.
          </Text>
        </Flex>
        <Flex col stretch between mt={36}>
          <Flex between>
            <ShadowDiv>
              <GraySquareButton
                onClick={() => setChosenLimit(prevChosenLimit(chosenLimit))}
                width={48}
                height={48}
                noborder
              >
                <StyledArrowIosBackOutline height={22} />
              </GraySquareButton>
            </ShadowDiv>
            <Flex col itemsCenter>
              <Text techygradient t3 bold>
                {
                  {
                    [ChosenLimit.Recommended]: 'Extra safe',
                    [ChosenLimit.MaxPosition]: 'Highest position',
                    [ChosenLimit.Custom]: 'Manual',
                  }[chosenLimit]
                }
              </Text>
              <Text t5s>
                {
                  {
                    [ChosenLimit.Recommended]: (
                      <>
                        Highest Position
                        <Text success inline>
                          {' '}
                          + 20%
                        </Text>
                      </>
                    ),
                    [ChosenLimit.MaxPosition]: `in Portfolio`,
                    [ChosenLimit.Custom]: `Enter amount below`,
                  }[chosenLimit]
                }
              </Text>
            </Flex>
            <ShadowDiv>
              <GraySquareButton
                onClick={() => setChosenLimit(nextChosenLimit(chosenLimit))}
                width={48}
                height={48}
                noborder
                actuallyWhite
              >
                <StyledArrowIosForwardOutline height={22} />
              </GraySquareButton>
            </ShadowDiv>
          </Flex>
          <GenericInputSection
            onChange={(e) => handleInputChange(e.target.value)}
            value={localNewCoverageLimit}
            disabled={false}
            style={{
              marginTop: '20px',
            }}
            icon={
              <Text success big3>
                $
              </Text>
            }
            iconAndTextWidth={20}
            displayIconOnMobile
          />
        </Flex>
      </Flex>
      {scpBalanceMeetsMrab && (
        <ButtonWrapper>
          <Button
            {...gradientStyle}
            {...bigButtonStyle}
            secondary
            noborder
            onClick={callPurchase}
            disabled={parseFloat(formatAmount(localNewCoverageLimit)) == 0}
          >
            {curUserState ? `Save` : newUserState ? `Subscribe to Policy` : returningUserState ? `Activate Policy` : ``}
          </Button>
        </ButtonWrapper>
      )}
      {lackingScp != '0' && (
        <Text textAlignCenter pt={16}>
          You need at least ${lackingScp} for the desired cover limit. Use the form below to deposit the additional
          premium.
        </Text>
      )}
      {curPortfolio && curPortfolio.protocols.length > 0 && !scpBalanceMeetsMrab && (
        <Flex col gap={12} pt={16}>
          <div>
            <DropdownInputSection
              hasArrow
              isOpen={localCoinsOpen}
              placeholder={'Enter amount'}
              icon={<img src={`https://assets.solace.fi/${selectedCoin.name.toLowerCase()}`} height={16} />}
              text={selectedCoin.symbol}
              value={enteredDeposit}
              onChange={(e) => handleEnteredDeposit(filterAmount(e.target.value, enteredDeposit))}
              onClick={() => setLocalCoinsOpen(!localCoinsOpen)}
            />
            <BalanceDropdownOptions
              isOpen={localCoinsOpen}
              searchedList={batchBalanceData}
              onClick={(value: string) => {
                handleSelectedCoin(value)
                setLocalCoinsOpen(false)
              }}
            />
          </div>
          <ButtonWrapper style={{ width: '100%' }} p={0}>
            <Button
              {...bigButtonStyle}
              {...gradientStyle}
              secondary
              noborder
              onClick={handlePurchase}
              disabled={parseFloat(formatAmount(localNewCoverageLimit)) == 0 || lackingScp != '0'}
            >
              {/* <Text>Deposit &amp; Save</Text> */}
              <Text>
                {' '}
                {curUserState
                  ? `Deposit & Save`
                  : newUserState
                  ? `Deposit & Subscribe`
                  : returningUserState
                  ? `Deposit & Activate`
                  : ``}
              </Text>
            </Button>
          </ButtonWrapper>
        </Flex>
      )}
    </Flex>
  )
}
