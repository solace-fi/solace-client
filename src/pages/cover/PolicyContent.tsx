import { useWeb3React } from '@web3-react/core'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { StyledExpand, StyledOptions, StyledCalculator } from '../../components/atoms/Icon'
import { Flex, VerticalSeparator } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { TileCard } from '../../components/molecules/TileCard'
import { ZERO } from '../../constants'
import { ApiStatus, FunctionName, InterfaceState } from '../../constants/enums'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { useCoverageFunctions } from '../../hooks/policy/useSolaceCoverProductV3'
import {
  accurateMultiply,
  convertSciNotaToPrecise,
  filterAmount,
  fixed,
  floatUnits,
  formatAmount,
  truncateValue,
} from '../../utils/formatting'
import { useCoverageContext } from './CoverageContext'
import { BalanceDropdownOptions, DropdownInputSection } from './Dropdown'

import Zapper from '../../resources/svg/zapper.svg'
import ZapperDark from '../../resources/svg/zapper-dark.svg'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { LoaderText } from '../../components/molecules/LoaderText'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import { useCachedData } from '../../context/CachedDataManager'
import { useGeneral } from '../../context/GeneralManager'
import { Risk } from '@solace-fi/sdk-nightly'
import { usePortfolioAnalysis } from '../../hooks/policy/usePortfolioAnalysis'

export const PolicyContent = (): JSX.Element => {
  const { appTheme } = useGeneral()
  const { latestBlock } = useProvider()
  const { intrface, styles, input, dropdowns, policy, referral, portfolioKit } = useCoverageContext()
  const {
    navbarThreshold,
    coverageLoading,
    existingPolicyLoading,
    transactionLoading,
    balancesLoading,
    portfolioLoading,
    interfaceState,
    userState,
    handleUserState,
    handleCtaState,
    handleShowPortfolioModal,
    handleShowCLDModal,
    handleShowSimulatorModal,
    handleTransactionLoading,
    handleShowReferralModal,
    handleShowCodeNoticeModal,
  } = intrface
  const { bigButtonStyle, gradientStyle } = styles
  const {
    enteredDeposit,
    enteredWithdrawal,
    handleEnteredDeposit,
    handleEnteredWithdrawal,
    isAcceptableDeposit,
    selectedCoin,
    handleSelectedCoin,
    selectedCoinPrice,
  } = input
  const {
    policyId,
    existingPolicyId,
    existingPolicyNetwork,
    status,
    curCoverageLimit,
    scpBalance,
    scpObj,
    signatureObj,
    depositApproval,
    availCovCap,
    approveCPM,
  } = policy
  const { batchBalanceData, coinsOpen, setCoinsOpen } = dropdowns
  const { curPortfolio, curDailyCost, curUsdBalanceSum, curHighestPosition, fetchStatus } = portfolioKit
  const {
    cookieReferralCode,
    appliedReferralCode,
    cookieCodeUsable,
    applyReferralCode,
    handleCodeApplicationStatus,
  } = referral

  const { account } = useWeb3React()
  const { activeNetwork, changeNetwork } = useNetwork()
  const { tokenPriceMapping, version } = useCachedData()
  const { isMobile } = useWindowDimensions()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  const {
    purchaseWithStable,
    purchaseWithNonStable,
    purchase,
    cancel,
    withdraw,
    depositStable,
    depositNonStable,
    getMinRequiredAccountBalance,
    policyOf,
  } = useCoverageFunctions()

  const [showExistingPolicyMessage, setShowExistingPolicyMessage] = useState<boolean>(true)
  const firstTime = useMemo(() => existingPolicyId.isZero(), [existingPolicyId])

  const [enteredUSDDeposit, setEnteredUSDDeposit] = useState<string>('')
  const [enteredUSDWithdrawal, setEnteredUSDWithdrawal] = useState<string>('')

  const policyDuration = useMemo(() => (curDailyCost > 0 ? parseFloat(scpBalance) / curDailyCost : 0), [
    curDailyCost,
    scpBalance,
  ])

  const newDuration = useMemo(
    () => (curDailyCost > 0 ? parseFloat(formatAmount(enteredUSDDeposit)) / curDailyCost : 0),
    [curDailyCost, enteredUSDDeposit]
  )

  const [sugMinReqAccBal, setSugMinReqAccBal] = useState<BigNumber>(ZERO)
  const lackingScp = useMemo(() => {
    const parsedScpBalance = parseUnits(scpBalance, 18)
    const BN_Scp_Plus_Deposit = parsedScpBalance.add(BigNumber.from(accurateMultiply(enteredUSDDeposit, 18)))
    if (sugMinReqAccBal.isZero() && BN_Scp_Plus_Deposit.isZero()) return 'both zeroes'
    if (sugMinReqAccBal.gt(BN_Scp_Plus_Deposit)) {
      const diff = Math.round(parseFloat(formatUnits(sugMinReqAccBal.sub(BN_Scp_Plus_Deposit))) * 100) / 100
      return truncateValue(Math.max(diff, 0.01), 2)
    }
    return 'meets requirement'
  }, [scpBalance, sugMinReqAccBal, enteredUSDDeposit])

  const selectedCoinBalance = useMemo(() => {
    return batchBalanceData.find((d) => d.address.toLowerCase() == selectedCoin.address.toLowerCase())?.balance ?? ZERO
  }, [batchBalanceData, selectedCoin])

  // TODO - uncomment this when the smart functions are working
  const newUserState = useMemo(() => [InterfaceState.NEW_USER].includes(userState), [userState])
  const returningUserState = useMemo(() => [InterfaceState.RETURNING_USER].includes(userState), [userState])
  const curUserState = useMemo(() => [InterfaceState.CURRENT_USER].includes(userState), [userState])

  const depositCta = useMemo(() => [InterfaceState.DEPOSITING].includes(interfaceState), [interfaceState])
  const withdrawCta = useMemo(() => [InterfaceState.WITHDRAWING].includes(interfaceState), [interfaceState])
  const homeCta = useMemo(() => !depositCta && !withdrawCta, [depositCta, withdrawCta])

  const [suggestedCoverLimit, setSuggestedCoverLimit] = useState<BigNumber>(ZERO)

  const { dailyCost: initiativeDailyCost } = usePortfolioAnalysis(curPortfolio, suggestedCoverLimit)

  const initiativeDuration = useMemo(
    () => (initiativeDailyCost > 0 ? parseFloat(formatAmount(enteredUSDDeposit)) / initiativeDailyCost : 0),
    [initiativeDailyCost, enteredUSDDeposit]
  )

  const portfolioFetchStatus = useMemo(() => {
    let message = undefined
    switch (fetchStatus) {
      case 2:
        message = 'No account found'
        break
      case 3:
        message = 'Cannot fetch balances'
        break
      case 4:
        message = 'Cannot fetch scores'
        break
      case 1:
      case 0:
      case 5:
      default:
        message = undefined
    }
    return message
  }, [fetchStatus])

  const [refundableSOLACEAmount, setRefundableSOLACEAmount] = useState<BigNumber>(ZERO)
  const [withdrawingMoreThanRefundable, setWithdrawingMoreThanRefundable] = useState<boolean>(false)
  const [insufficientCovCap, setInsufficientCovCap] = useState<boolean>(false)

  const isAcceptableWithdrawal = useMemo(() => {
    const BN_enteredWithdrawal = parseUnits(formatAmount(enteredWithdrawal), 18)
    if (BN_enteredWithdrawal.isZero()) return false
    setWithdrawingMoreThanRefundable(BN_enteredWithdrawal.gt(refundableSOLACEAmount))
    return true
  }, [enteredWithdrawal, refundableSOLACEAmount])

  const handleDeposit = async () => {
    if (selectedCoin.stablecoin) {
      await callDepositStable()
    } else {
      await callDepositNonStable()
    }
  }

  const callDepositStable = async () => {
    if (!account) return
    handleTransactionLoading(true)
    await depositStable(selectedCoin.address, account, parseUnits(enteredDeposit, selectedCoin.decimals))
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callDepositStable', err, FunctionName.COVER_DEPOSIT_STABLE))
  }

  const callDepositNonStable = async () => {
    if (!account || !depositApproval) return
    const signature = signatureObj.signatures[`${activeNetwork.chainId}`]
    if (!signature) return
    const tokenSignature: any = Object.values(signature)[0]
    handleTransactionLoading(true)
    await depositNonStable(
      selectedCoin.address,
      account,
      parseUnits(enteredDeposit, selectedCoin.decimals),
      tokenSignature.price,
      tokenSignature.deadline,
      tokenSignature.signature
    )
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callDepositNonStable', err, FunctionName.COVER_DEPOSIT_NON_STABLE))
  }

  const callCancel = async () => {
    if (!account || !signatureObj) return
    handleTransactionLoading(true)
    const risk = new Risk()
    const premiumData = await risk.getSolaceRiskPremiumData(account, activeNetwork.chainId)
    await cancel(premiumData.premium.toString(), premiumData.deadline, premiumData.signature)
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callCancel', err, FunctionName.COVER_CANCEL))
  }

  const callWithdraw = async () => {
    if (!account || !signatureObj || refundableSOLACEAmount.isZero()) return
    const signature = signatureObj.signatures[`${activeNetwork.chainId}`]
    if (!signature) return
    const tokenSignature: any = Object.values(signature)[0]
    handleTransactionLoading(true)
    const parsedWithdrawal = parseUnits(formatAmount(enteredWithdrawal), 18)
    const amountToWithdraw = refundableSOLACEAmount.gt(parsedWithdrawal) ? parsedWithdrawal : refundableSOLACEAmount
    await withdraw(account, amountToWithdraw, tokenSignature.price, tokenSignature.deadline, tokenSignature.signature)
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callWithdraw', err, FunctionName.COVER_WITHDRAW))
  }

  const callPurchase = async () => {
    if (!account) return
    handleTransactionLoading(true)
    await purchase(account, suggestedCoverLimit)
      .then(async (res) => await _handleToast(res.tx, res.localTx, true))
      .then((res) => handleCodeApplication(res))
      .catch((err) => _handleContractCallError('callPurchase', err, FunctionName.COVER_PURCHASE))
  }

  const callPurchaseWithStable = async () => {
    if (!account || !depositApproval) return
    handleTransactionLoading(true)
    await purchaseWithStable(
      account,
      suggestedCoverLimit,
      selectedCoin.address,
      parseUnits(enteredDeposit, selectedCoin.decimals)
    )
      .then(async (res) => await _handleToast(res.tx, res.localTx, true))
      .then((res) => handleCodeApplication(res))
      .catch((err) => _handleContractCallError('callPurchaseWithStable', err, FunctionName.COVER_PURCHASE_WITH_STABLE))
  }

  const callPurchaseWithNonStable = async () => {
    if (!account || !depositApproval || !signatureObj) return
    const signature = signatureObj.signatures[`${activeNetwork.chainId}`]
    if (!signature) return
    const tokenSignature: any = Object.values(signature)[0]
    handleTransactionLoading(true)
    await purchaseWithNonStable(
      account,
      suggestedCoverLimit,
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
    handleCtaState(undefined)
    handleEnteredUSDDeposit('')
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

  const handleEnteredUSDWithdrawal = (usd_value: string) => {
    if (!tokenPriceMapping['solace']) return
    setEnteredUSDWithdrawal(usd_value)
    const token_amount_equivalent = parseFloat(formatAmount(usd_value)) / tokenPriceMapping['solace']
    handleEnteredWithdrawal(formatAmount(token_amount_equivalent.toString()), 18)
  }

  const handleEnteredUSDDeposit = (usd_value: string, maxDecimals?: number) => {
    const filtered = filterAmount(usd_value, enteredUSDDeposit)
    const formatted = formatAmount(filtered)
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 2) return
    if (floatUnits(selectedCoinBalance, maxDecimals ?? 18) * selectedCoinPrice < parseFloat(formatted)) return
    setEnteredUSDDeposit(filtered)
    const token_amount_equivalent = parseFloat(formatAmount(filtered)) / selectedCoinPrice
    handleEnteredDeposit(formatAmount(token_amount_equivalent.toString()), maxDecimals)
  }

  const getRefundableSOLACEAmount = useCallback(async () => {
    if (!account || !scpObj || !signatureObj) {
      setRefundableSOLACEAmount(ZERO)
      return
    }
    const signature = signatureObj.signatures[`${activeNetwork.chainId}`]
    if (!signature) {
      setRefundableSOLACEAmount(ZERO)
      return
    }
    const tokenSignature: any = Object.values(signature)[0]
    const refundableSOLACEAmount = await scpObj.getRefundableSOLACEAmount(
      account,
      tokenSignature.price,
      tokenSignature.deadline,
      tokenSignature.signature
    )
    setRefundableSOLACEAmount(refundableSOLACEAmount)
  }, [account, scpObj, signatureObj, activeNetwork])

  useEffect(() => {
    getRefundableSOLACEAmount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, latestBlock])

  useEffect(() => {
    if (!policyId || policyId?.eq(ZERO)) {
      handleUserState(InterfaceState.NEW_USER)
    } else if (!status) {
      handleUserState(InterfaceState.RETURNING_USER)
    } else {
      handleUserState(InterfaceState.CURRENT_USER)
    }
  }, [policyId, status, handleUserState, version, latestBlock])

  useEffect(() => {
    setShowExistingPolicyMessage(true)
  }, [activeNetwork.chainId])

  useEffect(() => {
    if (!curHighestPosition) {
      setSuggestedCoverLimit(ZERO)
    } else {
      const bnBal = BigNumber.from(accurateMultiply(curHighestPosition.balanceUSD, 18))
      const bnHigherBal = bnBal.add(bnBal.div(BigNumber.from('5')))
      setSuggestedCoverLimit(bnHigherBal)
    }
  }, [curHighestPosition])

  useEffect(() => {
    const init = async () => {
      const mrab = await getMinRequiredAccountBalance(suggestedCoverLimit)
      setSugMinReqAccBal(mrab)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedCoverLimit])

  useEffect(() => {
    if (suggestedCoverLimit.gt(availCovCap)) {
      setInsufficientCovCap(true)
    } else {
      setInsufficientCovCap(false)
    }
  }, [availCovCap, suggestedCoverLimit])

  return (
    // <Content>
    <div>
      {coverageLoading || existingPolicyLoading ? (
        <Flex col gap={16} m={isMobile ? 20 : undefined}>
          <LoaderText text={'Loading'} />
        </Flex>
      ) : (
        <Flex col gap={0}>
          {!firstTime && policyId?.isZero() && showExistingPolicyMessage ? (
            <TileCard>
              <Flex col gap={30} itemsCenter>
                <Text t2s>Solace Wallet Coverage</Text>
                <Flex col gap={10} itemsCenter>
                  <Text t2>Cover your wallet on any of our supported chains with one policy!</Text>
                  <Text t2 warning>
                    It looks like you already have a policy on {existingPolicyNetwork.name}.
                  </Text>
                </Flex>
                <ButtonWrapper isColumn={isMobile}>
                  <Button info secondary pl={23} pr={23} onClick={() => changeNetwork(existingPolicyNetwork.chainId)}>
                    Switch to {existingPolicyNetwork.name}
                  </Button>
                  <Button info pl={23} pr={23} onClick={() => setShowExistingPolicyMessage(false)}>
                    Continue Anyway
                  </Button>
                </ButtonWrapper>
                {/* {appTheme == 'light' && (
                <Flex center>
                  <img src={Zapper} style={{ width: '145px' }} />
                </Flex>
              )}
              {appTheme == 'dark' && (
                <Flex center>
                  <img src={ZapperDark} style={{ width: '145px' }} />
                </Flex>
              )} */}
              </Flex>
            </TileCard>
          ) : (
            <>
              {newUserState && [5].includes(fetchStatus) && curPortfolio && curPortfolio.protocols.length == 0 && (
                <Flex col gap={16} marginAuto style={{ width: '100%' }}>
                  <Flex col gap={0} marginAuto>
                    <Text t4s textAlignCenter>
                      Your portfolio is empty.
                    </Text>
                    <Text t4s textAlignCenter>
                      Simulate your portfolio to see the coverage cost.
                    </Text>
                  </Flex>
                  <Flex stretch flex1 px={44}>
                    <Button
                      {...gradientStyle}
                      {...bigButtonStyle}
                      secondary
                      noborder
                      onClick={() => handleShowSimulatorModal(true)}
                    >
                      <Flex gap={8}>
                        <Text t4s>
                          <StyledCalculator size={18} />
                        </Text>
                        <Text bold t4s>
                          Quote Simulator
                        </Text>
                      </Flex>
                    </Button>
                  </Flex>
                </Flex>
              )}
              <Flex center mx={20} mt={47}>
                <div
                  style={{
                    // width: navbarThreshold ? '50%' : '100%',
                    display: 'flex',
                    width: '100%',
                    gap: '16px',
                  }}
                >
                  <TileCard
                    bigger
                    padding={16}
                    innerStyle={{
                      paddingLeft: '16px',
                      paddingBottom: '16px',
                      marginTop: '6.5px',
                      marginRight: '6.5px',
                    }}
                    onClick={() => handleShowPortfolioModal(true)}
                  >
                    <Flex between style={{ alignItems: 'center' }}>
                      <Text bold t6s>
                        My Portfolio
                      </Text>
                      <Text info>
                        <StyledExpand size={12} />
                      </Text>
                    </Flex>
                    {portfolioLoading ? (
                      <LoaderText text={'Fetching'} />
                    ) : !portfolioFetchStatus ? (
                      <Text t4s style={{ lineHeight: '14px' }} bold {...gradientStyle}>
                        ${truncateValue(curUsdBalanceSum, 2)}
                      </Text>
                    ) : (
                      <Text t4s style={{ lineHeight: '14px' }} bold error>
                        {portfolioFetchStatus}
                      </Text>
                    )}
                  </TileCard>
                  <TileCard
                    bigger
                    padding={16}
                    innerStyle={{
                      paddingLeft: '16px',
                      paddingBottom: '16px',
                      marginTop: '6.5px',
                      marginRight: '6.5px',
                    }}
                    onClick={() => handleShowCLDModal(true)}
                  >
                    <Flex between style={{ alignItems: 'center' }}>
                      <Text bold t6s>
                        {curUserState ? `My Cover Limit` : `Suggested Cover Limit`}
                      </Text>
                      <Text info>
                        <StyledOptions size={12} />
                      </Text>
                    </Flex>
                    <Text t4s style={{ lineHeight: '14px' }} bold {...gradientStyle}>
                      ${truncateValue(floatUnits(curUserState ? curCoverageLimit : suggestedCoverLimit, 18), 2)}
                    </Text>
                  </TileCard>
                </div>
              </Flex>
              <Flex button noborder py={6.5} px={16} mx={20} mt={12} bgRaised style={{ borderRadius: '8px' }}>
                <Text t5s bold info>
                  <Flex between gap={12} onClick={() => handleShowReferralModal(true)}>
                    {!newUserState ? (
                      <Text t4>Manage your referrals</Text>
                    ) : cookieReferralCode && cookieCodeUsable && !appliedReferralCode ? (
                      <Text success t4>
                        Referral code active:{' '}
                        {cookieReferralCode.length > 10
                          ? `${cookieReferralCode.substring(0, 10)}...`
                          : cookieReferralCode}
                      </Text>
                    ) : cookieReferralCode && !cookieCodeUsable && !appliedReferralCode ? (
                      <Text error t4>
                        Invalid referral code:{' '}
                        {cookieReferralCode.length > 10
                          ? `${cookieReferralCode.substring(0, 10)}...`
                          : cookieReferralCode}
                      </Text>
                    ) : appliedReferralCode ? (
                      <Text warning t4>
                        This account has already used a referral code
                      </Text>
                    ) : (
                      <Text warning t4>
                        No referral code detected
                      </Text>
                    )}
                    <StyledOptions width={12} />
                  </Flex>
                </Text>
              </Flex>
              <div style={{ margin: '16px 20px auto' }}>
                <Flex shadow bgSecondary col rounded px={24} py={16}>
                  {!newUserState && (
                    <Flex stretch between pb={16}>
                      <Flex col>
                        <Text bold t4 {...gradientStyle}>
                          Premium Cost
                        </Text>
                      </Flex>
                      <Text bold t4 {...gradientStyle}>
                        ${truncateValue(curDailyCost, 2)}
                        <Text t7s style={{ backgroundColor: 'green' }} techygradient inline ml={2}>
                          / Day
                        </Text>
                      </Text>
                    </Flex>
                  )}
                  {!newUserState && (
                    <Flex bgRaised py={16} px={20} rounded stretch between mb={16}>
                      <Flex col gap={4}>
                        <Text bold t7s textAlignCenter>
                          My Balance
                        </Text>
                        <Text textAlignCenter bold t4s dark={appTheme == 'light'} light={appTheme == 'dark'}>
                          ${truncateValue(scpBalance, 2)}
                        </Text>
                      </Flex>
                      <VerticalSeparator />
                      <Flex col gap={4}>
                        <Text bold t7s textAlignCenter>
                          Policy Status
                        </Text>
                        {status ? (
                          <Text textAlignCenter bold t4s success>
                            Active
                          </Text>
                        ) : (
                          <Text textAlignCenter bold t4s error>
                            Inactive
                          </Text>
                        )}
                      </Flex>
                      <VerticalSeparator />
                      <Flex col gap={4}>
                        <Text bold t7s textAlignCenter>
                          Est. Days
                        </Text>
                        <Text textAlignCenter bold t4s dark={appTheme == 'light'} light={appTheme == 'dark'}>
                          {truncateValue(policyDuration, 2)}
                        </Text>
                      </Flex>
                    </Flex>
                  )}
                  {cookieReferralCode && !cookieCodeUsable && newUserState && (
                    <Text textAlignCenter pb={12}>
                      Cannot use invalid referral code
                    </Text>
                  )}
                  {(newUserState || returningUserState) &&
                    (suggestedCoverLimit.isZero() ? (
                      <Text textAlignCenter pb={12}>
                        You cannot purchase a policy with a cover limit of 0.
                      </Text>
                    ) : insufficientCovCap ? (
                      <Text textAlignCenter pb={12}>
                        Please choose a lower cover limit to activate the policy.
                      </Text>
                    ) : lackingScp != 'meets requirement' && lackingScp != 'both zeroes' ? (
                      <Text textAlignCenter pb={12}>
                        You need at least over ~${lackingScp} for the suggested cover limit. Lower the value or use the
                        form below to deposit the additional premium.
                      </Text>
                    ) : null)}
                  <Flex col gap={12}>
                    {(depositCta || newUserState) &&
                      (!balancesLoading ? (
                        <div>
                          <div
                            onClick={() => {
                              if (coinsOpen) setCoinsOpen(false)
                            }}
                          >
                            <DropdownInputSection
                              hasArrow
                              isOpen={coinsOpen}
                              placeholder={'$'}
                              icon={
                                <img src={`https://assets.solace.fi/${selectedCoin.name.toLowerCase()}`} height={16} />
                              }
                              text={selectedCoin.symbol}
                              value={enteredUSDDeposit}
                              onChange={(e) => handleEnteredUSDDeposit(e.target.value, selectedCoin.decimals)}
                              onClick={() => setCoinsOpen(!coinsOpen)}
                            />
                          </div>
                          <BalanceDropdownOptions
                            isOpen={coinsOpen}
                            searchedList={batchBalanceData}
                            onClick={(value: string) => {
                              handleSelectedCoin(value)
                              setCoinsOpen(false)
                            }}
                          />
                        </div>
                      ) : (
                        <LoaderText />
                      ))}
                    {withdrawCta && (
                      <Flex col gap={8}>
                        <Flex between>
                          <Flex col>
                            <Text t4>Withdrawable (excludes earned rewards):</Text>
                          </Flex>
                          <Flex gap={5}>
                            <Flex col>
                              <Text t4>{`~ $${truncateValue(
                                tokenPriceMapping['solace']
                                  ? parseFloat(formatUnits(refundableSOLACEAmount, 18)) * tokenPriceMapping['solace']
                                  : 0,
                                2
                              )}`}</Text>
                            </Flex>
                          </Flex>
                        </Flex>
                        <DropdownInputSection
                          placeholder={'$'}
                          icon={<img src={`https://assets.solace.fi/solace`} height={16} />}
                          text={'SOLACE'}
                          value={`$${
                            enteredUSDWithdrawal != '' && enteredUSDWithdrawal != '0.' && enteredUSDWithdrawal != '.'
                              ? truncateValue(enteredUSDWithdrawal, 2, false)
                              : enteredUSDWithdrawal
                          }`}
                          onChange={(e) => handleEnteredUSDWithdrawal(filterAmount(e.target.value, enteredWithdrawal))}
                        />
                      </Flex>
                    )}
                    <ButtonWrapper isColumn p={0}>
                      {newUserState && depositApproval && homeCta && (
                        <Button
                          {...bigButtonStyle}
                          matchBg
                          secondary
                          noborder
                          onClick={() => {
                            const selectedCoinBalance_USD =
                              floatUnits(selectedCoinBalance, selectedCoin.decimals) * selectedCoinPrice
                            handleEnteredDeposit(
                              formatUnits(selectedCoinBalance, selectedCoin.decimals),
                              selectedCoin.decimals
                            )
                            setEnteredUSDDeposit(
                              fixed(convertSciNotaToPrecise(`${selectedCoinBalance_USD}`), 2).toString()
                            )
                          }}
                          widthP={100}
                          disabled={selectedCoinBalance.isZero()}
                        >
                          <Text {...gradientStyle}>MAX</Text>
                        </Button>
                      )}
                      {newUserState && parseFloat(formatAmount(enteredUSDDeposit)) > 0 && (
                        <Text textAlignCenter t5s>
                          With this deposit, your policy will extend by{' '}
                          <TextSpan success>{truncateValue(initiativeDuration, 1)} days</TextSpan>.
                        </Text>
                      )}
                      {(newUserState || returningUserState) && depositApproval && homeCta && (
                        <Button
                          {...gradientStyle}
                          {...bigButtonStyle}
                          secondary={newUserState}
                          noborder={newUserState}
                          success={returningUserState}
                          onClick={handlePurchase}
                          disabled={
                            suggestedCoverLimit.isZero() ||
                            portfolioLoading ||
                            lackingScp != 'meets requirement' ||
                            (!parseUnits(formatAmount(enteredDeposit), selectedCoin.decimals).isZero() &&
                              !isAcceptableDeposit) ||
                            (cookieReferralCode && !cookieCodeUsable && newUserState)
                          }
                        >
                          <Text bold t4s>
                            Activate Policy
                          </Text>
                        </Button>
                      )}
                      {(newUserState || returningUserState) && !depositApproval && homeCta && (
                        <>
                          <Button
                            {...gradientStyle}
                            {...bigButtonStyle}
                            secondary
                            noborder
                            onClick={() =>
                              approveCPM(selectedCoin.address, parseUnits(enteredDeposit, selectedCoin.decimals))
                            }
                            disabled={!isAcceptableDeposit}
                          >
                            Approve Entered {selectedCoin.symbol}
                          </Button>
                          <Button
                            {...gradientStyle}
                            {...bigButtonStyle}
                            secondary
                            noborder
                            onClick={() => approveCPM(selectedCoin.address)}
                          >
                            Approve Max {selectedCoin.symbol}
                          </Button>
                        </>
                      )}
                      {(curUserState || returningUserState) && homeCta && (
                        <Button
                          {...gradientStyle}
                          {...bigButtonStyle}
                          secondary
                          noborder
                          onClick={() => handleCtaState(InterfaceState.DEPOSITING)}
                        >
                          <Text bold t4s>
                            Deposit
                          </Text>
                        </Button>
                      )}
                      {(curUserState || returningUserState) && homeCta && (
                        <Button
                          secondary
                          matchBg
                          {...bigButtonStyle}
                          noborder
                          onClick={() => handleCtaState(InterfaceState.WITHDRAWING)}
                        >
                          <Text bold t4s techygradient>
                            Withdraw
                          </Text>
                        </Button>
                      )}
                      {depositCta && (
                        <>
                          {!depositApproval && (
                            <>
                              <Button
                                {...gradientStyle}
                                {...bigButtonStyle}
                                secondary
                                noborder
                                onClick={() =>
                                  approveCPM(selectedCoin.address, parseUnits(enteredDeposit, selectedCoin.decimals))
                                }
                                disabled={!isAcceptableDeposit}
                              >
                                Approve Entered {selectedCoin.symbol}
                              </Button>
                              <Button
                                {...gradientStyle}
                                {...bigButtonStyle}
                                secondary
                                noborder
                                onClick={() => approveCPM(selectedCoin.address)}
                              >
                                Approve Max {selectedCoin.symbol}
                              </Button>
                            </>
                          )}
                          {depositApproval && (
                            <>
                              {parseFloat(formatAmount(enteredUSDDeposit)) > 0 && (
                                <Text textAlignCenter t5s>
                                  With this deposit, your policy will extend by{' '}
                                  <TextSpan success>
                                    {truncateValue(returningUserState ? initiativeDuration : newDuration, 1)} days
                                  </TextSpan>
                                  .
                                </Text>
                              )}
                              <Button
                                {...gradientStyle}
                                {...bigButtonStyle}
                                secondary
                                noborder
                                onClick={handleDeposit}
                                disabled={!isAcceptableDeposit}
                                widthP={100}
                              >
                                <Text>Deposit</Text>
                              </Button>
                            </>
                          )}
                          <ButtonWrapper p={0} style={{ width: '100%' }}>
                            <Button
                              pt={16}
                              pb={16}
                              separator
                              onClick={() => {
                                handleCtaState(undefined)
                                handleEnteredUSDDeposit('')
                              }}
                              widthP={100}
                            >
                              Cancel
                            </Button>
                            {depositApproval && (
                              <Button
                                {...bigButtonStyle}
                                matchBg
                                secondary
                                noborder
                                onClick={() => {
                                  const selectedCoinBalance_USD =
                                    floatUnits(selectedCoinBalance, selectedCoin.decimals) * selectedCoinPrice
                                  handleEnteredDeposit(
                                    formatUnits(selectedCoinBalance, selectedCoin.decimals),
                                    selectedCoin.decimals
                                  )
                                  setEnteredUSDDeposit(
                                    fixed(convertSciNotaToPrecise(`${selectedCoinBalance_USD}`), 2).toString()
                                  )
                                }}
                                widthP={100}
                                disabled={selectedCoinBalance.isZero()}
                              >
                                <Text {...gradientStyle}>MAX</Text>
                              </Button>
                            )}
                          </ButtonWrapper>
                        </>
                      )}
                      {withdrawCta && (
                        <>
                          <Button
                            {...gradientStyle}
                            {...bigButtonStyle}
                            secondary
                            noborder
                            onClick={callWithdraw}
                            disabled={
                              !isAcceptableWithdrawal ||
                              refundableSOLACEAmount.isZero() ||
                              withdrawingMoreThanRefundable
                            }
                          >
                            <Text>Withdraw</Text>
                          </Button>
                          <ButtonWrapper p={0} style={{ width: '100%' }}>
                            <Button
                              pt={16}
                              pb={16}
                              separator
                              onClick={() => {
                                handleCtaState(undefined)
                                handleEnteredUSDWithdrawal('')
                              }}
                              widthP={100}
                            >
                              Cancel
                            </Button>
                            <Button
                              {...bigButtonStyle}
                              matchBg
                              secondary
                              noborder
                              onClick={() => {
                                const refundableSOLACEAmount_USD_Equivalent =
                                  floatUnits(refundableSOLACEAmount, 18) * tokenPriceMapping['solace']
                                handleEnteredWithdrawal(formatUnits(refundableSOLACEAmount, 18), 18)
                                setEnteredUSDWithdrawal(
                                  convertSciNotaToPrecise(`${refundableSOLACEAmount_USD_Equivalent}`)
                                )
                              }}
                              disabled={refundableSOLACEAmount.isZero() || !tokenPriceMapping['solace']}
                              widthP={100}
                            >
                              <Text {...gradientStyle}>MAX</Text>
                            </Button>
                          </ButtonWrapper>
                        </>
                      )}
                      {curUserState && homeCta && (
                        <Button {...bigButtonStyle} error onClick={callCancel} noborder nohover>
                          Deactivate Policy
                        </Button>
                      )}
                    </ButtonWrapper>
                  </Flex>
                </Flex>
              </div>
              {([2, 3, 4].includes(fetchStatus) ||
                ([5].includes(fetchStatus) && curPortfolio && curPortfolio.protocols.length > 0)) && (
                <Flex col gap={16} marginAuto pt={36} px={44}>
                  <Text t4 textAlignCenter>
                    Get a quote for future portfolio positions by simulating a portfolio.
                  </Text>
                  <Flex stretch flex1>
                    <Button
                      {...gradientStyle}
                      {...bigButtonStyle}
                      secondary
                      noborder
                      onClick={() => handleShowSimulatorModal(true)}
                    >
                      <Flex gap={8}>
                        <Text t4s>
                          <StyledCalculator size={18} />
                        </Text>
                        <Text bold t4s>
                          Quote Simulator
                        </Text>
                      </Flex>
                    </Button>
                  </Flex>
                </Flex>
              )}
            </>
          )}
        </Flex>
      )}
    </div>
  )
}
