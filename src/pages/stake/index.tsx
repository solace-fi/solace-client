/*

    Table of Contents:

    import packages
    import managers
    import components
    import hooks

    Stake 
      custom hooks
      useEffect hooks

*/

/* import packages */
import React, { useState, useEffect, useMemo, Dispatch, SetStateAction } from 'react'
import { parseUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useGeneral } from '../../context/GeneralManager'
import { useContracts } from '../../context/ContractsManager'

/* import constants */
import { FunctionName } from '../../constants/enums'
import { ZERO } from '../../constants'

/* import components */
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { Card } from '../../components/atoms/Card'
import { FormCol, FormRow } from '../../components/atoms/Form'
import { Input } from '../../components/atoms/Input'
import { Content, FlexCol, FlexRow, HorizRule } from '../../components/atoms/Layout'
import { ModalCell } from '../../components/atoms/Modal'
import { Text } from '../../components/atoms/Typography'
import { HeroContainer, MultiTabIndicator } from '../../components/atoms/Layout'
import { WalletConnectButton } from '../../components/molecules/WalletConnectButton'
import { StyledRefresh } from '../../components/atoms/Icon'

/* import hooks */
import { useSolaceBalance, useXSolaceBalance, useXSolaceV1Balance } from '../../hooks/useBalance'
import { useXSolaceV1, useXSolaceV1Details } from '../../hooks/useXSolaceV1'
import { useInputAmount } from '../../hooks/useInputAmount'
import { useReadToken } from '../../hooks/useToken'

/* import utils */
import { formatAmount, getUnit, truncateBalance } from '../../utils/formatting'
import { Tab } from './types/Tab'

import Twiv from './components/Twiv'
import Switchers from './sections/Switchers'
import V2Form from './sections/V2Form'
import { Version } from './types/Version'
import styled, { css } from 'styled-components'
import Twan from './components/Twan'
import './tailwind.min.css'
import { useXSLocker } from '../../hooks/useXSLocker'
import { GeneralElementProps } from '../../components/generalInterfaces'
import Checkbox from './atoms/Checkbox'
import RaisedBox from './atoms/RaisedBox'
import ShadowDiv from './atoms/ShadowDiv'
import InfoPair from './molecules/InfoPair'
import CardSectionValue from './components/CardSectionValue'
import VerticalSeparator from './components/VerticalSeparator'

// disable no unused variables
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Stake1(): any {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const { haveErrors } = useGeneral()
  const { keyContracts } = useContracts()
  const { solace, xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  const [isStaking, setIsStaking] = useState<boolean>(true)
  const solaceBalance = useSolaceBalance()
  const { xSolaceV1Balance, v1StakedSolaceBalance } = useXSolaceV1Balance()
  const readSolaceToken = useReadToken(solace)
  const readXSolaceToken = useReadToken(xSolaceV1)
  const {
    gasConfig,
    amount,
    isAppropriateAmount,
    handleToast,
    handleContractCallError,
    handleInputChange,
    setMax,
    resetAmount,
  } = useInputAmount()
  const { stake_v1, unstake_v1 } = useXSolaceV1()
  const { userShare, xSolacePerSolace, solacePerXSolace } = useXSolaceV1Details()
  const { account } = useWallet()
  const [convertStoX, setConvertStoX] = useState<boolean>(true)
  const [convertedAmount, setConvertedAmount] = useState<BigNumber>(ZERO)

  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)

  const assetBalance = useMemo(
    () =>
      isStaking
        ? parseUnits(solaceBalance, readSolaceToken.decimals)
        : parseUnits(v1StakedSolaceBalance, readSolaceToken.decimals),
    [isStaking, solaceBalance, v1StakedSolaceBalance, readSolaceToken]
  )

  const assetDecimals = useMemo(() => (isStaking ? readSolaceToken.decimals : readXSolaceToken.decimals), [
    isStaking,
    readSolaceToken.decimals,
    readXSolaceToken.decimals,
  ])

  const callStakeSigned = async () => {
    await stake_v1(
      parseUnits(amount, readSolaceToken.decimals),
      `${truncateBalance(amount)} ${getUnit(FunctionName.STAKE_V1)}`,
      gasConfig
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callStakeSigned', err, FunctionName.STAKE_V1))
  }

  const callUnstake = async () => {
    if (!xSolaceV1) return
    const formatted = formatAmount(amount)
    let xSolaceToUnstake: BigNumber = ZERO
    if (formatted == v1StakedSolaceBalance) {
      xSolaceToUnstake = parseUnits(xSolaceV1Balance, readXSolaceToken.decimals)
    } else {
      xSolaceToUnstake = await xSolaceV1.solaceToXSolace(parseUnits(formatted, readSolaceToken.decimals))
    }
    await unstake_v1(
      xSolaceToUnstake,
      `${truncateBalance(xSolaceToUnstake.toString())} ${getUnit(FunctionName.UNSTAKE_V1)}`,
      gasConfig
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callUnstake', err, FunctionName.UNSTAKE_V1))
  }

  const _setMax = () => {
    setMax(assetBalance, assetDecimals)
  }

  /*

  useEffect hooks

  */

  useEffect(() => {
    setIsAcceptableAmount(isAppropriateAmount(amount, assetDecimals, assetBalance))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, isStaking, assetBalance, assetDecimals, readSolaceToken.decimals, readXSolaceToken.decimals, xSolaceV1])

  useEffect(() => {
    resetAmount()
    setConvertedAmount(ZERO)
    setConvertStoX(isStaking)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStaking])

  useEffect(() => {
    const getConvertedAmount = async () => {
      if (!xSolaceV1) return
      const formatted = formatAmount(amount)
      if (isStaking) {
        const amountInXSolace = await xSolaceV1.solaceToXSolace(parseUnits(formatted, readSolaceToken.decimals))
        setConvertedAmount(amountInXSolace)
      } else {
        // const amountInSolace = await xSolace.xSolaceToSolace(parseUnits(formatted, readXSolaceToken.decimals))
        // setConvertedAmount(amountInSolace)
        setConvertedAmount(parseUnits(formatted, readSolaceToken.decimals))
      }
    }
    getConvertedAmount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, readSolaceToken.decimals, readXSolaceToken.decimals, xSolaceV1])

  return (
    <>
      {!account ? (
        <HeroContainer>
          <Text bold t1 textAlignCenter>
            Please connect wallet to begin staking
          </Text>
          <WalletConnectButton info welcome secondary />
        </HeroContainer>
      ) : (
        <Content>
          <FlexCol>
            <Card style={{ margin: 'auto' }}>
              <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', position: 'relative' }}>
                <MultiTabIndicator style={{ left: isStaking ? '0' : '50%' }} />
                <ModalCell
                  pt={5}
                  pb={10}
                  pl={0}
                  pr={0}
                  onClick={() => setIsStaking(true)}
                  jc={'center'}
                  style={{ cursor: 'pointer' }}
                >
                  <Text t1 info={isStaking}>
                    Stake
                  </Text>
                </ModalCell>
                <ModalCell
                  pt={5}
                  pb={10}
                  pl={0}
                  pr={0}
                  onClick={() => setIsStaking(false)}
                  jc={'center'}
                  style={{ cursor: 'pointer' }}
                >
                  <Text t1 info={!isStaking}>
                    Unstake
                  </Text>
                </ModalCell>
              </div>
              <FormRow mt={20} mb={10}>
                <FormCol>
                  <Text bold t2>
                    APY
                  </Text>
                </FormCol>
                <FormCol>
                  <Text bold t2 textAlignRight info>
                    2000%
                  </Text>
                </FormCol>
              </FormRow>
              <FlexRow style={{ textAlign: 'center', marginTop: '20px', marginBottom: '10px' }}>
                <Input
                  widthP={100}
                  minLength={1}
                  maxLength={79}
                  autoComplete="off"
                  autoCorrect="off"
                  inputMode="decimal"
                  placeholder="0.0"
                  textAlignCenter
                  type="text"
                  onChange={(e) =>
                    handleInputChange(e.target.value, isStaking ? readSolaceToken.decimals : readXSolaceToken.decimals)
                  }
                  value={amount}
                />
                <Button info ml={10} pt={4} pb={4} pl={8} pr={8} width={70} height={30} onClick={_setMax}>
                  MAX
                </Button>
              </FlexRow>
              <FormRow mt={40} mb={10}>
                <FormCol>
                  <Text t4={!isStaking} fade={!isStaking}>
                    Unstaked Balance
                  </Text>
                </FormCol>
                <FormCol>
                  <Text textAlignRight info t4={!isStaking} fade={!isStaking}>
                    {solaceBalance} {readSolaceToken.symbol}
                  </Text>
                </FormCol>
              </FormRow>
              <FormRow mb={30}>
                <FormCol>
                  <Text t4={isStaking} fade={isStaking}>
                    Staked Balance
                  </Text>
                </FormCol>
                <FormCol>
                  <Text textAlignRight info t4={isStaking} fade={isStaking}>
                    {v1StakedSolaceBalance} {readSolaceToken.symbol}
                  </Text>
                </FormCol>
              </FormRow>
              {/* <FormRow mb={10}>
                <FormCol>
                  <Text bold>Amount you will get</Text>
                </FormCol>
                <FormCol>
                  <Text bold textAlignRight info>
                    {convertedAmount.eq(ZERO)
                      ? `-`
                      : formatUnits(
                          convertedAmount,
                          isStaking ? readXSolaceToken.decimals : readSolaceToken.decimals
                        )}{' '}
                    {isStaking ? readXSolaceToken.symbol : readSolaceToken.symbol}
                  </Text>
                </FormCol>
              </FormRow> */}
              <FormRow mt={10} mb={30}>
                <FormCol>
                  <Button onClick={() => setConvertStoX(!convertStoX)}>
                    Conversion
                    <StyledRefresh size={30} style={{ cursor: 'pointer' }} />
                  </Button>
                </FormCol>
                <FormCol>
                  <Text t4 pr={5}>
                    {convertStoX
                      ? `1 ${readSolaceToken.symbol} = ${xSolacePerSolace} ${readXSolaceToken.symbol}`
                      : `1 ${readXSolaceToken.symbol} = ${solacePerXSolace} ${readSolaceToken.symbol}`}
                  </Text>
                </FormCol>
              </FormRow>
              <HorizRule />
              {account && (
                <FormRow mt={20} mb={10}>
                  <FormCol>
                    <Text t4>My Pool Share</Text>
                  </FormCol>
                  <FormCol>
                    <Text t4>{truncateBalance(userShare)}%</Text>
                  </FormCol>
                </FormRow>
              )}
              <ButtonWrapper>
                <Button
                  widthP={100}
                  info
                  disabled={!isAcceptableAmount || haveErrors}
                  onClick={isStaking ? callStakeSigned : callUnstake}
                >
                  {isStaking ? 'Stake' : 'Unstake'}
                </Button>
              </ButtonWrapper>
            </Card>
          </FlexCol>
        </Content>
      )}
    </>
  )
}

/*
 Components
 */

const DifferenceText = function DifferenceText({
  children,
  onClick,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  // text-sm font-bold underline mt-3 text-underline-offset[4px] text-decoration-thickness[2px] self-center cursor-pointer select-none hover:opacity-80 duration-200
  const StyledText = styled.div`
    font-size: 0.875rem;
    line-height: 1.25rem;
    margin-top: 0.75rem;
    font-weight: 700;
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 4px;
    align-self: center;
    cursor: pointer;
    user-select: none;
    transition: opacity 0.2s ease-in-out;
    &:hover {
      opacity: 0.8;
    }
  `
  return (
    <StyledText
      onClick={onClick}
      // className="text-sm font-bold underline mt-3 text-underline-offset[4px] text-decoration-thickness[2px] self-center cursor-pointer select-none hover:opacity-80 duration-200"
    >
      {children}
    </StyledText>
  )
}
// const Notification = tw.div`bg-[#F04D42] text-[#fafafa] rounded-[10px] p-6 text-sm font-medium flex items-center`
const Notification = styled.div<GeneralElementProps>`
  background-color: #f04d42;
  color: #fafafa;
  padding: 1.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const baseButtonStyle = css`
  border-radius: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  border: 1px solid;
  border-color: white;
`
const redButtonStyle = css`
  background-color: #f04d42;
  color: #fafafa;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  &:hover {
    background-color: white;
    color: #f04d42;
  }
`
const whiteButtonStyle = css`
  background-color: white;
  color: #f04d42;
`

const NotificationButton = styled.div<{ active?: boolean }>`
  ${baseButtonStyle}
  ${({ active }) => (active ? whiteButtonStyle : redButtonStyle)}
  &:not(:first-child) {
    margin-left: 10px;
  }
  height: 34px;
  width: 117px;
  border-radius: 10px;
  font-size: 14px;
`

const Typography = {
  Notice: styled.p`
    margin-top: 0;
    margin-bottom: 0;
    margin-right: 60px;
    font-size: 0.875rem /* 14px */;
    line-height: 22.4px;
    font-weight: 500;
  `,
  Emphasis: styled.span`
    font-weight: 700;
  `,
} as const

export default function Stake(): JSX.Element {
  // account usewallet
  const { account } = useWallet()
  const [version, setVersion] = useState<Version>(Version.v2 as Version)
  const [tab, setTab] = useState(Tab.staking)
  // const inputRef = useRef<HTMLInputElement>(null);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert('cickity click')
    // if (inputRef.current && inputRef.current.value) {
    //   alert(`Submitting ${inputRef.current.value}`);
    // }
  }
  // inputValue and rangeValue for staking, unstaking and locking
  const [stakingInputValue, setStakingInputValue] = useState('')
  const [stakingRangeValue, setStakingRangeValue] = useState('')
  const [unstakingInputValue, setUnstakingInputValue] = useState('')
  const [unstakingRangeValue, setUnstakingRangeValue] = useState('')
  const [lockingInputValue, setLockingInputValue] = useState('')
  const [lockingRangeValue, setLockingRangeValue] = useState('')

  // simplification utilities
  // prettier-ignore
  const [inputValue, setInputValue, rangeValue, setRangeValue] = useMemo(() => version === Version.difference ? [undefined, () => {""}, undefined, () => {""}] : ({
    [Tab.staking]: [stakingInputValue, setStakingInputValue, stakingRangeValue, setStakingRangeValue],
    [Tab.unstaking]: [unstakingInputValue, setUnstakingInputValue, unstakingRangeValue, setUnstakingRangeValue],
    [Tab.locking]: [lockingInputValue, setLockingInputValue, lockingRangeValue, setLockingRangeValue],
  }[tab] as [string, Dispatch<SetStateAction<string>>, string, Dispatch<SetStateAction<string>>]),

  [tab, stakingInputValue, stakingRangeValue, unstakingInputValue, unstakingRangeValue, lockingInputValue, lockingRangeValue, version]);

  // user current staked and unstaked amounts, and locking time

  const [lockedDays, setLockedDays] = useState(157)
  // xsolace price in solace
  const maxDaysLocked = 1461

  const solaceBalance = useSolaceBalance()
  const { getStakedBalance, getUserLockerBalances } = useXSLocker()
  const [stakedSolaceBalance, setStakedSolaceBalance] = useState<string>('0')
  const [lockedSolaceBalance, setLockedSolaceBalance] = useState<string>('0')
  const [unlockedSolaceBalance, setUnlockedSolaceBalance] = useState<string>('0')

  // prettier - ignore
  const setMax = useMemo(
    () =>
      Version.difference === version
        ? () => undefined
        : ({
            [Tab.staking]: () => (setRangeValue('100'), setInputValue(solaceBalance)),
            [Tab.unstaking]: () => (setRangeValue('100'), setInputValue(unlockedSolaceBalance)),
            [Tab.locking]: () => (setRangeValue('100'), setInputValue(maxDaysLocked.toString())),
          }[tab] as () => void),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab, unlockedSolaceBalance, solaceBalance, maxDaysLocked, setInputValue, setRangeValue]
  )

  useEffect(() => {
    const _getUserLockerBalances = async () => {
      if (!account) return
      const balances = await getUserLockerBalances(account)
      setStakedSolaceBalance(balances.stakedBalance)
      setUnlockedSolaceBalance(balances.unlockedBalance)
      setLockedSolaceBalance(balances.lockedBalance)
    }
    _getUserLockerBalances()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  return (
    <>
      {!account ? (
        <HeroContainer>
          <Text bold t1 textAlignCenter>
            Please connect wallet to begin staking
          </Text>
          <WalletConnectButton info welcome secondary />
        </HeroContainer>
      ) : (
        <Content>
          <Notification>
            <Typography.Notice>
              We have updated our staking mechanism to a new version{' '}
              <Typography.Emphasis>STAKING V2</Typography.Emphasis> which is a part of our{' '}
              <Typography.Emphasis>Governance system</Typography.Emphasis>. New staking is available only in new{' '}
              <Typography.Emphasis>STAKING V2</Typography.Emphasis>. In{' '}
              <Typography.Emphasis>STAKING V1</Typography.Emphasis> you can unstake your funds or migrate funds to new{' '}
              <Typography.Emphasis>STAKING V2</Typography.Emphasis>.
            </Typography.Notice>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex' }}>
                {/* div with 2 buttons horizontally saying Staking V1 and Staking V2, one border white, red bg, white text, the other white bg, red text, both semibold */}
                <NotificationButton active={version === Version.v1} onClick={() => setVersion(Version.v1)}>
                  Staking V1
                </NotificationButton>
                <NotificationButton
                  onClick={() => {
                    setVersion(Version.v2)
                  }}
                  active={version === Version.v2}
                >
                  Staking V2
                </NotificationButton>
              </div>
              <DifferenceText onClick={() => setVersion(Version.difference)}>What is the difference?</DifferenceText>
            </div>
          </Notification>
          <Checkbox type="checkbox" />
          {/* 24-padding white box with 10px radius corner and shadow */}
          <ShadowDiv style={{ marginBottom: '20px' }}>
            <RaisedBox
              style={{
                display: 'flex',
                alignItems: 'strech',
                gap: '91px',
                flexWrap: 'wrap',
              }}
            >
              {/* unstaked, staked, locked, total rewards, separator, apy (secondary) */}
              <InfoPair importance="primary" label="Unstaked Balance">
                <CardSectionValue importance="primary" annotation="SOLACE">
                  {stakedSolaceBalance}
                </CardSectionValue>
              </InfoPair>
              <InfoPair importance="primary" label="Staked Balance">
                <CardSectionValue importance="primary" annotation="SOLACE">
                  {unlockedSolaceBalance}
                </CardSectionValue>
              </InfoPair>
              <InfoPair importance="primary" label="Locked Balance">
                <CardSectionValue importance="primary" annotation="SOLACE">
                  {lockedSolaceBalance}
                </CardSectionValue>
              </InfoPair>
              <InfoPair importance="primary" label="Total Rewards">
                <CardSectionValue importance="primary" annotation="SOLACE">
                  {stakedSolaceBalance}
                </CardSectionValue>
              </InfoPair>
              <VerticalSeparator />
              <InfoPair importance="secondary" label="APY">
                <Text bold>2000%</Text>
              </InfoPair>
            </RaisedBox>
          </ShadowDiv>
          {/* only show the following if staking is v2 and the tab is not `difference` */}
          {version === Version.v2 && (
            <Twiv css={'text-[#5E5E5E]'}>
              <Twiv css={'bg-[#fafafa] min-h-screen px-1 lg:px-10 py-10'}>
                {/* select between v1 and v2 */}
                <Switchers
                  tab={tab}
                  lockedDays={lockedDays}
                  version={version}
                  setTab={setTab}
                  setLockedDays={setLockedDays}
                  setVersion={setVersion}
                />
                <V2Form
                  tab={tab}
                  staked={stakedSolaceBalance}
                  unstaked={solaceBalance}
                  locked={lockedSolaceBalance}
                  onSubmit={onSubmit}
                  inputValue={inputValue}
                  setMax={setMax}
                  lockedDays={lockedDays}
                  inputOnChange={(e) => {
                    // 1. validate input (blocked till main project integration)
                    // 2. update input value state
                    e.target.value !== inputValue && setInputValue(e.target.value)
                    // 3. update range value state (as percentage string between 0 and 100)
                    const newRangeValue = {
                      [Tab.staking]: String((Number(inputValue) * 100) / parseFloat(solaceBalance)),
                      [Tab.unstaking]: String((Number(inputValue) * 100) / parseFloat(unlockedSolaceBalance)),
                      [Tab.locking]: String((Number(inputValue) * 100) / maxDaysLocked),
                    }[tab]
                    newRangeValue !== rangeValue && setRangeValue(newRangeValue)
                  }}
                  rangeValue={rangeValue ?? '0'}
                  rangeOnChange={(e) => {
                    // 1. validate input (blocked till main project integration)
                    // 2. update input value state (as percentage string between 0 and 100)
                    // 3. update range value state

                    rangeValue !== e.target.value && setRangeValue(e.target.value)
                    setTimeout(() => console.log({ targetValue: e.target.value, rangeValue }), 0)
                    const newInputValue = {
                      [Tab.staking]: String((Number(e.target.value) * parseFloat(solaceBalance)) / 100),
                      [Tab.unstaking]: String((Number(e.target.value) * parseFloat(unlockedSolaceBalance)) / 100),
                      [Tab.locking]: String((Number(e.target.value) * maxDaysLocked) / 100),
                    }[tab]
                    newInputValue !== inputValue && setInputValue(newInputValue)
                  }}
                />
              </Twiv>
            </Twiv>
          )}
          {/* only show the following if staking is v1 and the tab is not `difference` */}
          {version === Version.v1 && (
            <Twiv css={'text-xl font-bold text-[#5F5DF9] animate-bounce'}>
              V1 not implemented in this component <Twan css={'text-[#F04D42]'}>(yet)</Twan>.
            </Twiv>
          )}
          {/* only show the following if staking is v1 and the tab is 'difference' */}
          {version === Version.difference && (
            <Twiv css={'text-xl font-bold text-[#5F5DF9] animate-bounce'}>
              Difference between V1 and V2:
              <Twiv css={'text-[#5E5E5E]'}>not implemented yet</Twiv>
            </Twiv>
          )}
        </Content>
      )}
    </>
  )
}
