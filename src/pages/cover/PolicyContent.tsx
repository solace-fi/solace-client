import useDebounce from '@rooks/use-debounce'
import { useWeb3React } from '@web3-react/core'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { StyledExpand, StyledOptions, StyledCalculator } from '../../components/atoms/Icon'
import { Flex, VerticalSeparator } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { TileCard } from '../../components/molecules/TileCard'
import { ZERO } from '../../constants'
import { FunctionName, InterfaceState, TransactionCondition } from '../../constants/enums'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { useCoverageFunctions, useExistingPolicy } from '../../hooks/policy/useSolaceCoverProductV3'
import {
  accurateMultiply,
  convertSciNotaToPrecise,
  filterAmount,
  floatUnits,
  formatAmount,
  truncateValue,
} from '../../utils/formatting'
import { useCoverageContext } from './CoverageContext'
import { BalanceDropdownOptions, DropdownInputSection, DropdownOptions } from './Dropdown'

import Zapper from '../../resources/svg/zapper.svg'
import ZapperDark from '../../resources/svg/zapper-dark.svg'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { LoaderText } from '../../components/molecules/LoaderText'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import { useCachedData } from '../../context/CachedDataManager'
import { TransactionResponse } from '@ethersproject/providers'
import { LocalTx } from '../../constants/types'
import { useNotifications } from '../../context/NotificationsManager'

export const PolicyContent = (): JSX.Element => {
  const { latestBlock } = useProvider()
  const { intrface, styles, input, dropdowns, policy, referral, portfolioKit } = useCoverageContext()
  const {
    navbarThreshold,
    coverageLoading,
    existingPolicyLoading,
    transactionLoading,
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
    unlimitedApproveCPM,
  } = policy
  const { batchBalanceData, coinsOpen, setCoinsOpen } = dropdowns
  const { curDailyCost, curUsdBalanceSum, curHighestPosition, fetchStatus } = portfolioKit
  const { cookieReferralCode, appliedReferralCode, applyReferralCode } = referral

  const { account } = useWeb3React()
  const { activeNetwork, changeNetwork } = useNetwork()
  const { version } = useCachedData()
  const { makeApiToast } = useNotifications()
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
  const policyDuration = useMemo(() => (curDailyCost > 0 ? parseFloat(scpBalance) / curDailyCost : 0), [
    curDailyCost,
    scpBalance,
  ])

  const [sugMinReqAccBal, setSugMinReqAccBal] = useState<BigNumber>(ZERO)
  const lackingScp = useMemo(() => {
    const parsedScpBalance = parseUnits(scpBalance, 18)
    const float_enteredDeposit = parseFloat(formatAmount(enteredDeposit))
    const depositUSDEquivalent = float_enteredDeposit * selectedCoinPrice
    const BN_Scp_Plus_Deposit = parsedScpBalance.add(
      BigNumber.from(accurateMultiply(convertSciNotaToPrecise(`${depositUSDEquivalent}`), 18))
    )
    if (sugMinReqAccBal.isZero() && BN_Scp_Plus_Deposit.isZero()) return 'both zeroes'
    if (sugMinReqAccBal.gt(BN_Scp_Plus_Deposit))
      return truncateValue(formatUnits(sugMinReqAccBal.sub(BN_Scp_Plus_Deposit)), 2)
    return 'meets requirement'
  }, [scpBalance, sugMinReqAccBal, enteredDeposit, selectedCoinPrice])

  const selectedCoinBalance = useMemo(
    () => batchBalanceData.find((d) => d.address.toLowerCase() == selectedCoin.address.toLowerCase())?.balance ?? ZERO,
    [batchBalanceData, selectedCoin]
  )

  // TODO - uncomment this when the smart functions are working
  const newUserState = useMemo(() => [InterfaceState.NEW_USER].includes(userState), [userState])
  const returningUserState = useMemo(() => [InterfaceState.RETURNING_USER].includes(userState), [userState])
  const curUserState = useMemo(() => [InterfaceState.CURRENT_USER].includes(userState), [userState])

  const depositCta = useMemo(() => [InterfaceState.DEPOSITING].includes(interfaceState), [interfaceState])
  const withdrawCta = useMemo(() => [InterfaceState.WITHDRAWING].includes(interfaceState), [interfaceState])
  const homeCta = useMemo(() => !depositCta && !withdrawCta, [depositCta, withdrawCta])

  const [suggestedCoverLimit, setSuggestedCoverLimit] = useState<BigNumber>(ZERO)

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

  // MANUALLY ADJUST INTERFACE STATE HERE FOR NOW
  // const newUserState = false
  // const curUserState = true
  // const returningUserState = false

  // const depositCta = false
  // const withdrawCta = false

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

  const handleCodeApplication = async (res: { tx: TransactionResponse | null; localTx: LocalTx | null }) => {
    if (!res.tx || !res.localTx) return res
    if (!account || !cookieReferralCode || appliedReferralCode) return res
    const policyId: BigNumber = await policyOf(account)
    if (policyId?.isZero()) return res
    const date = Date.now()
    await applyReferralCode(cookieReferralCode, policyId.toNumber(), activeNetwork.chainId).then((r) => {
      if (r) {
        makeApiToast('Referral Code Applied', TransactionCondition.SUCCESS, date)
      } else {
        makeApiToast('Referral Code Failed', TransactionCondition.FAILURE, date)
      }
    })
    return res
  }

  const callPurchase = async () => {
    if (!account) return
    handleTransactionLoading(true)
    await purchase(account, suggestedCoverLimit)
      .then((res) => handleCodeApplication(res))
      .then((res) => _handleToast(res.tx, res.localTx))
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
      .then((res) => handleCodeApplication(res))
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
      suggestedCoverLimit,
      selectedCoin.address,
      parseUnits(enteredDeposit, selectedCoin.decimals),
      tokenSignature.price,
      tokenSignature.deadline,
      tokenSignature.signature
    )
      .then((res) => handleCodeApplication(res))
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

  const callCancel = async () => {
    if (!account || !signatureObj) return
    const test1 = {
      premium_usd: 3.5900359601031178,
      premium: 3590035960103117800,
      policyholder: '0x1271e2acD0d209FA490692F5578239583Cde4073',
      deadline: 1655506122,
      signature:
        '0x5f76b378d2d59d7a7a71842af8e8dee223b93bde4a1a335e565b0d2d3bc03b587bf55de13a89c237ccb0e279bfa5d665a8e66713ee07275a1c9f076f6364624d1c',
    }

    const test2 = {
      premium_usd: 3.833,
      premium: 3833000000000000000,
      policyholder: '0xfb5cAAe76af8D3CE730f3D62c6442744853d43Ef',
      deadline: 1655506228,
      signature:
        '0x88e2ba2e6021e358b3e9514a773f916c986e4713b43ece883bda036677587ec611f246c8d0502a0079e36a5be4f9342a81e8ed522644401694b39237fef5ac001b',
    }

    const test3 = {
      premium_usd: 2.95,
      premium: 2950000000000000000,
      policyholder: '0x501AcE0e8D16B92236763E2dEd7aE3bc2DFfA276',
      deadline: 1655506267,
      signature:
        '0xe2638905d37e28580ad40c169a78ec823e36a3706980cdbacc1e3e3b0c0cfc5132751671abbb033fb46c8d5a00ec482d0319956e761ad6f601fdf6f7e26ac96a1c',
    }

    const test4 = {
      premium_usd: 4.920385,
      premium: 4920385000000000000,
      policyholder: '0x34Bb9e91dC8AC1E13fb42A0e23f7236999e063D4',
      deadline: 1655506319,
      signature:
        '0x1c30441912b44044f95d8c6b6490652a5808e9ed076077b2875e80c91d46b99c7b37d9d7608c15837eac22020594f8eca8e22c8e9e60e3b65cd1472c7f5975af1c',
    }

    handleTransactionLoading(true)
    await cancel(test4.premium.toString(), test4.deadline, test4.signature)
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callCancel', err, FunctionName.COVER_CANCEL))
  }

  const callWithdraw = async () => {
    if (!account || !signatureObj || refundableSOLACEAmount.isZero()) return
    const signature = signatureObj.signatures[`${activeNetwork.chainId}`]
    const tokenSignature: any = Object.values(signature)[0]
    handleTransactionLoading(true)
    const parsedWithdrawal = parseUnits(formatAmount(enteredWithdrawal), selectedCoin.decimals)
    const amountToWithdraw = refundableSOLACEAmount.gt(parsedWithdrawal) ? parsedWithdrawal : refundableSOLACEAmount
    await withdraw(account, amountToWithdraw, tokenSignature.price, tokenSignature.deadline, tokenSignature.signature)
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callWithdraw', err, FunctionName.COVER_WITHDRAW))
  }

  const _handleToast = (tx: any, localTx: any) => {
    handleEnteredWithdrawal('')
    handleEnteredDeposit('')
    handleTransactionLoading(false)
    handleToast(tx, localTx)
  }

  const _handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    handleContractCallError(functionName, err, txType)
    handleTransactionLoading(false)
  }

  const getRefundableSOLACEAmount = useCallback(async () => {
    if (!account || !scpObj) {
      setRefundableSOLACEAmount(ZERO)
      return
    }
    const signature = signatureObj.signatures[`${activeNetwork.chainId}`]
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
      <Flex justifyCenter mb={36}>
        <Text big2 mont style={{ marginLeft: 'auto', marginRight: 'auto', fontWeight: '600' }}>
          My Policy
        </Text>
      </Flex>
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
              {[2, 3, 4, 5].includes(fetchStatus) && newUserState && (
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
                    // gridTemplateColumns: '1fr 1fr',
                    // display: 'grid',
                    // position: 'relative',
                    // gap: '15px',
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
                    <Flex>Manage your referrals (Work In Progress)</Flex>
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
                        <Text textAlignCenter bold t4s dark>
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
                        <Text textAlignCenter bold t4s dark>
                          {truncateValue(policyDuration, 2)}
                        </Text>
                      </Flex>
                    </Flex>
                  )}
                  {(newUserState || returningUserState) &&
                    (insufficientCovCap ? (
                      <Text textAlignCenter pb={12}>
                        Please choose a lower cover limit to activate the policy.
                      </Text>
                    ) : lackingScp != 'meets requirement' && lackingScp != 'both zeroes' ? (
                      <Text textAlignCenter pb={12}>
                        You need at least ${lackingScp} for the suggested cover limit. Lower the value or use the form
                        below to deposit the additional premium.
                      </Text>
                    ) : null)}
                  <Flex col gap={12}>
                    {(depositCta || newUserState) && (
                      <div>
                        <DropdownInputSection
                          hasArrow
                          isOpen={coinsOpen}
                          placeholder={'Enter amount'}
                          icon={<img src={`https://assets.solace.fi/${selectedCoin.name.toLowerCase()}`} height={16} />}
                          text={selectedCoin.symbol}
                          value={enteredDeposit}
                          onChange={(e) =>
                            handleEnteredDeposit(filterAmount(e.target.value, enteredDeposit), selectedCoin.decimals)
                          }
                          onClick={() => setCoinsOpen(!coinsOpen)}
                        />
                        <BalanceDropdownOptions
                          isOpen={coinsOpen}
                          searchedList={batchBalanceData}
                          onClick={(value: string) => {
                            handleSelectedCoin(value)
                            setCoinsOpen(false)
                          }}
                        />
                      </div>
                    )}
                    {withdrawCta && (
                      <Flex col gap={8}>
                        <Flex between>
                          <Flex col>
                            <Text t4>Withdrawable:</Text>
                          </Flex>
                          <Flex gap={5}>
                            <Flex col>
                              <Text t4>{truncateValue(formatUnits(refundableSOLACEAmount, 18), 2)} SOLACE</Text>
                            </Flex>
                            <Flex col>
                              <Text t4>{`~ $${truncateValue(
                                signatureObj.price > 0
                                  ? parseFloat(formatUnits(refundableSOLACEAmount, 18)) * signatureObj.price
                                  : 0,
                                2
                              )}`}</Text>
                            </Flex>
                          </Flex>
                        </Flex>
                        <DropdownInputSection
                          placeholder={'Enter amount'}
                          icon={<img src={`https://assets.solace.fi/solace`} height={16} />}
                          text={'SOLACE'}
                          value={enteredWithdrawal}
                          onChange={(e) => handleEnteredWithdrawal(filterAmount(e.target.value, enteredWithdrawal))}
                        />
                      </Flex>
                    )}
                    <ButtonWrapper isColumn p={0}>
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
                              !isAcceptableDeposit)
                          }
                        >
                          <Text bold t4s>
                            Activate Policy
                          </Text>
                        </Button>
                      )}
                      {(newUserState || returningUserState) && !depositApproval && homeCta && (
                        <Button
                          {...gradientStyle}
                          {...bigButtonStyle}
                          secondary
                          noborder
                          onClick={() => unlimitedApproveCPM(selectedCoin.address)}
                        >
                          <Text bold t4s>
                            Approve
                          </Text>
                        </Button>
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
                            <Button
                              {...gradientStyle}
                              {...bigButtonStyle}
                              secondary
                              noborder
                              onClick={() => unlimitedApproveCPM(selectedCoin.address)}
                              widthP={100}
                            >
                              <Text bold t4s>
                                Approve
                              </Text>
                            </Button>
                          )}
                          {depositApproval && (
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
                          )}
                          <ButtonWrapper p={0} style={{ width: '100%' }}>
                            <Button
                              pt={16}
                              pb={16}
                              separator
                              onClick={() => {
                                handleCtaState(undefined)
                                handleEnteredDeposit('')
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
                                onClick={() =>
                                  handleEnteredDeposit(
                                    formatUnits(selectedCoinBalance, selectedCoin.decimals),
                                    selectedCoin.decimals
                                  )
                                }
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
                                handleEnteredWithdrawal('')
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
                              onClick={() => handleEnteredWithdrawal(formatUnits(refundableSOLACEAmount, 18))}
                              disabled={refundableSOLACEAmount.isZero()}
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
              {[2, 3, 4, 5].includes(fetchStatus) && !newUserState && (
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
