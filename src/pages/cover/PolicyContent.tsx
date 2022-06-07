import useDebounce from '@rooks/use-debounce'
import { useWeb3React } from '@web3-react/core'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { StyledClock, StyledOptions } from '../../components/atoms/Icon'
import { Content, Flex, HeroContainer, VerticalSeparator } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { TileCard } from '../../components/molecules/TileCard'
import { ZERO } from '../../constants'
import { FunctionName, InterfaceState } from '../../constants/enums'
import { useGeneral } from '../../context/GeneralManager'
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
import { Price, SCP } from '@solace-fi/sdk-nightly'
import { BigNumber } from 'ethers'

export const PolicyContent = (): JSX.Element => {
  const { intrface, styles, input, dropdowns, policy, portfolioKit } = useCoverageContext()
  const {
    navbarThreshold,
    coverageLoading,
    existingPolicyLoading,
    portfolioLoading,
    interfaceState,
    userState,
    handleUserState,
    handleCtaState,
    handleShowPortfolioModal,
    handleShowCLDModal,
    handleShowSimulatorModal,
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
  } = policy
  const { batchBalanceData, coinsOpen, setCoinsOpen } = dropdowns
  const { curPortfolio, curDailyCost, curUsdBalanceSum } = portfolioKit

  const [enteredWithdrawal, setEnteredWithdrawal] = useState<string>(asyncEnteredWithdrawal)

  const { appTheme } = useGeneral()
  const { account } = useWeb3React()
  const { latestBlock, signer } = useProvider()
  const { activeNetwork, changeNetwork } = useNetwork()
  const { isMobile } = useWindowDimensions()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  const { purchaseWithStable, purchaseWithNonStable, purchase, cancel, withdraw } = useCoverageFunctions()

  const [showExistingPolicyMessage, setShowExistingPolicyMessage] = useState<boolean>(true)
  const firstTime = useMemo(() => existingPolicyId.isZero(), [existingPolicyId])
  const policyDuration = useMemo(() => (curDailyCost > 0 ? parseFloat(scpBalance) / curDailyCost : 0), [
    curDailyCost,
    scpBalance,
  ])

  // TODO - uncomment this when the smart functions are working
  // const newUserState = useMemo(() => [InterfaceState.NEW_USER].includes(userState), [userState])
  // const returningUserState = useMemo(() => [InterfaceState.RETURNING_USER].includes(userState), [userState])
  // const curUserState = useMemo(() => [InterfaceState.CURRENT_USER].includes(userState), [userState])

  // const depositCta = useMemo(() => [InterfaceState.DEPOSITING].includes(interfaceState), [interfaceState])
  // const withdrawCta = useMemo(() => [InterfaceState.WITHDRAWING].includes(interfaceState), [interfaceState])

  // MANUALLY ADJUST INTERFACE STATE HERE FOR NOW
  const newUserState = false
  const curUserState = false
  const returningUserState = true

  const depositCta = true
  const withdrawCta = false

  const [refundableSOLACEAmount, setRefundableSOLACEAmount] = useState<BigNumber>(ZERO)
  const [withdrawingMoreThanRefundable, setWithdrawingMoreThanRefundable] = useState<boolean>(false)

  const [signatureObj, setSignatureObj] = useState<any>(undefined)

  const isAcceptableWithdrawal = useMemo(() => {
    const BN_enteredWithdrawal = parseUnits(formatAmount(enteredWithdrawal), 18)
    if (BN_enteredWithdrawal.isZero()) return false
    setWithdrawingMoreThanRefundable(refundableSOLACEAmount.gt(BN_enteredWithdrawal))
    return true
  }, [enteredWithdrawal, refundableSOLACEAmount])

  const callPurchase = async () => {
    if (!account) return
    await purchase(account, enteredCoverLimit)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callPurchase', err, FunctionName.COVER_PURCHASE))
  }

  const callPurchaseWithStable = async () => {
    if (!account) return
    await purchaseWithStable(
      account,
      enteredCoverLimit,
      selectedCoin.address,
      parseUnits(enteredDeposit, selectedCoin.decimals)
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callPurchaseWithStable', err, FunctionName.COVER_PURCHASE_WITH_STABLE))
  }

  const callPurchaseWithNonStable = async () => {
    if (!account) return
    await purchaseWithNonStable(
      account,
      enteredCoverLimit,
      selectedCoin.address,
      parseUnits(enteredDeposit, selectedCoin.decimals),
      signatureObj.price,
      signatureObj.deadline,
      signatureObj.signature
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) =>
        handleContractCallError('callPurchaseWithNonStable', err, FunctionName.COVER_PURCHASE_WITH_NON_STABLE)
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
    if (!account) return
    await cancel()
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callCancel', err, FunctionName.COVER_CANCEL))
  }

  const getRefundableSOLACEAmount = useCallback(async () => {
    if (!account) {
      setRefundableSOLACEAmount(ZERO)
      setSignatureObj(undefined)
      return
    }
    const p = new Price()
    const priceInfo = await p.getPriceInfo()
    const scp = new SCP(activeNetwork.chainId, signer)
    const signature = priceInfo.signatures[`${activeNetwork.chainId}`]
    if (!signature) {
      setRefundableSOLACEAmount(ZERO)
      setSignatureObj(undefined)
      return
    }
    const tokenSignatureProps: any = Object.values(signature)[0]
    const refundableSOLACEAmount = await scp.getRefundableSOLACEAmount(
      account,
      tokenSignatureProps.price,
      tokenSignatureProps.deadline,
      tokenSignatureProps.signature
    )
    setRefundableSOLACEAmount(refundableSOLACEAmount)
    setSignatureObj(tokenSignatureProps)
  }, [account, activeNetwork.chainId, signer])

  const callWithdraw = async () => {
    if (!account || !signatureObj || refundableSOLACEAmount.isZero()) return
    const amountToWithdraw = refundableSOLACEAmount.gt(parseUnits(enteredWithdrawal, selectedCoin.decimals))
      ? parseUnits(enteredWithdrawal, selectedCoin.decimals)
      : refundableSOLACEAmount
    await withdraw(account, amountToWithdraw, signatureObj.price, signatureObj.deadline, signatureObj.signature)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callWithdraw', err, FunctionName.COVER_WITHDRAW))
  }

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
    <Content>
      <div
        style={{
          backgroundColor: 'red',
          width: '375px',
        }}
      >
        {coverageLoading || existingPolicyLoading ? (
          <Flex col gap={24} m={isMobile ? 20 : undefined}>
            <LoaderText text={'Loading'} />
          </Flex>
        ) : (
          <Flex col gap={24}>
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
                  <Flex col gap={8} marginAuto>
                    <Text mont t3 textAlignCenter>
                      Your portfolio is empty.
                    </Text>
                    <Text mont t3 textAlignCenter>
                      You may simulate a portfolio to see the cost of coverage.
                    </Text>
                    <Flex stretch flex1>
                      <Button
                        {...gradientStyle}
                        {...bigButtonStyle}
                        secondary
                        noborder
                        onClick={() => handleShowSimulatorModal(true)}
                      >
                        <Text bold t4s>
                          Enter Simulator
                        </Text>
                      </Button>
                    </Flex>
                  </Flex>
                )}
                <Flex center>
                  <div
                    style={{
                      width: navbarThreshold ? '50%' : '100%',
                      gridTemplateColumns: '1fr 1fr',
                      display: 'grid',
                      position: 'relative',
                      gap: '15px',
                    }}
                  >
                    <TileCard bigger padding={16}>
                      <Flex between style={{ alignItems: 'center' }}>
                        <Text bold>My Portfolio</Text>
                        <Button width={40} noborder onClick={() => handleShowPortfolioModal(true)}>
                          <Text info>
                            <StyledOptions size={20} />
                          </Text>
                        </Button>
                      </Flex>
                      {portfolioLoading ? (
                        <LoaderText text={'Fetching'} />
                      ) : (
                        <Text t3s bold {...gradientStyle} pt={8}>
                          ${truncateValue(curUsdBalanceSum, 2)}
                        </Text>
                      )}
                    </TileCard>
                    <TileCard bigger padding={16}>
                      <Flex between style={{ alignItems: 'center' }}>
                        <Text bold>My Cover Limit</Text>
                        <Button width={40} noborder onClick={() => handleShowCLDModal(true)}>
                          <Text info>
                            <StyledOptions size={20} />
                          </Text>
                        </Button>
                      </Flex>
                      <Text pt={8}>
                        <TextSpan t3s bold {...gradientStyle}>
                          ${truncateValue(floatUnits(curCoverageLimit, 18), 2)}
                        </TextSpan>
                      </Text>
                    </TileCard>
                  </div>
                </Flex>
                <div style={{ margin: 'auto' }}>
                  <TileCard>
                    <Flex stretch between pb={16}>
                      <Flex col>
                        <Text bold t4 {...gradientStyle}>
                          My Subscription Cost
                        </Text>
                      </Flex>
                      <Flex col>
                        <Text bold t4 {...gradientStyle}>
                          ${truncateValue(curDailyCost, 2)} / Day
                        </Text>
                      </Flex>
                    </Flex>
                    {(curUserState || returningUserState) && (
                      <Flex stretch between center pb={24}>
                        <div
                          style={{
                            gridTemplateColumns: '1fr 0fr 1fr 0fr 1fr',
                            display: 'grid',
                            position: 'relative',
                            gap: '12px',
                          }}
                        >
                          <Flex col>
                            <Text bold t4 textAlignCenter>
                              My Balance
                            </Text>
                            <Text textAlignCenter bold t3 {...gradientStyle}>
                              ${truncateValue(scpBalance, 2)}
                            </Text>
                          </Flex>
                          <VerticalSeparator />
                          <Flex col>
                            <Text bold t4 textAlignCenter>
                              Policy Status
                            </Text>
                            {status ? (
                              <Text textAlignCenter bold t3 success>
                                Active
                              </Text>
                            ) : (
                              <Text textAlignCenter bold t3 error>
                                Inactive
                              </Text>
                            )}
                          </Flex>
                          <VerticalSeparator />
                          <Flex col>
                            <Text bold t4 textAlignCenter>
                              Est. Days
                            </Text>
                            <Text textAlignCenter bold t3 {...gradientStyle}>
                              {truncateValue(policyDuration, 2)}
                            </Text>
                          </Flex>
                        </div>
                      </Flex>
                    )}
                    <Flex col gap={12}>
                      {(depositCta || newUserState) && (
                        <div>
                          <DropdownInputSection
                            hasArrow
                            isOpen={coinsOpen}
                            placeholder={'Enter amount'}
                            icon={
                              <img src={`https://assets.solace.fi/${selectedCoin.name.toLowerCase()}`} height={16} />
                            }
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
                        {newUserState && (
                          <Button
                            {...gradientStyle}
                            {...bigButtonStyle}
                            secondary
                            noborder
                            onClick={handlePurchase}
                            disabled={
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
                        {returningUserState && !depositCta && !withdrawCta && (
                          <Button
                            success
                            {...bigButtonStyle}
                            onClick={handlePurchase}
                            disabled={
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
                        {(curUserState || returningUserState) && !depositCta && !withdrawCta && (
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
                            <Text bold t4s>
                              Withdraw
                            </Text>
                          </Button>
                        )}
                        {depositCta && (
                          <ButtonWrapper style={{ width: '100%' }} p={0}>
                            <Button pt={16} pb={16} separator onClick={() => handleCtaState(undefined)}>
                              Cancel
                            </Button>
                            <Button
                              {...bigButtonStyle}
                              matchBg
                              secondary
                              noborder
                              onClick={handlePurchase}
                              disabled={!isAcceptableDeposit}
                            >
                              <Text {...gradientStyle}>Deposit</Text>
                            </Button>
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
                  </TileCard>
                </div>
                {curPortfolio && curPortfolio.protocols.length > 0 && (
                  <Flex col gap={8} marginAuto pt={36}>
                    <Text mont t3 textAlignCenter>
                      See the predicted coverage cost for a customized portfolio through the simulator.
                    </Text>
                    <Flex stretch flex1>
                      <Button
                        {...gradientStyle}
                        {...bigButtonStyle}
                        secondary
                        noborder
                        onClick={() => handleShowSimulatorModal(true)}
                      >
                        <Text bold t4s>
                          Enter Simulator
                        </Text>
                      </Button>
                    </Flex>
                  </Flex>
                )}
              </>
            )}
          </Flex>
        )}
      </div>
    </Content>
  )
}
