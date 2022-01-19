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
import { useProvider } from '../../context/ProviderManager'
import { useCachedData } from '../../context/CachedDataManager'

/* import constants */
import { FunctionName } from '../../constants/enums'
import { ZERO } from '../../constants'
import { LockData, UserLocksInfo } from '../../constants/types'

/* import components */
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { Card } from '../../components/atoms/Card'
import { FormCol, FormRow } from '../../components/atoms/Form'
import { Input } from '../../components/atoms/Input'
import { Content, FlexCol, FlexRow, HorizRule, Scrollable } from '../../components/atoms/Layout'
import { ModalCell } from '../../components/atoms/Modal'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { HeroContainer, MultiTabIndicator } from '../../components/atoms/Layout'
import { WalletConnectButton } from '../../components/molecules/WalletConnectButton'
import { StyledRefresh } from '../../components/atoms/Icon'

/* import hooks */
import { useSolaceBalance, useXSolaceV1Balance } from '../../hooks/useBalance'
import { useXSolaceV1, useXSolaceV1Details } from '../../hooks/useXSolaceV1'
import { useInputAmount } from '../../hooks/useInputAmount'
import { useReadToken } from '../../hooks/useToken'
import { useUserLockData } from '../../hooks/useXSLocker'
import { useXSolaceMigrator } from '../../hooks/useXSolaceMigrator'

/* import utils */
import { formatAmount, truncateBalance } from '../../utils/formatting'
import { Tab } from './types/Tab'

import Twiv from './components/Twiv'
import { StakingVersion } from './types/Version'
import Twan from './components/Twan'
import '../../styles/tailwind.min.css'
import DifferenceNotification from './organisms/DifferenceNotification'
import Flex from './atoms/Flex'
import Safe from './sections/Safe/index'
import AggregatedStakeData from './sections/AggregatedStakeData'
import NewSafe from './sections/Safe/NewSafe'
import DifferenceBoxes from './sections/DifferenceBoxes.tsx'

// disable no unused variables
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Stake1(): any {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const { haveErrors } = useGeneral()
  const { keyContracts } = useContracts()
  const { solace, xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  // const [isMigrating, setIsMigrating] = useState<boolean>(true)
  // const solaceBalance = useSolaceBalance()
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
  } = useInputAmount()
  const { stake_v1, unstake_v1 } = useXSolaceV1()
  // const { userShare, xSolacePerSolace, solacePerXSolace } = useXSolaceV1Details()
  const { migrate } = useXSolaceMigrator()
  const { account } = useWallet()
  // const [convertStoX, setConvertStoX] = useState<boolean>(true)

  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)

  const callStakeSigned = async () => {
    await stake_v1(parseUnits(amount, readSolaceToken.decimals), gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callStakeSigned', err, FunctionName.STAKE_V1))
  }

  const callUnstake = async () => {
    const xSolaceToUnstake: BigNumber = await getXSolaceFromSolace()
    await unstake_v1(xSolaceToUnstake, gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callUnstake', err, FunctionName.UNSTAKE_V1))
  }

  const callMigrateSigned = async () => {
    if (!account) return
    const xSolaceToMigrate: BigNumber = await getXSolaceFromSolace()
    await migrate(account, xSolaceToMigrate, gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callMigrateSigned', err, FunctionName.STAKING_MIGRATE))
  }

  const _setMax = () => setMax(parseUnits(v1StakedSolaceBalance, readSolaceToken.decimals), readSolaceToken.decimals)

  const getXSolaceFromSolace = async () => {
    const formatted = formatAmount(amount)
    let xSolace: BigNumber = ZERO
    if (!xSolaceV1) return xSolace
    if (formatted == v1StakedSolaceBalance) {
      xSolace = parseUnits(xSolaceV1Balance, readXSolaceToken.decimals)
    } else {
      xSolace = await xSolaceV1.solaceToXSolace(parseUnits(formatted, readSolaceToken.decimals))
    }
    return xSolace
  }

  /*

  useEffect hooks

  */

  useEffect(() => {
    setIsAcceptableAmount(
      isAppropriateAmount(amount, readSolaceToken.decimals, parseUnits(v1StakedSolaceBalance, readSolaceToken.decimals))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, parseUnits(v1StakedSolaceBalance, readSolaceToken.decimals), readSolaceToken.decimals])

  // useEffect(() => {
  //   resetAmount()
  //   setConvertStoX(isMigrating)
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isMigrating])

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
              <div style={{ position: 'relative' }}>
                <MultiTabIndicator />
                <ModalCell pt={5} pb={10} pl={0} pr={0} jc={'center'}>
                  <Text t1>
                    <TextSpan t1 info>
                      Migrate
                    </TextSpan>{' '}
                    or{' '}
                    <TextSpan t1 info>
                      Unstake
                    </TextSpan>
                  </Text>
                </ModalCell>
              </div>
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
                  onChange={(e) => handleInputChange(e.target.value, readSolaceToken.decimals)}
                  value={amount}
                />
                <Button info ml={10} pt={4} pb={4} pl={8} pr={8} width={70} height={30} onClick={_setMax}>
                  MAX
                </Button>
              </FlexRow>

              <FormRow mb={30}>
                <FormCol>
                  <Text>Staked Balance</Text>
                </FormCol>
                <FormCol>
                  <Text textAlignRight info>
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
                          isMigrating ? readXSolaceToken.decimals : readSolaceToken.decimals
                        )}{' '}
                    {isMigrating ? readXSolaceToken.symbol : readSolaceToken.symbol}
                  </Text>
                </FormCol>
              </FormRow> */}
              {/* <FormRow mt={10} mb={30}>
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
              </FormRow> */}
              <HorizRule />
              {/* {account && (
                <FormRow mt={20} mb={10}>
                  <FormCol>
                    <Text t4>My Pool Share</Text>
                  </FormCol>
                  <FormCol>
                    <Text t4>{truncateBalance(userShare)}%</Text>
                  </FormCol>
                </FormRow>
              )} */}
              <ButtonWrapper isColumn style={{ gap: '20px' }}>
                <Button widthP={100} info secondary disabled={!isAcceptableAmount || haveErrors} onClick={callUnstake}>
                  Unstake
                </Button>
                <Button
                  widthP={100}
                  error
                  style={{ backgroundColor: '#f04d42' }}
                  disabled={!isAcceptableAmount || haveErrors}
                  secondary
                  onClick={callMigrateSigned}
                  light
                >
                  Migrate to STAKING V2
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
  const [newSafeIsOpen, setNewSafeIsOpen] = useState(false)
  const { account } = useWallet()
  const { latestBlock } = useProvider()
  const { version } = useCachedData()
  const [stakingVersion, setStakingVersion] = useState<StakingVersion>(StakingVersion.v2 as StakingVersion)
  const [tab, setTab] = useState(Tab.DEPOSIT)
  const [locks, setLocks] = useState<LockData[]>([])
  const [userLockInfo, setUserLockInfo] = useState<UserLocksInfo>({
    pendingRewards: ZERO,
    stakedBalance: ZERO,
    lockedBalance: ZERO,
    unlockedBalance: ZERO,
    yearlyReturns: ZERO,
    apy: ZERO,
  })

  const { getUserLocks } = useUserLockData()

  useEffect(() => {
    const _getUserLocks = async () => {
      if (!account) return
      const userLockData = await getUserLocks(account)
      setLocks(userLockData.locks)
      setUserLockInfo(userLockData.user)
    }
    _getUserLocks()
  }, [account, latestBlock, version])

  const openSafe = () => setNewSafeIsOpen(true)
  const closeSafe = () => setNewSafeIsOpen(false)

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
          <DifferenceNotification version={stakingVersion} setVersion={setStakingVersion} />
          {StakingVersion.v2 === stakingVersion && (
            <>
              <AggregatedStakeData stakeData={userLockInfo} />
              <Flex between mb={20}>
                {!newSafeIsOpen ? (
                  <Button secondary info noborder pl={23} pr={23} onClick={openSafe}>
                    Create New Safe
                  </Button>
                ) : (
                  <Button secondary info noborder pl={23} pr={23} onClick={closeSafe}>
                    Close
                  </Button>
                )}
                {/* <Button info pl={23} pr={23}>
                  Batch Actions
                </Button> */}
              </Flex>
              <NewSafe isOpen={newSafeIsOpen} />
              {locks.map((lock) => (
                <Safe key={lock.xsLockID.toNumber()} lock={lock} />
              ))}
            </>
          )}
          {/* only show the following if staking is v1 and the tab is not `difference` */}
          {stakingVersion === StakingVersion.v1 && <Stake1 />}
          {/* only show the following if staking is v1 and the tab is 'difference' */}
          {stakingVersion === StakingVersion.difference && (
            <DifferenceBoxes setStakingVersion={setStakingVersion} />
            // <Twiv css={'text-xl font-bold text-[#5F5DF9] animate-bounce'}>
            //   Difference between V1 and V2:
            //   <Twiv css={'text-[#5E5E5E]'}>not implemented yet</Twiv>
            // </Twiv>
          )}
        </Content>
      )}
    </>
  )
}
