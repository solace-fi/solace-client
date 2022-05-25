import useDebounce from '@rooks/use-debounce'
import { useWeb3React } from '@web3-react/core'
import React, { useEffect, useMemo, useState } from 'react'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { StyledClock, StyledOptions } from '../../components/atoms/Icon'
import { Content, Flex, VerticalSeparator } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { TileCard } from '../../components/molecules/TileCard'
import { ZERO } from '../../constants'
import { FunctionName, InterfaceState } from '../../constants/enums'
import { useCachedData } from '../../context/CachedDataManager'
import { useGeneral } from '../../context/GeneralManager'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { useCoverageFunctions, useExistingPolicy } from '../../hooks/policy/useSolaceCoverProductV3'
import { filterAmount } from '../../utils/formatting'
import { useCoverageContext } from './CoverageContext'
import { BalanceDropdownOptions, DropdownInputSection, DropdownOptions } from './Dropdown'

import Zapper from '../../resources/svg/zapper.svg'
import ZapperDark from '../../resources/svg/zapper-dark.svg'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { LoaderText } from '../../components/molecules/LoaderText'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'

export const PolicyContent = (): JSX.Element => {
  const { intrface, styles, input, dropdowns, policy } = useCoverageContext()
  const { navbarThreshold, coverageLoading, handleUserState } = intrface
  const { bigButtonStyle, gradientStyle } = styles
  const {
    enteredAmount: asyncEnteredAmount,
    enteredDays: asyncEnteredDays,
    setEnteredDays: setAsyncEnteredDays,
    handleInputChange: handleAmountChange,
    isAcceptableAmount,
    selectedCoin,
    handleSelectedCoin,
  } = input
  const { policyId, newCoverageLimit } = policy
  const { daysOptions, batchBalanceData, daysOpen, coinsOpen, setDaysOpen, setCoinsOpen } = dropdowns

  const [enteredDays, setEnteredDays] = useState<string>(asyncEnteredDays)
  const [enteredAmount, setEnteredAmount] = useState<string>(asyncEnteredAmount)

  const { appTheme } = useGeneral()
  const { account } = useWeb3React()
  const { latestBlock, signer } = useProvider()
  const { activeNetwork, changeNetwork } = useNetwork()
  const { version } = useCachedData()
  const { isMobile } = useWindowDimensions()
  const { policyId: existingPolicyId, network: existingPolicyNetwork, loading: existingLoading } = useExistingPolicy()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  const { getMinRequiredAccountBalance, getAvailableCoverCapacity, purchase, cancel } = useCoverageFunctions()

  const [showExistingPolicyMessage, setShowExistingPolicyMessage] = useState<boolean>(true)
  const firstTime = useMemo(() => existingPolicyId.isZero(), [existingPolicyId])

  // const buyCta = useMemo(() => [InterfaceState.BUYING].includes(intrface.interfaceState), [intrface.interfaceState])
  // const extendCta = useMemo(() => [InterfaceState.EXTENDING].includes(intrface.interfaceState), [
  //   intrface.interfaceState,
  // ])
  // const withdrawCta = useMemo(() => [InterfaceState.WITHDRAWING].includes(intrface.interfaceState), [
  //   intrface.interfaceState,
  // ])
  // const neutralCta = useMemo(() => [InterfaceState.NEUTRAL].includes(intrface.interfaceState), [
  //   intrface.interfaceState,
  // ])

  const buyCta = true
  const neutralCta = false
  const extendCta = false
  const withdrawCta = false

  const callPurchase = async () => {
    if (!account) return
    await purchase(newCoverageLimit)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callPurchase', err, FunctionName.COVER_PURCHASE))
  }

  const _editDays = useDebounce(() => {
    setAsyncEnteredDays(enteredDays)
  }, 200)

  const _editAmount = useDebounce(() => {
    handleAmountChange(enteredAmount)
  }, 200)

  useEffect(() => {
    _editDays()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enteredDays])

  useEffect(() => {
    _editAmount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enteredAmount])

  useEffect(() => {
    if (!status) {
      handleUserState(InterfaceState.BUYING)
    } else {
      handleUserState(InterfaceState.NEUTRAL)
    }
  }, [status, handleUserState])

  useEffect(() => {
    setShowExistingPolicyMessage(true)
  }, [activeNetwork.chainId])

  return (
    <Content>
      {coverageLoading || existingLoading ? (
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
              <Flex col>
                <Text mont {...gradientStyle} t2 textAlignCenter>
                  Ready to protect your portfolio?
                </Text>
                <Text mont t3 textAlignCenter pt={8}>
                  Here is the best policy price based on your portfolio and optimal coverage limit.
                </Text>
              </Flex>
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
                      <Text info>
                        <StyledOptions size={20} />
                      </Text>
                    </Flex>
                    <Text t3s bold {...gradientStyle} pt={8}>
                      $1
                    </Text>
                    <Flex pt={16}>??</Flex>
                  </TileCard>
                  <TileCard bigger padding={16}>
                    <Flex between style={{ alignItems: 'center' }}>
                      <Text bold>Pay as you go</Text>
                      <Text info>
                        <StyledOptions size={20} />
                      </Text>
                    </Flex>
                    <Text pt={8}>
                      <TextSpan t3s bold {...gradientStyle}>
                        $1
                      </TextSpan>
                      <TextSpan t6 bold pl={5}>
                        / Day
                      </TextSpan>
                    </Text>
                    <Flex col pt={16}>
                      <Text t7 bold>
                        Coverage Limit:
                      </Text>
                      <Text t6>Highest Position + 20%</Text>
                    </Flex>
                  </TileCard>
                </div>
              </Flex>
              <div style={{ margin: 'auto' }}>
                <TileCard>
                  <Flex stretch between center pb={24}>
                    <Flex col>
                      <Text bold t4>
                        My Balance
                      </Text>
                      <Text textAlignCenter bold t3 {...gradientStyle}>
                        $69
                      </Text>
                    </Flex>
                    <VerticalSeparator />
                    <Flex col>
                      <Text bold t4>
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
                      <Text bold t4>
                        Est. Days
                      </Text>
                      <Text textAlignCenter bold t3 {...gradientStyle}>
                        365
                      </Text>
                    </Flex>
                  </Flex>
                  <Flex col gap={12}>
                    <Flex col>
                      <Text mont t4s textAlignCenter>
                        Enter the number of days or the amount of funds.
                      </Text>
                      <Text mont info t5s textAlignCenter italics underline pt={4}>
                        Paid daily. Cancel and withdraw any time.
                      </Text>
                    </Flex>
                    {(buyCta || extendCta) && (
                      <>
                        <div>
                          <DropdownInputSection
                            hasArrow
                            isOpen={daysOpen}
                            placeholder={'Enter days'}
                            icon={<StyledClock size={16} />}
                            text={'Days'}
                            value={enteredDays}
                            onChange={(e) => setEnteredDays(e.target.value)}
                            onClick={() => setDaysOpen(!daysOpen)}
                          />
                          <DropdownOptions
                            isOpen={daysOpen}
                            searchedList={daysOptions}
                            onClick={(value: string) => {
                              setEnteredDays(value)
                              setDaysOpen(false)
                            }}
                          />
                        </div>
                        <div>
                          <DropdownInputSection
                            hasArrow
                            isOpen={coinsOpen}
                            placeholder={'Enter amount'}
                            icon={<img src={`https://assets.solace.fi/zapperLogos/frax`} height={16} />}
                            text={selectedCoin.symbol}
                            value={enteredAmount}
                            onChange={(e) => setEnteredAmount(e.target.value)}
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
                      </>
                    )}
                    {withdrawCta && (
                      <DropdownInputSection
                        placeholder={'Enter amount'}
                        icon={<img src={`https://assets.solace.fi/solace`} height={16} />}
                        text={'SOLACE'}
                        value={enteredAmount}
                        onChange={(e) => setEnteredAmount(filterAmount(e.target.value, enteredAmount))}
                      />
                    )}
                    <ButtonWrapper isColumn p={0}>
                      {buyCta && (
                        <Button {...gradientStyle} {...bigButtonStyle} secondary noborder>
                          <Text bold t4s>
                            Purchase Policy
                          </Text>
                        </Button>
                      )}
                      {neutralCta && (
                        <Button
                          {...gradientStyle}
                          {...bigButtonStyle}
                          secondary
                          noborder
                          onClick={() => handleUserState(InterfaceState.EXTENDING)}
                        >
                          <Text bold t4s>
                            Extend Policy
                          </Text>
                        </Button>
                      )}
                      {neutralCta && (
                        <Button
                          secondary
                          matchBg
                          {...bigButtonStyle}
                          noborder
                          onClick={() => handleUserState(InterfaceState.WITHDRAWING)}
                        >
                          <Text bold t4s>
                            Withdraw Funds
                          </Text>
                        </Button>
                      )}
                      {extendCta && (
                        <ButtonWrapper style={{ width: '100%' }} p={0}>
                          <Button pt={16} pb={16} separator onClick={() => handleUserState(InterfaceState.NEUTRAL)}>
                            Cancel
                          </Button>
                          <Button {...bigButtonStyle} {...gradientStyle} secondary noborder>
                            Extend Policy
                          </Button>
                        </ButtonWrapper>
                      )}
                      {withdrawCta && (
                        <ButtonWrapper style={{ width: '100%' }} p={0}>
                          <Button pt={16} pb={16} separator onClick={() => handleUserState(InterfaceState.NEUTRAL)}>
                            Cancel
                          </Button>
                          <Button {...bigButtonStyle} matchBg secondary noborder>
                            <Text {...gradientStyle}>Withdraw</Text>
                          </Button>
                        </ButtonWrapper>
                      )}
                    </ButtonWrapper>
                  </Flex>
                </TileCard>
                {(withdrawCta || extendCta || neutralCta) && (
                  <Button {...bigButtonStyle} error mt={16}>
                    Cancel Policy
                  </Button>
                )}
              </div>
            </>
          )}
        </Flex>
      )}
    </Content>
  )
}
