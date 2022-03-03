import React, { useEffect, useState, useMemo } from 'react'
import { Flex, HorizRule, VerticalSeparator } from '../../components/atoms/Layout'
import { QuestionCircle } from '@styled-icons/bootstrap/QuestionCircle'
// src/components/atoms/Button/index.ts
import { Button } from '../../components/atoms/Button'
// src/resources/svg/icons/usd.svg
import DAI from '../../resources/svg/icons/dai.svg'
import { StyledGrayBox } from '../../components/molecules/GrayBox'
import { GenericInputSection } from '../../components/molecules/InputSection'
import { StyledSlider } from '../../components/atoms/Input'
import commaNumber from '../../utils/commaNumber'
import { StyledTooltip } from '../../components/molecules/Tooltip'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { MAX_APPROVAL_AMOUNT, ZERO } from '../../constants'
import { useCooldownDetails, useFunctions } from '../../hooks/useSolaceCoverProduct'
import { useWallet } from '../../context/WalletManager'
import { BigNumber } from 'ethers'
import { LocalTx, SolaceRiskScore } from '../../constants/types'
import {
  accurateMultiply,
  filterAmount,
  floatUnits,
  truncateValue,
  convertSciNotaToPrecise,
} from '../../utils/formatting'
import { getTimeFromMillis } from '../../utils/time'
import { useTransactionExecution } from '../../hooks/useInputAmount'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { parseUnits } from 'ethers/lib/utils'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import IERC20 from '../../constants/metadata/IERC20Metadata.json'
import useDebounce from '@rooks/use-debounce'
import { formatUnits } from 'ethers/lib/utils'
import { getContract } from '../../utils'
import { useContracts } from '../../context/ContractsManager'
import { useNotifications } from '../../context/NotificationsManager'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import { Text } from '../../components/atoms/Typography'
import { ModalCell } from '../../components/atoms/Modal'

export function PolicyBalance({
  balances,
  referralChecks,
  stableCoin,
  minReqAccBal,
  portfolio,
  currentCoverageLimit,
  newCoverageLimit,
  referralCode,
  walletAssetBalance,
  walletAssetDecimals,
  approval,
  inactive,
  inputProps,
  coverageActivity,
  setReferralCode,
}: {
  balances: {
    totalAccountBalance: BigNumber
    personalBalance: BigNumber
    earnedBalance: BigNumber
  }
  referralChecks: {
    codeIsUsable: boolean
    codeIsValid: boolean
    referrerIsActive: boolean
    checkingReferral: boolean
    referrerIsOther: boolean
  }
  stableCoin: string
  minReqAccBal: BigNumber
  portfolio: SolaceRiskScore | undefined
  currentCoverageLimit: BigNumber
  newCoverageLimit: BigNumber
  referralCode: string | undefined
  walletAssetBalance: BigNumber
  walletAssetDecimals: number
  approval: boolean
  inputProps: {
    amount: string
    isAppropriateAmount: (amount: string, amountDecimals: number, assetBalance: BigNumber) => boolean
    handleInputChange: (input: string, maxDecimals?: number | undefined, maxBalance?: string | undefined) => void
    resetAmount: () => void
  }
  coverageActivity: {
    policyId: BigNumber
    status: boolean
    coverageLimit: BigNumber
    mounting: boolean
  }
  inactive?: boolean
  setReferralCode: (referralCode: string | undefined) => void
}): JSX.Element {
  const [doesReachMinReqAccountBal, setDoesReachMinReqAccountBal] = useState(false)

  const { ifDesktop } = useWindowDimensions()
  const { account, library } = useWallet()
  const { activeNetwork } = useNetwork()
  const { keyContracts } = useContracts()
  const { solaceCoverProduct } = useMemo(() => keyContracts, [keyContracts])
  const { makeTxToast } = useNotifications()
  const { reload } = useCachedData()

  const { cooldownStart, cooldownLeft } = useCooldownDetails(account)

  const { deposit, withdraw, activatePolicy } = useFunctions()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  const [rangeValue, setRangeValue] = useState<string>('0')
  const [isDepositing, setIsDepositing] = useState<boolean>(true)
  const [stableCoinName, setStableCoinName] = useState<string>('')
  const [stableCoinSymbol, setStableCoinSymbol] = useState<string>('')

  const usdBalanceSum = useMemo(
    () =>
      portfolio && portfolio.protocols.length > 0
        ? portfolio.protocols.reduce((total, protocol) => (total += protocol.balanceUSD), 0)
        : 0,
    [portfolio]
  )

  const annualRate = useMemo(() => (portfolio && portfolio.current_rate ? portfolio.current_rate : 0), [portfolio])

  const annualCost = useMemo(() => (portfolio && portfolio.address_rp ? portfolio.address_rp : 0), [portfolio])

  const dailyRate = useMemo(() => annualRate / 365.25, [annualRate])

  const dailyCost = useMemo(() => {
    const numberifiedCurrentCoverageLimit = floatUnits(currentCoverageLimit, 18)
    if (usdBalanceSum < numberifiedCurrentCoverageLimit) return usdBalanceSum * dailyRate
    return numberifiedCurrentCoverageLimit * dailyRate
  }, [currentCoverageLimit, dailyRate, usdBalanceSum])

  const policyDuration = useMemo(() => (dailyCost > 0 ? floatUnits(balances.totalAccountBalance, 18) / dailyCost : 0), [
    dailyCost,
    balances.totalAccountBalance,
  ])

  const projectedDailyCost = useMemo(() => {
    const numberifiedNewCoverageLimit = floatUnits(newCoverageLimit, 18)
    if (usdBalanceSum < numberifiedNewCoverageLimit) return usdBalanceSum * dailyRate
    return numberifiedNewCoverageLimit * dailyRate
  }, [newCoverageLimit, dailyRate, usdBalanceSum])

  const projectedPolicyDuration = useMemo(() => {
    const bnAmount = BigNumber.from(accurateMultiply(inputProps.amount, 18))
    return projectedDailyCost > 0 ? floatUnits(balances.totalAccountBalance.add(bnAmount), 18) / projectedDailyCost : 0
  }, [projectedDailyCost, balances.totalAccountBalance, inputProps.amount])

  const isAcceptableAmount = useMemo(
    () => inputProps.isAppropriateAmount(inputProps.amount, walletAssetDecimals, walletAssetBalance),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputProps.amount, walletAssetBalance, walletAssetDecimals]
  )

  const referralValidation = useMemo(
    () =>
      referralChecks.codeIsUsable &&
      referralChecks.codeIsValid &&
      referralChecks.referrerIsActive &&
      !referralChecks.checkingReferral &&
      referralChecks.referrerIsOther,
    [referralChecks]
  )

  const unlimitedApprove = async () => {
    if (!solaceCoverProduct || !account || !library) return
    const stablecoinContract = getContract(stableCoin, IERC20.abi, library, account)
    try {
      const tx: TransactionResponse = await stablecoinContract.approve(solaceCoverProduct.address, MAX_APPROVAL_AMOUNT)
      const txHash = tx.hash
      makeTxToast(FunctionName.APPROVE, TransactionCondition.PENDING, txHash)
      await tx.wait(activeNetwork.rpc.blockConfirms).then((receipt: TransactionReceipt) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(FunctionName.APPROVE, status, txHash)
        reload()
      })
    } catch (err) {
      handleContractCallError('approve', err, FunctionName.APPROVE)
    }
  }

  const callDeposit = async () => {
    if (!account) return
    await deposit(account, parseUnits(inputProps.amount, 18))
      .then((res) => _handleToast1(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callDeposit', err, FunctionName.SOTERIA_DEPOSIT))
  }

  const callWithdraw = async () => {
    if (!account) return
    await withdraw()
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callWithdraw', err, FunctionName.SOTERIA_WITHDRAW))
  }

  const callActivatePolicy = async () => {
    if (!account) return
    const amount_ = inputProps.amount.length > 0 ? inputProps.amount : '0'
    await activatePolicy(
      account,
      newCoverageLimit,
      parseUnits(amount_, 18),
      referralValidation && referralCode ? referralCode : []
    )
      .then((res) => _handleToast2(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callActivatePolicy', err, FunctionName.SOTERIA_ACTIVATE))
  }

  const _handleInputChange = (_amount: string) => {
    inputProps.handleInputChange(_amount, walletAssetDecimals)
    const filtered = filterAmount(_amount, inputProps.amount)
    setRangeValue(accurateMultiply(filtered, walletAssetDecimals))
  }

  const handleRangeChange = (rangeAmount: string, convertFromSciNota = true) => {
    inputProps.handleInputChange(
      formatUnits(
        BigNumber.from(`${convertFromSciNota ? convertSciNotaToPrecise(rangeAmount) : rangeAmount}`),
        walletAssetDecimals
      )
    )
    setRangeValue(`${convertFromSciNota ? convertSciNotaToPrecise(rangeAmount) : rangeAmount}`)
  }

  const _handleToast1 = async (tx: any, localTx: LocalTx | null) => {
    await _handleToast2(tx, localTx)
    setReferralCode(undefined)
  }

  const _handleToast2 = async (tx: any, localTx: LocalTx | null) => {
    await handleToast(tx, localTx)
    inputProps.resetAmount()
  }

  const _checkMinReqAccountBal = useDebounce(async () => {
    const bnAmount = BigNumber.from(accurateMultiply(inputProps.amount, 18))
    setDoesReachMinReqAccountBal(balances.personalBalance.add(bnAmount).gt(minReqAccBal))
  }, 300)

  useEffect(() => {
    const getStableCoinDetails = async () => {
      const contract = getContract(stableCoin, IERC20.abi, library, account)
      const [name, symbol] = await Promise.all([contract.name(), contract.symbol()])
      setStableCoinName(name)
      setStableCoinSymbol(symbol)
    }
    getStableCoinDetails()
  }, [stableCoin])

  useEffect(() => {
    _checkMinReqAccountBal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balances.personalBalance, inputProps.amount, minReqAccBal])

  useEffect(() => {
    inputProps.resetAmount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inactive])

  return (
    <Flex
      col
      stretch
      gap={40}
      style={{
        width: '100%',
      }}
    >
      <Flex between itemsCenter>
        <Text t2 bold techygradient>
          Policy Balance
        </Text>
        <StyledTooltip
          id={'policy-balance'}
          tip={[
            'You can control the balance on your policy here.',
            'To pay for your coverage, your balance is deducted weekly or when you make changes to the policy.',
          ]}
        >
          <QuestionCircle height={20} width={20} color={'#aaa'} />
        </StyledTooltip>
      </Flex>
      <Flex
        col
        between
        stretch
        gap={30}
        pl={ifDesktop(2)}
        pr={ifDesktop(2)}
        style={{
          height: '100%',
        }}
      >
        <Flex col gap={10} stretch>
          {coverageActivity.status && (
            <Flex pl={24} pr={24} mt={10} col gap={10}>
              <Flex between>
                <Text t4s>Your Annual Cost</Text>
                <Text t4s bold>
                  {truncateValue(annualCost, 2)}{' '}
                  <Text t6s inline>
                    DAI/Year
                  </Text>
                </Text>
              </Flex>
              <Flex between>
                <Text t4s>Coverage Price</Text>
                <Text t4s bold>
                  {truncateValue(dailyCost, 2)}{' '}
                  <Text t6s inline>
                    DAI/Day
                  </Text>
                </Text>
              </Flex>
              <Flex between>
                <Text t4s>Estimated Policy Duration</Text>
                <Text t4s bold>
                  {truncateValue(policyDuration, 2)}{' '}
                  <Text t6s inline>
                    Days
                  </Text>
                </Text>
              </Flex>
            </Flex>
          )}
          {!coverageActivity.status && (
            <Flex pl={24} pr={24} mt={10} col gap={10}>
              <Flex between>
                <Text t4s>Your Annual Cost</Text>
                <Text t4s bold>
                  {truncateValue(annualCost, 2)}{' '}
                  <Text t6s inline>
                    DAI/Year
                  </Text>
                </Text>
              </Flex>
              <Flex between>
                <Text t4s>Projected Coverage Price</Text>
                <Text t4s bold warning>
                  {truncateValue(projectedDailyCost, 2)}{' '}
                  <Text t6s inline>
                    DAI/Day
                  </Text>
                </Text>
              </Flex>
              <Flex between>
                <Text t4s>Projected Policy Duration</Text>
                <Text t4s bold warning>
                  {truncateValue(projectedPolicyDuration, 2)}{' '}
                  <Text t6s inline>
                    Days
                  </Text>
                </Text>
              </Flex>
            </Flex>
          )}
          <StyledGrayBox>
            <Flex
              stretch
              gap={13}
              style={{
                width: '100%',
              }}
            >
              <Flex col gap={8}>
                <Text t4s bold>
                  Effective Balance
                </Text>
                <Flex gap={6}>
                  $
                  <Text t2s bold autoAlignVertical>
                    {commaNumber(
                      truncateValue(formatUnits(balances.totalAccountBalance, walletAssetDecimals), 2, false)
                    )}
                  </Text>
                </Flex>
              </Flex>
              <VerticalSeparator />
              <Flex
                col
                stretch
                gap={5.5}
                style={{
                  flex: 1,
                }}
              >
                <Flex between>
                  <Text t4s bold info>
                    Personal
                  </Text>
                  <Text t4s bold info>
                    {commaNumber(truncateValue(formatUnits(balances.personalBalance, walletAssetDecimals), 2, false))}{' '}
                    DAI
                  </Text>
                </Flex>
                <Flex between>
                  <Text t4s bold techygradient>
                    Bonus
                  </Text>
                  <Text t4s bold techygradient>
                    {commaNumber(truncateValue(formatUnits(balances.earnedBalance, walletAssetDecimals), 2, false))} DAI
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </StyledGrayBox>
        </Flex>
        <HorizRule widthP={100} />
        {!coverageActivity.policyId.eq(ZERO) && (
          <div style={{ gridTemplateColumns: '1fr 0fr 1fr', display: 'grid', position: 'relative' }}>
            <ModalCell
              pt={5}
              pb={10}
              pl={0}
              pr={0}
              onClick={() => setIsDepositing(true)}
              jc={'center'}
              style={{ cursor: 'pointer', backgroundColor: isDepositing ? 'rgba(0, 0, 0, .05)' : 'inherit' }}
            >
              <Text t2 bold info={isDepositing}>
                {inactive ? 'Activate' : 'Deposit'}
              </Text>
            </ModalCell>
            <VerticalSeparator />
            <ModalCell
              pt={5}
              pb={10}
              pl={0}
              pr={0}
              onClick={() => setIsDepositing(false)}
              jc={'center'}
              style={{
                cursor: 'pointer',
                backgroundColor: !isDepositing ? 'rgba(0, 0, 0, .05)' : 'inherit',
              }}
            >
              <Text t2 bold info={!isDepositing}>
                Withdraw
              </Text>
            </ModalCell>
          </div>
        )}
        <Flex col gap={20}>
          {isDepositing ? (
            <>
              {inactive && <Text t4>Set the coverage limit and initial deposit for your policy</Text>}
              <GenericInputSection
                icon={<img src={`https://assets.solace.fi/${stableCoinName.toLowerCase()}`} height={20} />}
                onChange={(e) => _handleInputChange(e.target.value)}
                text={stableCoinSymbol}
                value={inputProps.amount}
                disabled={false}
                displayIconOnMobile
                style={{ width: '99%' }}
              />
              <StyledSlider
                disabled={false}
                min={0}
                max={walletAssetBalance.toString()}
                value={rangeValue}
                onChange={(e) => handleRangeChange(e.target.value)}
              />
            </>
          ) : (
            <>
              <Text t4>
                You can withdraw your entire personal balance after your cooldown period has passed. To start the
                cooldown, deactivate your policy first.
              </Text>
              {!coverageActivity.policyId.eq(ZERO) && (
                <Flex between gap={10}>
                  <Flex gap={4}>
                    <Text t5s bold>
                      Cooldown:
                    </Text>
                    <Text info t5s bold>
                      {cooldownStart.eq(ZERO)
                        ? 'Not started'
                        : getTimeFromMillis(cooldownLeft.toNumber() * 1000) == '0'
                        ? 'Passed'
                        : getTimeFromMillis(cooldownLeft.toNumber() * 1000)}
                    </Text>
                  </Flex>
                  <Flex gap={4}>
                    <Text t5s bold>
                      Withdrawable:
                    </Text>
                    <Text info t5s bold>
                      {!cooldownStart.eq(ZERO) && getTimeFromMillis(cooldownLeft.toNumber() * 1000) == '0'
                        ? commaNumber(
                            truncateValue(formatUnits(balances.personalBalance, walletAssetDecimals), 2, false)
                          )
                        : commaNumber(
                            truncateValue(
                              formatUnits(
                                balances.personalBalance.gt(minReqAccBal)
                                  ? balances.personalBalance.sub(minReqAccBal)
                                  : ZERO,
                                walletAssetDecimals
                              ),
                              2,
                              false
                            )
                          )}
                    </Text>
                  </Flex>
                </Flex>
              )}
            </>
          )}
        </Flex>
        <Flex col gap={20}>
          {!isDepositing && (
            <Button
              info
              pl={ifDesktop(46.75)}
              pr={ifDesktop(46.75)}
              pt={8}
              pb={8}
              style={{
                fontWeight: 600,
                flex: 1,
              }}
              onClick={callWithdraw}
              disabled={balances.personalBalance.isZero()}
            >
              Withdraw
            </Button>
          )}
          {isDepositing && (
            <>
              {inactive && approval && (
                <>
                  {!doesReachMinReqAccountBal && (
                    <Text autoAlignHorizontal t4 error>
                      Insufficient deposit (Need at least over:{' '}
                      {truncateValue(formatUnits(minReqAccBal, walletAssetDecimals), 2)})
                    </Text>
                  )}
                  {newCoverageLimit.eq(ZERO) && (
                    <Text autoAlignHorizontal t4 error>
                      Your coverage limit cannot be zero
                    </Text>
                  )}
                  <Button
                    info
                    secondary
                    disabled={
                      !doesReachMinReqAccountBal ||
                      newCoverageLimit.eq(ZERO) ||
                      (inputProps.amount != '' &&
                        parseUnits(inputProps.amount, walletAssetDecimals).gt(walletAssetBalance))
                    }
                    onClick={callActivatePolicy}
                  >
                    Activate my policy
                  </Button>
                </>
              )}
              {!inactive && approval && (
                <Button
                  info
                  secondary
                  disabled={!isAcceptableAmount}
                  pl={ifDesktop(46.75)}
                  pr={ifDesktop(46.75)}
                  pt={8}
                  pb={8}
                  style={{
                    fontWeight: 600,
                    flex: 1,
                  }}
                  onClick={callDeposit}
                >
                  Deposit
                </Button>
              )}
              {!approval && (
                <Button
                  info
                  secondary
                  pl={ifDesktop(46.75)}
                  pr={ifDesktop(46.75)}
                  pt={8}
                  pb={8}
                  style={{
                    fontWeight: 600,
                    flex: 1,
                  }}
                  onClick={unlimitedApprove}
                  // disabled={inputProps.amount == '' || parseUnits(inputProps.amount, 18).eq(ZERO)}
                >
                  Approve
                </Button>
              )}
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
