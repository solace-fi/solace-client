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
import React, { useState, useEffect, useMemo } from 'react'
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
import '../../resources/tailwind.min.css'
import { useXSLocker } from '../../hooks/useXSLocker'
import { GeneralElementProps } from '../../components/generalInterfaces'
import Checkbox from './atoms/Checkbox'
import RaisedBox from './atoms/RaisedBox'
import ShadowDiv from './atoms/ShadowDiv'
import InfoPair from './molecules/InfoPair'
import CardSectionValue from './components/CardSectionValue'
import VerticalSeparator from './components/VerticalSeparator'
import DifferenceNotification from './organisms/DifferenceNotification'
import Flex from './atoms/Flex'
import Safe from './sections/Safe/index'
import AggregatedStakeData from './sections/AggregatedStakeData'

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
    await stake_v1(parseUnits(amount, readSolaceToken.decimals), gasConfig)
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
    await unstake_v1(xSolaceToUnstake, gasConfig)
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
    setConvertStoX(isStaking)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStaking])

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

export default function Stake(): JSX.Element {
  // account usewallet
  const { account } = useWallet()
  const [version, setVersion] = useState<Version>(Version.v2 as Version)
  const [tab, setTab] = useState(Tab.staking)
  // const inputRef = useRef<HTMLInputElement>(null);

  // user current staked and unstaked amounts, and locking time

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
          <DifferenceNotification version={version} setVersion={setVersion} />
          <AggregatedStakeData />
          <Flex between mb={20}>
            <Button secondary info noborder pl={23} pr={23}>
              New Stake
            </Button>
            <Button info pl={23} pr={23}>
              Batch Actions
            </Button>
          </Flex>
          {/* Safe props
          
  stakingAmount: number
  safeStatus: string
  timeLeft: number
  multiplier: number
  apy: number
  rewards: number */}
          {[
            {
              id: '1',
              stakingAmount: 100,
              safeStatus: 'Locked',
              timeLeft: 157,
              multiplier: 1.32,
              apy: 2000 * 1.32,
              rewards: 100,
            },
            {
              id: '2',
              stakingAmount: 250,
              safeStatus: 'Staked',
              timeLeft: 0,
              multiplier: 1,
              apy: 2000,
              rewards: 0,
            },
          ].map(({ stakingAmount, safeStatus, timeLeft, multiplier, apy, rewards, id }) => (
            <Safe
              stakingAmount={stakingAmount}
              safeStatus={safeStatus}
              timeLeft={timeLeft}
              multiplier={multiplier}
              apy={apy}
              rewards={rewards}
              key={id}
            />
          ))}
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
