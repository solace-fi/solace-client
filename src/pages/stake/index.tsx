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
import { DAYS_PER_YEAR, ZERO } from '../../constants'
import { LockData, UserLocksInfo } from '../../constants/types'
import { StakingVersion } from './types/Version'
import { LockCheckbox } from './types/LockCheckbox'

/* import components */
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { Card } from '../../components/atoms/Card'
import { FormCol, FormRow } from '../../components/atoms/Form'
import { Input, StyledSlider } from '../../components/atoms/Input'
import { Content, FlexCol, FlexRow, HorizRule } from '../../components/atoms/Layout'
import { ModalCell } from '../../components/atoms/Modal'
import { Text } from '../../components/atoms/Typography'
import { HeroContainer, MultiTabIndicator } from '../../components/atoms/Layout'
import { WalletConnectButton } from '../../components/molecules/WalletConnectButton'

/* import hooks */
import { useXSolaceV1Balance } from '../../hooks/useBalance'
import { useXSolaceV1 } from '../../hooks/useXSolaceV1'
import { useInputAmount } from '../../hooks/useInputAmount'
import { useReadToken } from '../../hooks/useToken'
import { useUserLockData } from '../../hooks/useXSLocker'
import { useXSolaceMigrator } from '../../hooks/useXSolaceMigrator'

/* import utils */
import { formatAmount } from '../../utils/formatting'
import calculateTotalWithdrawable from './utils/stake/batchActions/actions/calculateTotalWithdrawable'
import calculateTotalHarvest from './utils/stake/batchActions/actions/calculateTotalHarvest'
import { formatShort } from './utils/stake/batchActions/formatShort'

import updateLocksChecked from './utils/stake/batchActions/checkboxes/updateLocksChecked'
import getCheckedLocks from './utils/stake/batchActions/checkboxes/getCheckedLocks'
import lockIsChecked from './utils/stake/batchActions/checkboxes/lockIsChecked'
import updateLockCheck from './utils/stake/batchActions/checkboxes/updateLockCheck'
import somethingIsChecked from './utils/stake/batchActions/checkboxes/somethingIsChecked'
import allLocksAreChecked from './utils/stake/batchActions/checkboxes/allLocksAreChecked'

import '../../styles/tailwind.min.css'
import DifferenceNotification from './organisms/DifferenceNotification'
import Flex from './atoms/Flex'
import Safe from './sections/Safe/index'
import AggregatedStakeData from './sections/AggregatedStakeData'
import NewSafe from './sections/Safe/NewSafe'
import DifferenceBoxes from './sections/DifferenceBoxes.tsx'
import Checkbox from './atoms/Checkbox'
import CardSectionValue from './components/CardSectionValue'

// util imports
import { Label } from './molecules/InfoPair'
import InputSection from './sections/InputSection'
import { SmallBox } from '../../components/atoms/Box'
import { getExpiration } from '../../utils/time'
import { Tab } from './types/Tab'

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
  const { latestBlock } = useProvider()
  // const [convertStoX, setConvertStoX] = useState<boolean>(true)

  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)
  const [lockInputValue, setLockInputValue] = React.useState('0')

  // const callStakeSigned = async () => {
  //   await stake_v1(parseUnits(amount, readSolaceToken.decimals), gasConfig)
  //     .then((res) => handleToast(res.tx, res.localTx))
  //     .catch((err) => handleContractCallError('callStakeSigned', err, FunctionName.STAKE_V1))
  // }

  const callUnstake = async () => {
    const xSolaceToUnstake: BigNumber = await getXSolaceFromSolace()
    await unstake_v1(xSolaceToUnstake, gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callUnstake', err, FunctionName.UNSTAKE_V1))
  }

  const callMigrateSigned = async () => {
    if (!latestBlock || !account) return
    const xSolaceToMigrate: BigNumber = await getXSolaceFromSolace()
    const seconds = latestBlock.timestamp + parseInt(lockInputValue) * 86400
    await migrate(account, BigNumber.from(seconds), xSolaceToMigrate, gasConfig)
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

  const lockInputOnChange = (value: string) => {
    const filtered = value.replace(/[^0-9]*/g, '')
    if (parseFloat(filtered) <= DAYS_PER_YEAR * 4 || filtered == '') {
      setLockInputValue(filtered)
    }
  }
  const lockRangeOnChange = (value: string) => setLockInputValue(value)

  const lockSetMax = () => setLockInputValue(`${DAYS_PER_YEAR * 4}`)

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
                  <Text t1>Staking V1</Text>
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
              <HorizRule />
              <ButtonWrapper isColumn style={{ gap: '20px' }}>
                <Button widthP={100} info secondary disabled={!isAcceptableAmount || haveErrors} onClick={callUnstake}>
                  Unstake
                </Button>
                <Text>or</Text>
                <div>
                  <Label importance="quaternary" style={{ marginBottom: '8px' }}>
                    Choose a Lock time (optional)
                  </Label>
                  <InputSection
                    tab={Tab.LOCK}
                    value={lockInputValue}
                    onChange={(e) => lockInputOnChange(e.target.value)}
                    setMax={lockSetMax}
                  />
                </div>
                <StyledSlider
                  value={lockInputValue}
                  onChange={(e) => lockRangeOnChange(e.target.value)}
                  min={0}
                  max={DAYS_PER_YEAR * 4}
                />
                {
                  <SmallBox transparent collapse={!lockInputValue || lockInputValue == '0'} m={0} p={0}>
                    <Text
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      Lock End Date: {getExpiration(parseInt(lockInputValue))}
                    </Text>
                  </SmallBox>
                }
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
  const [batchActionsIsEnabled, setBatchActionsIsEnabled] = useState(false)
  const [locksChecked, setLocksChecked] = useState<LockCheckbox[]>([])

  const { account } = useWallet()
  const { latestBlock } = useProvider()
  const { version } = useCachedData()
  const [stakingVersion, setStakingVersion] = useState<StakingVersion>(StakingVersion.v2 as StakingVersion)
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
      setLocksChecked(updateLocksChecked(userLockData.locks, locksChecked))
      setUserLockInfo(userLockData.user)
    }
    _getUserLocks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, latestBlock, version])

  const openSafe = () => setNewSafeIsOpen(true)
  const closeSafe = () => setNewSafeIsOpen(false)
  const toggleBatchActions = () => setBatchActionsIsEnabled(!batchActionsIsEnabled)

  const handleLockCheck = (lockId: BigNumber) => {
    const checkboxStatus = lockIsChecked(locksChecked, lockId)
    const newArr = updateLockCheck(locksChecked, lockId, !checkboxStatus)
    setLocksChecked(newArr)
  }

  const handleLockCheckAll = () => {
    if (allLocksAreChecked(locksChecked)) {
      setLocksChecked(locksChecked.map((lock) => ({ ...lock, checked: false })))
    } else {
      setLocksChecked(locksChecked.map((lock) => ({ ...lock, checked: true })))
    }
  }

  const handleBatchWithdraw = async () => {
    const selectedLocks = locks.filter((_, index) => locksChecked[index])
    const selectedLocksWithdraw = selectedLocks.map((lock) => ({
      lockId: lock.xsLockID,
      amount: lock.pendingRewards,
    }))
    console.log('selectedLocksWithdraw', selectedLocksWithdraw)
  }

  const handleBatchHarvest = async () => {
    const selectedLocks = locks.filter((_, index) => locksChecked[index])
    const selectedLocksHarvest = selectedLocks.map((lock) => ({
      lockId: lock.xsLockID,
      amount: lock.pendingRewards,
    }))
    console.log('selectedLocksHarvest', selectedLocksHarvest)
  }
  const rewardsAreZero = () => calculateTotalHarvest(getCheckedLocks(locks, locksChecked)).isZero()
  const withdrawalsAreZero = () => calculateTotalWithdrawable(getCheckedLocks(locks, locksChecked)).isZero()
  const getFormattedRewards = () => formatShort(calculateTotalHarvest(getCheckedLocks(locks, locksChecked)))
  const getFormattedWithdrawal = () => formatShort(calculateTotalWithdrawable(getCheckedLocks(locks, locksChecked)))

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
                {!batchActionsIsEnabled ? (
                  !newSafeIsOpen ? (
                    <Button secondary info noborder pl={23} pr={23} onClick={openSafe}>
                      Create New Safe
                    </Button>
                  ) : (
                    <Button secondary info noborder pl={23} pr={23} onClick={closeSafe}>
                      Close
                    </Button>
                  )
                ) : (
                  // checkbox + Select all, Rewards selected (harvest), Withdraw selected (withdraw)
                  <>
                    {/* select all checkbox */}
                    <Flex gap={20}>
                      <Flex
                        center
                        gap={5}
                        style={{
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                        onClick={handleLockCheckAll}
                      >
                        <Checkbox type="checkbox" checked={allLocksAreChecked(locksChecked)} />
                        <Text bold t4 info>
                          Select all
                        </Text>
                      </Flex>
                      {somethingIsChecked(locksChecked) && (
                        <>
                          {' '}
                          <Flex center gap={5}>
                            <Text t4>Rewards selected:</Text>
                            <CardSectionValue annotation="SOLACE" smol info>
                              {/* calcualte total selected harvest, divide by 1e18, to string (big numbers) */}
                              {getFormattedRewards()}
                            </CardSectionValue>
                          </Flex>
                          <Flex center gap={5}>
                            <Text t4>Withdrawable selected:</Text>
                            <CardSectionValue annotation="SOLACE" smol info>
                              {getFormattedWithdrawal()}
                            </CardSectionValue>
                          </Flex>
                        </>
                      )}
                    </Flex>
                    {/* Harvest selected (harvest) */}
                    {/* <Button secondary info noborder pl={23} pr={23} onClick={handleExitBatch}>
                        Exit Batch
                      </Button>
                      <Button secondary info noborder pl={23} pr={23} onClick={handleBatchHarvest}>
                        Harvest
                      </Button>
                      <Button secondary info noborder pl={23} pr={23} onClick={handleBatchWithdraw}>
                        Withdraw
                      </Button> */}
                  </>
                )}
                <Flex center gap={20}>
                  {/* 2 buttons: withdraw, harvest rewards */}
                  {batchActionsIsEnabled && (
                    <>
                      {!rewardsAreZero() && (
                        <Button secondary info noborder pl={23} pr={23} onClick={handleBatchHarvest}>
                          Harvest Rewards
                        </Button>
                      )}
                      {!withdrawalsAreZero() && (
                        <Button secondary info noborder pl={23} pr={23} onClick={handleBatchWithdraw}>
                          Withdraw
                        </Button>
                      )}
                    </>
                  )}
                  <Button info pl={23} pr={23} onClick={toggleBatchActions}>
                    {batchActionsIsEnabled ? 'Exit Batch' : 'Batch Actions'}
                  </Button>
                </Flex>
                {/* <Button info pl={23} pr={23} onClick={toggleBatchActions}>
                  {batchActionsIsEnabled ? 'X' : 'Batch Actions'}
                </Button> */}
              </Flex>
              <NewSafe isOpen={newSafeIsOpen} />
              {locks.map((lock, i) => (
                <Safe
                  key={lock.xsLockID.toNumber()}
                  lock={lock}
                  batchActionsIsEnabled={batchActionsIsEnabled}
                  isChecked={lockIsChecked(locksChecked, lock.xsLockID)}
                  onCheck={() => handleLockCheck(lock.xsLockID)}
                  index={i}
                />
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
