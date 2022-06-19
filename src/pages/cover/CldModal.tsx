import { useWeb3React } from '@web3-react/core'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { ModalCloseButton } from '../../components/molecules/Modal'
import { useGeneral } from '../../context/GeneralManager'
import { Text } from '../../components/atoms/Typography'
import { ApiStatus, FunctionName, InterfaceState, TransactionCondition } from '../../constants/enums'
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
import { ChosenLimit } from '../../constants/enums'
import usePrevious from '../../hooks/internal/usePrevious'
import { TransactionResponse } from '@ethersproject/providers'
import { LocalTx } from '../../constants/types'

const ChosenLimitLength = Object.values(ChosenLimit).filter((x) => typeof x === 'number').length

const nextChosenLimit = (chosenLimit: ChosenLimit) => ((chosenLimit + 1) % ChosenLimitLength) as ChosenLimit
const prevChosenLimit = (chosenLimit: ChosenLimit) =>
  ((chosenLimit - 1 + ChosenLimitLength) % ChosenLimitLength) as ChosenLimit

export const CldModal = () => {
  const { account } = useWeb3React()
  const { appTheme } = useGeneral()
  const { activeNetwork } = useNetwork()
  const {
    purchaseWithStable,
    purchaseWithNonStable,
    purchase,
    getMinRequiredAccountBalance,
    policyOf,
  } = useCoverageFunctions()
  const { intrface, portfolioKit, simulator, input, dropdowns, styles, referral, policy } = useCoverageContext()
  const {
    userState,
    handleShowCLDModal,
    transactionLoading,
    handleTransactionLoading,
    handleShowSimulatorModal,
    handleShowCodeNoticeModal,
  } = intrface
  const {
    enteredDeposit,
    handleEnteredDeposit,
    importedCoverLimit,
    selectedCoin,
    handleSelectedCoin,
    selectedCoinPrice,
  } = input
  const { curHighestPosition } = portfolioKit
  const { importCounter } = simulator
  const { batchBalanceData } = dropdowns
  const { bigButtonStyle, gradientStyle } = styles
  const {
    cookieReferralCode,
    appliedReferralCode,
    cookieCodeUsable,
    applyReferralCode,
    handleCodeApplicationStatus,
  } = referral
  const { signatureObj, depositApproval, scpBalance, status, availCovCap, unlimitedApproveCPM } = policy

  const { handleToast, handleContractCallError } = useTransactionExecution()
  const [localCoinsOpen, setLocalCoinsOpen] = useState<boolean>(false)

  const curUserState = useMemo(() => [InterfaceState.CURRENT_USER].includes(userState), [userState])
  const newUserState = useMemo(() => [InterfaceState.NEW_USER].includes(userState), [userState])
  const returningUserState = useMemo(() => [InterfaceState.RETURNING_USER].includes(userState), [userState])

  const [chosenLimit, setChosenLimit] = useState<ChosenLimit>(ChosenLimit.Recommended)

  const [highestAmount, setHighestAmount] = useState<BigNumber>(ZERO)
  const [recommendedAmount, setRecommendedAmount] = useState<BigNumber>(ZERO)
  const [customInputAmount, setCustomInputAmount] = useState<string>('')
  const [isImportOrigin, setIsImportOrigin] = useState<boolean>(false)
  const [insufficientCovCap, setInsufficientCovCap] = useState<boolean>(false)

  const [localNewCoverageLimit, setLocalNewCoverageLimit] = useState<string>('')
  const [minReqAccBal, setMinReqAccBal] = useState<BigNumber>(ZERO)

  const importCounterPrev = usePrevious(importCounter)

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
    if (minReqAccBal.isZero() && BN_Scp_Plus_Deposit.isZero()) return 'both zeroes'
    if (minReqAccBal.gt(BN_Scp_Plus_Deposit))
      return truncateValue(formatUnits(minReqAccBal.sub(BN_Scp_Plus_Deposit)), 2)
    return 'meets requirement'
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
      .then(async (res) => await _handleToast(res.tx, res.localTx, true))
      .then((res) => handleCodeApplication(res))

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
      .then(async (res) => await _handleToast(res.tx, res.localTx, true))
      .then((res) => handleCodeApplication(res))

      .catch((err) => _handleContractCallError('callPurchaseWithStable', err, FunctionName.COVER_PURCHASE_WITH_STABLE))
  }

  const callPurchaseWithNonStable = async () => {
    if (!account || !signatureObj) return
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
      .then(async (res) => await _handleToast(res.tx, res.localTx, true))
      .then((res) => handleCodeApplication(res))

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

  const _handleToast = async (tx: any, localTx: any, codeApplication?: boolean) => {
    if (codeApplication && !appliedReferralCode && cookieReferralCode && newUserState) {
      handleCodeApplicationStatus(ApiStatus.PENDING)
      handleShowCodeNoticeModal(true)
    }
    handleEnteredDeposit('')
    handleTransactionLoading(false)
    return await handleToast(tx, localTx)
  }

  const _handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    handleContractCallError(functionName, err, txType)
    handleTransactionLoading(false)
  }

  const handleCodeApplication = async (activationStatus: boolean) => {
    if (!activationStatus || !account || !cookieReferralCode || appliedReferralCode || !newUserState) {
      handleCodeApplicationStatus('activation failed')
      return
    }
    const policyId: BigNumber = await policyOf(account)
    if (policyId?.isZero()) {
      handleCodeApplicationStatus('activation failed')
      return
    }
    handleCodeApplicationStatus('handling referral')
    await applyReferralCode(cookieReferralCode, policyId.toNumber(), activeNetwork.chainId).then((r) => {
      if (r) {
        handleCodeApplicationStatus(ApiStatus.OK)
      } else {
        handleCodeApplicationStatus(ApiStatus.ERROR)
      }
    })
  }

  // sets up amounts
  useEffect(() => {
    if (!curHighestPosition) {
      setHighestAmount(ZERO)
      setRecommendedAmount(ZERO)
      return
    } else {
      /** Big Number Balance */ const bnBal = BigNumber.from(accurateMultiply(curHighestPosition.balanceUSD, 18))
      /** balance + 20% */ const bnHigherBal = bnBal.add(bnBal.div(BigNumber.from('5')))
      setHighestAmount(bnBal)
      setRecommendedAmount(bnHigherBal)
    }
  }, [curHighestPosition])

  useEffect(() => {
    if (importCounter > 0) {
      setCustomInputAmount(formatUnits(importedCoverLimit, 18))
      setLocalNewCoverageLimit(formatUnits(importedCoverLimit, 18))
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
      default:
        setLocalNewCoverageLimit(customInputAmount)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenLimit, highestAmount, recommendedAmount, customInputAmount])

  useEffect(() => {
    const init = async () => {
      const mrab = await getMinRequiredAccountBalance(parseUnits(formatAmount(localNewCoverageLimit), 18))
      setMinReqAccBal(mrab)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localNewCoverageLimit])

  useEffect(() => {
    if (parseUnits(formatAmount(localNewCoverageLimit), 18).gt(availCovCap)) {
      setInsufficientCovCap(true)
    } else {
      setInsufficientCovCap(false)
    }
  }, [availCovCap, localNewCoverageLimit])

  useEffect(() => {
    if (importCounter > (importCounterPrev ?? 0)) {
      setIsImportOrigin(true)
    }
  }, [importCounter, importCounterPrev])

  return (
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
        <Flex
          onClick={() => {
            if (isImportOrigin) handleShowSimulatorModal(true)
            handleShowCLDModal(false)
            setIsImportOrigin(false)
          }}
        >
          <ModalCloseButton lightColor={appTheme == 'dark'} />
        </Flex>
      </Flex>
      <Flex justifyCenter mb={4}>
        <Text big3 mont semibold style={{ lineHeight: '29.26px' }}>
          {status ? `Update Cover Limit` : `Purchase Policy`}
        </Text>
      </Flex>
      <Flex col stretch>
        <Flex justifyCenter>
          <Text t4s textAlignCenter>
            In case of an exploit, what amount would you like to be covered up to?
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
      {insufficientCovCap ? (
        <Text textAlignCenter pt={16}>
          Your desired cover limit is too high.
        </Text>
      ) : lackingScp == 'both zeroes' ? (
        <Text textAlignCenter pt={16}>
          You cannot purchase a policy with a cover limit of 0.
        </Text>
      ) : null}
      {cookieReferralCode && !cookieCodeUsable && newUserState && (
        <Text textAlignCenter pt={16}>
          Cannot use invalid referral code
        </Text>
      )}
      {scpBalanceMeetsMrab && (
        <ButtonWrapper>
          {depositApproval && (
            <Button
              {...gradientStyle}
              {...bigButtonStyle}
              secondary
              noborder
              onClick={callPurchase}
              disabled={
                parseFloat(formatAmount(localNewCoverageLimit)) == 0 ||
                insufficientCovCap ||
                (cookieReferralCode && !cookieCodeUsable && newUserState)
              }
            >
              {curUserState ? `Save` : newUserState || returningUserState ? `Activate` : ``}
            </Button>
          )}
          {!depositApproval && (
            <Button {...gradientStyle} {...bigButtonStyle} secondary noborder onClick={unlimitedApproveCPM}>
              Approve
            </Button>
          )}
        </ButtonWrapper>
      )}
      {lackingScp != 'meets requirement' && lackingScp != 'both zeroes' && (
        <Text textAlignCenter pt={16}>
          You need at least ${lackingScp} for the desired cover limit. Lower the value or use the form below to deposit
          the additional premium.
        </Text>
      )}
      {!scpBalanceMeetsMrab && (
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
            {depositApproval && (
              <Button
                {...bigButtonStyle}
                {...gradientStyle}
                secondary
                noborder
                onClick={handlePurchase}
                disabled={
                  parseFloat(formatAmount(localNewCoverageLimit)) == 0 ||
                  lackingScp != 'meets requirement' ||
                  insufficientCovCap ||
                  (cookieReferralCode && !cookieCodeUsable && newUserState)
                }
              >
                {/* <Text>Deposit &amp; Save</Text> */}
                <Text> {curUserState ? `Save` : newUserState || returningUserState ? `Activate` : ``}</Text>
              </Button>
            )}
            {!depositApproval && (
              <Button {...gradientStyle} {...bigButtonStyle} secondary noborder onClick={unlimitedApproveCPM}>
                Approve
              </Button>
            )}
          </ButtonWrapper>
        </Flex>
      )}
    </Flex>
  )
}
