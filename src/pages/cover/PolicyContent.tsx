import useDebounce from '@rooks/use-debounce'
import { useWeb3React } from '@web3-react/core'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { StyledExpand, StyledOptions, StyledCalculator } from '../../components/atoms/Icon'
import { Flex, VerticalSeparator } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { TileCard } from '../../components/molecules/TileCard'
import { ZERO } from '../../constants'
import { FunctionName, InterfaceState } from '../../constants/enums'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { useCoverageFunctions, useExistingPolicy } from '../../hooks/policy/useSolaceCoverProductV3'
import { accurateMultiply, filterAmount, floatUnits, formatAmount, truncateValue } from '../../utils/formatting'
import { useCoverageContext } from './CoverageContext'
import { BalanceDropdownOptions, DropdownInputSection, DropdownOptions } from './Dropdown'

import Zapper from '../../resources/svg/zapper.svg'
import ZapperDark from '../../resources/svg/zapper-dark.svg'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { LoaderText } from '../../components/molecules/LoaderText'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { parseUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import { RaisedBox } from '../../components/atoms/Box'
import { COVER_PAYMENT_MANAGER_ADDRESS, SOLACE_COVER_PRODUCT_V3_ADDRESS } from '@solace-fi/sdk-nightly'

export const PolicyContent = (): JSX.Element => {
  const { intrface, styles, input, dropdowns, policy, portfolioKit } = useCoverageContext()
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
    enteredWithdrawal: asyncEnteredWithdrawal,
    enteredCoverLimit,
    handleEnteredDeposit,
    handleEnteredWithdrawal,
    isAcceptableDeposit,
    selectedCoin,
    handleSelectedCoin,
  } = input
  const {
    policyId,
    existingPolicyId,
    existingPolicyNetwork,
    status,
    curCoverageLimit,
    scpBalance,
    doesMeetMinReqAccBal,
    scpObj,
    signatureObj,
    depositApproval,
    minReqScpBal,
    minReqAccBal,
    unlimitedApproveCPM,
  } = policy
  const { batchBalanceData, coinsOpen, setCoinsOpen } = dropdowns
  const { curPortfolio, curDailyCost, curUsdBalanceSum } = portfolioKit

  const [enteredWithdrawal, setEnteredWithdrawal] = useState<string>(asyncEnteredWithdrawal)

  const { account } = useWeb3React()
  const { activeNetwork, changeNetwork } = useNetwork()
  const { isMobile } = useWindowDimensions()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  const {
    purchaseWithStable,
    purchaseWithNonStable,
    purchase,
    cancel,
    withdraw,
    getBalanceOfNonRefundable,
    depositStable,
    depositNonStable,
  } = useCoverageFunctions()

  const [showExistingPolicyMessage, setShowExistingPolicyMessage] = useState<boolean>(true)
  const firstTime = useMemo(() => existingPolicyId.isZero(), [existingPolicyId])
  const policyDuration = useMemo(() => (curDailyCost > 0 ? parseFloat(scpBalance) / curDailyCost : 0), [
    curDailyCost,
    scpBalance,
  ])

  // TODO - uncomment this when the smart functions are working
  const newUserState = useMemo(() => [InterfaceState.NEW_USER].includes(userState), [userState])
  const returningUserState = useMemo(() => [InterfaceState.RETURNING_USER].includes(userState), [userState])
  const curUserState = useMemo(() => [InterfaceState.CURRENT_USER].includes(userState), [userState])

  const depositCta = useMemo(() => [InterfaceState.DEPOSITING].includes(interfaceState), [interfaceState])
  const withdrawCta = useMemo(() => [InterfaceState.WITHDRAWING].includes(interfaceState), [interfaceState])

  // MANUALLY ADJUST INTERFACE STATE HERE FOR NOW
  // const newUserState = false
  // const curUserState = true
  // const returningUserState = false

  // const depositCta = false
  // const withdrawCta = false

  const [refundableSOLACEAmount, setRefundableSOLACEAmount] = useState<BigNumber>(ZERO)
  const [withdrawingMoreThanRefundable, setWithdrawingMoreThanRefundable] = useState<boolean>(false)

  const isAcceptableWithdrawal = useMemo(() => {
    const BN_enteredWithdrawal = parseUnits(formatAmount(enteredWithdrawal), 18)
    if (BN_enteredWithdrawal.isZero()) return false
    setWithdrawingMoreThanRefundable(refundableSOLACEAmount.gt(BN_enteredWithdrawal))
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

  const callPurchase = async () => {
    if (!account) return
    handleTransactionLoading(true)
    await purchase(account, enteredCoverLimit)
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callPurchase', err, FunctionName.COVER_PURCHASE))
  }

  const callPurchaseWithStable = async () => {
    if (!account || !depositApproval) return
    handleTransactionLoading(true)
    await purchaseWithStable(
      account,
      enteredCoverLimit,
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
      enteredCoverLimit,
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

  const callCancel = async () => {
    if (!account || !signatureObj) return
    const signature = signatureObj.signatures[`${activeNetwork.chainId}`]
    const tokenSignature: any = Object.values(signature)[0]
    handleTransactionLoading(true)
    // await cancel()
    //   .then((res) => _handleToast(res.tx, res.localTx))
    //   .catch((err) => _handleContractCallError('callCancel', err, FunctionName.COVER_CANCEL))
  }

  const callWithdraw = async () => {
    if (!account || !signatureObj || refundableSOLACEAmount.isZero()) return
    const signature = signatureObj.signatures[`${activeNetwork.chainId}`]
    const tokenSignature: any = Object.values(signature)[0]
    handleTransactionLoading(true)
    const amountToWithdraw = refundableSOLACEAmount.gt(parseUnits(enteredWithdrawal, selectedCoin.decimals))
      ? parseUnits(enteredWithdrawal, selectedCoin.decimals)
      : refundableSOLACEAmount
    const nr = await getBalanceOfNonRefundable(account)
    let refundableSCP1 = ZERO
    let refundableSCP2 = ZERO
    if (parseUnits(scpBalance, 18).gt(nr)) {
      refundableSCP1 = parseUnits(scpBalance, 18).sub(nr)
      const float_refundableSCP1 = floatUnits(refundableSCP1, 18)
      refundableSCP2 = parseUnits(scpBalance, 18).sub(minReqScpBal)
      const float_refundableSCP2 = floatUnits(refundableSCP2, 18)
      console.log('current cover limit', floatUnits(curCoverageLimit, 18))
      console.log('mrab', floatUnits(minReqAccBal, 18))
      console.log('scpBalance', scpBalance)
      console.log('nonrefundable', floatUnits(nr, 18))
      console.log('minScpRequired', floatUnits(minReqScpBal, 18))
      console.log('scpBalance - nonrefundable SCP', float_refundableSCP1)
      console.log('scpBalance - minScpRequired SCP', float_refundableSCP2)
      console.log('refundableSOLACEAmount SOLACE', floatUnits(refundableSOLACEAmount, 18))
      console.log('scpBalance - nonrefundable SOLACE', float_refundableSCP1 / signatureObj.price)
      console.log('scpBalance - minScpRequired SOLACE', float_refundableSCP2 / signatureObj.price)
      console.log('swc3', SOLACE_COVER_PRODUCT_V3_ADDRESS[activeNetwork.chainId])
      console.log('cpm', COVER_PAYMENT_MANAGER_ADDRESS[activeNetwork.chainId])
    }
    await withdraw(account, amountToWithdraw, tokenSignature.price, tokenSignature.deadline, tokenSignature.signature)
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callWithdraw', err, FunctionName.COVER_WITHDRAW))
  }

  const _handleToast = (tx: any, localTx: any) => {
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

  const _editWithdrawal = useDebounce(() => {
    handleEnteredWithdrawal(enteredWithdrawal)
  }, 200)

  const _getRefundableSOLACEAmount = useDebounce(() => {
    getRefundableSOLACEAmount()
  }, 300)

  useEffect(() => {
    _editWithdrawal()
    _getRefundableSOLACEAmount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enteredWithdrawal])

  useEffect(() => {
    if (!policyId || policyId?.eq(ZERO)) {
      handleUserState(InterfaceState.NEW_USER)
    } else if (!status) {
      handleUserState(InterfaceState.RETURNING_USER)
    } else {
      handleUserState(InterfaceState.CURRENT_USER)
    }
  }, [policyId, status, handleUserState])

  useEffect(() => {
    setShowExistingPolicyMessage(true)
  }, [activeNetwork.chainId])

  // useEffect(() => {
  //   setEnteredDeposit(asyncEnteredDeposit)
  // }, [asyncEnteredDeposit])

  useEffect(() => {
    setEnteredWithdrawal(asyncEnteredWithdrawal)
  }, [asyncEnteredWithdrawal])

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
              {curPortfolio && curPortfolio.protocols.length == 0 && newUserState && (
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
                          Portfolio Simulator
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
                    noPadding
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
                    ) : (
                      <Text t4s style={{ lineHeight: '14px' }} bold {...gradientStyle}>
                        ${truncateValue(curUsdBalanceSum, 2)}
                      </Text>
                    )}
                  </TileCard>
                  <TileCard
                    bigger
                    noPadding
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
                        {curUserState ? `My Cover Limit` : `Entered Cover Limit`}
                      </Text>
                      <Text info>
                        <StyledOptions size={12} />
                      </Text>
                    </Flex>
                    <Text t4s style={{ lineHeight: '14px' }} bold {...gradientStyle}>
                      ${truncateValue(floatUnits(curUserState ? curCoverageLimit : enteredCoverLimit, 18), 2)}
                    </Text>
                  </TileCard>
                </div>
              </Flex>
              <Flex button noborder py={6.5} px={16} mx={20} mt={12} bgRaised style={{ borderRadius: '8px' }}>
                <Text t5s bold info>
                  <Flex itemsCenter gap={12} onClick={() => handleShowReferralModal(true)}>
                    <StyledOptions width={12} />
                    <Flex>Manage your referrals</Flex>
                  </Flex>
                </Text>
              </Flex>
              <div style={{ margin: '16px 20px auto' }}>
                <Flex shadow bgSecondary col rounded px={24} py={16}>
                  <Flex stretch between pb={16}>
                    <Flex col>
                      <Text bold t4 {...gradientStyle}>
                        My Subscription Cost
                      </Text>
                    </Flex>
                    <Text bold t4 {...gradientStyle}>
                      ${truncateValue(curDailyCost, 2)}
                      <Text t7s style={{ backgroundColor: 'green' }} techygradient inline ml={2}>
                        / Day
                      </Text>
                    </Text>
                  </Flex>
                  {(curUserState || returningUserState) && (
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
                      <DropdownInputSection
                        placeholder={'Enter amount'}
                        icon={<img src={`https://assets.solace.fi/solace`} height={16} />}
                        text={'SOLACE'}
                        value={enteredWithdrawal}
                        onChange={(e) => setEnteredWithdrawal(filterAmount(e.target.value, enteredWithdrawal))}
                      />
                    )}
                    <ButtonWrapper isColumn p={0}>
                      {newUserState && depositApproval && (
                        <Button
                          {...gradientStyle}
                          {...bigButtonStyle}
                          secondary
                          noborder
                          onClick={handlePurchase}
                          disabled={
                            enteredCoverLimit.isZero() ||
                            portfolioLoading ||
                            !doesMeetMinReqAccBal ||
                            (!parseUnits(formatAmount(enteredDeposit), selectedCoin.decimals).isZero() &&
                              !isAcceptableDeposit)
                          }
                        >
                          <Text bold t4s>
                            Subscribe to Policy
                          </Text>
                        </Button>
                      )}
                      {returningUserState && !depositCta && !withdrawCta && depositApproval && (
                        <Button
                          success
                          {...bigButtonStyle}
                          onClick={handlePurchase}
                          disabled={
                            enteredCoverLimit.isZero() ||
                            portfolioLoading ||
                            !doesMeetMinReqAccBal ||
                            (!parseUnits(formatAmount(enteredDeposit), selectedCoin.decimals).isZero() &&
                              !isAcceptableDeposit)
                          }
                        >
                          <Text bold t4s>
                            Activate Policy
                          </Text>
                        </Button>
                      )}
                      {!depositApproval && newUserState && (
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
                      {depositApproval && (curUserState || returningUserState) && !depositCta && !withdrawCta && (
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
                      {(curUserState || returningUserState) && !depositCta && !withdrawCta && (
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
                        <ButtonWrapper style={{ width: '100%' }} p={0}>
                          <Button pt={16} pb={16} separator onClick={() => handleCtaState(undefined)}>
                            Cancel
                          </Button>
                          {depositApproval && (
                            <Button
                              {...bigButtonStyle}
                              matchBg
                              secondary
                              noborder
                              onClick={handleDeposit}
                              disabled={!isAcceptableDeposit}
                            >
                              <Text {...gradientStyle}>Deposit</Text>
                            </Button>
                          )}
                          {!depositApproval && (
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
                        </ButtonWrapper>
                      )}
                      {withdrawCta && (
                        <ButtonWrapper style={{ width: '100%' }} p={0}>
                          <Button pt={16} pb={16} separator onClick={() => handleCtaState(undefined)}>
                            Cancel
                          </Button>
                          <Button
                            {...bigButtonStyle}
                            matchBg
                            secondary
                            noborder
                            onClick={callWithdraw}
                            disabled={!isAcceptableWithdrawal || refundableSOLACEAmount.isZero()}
                          >
                            <Text {...gradientStyle}>Withdraw</Text>
                          </Button>
                        </ButtonWrapper>
                      )}
                      {curUserState && !depositCta && !withdrawCta && (
                        <Button {...bigButtonStyle} error onClick={callCancel}>
                          Deactivate Policy
                        </Button>
                      )}
                    </ButtonWrapper>
                  </Flex>
                </Flex>
              </div>
              {curPortfolio && curPortfolio.protocols.length > 0 && (
                <Flex col gap={16} marginAuto pt={36} px={44}>
                  <Text t4 textAlignCenter>
                    Get a quote for non-existing portfolio positions by simulating your portfolio.
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
                          Portfolio Simulator
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
