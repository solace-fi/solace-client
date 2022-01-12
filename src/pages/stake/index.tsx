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
import { formatUnits, parseUnits } from '@ethersproject/units'
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
import { useSolaceBalance, useXSolaceBalance } from '../../hooks/useBalance'
import { useStakingApyV1, useXSolaceV1, useXSolaceV1Details } from '../../hooks/useXSolaceV1'
import { useInputAmount } from '../../hooks/useInputAmount'
import { useReadToken } from '../../hooks/useToken'

/* import utils */
import { formatAmount, getUnit, truncateBalance } from '../../utils/formatting'
import { Tab } from './types/Tab'
import tw from 'twin.macro'
import Twiv from './components/Twiv'
import Switchers from './sections/Switchers'
import V2Form from './sections/V2Form'
import { Version } from './types/Version'
import styled from 'styled-components'
import Twan from './components/Twan'

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
  const xSolaceBalance = useXSolaceBalance()
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
  const { stakingApy } = useStakingApyV1()
  const { userShare, xSolacePerSolace, solacePerXSolace } = useXSolaceV1Details()
  const { account } = useWallet()
  const [convertStoX, setConvertStoX] = useState<boolean>(true)
  const [convertedAmount, setConvertedAmount] = useState<BigNumber>(ZERO)

  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)

  const assetBalance = useMemo(
    () =>
      isStaking
        ? parseUnits(solaceBalance, readSolaceToken.decimals)
        : parseUnits(xSolaceBalance, readXSolaceToken.decimals),
    [isStaking, solaceBalance, xSolaceBalance, readSolaceToken, readXSolaceToken]
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
    await unstake_v1(
      parseUnits(amount, readXSolaceToken.decimals),
      `${truncateBalance(amount)} ${getUnit(FunctionName.UNSTAKE_V1)}`,
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
        const amountInSolace = await xSolaceV1.xSolaceToSolace(parseUnits(formatted, readXSolaceToken.decimals))
        setConvertedAmount(amountInSolace)
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
                    {stakingApy}
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
                    {xSolaceBalance} {readXSolaceToken.symbol}
                  </Text>
                </FormCol>
              </FormRow>
              <FormRow mb={10}>
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
              </FormRow>
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
                    <Text t4>My xSolace Pool Share</Text>
                  </FormCol>
                  <FormCol>
                    <Text t4>{userShare}%</Text>
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

// export default Stake

/* MY STUFFERINO

import React from 'react'
import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import tw from 'twin.macro'
import Twiv from './components/Twiv'
import { Tab } from './types/Tab'
import { Version } from './types/Version'
import Switchers from './sections/Switchers'
import V2Form from './sections/V2Form'
/*
 Components
 */

// Upper banner
const Notification = tw.div`bg-[#F04D42] text-[#fafafa] rounded-[10px] p-6 text-sm font-medium flex items-center`

const baseButton = tw`rounded-lg text-sm font-semibold flex items-center justify-center select-none border-solid border-[1px] border-white duration-200`
const whiteButton = tw`bg-white text-[#F04D42]`
const redButton = tw`bg-[#F04D42] text-[#fafafa] hover:bg-white hover:text-[#F04D42] cursor-pointer`
const DifferenceText = tw.div`text-sm font-bold underline mt-3 text-underline-offset[4px] text-decoration-thickness[2px] self-center cursor-pointer select-none hover:opacity-80 duration-200`

const NotificationButton = styled.div<{ active?: boolean }>`
  ${({ active }) => (active ? whiteButton : redButton)}
  ${baseButton}

&:not(:first-child) {
    margin-left: 10px;
  }
  height: 34px;
  width: 117px;
  border-radius: 10px;
  font-size: 14px;
`

const Typography = {
  Notice: tw.p`my-0 text-sm font-medium mr-10`,
  Emphasis: tw.span`font-bold`,
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
  const [stakedAmount /*, setStakedAmount*/] = useState(552)
  const [unstakedAmount /*, setUnstakedAmount*/] = useState(0)
  const [lockedDays, setLockedDays] = useState(157)
  // xsolace price in solace
  const [xSolacePrice /*, setXSolacePrice */] = useState(1.5)
  const maxDaysLocked = 1461

  // prettier-ignore
  const setMax = useMemo(() => Version.difference === version ? () => undefined :  ({
      [Tab.staking]: () => (setRangeValue("100"), setInputValue(unstakedAmount.toString())),
      [Tab.unstaking]: () => (setRangeValue("100"), setInputValue(stakedAmount.toString())),
      [Tab.locking]: () => (setRangeValue("100"), setInputValue(maxDaysLocked.toString())),
    }[tab] as () => void) ,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab, stakedAmount, unstakedAmount, maxDaysLocked, setInputValue, setRangeValue]
  );

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
              <Typography.Emphasis>Governance system</Typography.Emphasis>.<br /> New staking is available only in new{' '}
              <Typography.Emphasis>STAKING V2</Typography.Emphasis>.<br /> In{' '}
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
          {/* only show the following if staking is v2 and the tab is not `difference` */}
          {version === Version.v2 && (
            <Twiv css={tw`font-sans text-text-secondary`}>
              <Twiv css={tw`bg-bg-secondary min-h-screen px-1 lg:px-10 py-10`}>
                {/* select between v1 and v2 */}
                <Switchers
                  tab={tab}
                  setTab={setTab}
                  version={version}
                  lockedDays={lockedDays}
                  setLockedDays={setLockedDays}
                  setVersion={setVersion}
                />
                <V2Form
                  tab={tab}
                  stakedAmount={stakedAmount}
                  unstakedAmount={unstakedAmount}
                  xSolacePrice={xSolacePrice}
                  onSubmit={onSubmit}
                  inputValue={inputValue}
                  setMax={setMax}
                  lockedDays={lockedDays}
                  inputOnChange={(e) => {
                    // 1. validate input (blocked till main project integration)
                    // 2. update input value state
                    setInputValue(e.target.value)
                    // 3. update range value state (as percentage string between 0 and 100)
                    setRangeValue(
                      {
                        [Tab.staking]: String((Number(inputValue) * 100) / unstakedAmount),
                        [Tab.unstaking]: String((Number(inputValue) * 100) / stakedAmount),
                        [Tab.locking]: String((Number(inputValue) * 100) / maxDaysLocked),
                      }[tab]
                    )
                  }}
                  rangeValue={rangeValue ?? '0'}
                  rangeOnChange={(e) => {
                    // 1. validate input (blocked till main project integration)
                    // 2. update input value state (as percentage string between 0 and 100)
                    // 3. update range value state

                    setRangeValue(e.target.value)
                    setTimeout(() => console.log({ targetValue: e.target.value, rangeValue }), 0)
                    setInputValue(
                      {
                        [Tab.staking]: String((Number(e.target.value) * unstakedAmount) / 100),
                        [Tab.unstaking]: String((Number(e.target.value) * stakedAmount) / 100),
                        [Tab.locking]: String((Number(e.target.value) * maxDaysLocked) / 100),
                      }[tab]
                    )
                  }}
                />
              </Twiv>
            </Twiv>
          )}
          {/* only show the following if staking is v1 and the tab is not `difference` */}
          {version === Version.v1 && (
            <Twiv css={tw`text-xl font-bold text-text-accent animate-bounce`}>
              V1 not implemented in this component <Twan css={tw`text-text-warning`}>(yet)</Twan>.
            </Twiv>
          )}
          {/* only show the following if staking is v1 and the tab is `difference` */}
          {version === Version.difference && (
            <Twiv css={tw`text-xl font-bold text-text-accent animate-bounce`}>
              Difference between V1 and V2:
              <Twiv css={tw`text-text-secondary`}>not implemented yet</Twiv>
            </Twiv>
          )}
        </Content>
      )}
    </>
  )
}
