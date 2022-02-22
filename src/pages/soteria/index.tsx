import React, { useEffect, useState, useMemo } from 'react'
import {
  Flex,
  ShadowDiv,
  GrayBgDiv,
  Content,
  HeroContainer,
  HorizRule,
  VerticalSeparator,
} from '../../components/atoms/Layout'
import { QuestionCircle } from '@styled-icons/bootstrap/QuestionCircle'
// src/components/atoms/Button/index.ts
import { Button, GraySquareButton } from '../../components/atoms/Button'
// src/resources/svg/icons/usd.svg
import DAI from '../../resources/svg/icons/dai.svg'
import { FixedHeightGrayBox, StyledGrayBox } from '../../components/molecules/GrayBox'
import { GenericInputSection } from '../../components/molecules/InputSection'
import { Input, StyledSlider } from '../../components/atoms/Input'
import commaNumber from '../../utils/commaNumber'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableData } from '../../components/atoms/Table'
import { StyledTooltip } from '../../components/molecules/Tooltip'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { ADDRESS_ZERO, BKPT_5, MAX_APPROVAL_AMOUNT, ZERO } from '../../constants'
import {
  useCheckIsCoverageActive,
  useCooldownDetails,
  useFunctions,
  usePortfolio,
  useTotalAccountBalance,
} from '../../hooks/useSolaceCoverProduct'
import { useWallet } from '../../context/WalletManager'
import { BigNumber, Contract } from 'ethers'
import { useGeneral } from '../../context/GeneralManager'
import { StyledArrowIosBackOutline, StyledArrowIosForwardOutline } from '../../components/atoms/Icon'
import { LocalTx, SolaceRiskProtocol, SolaceRiskScore } from '../../constants/types'
import {
  accurateMultiply,
  capitalizeFirstLetter,
  filterAmount,
  floatUnits,
  truncateValue,
  convertSciNotaToPrecise,
  shortenAddress,
} from '../../utils/formatting'
import { getTimeFromMillis } from '../../utils/time'
import { useInputAmount, useTransactionExecution } from '../../hooks/useInputAmount'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { parseUnits } from 'ethers/lib/utils'
import { useCachedData } from '../../context/CachedDataManager'
import { useProvider } from '../../context/ProviderManager'
import { DAI_ADDRESS } from '../../constants/mappings/tokenAddressMapping'
import { useNetwork } from '../../context/NetworkManager'
import IERC20 from '../../constants/metadata/IERC20Metadata.json'
import { queryBalance, queryDecimals } from '../../utils/contract'
import useDebounce from '@rooks/use-debounce'
import { formatUnits } from 'ethers/lib/utils'
import { getContract } from '../../utils'
import { useContracts } from '../../context/ContractsManager'
import { useNotifications } from '../../context/NotificationsManager'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import { useTokenAllowance } from '../../hooks/useToken'
import { Loader } from '../../components/atoms/Loader'
import { TextSpan, Text } from '../../components/atoms/Typography'
import { Box, RaisedBox } from '../../components/atoms/Box'
import { StyledInfo } from '../../components/atoms/Icon'
import { WalletConnectButton } from '../../components/molecules/WalletConnectButton'
import { ModalCell } from '../../components/atoms/Modal'

import Zapper from '../../resources/svg/zapper.svg'
import ZapperDark from '../../resources/svg/zapper-dark.svg'
import { CopyButton } from '../../components/molecules/CopyButton'

function Card({
  children,
  style,
  thinner,
  innerBigger,
  innerThinner,
  bigger,
  normous,
  horiz,
  inactive,
  noShadow,
  noPadding,
  gap,
  ...rest
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  /** first card - `flex: 0.8` */ thinner?: boolean
  /** second card - `flex 1` */ bigger?: boolean
  /** second card inactive - `flex 1.2` */ innerBigger?: boolean
  /** second card - `flex: 0.8` */ innerThinner?: boolean
  /* big box under coverage active toggle - flex: 12*/ normous?: boolean
  /** first time 2-form card - `flex 2` */ inactive?: boolean
  horiz?: boolean
  noShadow?: boolean
  noPadding?: boolean
  gap?: number
}) {
  const defaultStyle = style ?? {}
  // thinner is 0.8, bigger is 1.2
  const customStyle = {
    display: 'flex',
    flex: (() => {
      if (thinner) return 0.8
      if (bigger) return 1
      if (innerBigger) return 1.2
      if (innerThinner) return 0.9
      if (normous) return 12
      if (inactive) return 2
    })(),
  }
  const combinedStyle = { ...defaultStyle, ...customStyle }

  const colStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'stretch',
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
  }

  return !noShadow ? (
    <ShadowDiv style={combinedStyle} {...rest}>
      <RaisedBox style={horiz ? rowStyle : colStyle}>
        <Flex p={!noPadding ? 24 : undefined} column={!horiz} stretch flex1 gap={gap}>
          {children}
        </Flex>
      </RaisedBox>
    </ShadowDiv>
  ) : (
    <Flex style={combinedStyle} {...rest} col>
      <RaisedBox style={horiz ? rowStyle : colStyle}>
        <Flex p={!noPadding ? 24 : undefined} column={!horiz} stretch flex1 gap={gap}>
          {children}
        </Flex>
      </RaisedBox>
    </Flex>
  )
}

// second line is an svg circle with a text inside
// third line is a text below the circle
// fourth line is 1 submit and 1 cancel button

enum ChosenLimit {
  Custom,
  MaxPosition,
  Recommended,
}

const ChosenLimitLength = Object.values(ChosenLimit).filter((x) => typeof x === 'number').length

const nextChosenLimit = (chosenLimit: ChosenLimit) => ((chosenLimit + 1) % ChosenLimitLength) as ChosenLimit
const prevChosenLimit = (chosenLimit: ChosenLimit) =>
  ((chosenLimit - 1 + ChosenLimitLength) % ChosenLimitLength) as ChosenLimit

function CoverageLimitBasicForm({
  portfolio,
  currentCoverageLimit,
  isEditing,
  setNewCoverageLimit,
}: {
  portfolio: SolaceRiskScore | undefined
  currentCoverageLimit: BigNumber
  isEditing: boolean
  setNewCoverageLimit: (newCoverageLimit: BigNumber) => void
}) {
  const [chosenLimit, setChosenLimit] = useState<ChosenLimit>(ChosenLimit.Recommended)

  const highestPosition = useMemo(
    () =>
      portfolio && portfolio.protocols.length > 0
        ? portfolio.protocols.reduce((pn, cn) => (cn.balanceUSD > pn.balanceUSD ? cn : pn))
        : undefined,
    [portfolio]
  )

  // const usdBalanceSum = useMemo(
  //   () =>
  //     portfolio && portfolio.protocols.length > 0
  //       ? portfolio.protocols.reduce((total, protocol) => (total += protocol.balanceUSD), 0)
  //       : 0,
  //   [portfolio]
  // )

  const [highestAmount, setHighestAmount] = useState<BigNumber>(ZERO)
  const [recommendedAmount, setRecommendedAmount] = useState<BigNumber>(ZERO)
  const [customInputAmount, setCustomInputAmount] = useState<string>('')

  const handleInputChange = (input: string) => {
    // allow only numbers and decimals
    const filtered = filterAmount(input, customInputAmount)

    // if filtered is only "0." or "." or '', filtered becomes '0.0'
    // const formatted = formatAmount(filtered)

    // if number has more than max decimal places, do not update
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 18) return

    // if number is greater than available cover capacity, do not update
    // if (parseUnits(formatted, 18).gt(availableCoverCapacity)) return

    const bnFiltered = BigNumber.from(accurateMultiply(filtered, 18))
    setNewCoverageLimit(bnFiltered)
    setCustomInputAmount(filtered)
    if (!recommendedAmount.eq(bnFiltered) && !highestAmount.eq(bnFiltered)) {
      setChosenLimit(ChosenLimit.Custom)
    }
  }

  useEffect(() => {
    if (!highestPosition) return
    /** Big Number Balance */ const bnBal = BigNumber.from(accurateMultiply(highestPosition.balanceUSD, 18))
    /** balance + 20% */ const bnHigherBal = bnBal.add(bnBal.div(BigNumber.from('5')))
    setHighestAmount(bnBal)
    setRecommendedAmount(bnHigherBal)
  }, [highestPosition])

  useEffect(() => {
    switch (chosenLimit) {
      case ChosenLimit.Recommended:
        setNewCoverageLimit(recommendedAmount)
        setCustomInputAmount(formatUnits(recommendedAmount, 18))
        break
      case ChosenLimit.MaxPosition:
        setNewCoverageLimit(highestAmount)
        setCustomInputAmount(formatUnits(highestAmount, 18))
        break
    }
  }, [chosenLimit, highestAmount, setNewCoverageLimit, recommendedAmount, customInputAmount])

  return (
    <>
      <Flex col gap={30} stretch>
        {!isEditing ? (
          <FixedHeightGrayBox
            h={66}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '40px',
            }}
          >
            <Flex baseline center>
              <Text techygradient t2 bold>
                {commaNumber(truncateValue(floatUnits(currentCoverageLimit, 18), 2, false))}{' '}
                <Text techygradient t4 bold inline>
                  USD
                </Text>
              </Text>
            </Flex>
          </FixedHeightGrayBox>
        ) : (
          <Flex col stretch>
            <Flex justifyCenter>
              <Text t4s>Select Limit</Text>
            </Flex>
            <Flex between itemsCenter mt={10}>
              <GraySquareButton onClick={() => setChosenLimit(prevChosenLimit(chosenLimit))}>
                <StyledArrowIosBackOutline height={18} />
              </GraySquareButton>
              <Flex col itemsCenter>
                <Text info t3 bold>
                  {
                    {
                      [ChosenLimit.Recommended]: 'Recommended',
                      [ChosenLimit.MaxPosition]: 'Base',
                      [ChosenLimit.Custom]: 'Manual',
                    }[chosenLimit]
                  }
                </Text>
                <Text info t5s>
                  {
                    {
                      [ChosenLimit.Recommended]: `120% of your highest position`,
                      [ChosenLimit.MaxPosition]: `100% of your highest position`,
                      [ChosenLimit.Custom]: `Enter custom amount below`,
                    }[chosenLimit]
                  }
                </Text>
              </Flex>
              <GraySquareButton onClick={() => setChosenLimit(nextChosenLimit(chosenLimit))}>
                <StyledArrowIosForwardOutline height={18} />
              </GraySquareButton>
            </Flex>
            <GenericInputSection
              // icon={<img src={DAI} alt="DAI" height={20} />}
              onChange={(e) => handleInputChange(e.target.value)}
              text="DAI"
              value={customInputAmount}
              disabled={false}
              style={{
                marginTop: '20px',
              }}
              iconAndTextWidth={80}
              displayIconOnMobile
            />
          </Flex>
        )}
        {portfolio && portfolio.protocols.length > 0 && (
          <Flex col stretch>
            {/* <Flex center mt={4}>
              <Flex baseline gap={4} center>
                <Text t4>Net worth found in your portfolio:</Text>
              </Flex>
            </Flex>
            <Flex center mt={4}>
              <Flex baseline gap={4} center>
                <Flex gap={4} baseline mt={2}>
                  <Text t3 bold>
                    {truncateValue(usdBalanceSum, 2, false)}
                  </Text>
                  <Text t4 bold>
                    USD
                  </Text>
                </Flex>
              </Flex>
            </Flex> */}
            <Flex center mt={20}>
              <Flex baseline gap={4} center>
                <Text t4>Highest position in your portfolio:</Text>
              </Flex>
            </Flex>
            <Flex center mt={4}>
              <Flex baseline gap={4} center>
                <Flex gap={4} baseline mt={2}>
                  <Text t2 bold>
                    {truncateValue(formatUnits(highestAmount, 18), 2, false)}
                  </Text>
                  <Text t4 bold>
                    USD
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        )}
      </Flex>
    </>
  )
}

// second line is an svg circle with a text inside
// third line is a text below the circle
// fourth line is 1 submit and 1 cancel button

function CoverageLimit({
  balances,
  referralChecks,
  minReqAccBal,
  currentCoverageLimit,
  newCoverageLimit,
  isEditing,
  portfolio,
  referralCode,
  setNewCoverageLimit,
  setIsEditing,
  setReferralCode,
  canPurchaseNewCover,
  inactive,
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
  minReqAccBal: BigNumber
  currentCoverageLimit: BigNumber
  newCoverageLimit: BigNumber
  isEditing: boolean
  portfolio: SolaceRiskScore | undefined
  referralCode: string | undefined
  setNewCoverageLimit: (newCoverageLimit: BigNumber) => void
  setIsEditing: (isEditing: boolean) => void
  setReferralCode: (referralCode: string | undefined) => void
  canPurchaseNewCover: boolean
  inactive?: boolean
}) {
  const { account } = useWallet()
  const startEditing = () => setIsEditing(true)
  const stopEditing = () => setIsEditing(false)
  const [doesReachMinReqAccountBal, setDoesReachMinReqAccountBal] = useState(false)

  const { updateCoverLimit } = useFunctions()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  const referralValidation = useMemo(
    () =>
      referralChecks.codeIsUsable &&
      referralChecks.codeIsValid &&
      referralChecks.referrerIsActive &&
      !referralChecks.checkingReferral &&
      referralChecks.referrerIsOther,
    [referralChecks]
  )

  const callUpdateCoverLimit = async () => {
    if (!account) return
    await updateCoverLimit(newCoverageLimit, referralValidation && referralCode ? referralCode : [])
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callUpdateCoverLimit', err, FunctionName.SOTERIA_UPDATE))
  }

  const _handleToast = async (tx: any, localTx: LocalTx | null) => {
    await handleToast(tx, localTx)
    setReferralCode(undefined)
    stopEditing()
  }

  const _handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    handleContractCallError(functionName, err, txType)
  }

  const _checkMinReqAccountBal = useDebounce(async () => {
    setDoesReachMinReqAccountBal(balances.personalBalance.gt(minReqAccBal))
  }, 300)

  useEffect(() => {
    _checkMinReqAccountBal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minReqAccBal, balances])

  return (
    <Flex
      between
      col
      stretch
      style={{
        flex: '1',
      }}
    >
      <Flex itemsCenter between>
        <Text t2 bold techygradient>
          Coverage Limit
        </Text>
        <StyledTooltip
          id={'coverage-limit'}
          tip={[
            'Cover limit is the maximum payout in the event of a claim.',
            'You may set your cover limit to the amount of your largest position, or an amount of your choice.',
          ]}
        >
          <QuestionCircle height={20} width={20} color={'#aaa'} />
        </StyledTooltip>
      </Flex>
      <CoverageLimitBasicForm
        currentCoverageLimit={currentCoverageLimit}
        isEditing={isEditing}
        portfolio={portfolio}
        setNewCoverageLimit={setNewCoverageLimit}
      />
      <Flex justifyCenter={!isEditing} between={isEditing} gap={isEditing ? 20 : undefined} pt={10} pb={10}>
        {inactive ? (
          <div style={{ height: '36px' }} />
        ) : !isEditing ? (
          <Button
            info
            secondary
            pl={46.75}
            pr={46.75}
            pt={8}
            pb={8}
            style={{
              fontWeight: 600,
            }}
            onClick={startEditing}
          >
            Edit Limit
          </Button>
        ) : (
          <>
            <Button info pt={8} pb={8} style={{ fontWeight: 600, flex: 1, transition: '0s' }} onClick={stopEditing}>
              Discard
            </Button>
            <Button
              info
              secondary
              pt={8}
              pb={8}
              style={{ fontWeight: 600, flex: 1, transition: '0s' }}
              onClick={callUpdateCoverLimit}
              disabled={!doesReachMinReqAccountBal || !canPurchaseNewCover}
            >
              Save
            </Button>
          </>
        )}
      </Flex>
    </Flex>
  )
}

function PolicyBalance({
  balances,
  referralChecks,
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
}) {
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
    const stablecoinContract = getContract(DAI_ADDRESS[activeNetwork.chainId], IERC20.abi, library, account)
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
              style={{ cursor: 'pointer', backgroundColor: !isDepositing ? 'rgba(0, 0, 0, .05)' : 'inherit' }}
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
                backgroundColor: isDepositing ? 'rgba(0, 0, 0, .05)' : 'inherit',
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
                icon={<img src={DAI} height={20} />}
                onChange={(e) => _handleInputChange(e.target.value)}
                text="DAI"
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

function CoverageActive({ policyStatus }: { policyStatus: boolean }) {
  const { deactivatePolicy } = useFunctions()
  const { account } = useWallet()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  const callDeactivatePolicy = async () => {
    if (!account) return
    await deactivatePolicy()
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callDeactivatePolicy', err, FunctionName.SOTERIA_DEACTIVATE))
  }

  return (
    <Card>
      <Flex between itemsCenter>
        <Flex col gap={6}>
          <Flex stretch gap={7}>
            <Text t2s bold>
              Coverage
            </Text>
            <Text t2s bold success={policyStatus} warning={!policyStatus}>
              {policyStatus ? 'Active' : 'Inactive'}
            </Text>
          </Flex>
        </Flex>
        <Flex between itemsCenter>
          {policyStatus && (
            <Button onClick={callDeactivatePolicy} error>
              Deactivate
            </Button>
          )}
        </Flex>
      </Flex>
    </Card>
  )
}

function ReferralSection({
  referralCode,
  referralChecks,
  setReferralCode,
  userCanRefer,
}: {
  referralCode: string | undefined
  referralChecks: {
    codeIsUsable: boolean
    codeIsValid: boolean
    referrerIsActive: boolean
    checkingReferral: boolean
    referrerIsOther: boolean
  }
  setReferralCode: (referralCode: string | undefined) => void
  userCanRefer: boolean
}) {
  const { keyContracts } = useContracts()
  const { solaceCoverProduct } = useMemo(() => keyContracts, [keyContracts])
  const { activeNetwork } = useNetwork()
  const [formReferralCode, setFormReferralCode] = useState(referralCode)
  const [generatedReferralCode, setGeneratedReferralCode] = useState('')

  const getReferralCode = async () => {
    const ethereum = (window as any).ethereum
    if (!ethereum || !solaceCoverProduct) return
    const domainType = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ]

    const msgParams = JSON.stringify({
      domain: {
        name: 'Solace.fi-SolaceCoverProduct',
        version: '1',
        chainId: activeNetwork.chainId,
        verifyingContract: solaceCoverProduct.address,
      },

      message: {
        version: 1,
      },

      primaryType: 'SolaceReferral',

      types: {
        EIP712Domain: domainType,
        SolaceReferral: [{ name: 'version', type: 'uint256' }],
      },
    })

    ethereum
      .request({
        method: 'eth_signTypedData_v4',
        params: [ethereum.selectedAddress, msgParams],
      })
      .then((code: any) => {
        let code_ = String(code)
        if (code_.substring(code_.length - 2, code_.length) == '00') code_ = code_.substring(0, code_.length - 2) + '1b'
        if (code_.substring(code_.length - 2, code_.length) == '01') code_ = code_.substring(0, code_.length - 2) + '1c'
        setGeneratedReferralCode(code_)
      })
      .catch((error: any) => console.log(error))
  }

  return (
    <Card normous horiz>
      <Flex
        stretch
        col
        style={{
          width: '100%',
        }}
        gap={userCanRefer ? 40 : 0}
      >
        <Flex between itemsCenter>
          <Text t2 bold techygradient>
            Bonuses
          </Text>
          <StyledTooltip
            id={'coverage-price'}
            tip={'You can use a referral code to claim a bonus, or share your own code with other users'}
          >
            <QuestionCircle height={20} width={20} color={'#aaa'} />
          </StyledTooltip>
        </Flex>
        <Flex col flex1 gap={40} stretch justifyCenter>
          {userCanRefer && (
            <Flex col gap={10} stretch>
              <Text t4s>
                Give bonuses to users who get coverage via your referral link while you are covered (You&apos;ll get $50
                when your referral code is used) :
              </Text>
              {generatedReferralCode.length > 0 ? (
                <>
                  <Flex
                    p={5}
                    style={{
                      alignItems: 'flex-end',
                    }}
                  >
                    <Input
                      t4s
                      bold
                      techygradient
                      widthP={100}
                      readOnly
                      value={shortenAddress(generatedReferralCode)}
                      textAlignCenter
                    />
                  </Flex>
                  <CopyButton widthP={100} info toCopy={generatedReferralCode} objectName={'Code'} />
                  <CopyButton
                    widthP={100}
                    info
                    toCopy={`${(window as any).location.href}?rc=${generatedReferralCode}`}
                    objectName={'Link'}
                  />
                </>
              ) : (
                <Button info onClick={getReferralCode}>
                  Get My Code
                </Button>
              )}
            </Flex>
          )}
          <Flex col gap={10} stretch>
            <Text t4s>
              <Text t4s inline bold techygradient>
                Got a referral code?
              </Text>{' '}
              Enter here to claim $50 bonus credit when you{' '}
              <Text t4s inline info italics>
                activate a policy
              </Text>{' '}
              <Text t4s inline>
                or
              </Text>{' '}
              <Text t4s inline info italics>
                update your coverage limit
              </Text>
              :
            </Text>
            {referralCode && formReferralCode === referralCode && !referralChecks.checkingReferral ? (
              !referralChecks.codeIsUsable ? (
                <Text t4s error bold>
                  This policy already used a referral code. Cannot be applied.
                </Text>
              ) : !referralChecks.codeIsValid ? (
                <Text t4s error bold>
                  This referral code is invalid. Cannot be applied.
                </Text>
              ) : !referralChecks.referrerIsActive ? (
                <Text t4s error bold>
                  The referrer of this code has no active policy. Cannot be applied.
                </Text>
              ) : !referralChecks.referrerIsOther ? (
                <Text t4s error bold>
                  Sorry, but you cannot use your own referral code.
                </Text>
              ) : (
                <Text t4s success bold>
                  This referral code is valid. Will be applied.
                </Text>
              )
            ) : null}
            <GenericInputSection
              onChange={(e) => setFormReferralCode(e.target.value)}
              value={formReferralCode}
              buttonDisabled={
                referralCode != undefined && formReferralCode != undefined && formReferralCode === referralCode
              }
              displayIconOnMobile
              placeholder={'Enter your referral code'}
              buttonOnClick={() => setReferralCode(formReferralCode)}
              buttonText="Check"
            />
          </Flex>
        </Flex>
      </Flex>
    </Card>
  )
}

function PortfolioTable({ portfolio }: { portfolio: SolaceRiskScore | undefined }) {
  const { width } = useWindowDimensions()
  const { appTheme } = useGeneral()
  const [tierColors, setTierColors] = useState<string[]>([])

  useEffect(() => {
    const getGreenToRedColors = (maxTier: number) => {
      if (!portfolio) return

      // rgb settings: since we only want red to green colors, only values r and g will be adjusted
      const luminosityPercentage = appTheme == 'light' ? 0.7 : 0.8
      const rangeMin = appTheme == 'light' ? 60 : 80
      const rangeMax = 255

      // b value appears to represent color intensity in this case, so it is set to rangeMin
      // the lower b is, the stronger the color
      const b = rangeMin
      let r = rangeMax
      let g = b

      const colors = []

      // since we are changing r and g, we are changing two color ranges of equal length,
      // then divide the product by the number of tiers to get the increment
      // we do not need increment if the max tier is 0 or 1
      const increment = maxTier > 1 ? ((rangeMax - rangeMin) * 2) / maxTier : (rangeMax - rangeMin) * 2

      // we start by changing the g value to get the green colors first
      let changingR = false
      for (let i = 0; i < maxTier + 1; i++) {
        // for easier index-to-color access, we are pushing values toward the beginning of the array
        // the lower the index, the greener the color, and the higher the index, the redder the color
        colors.unshift(`rgb(${r * luminosityPercentage}, ${g * luminosityPercentage}, ${b * luminosityPercentage})`)
        if (changingR) {
          r -= increment
        } else {
          // if g goes past the max range, pour that leftover increment into subtracting from r
          if (g + increment > rangeMax) {
            const leftOver = g + increment - rangeMax
            g = rangeMax
            r -= leftOver
            changingR = true
          } else {
            g += increment
          }
          // switch to change r value if we got all the g colors
          if (g == rangeMax) {
            changingR = true
          }
        }
      }
      setTierColors(colors)
    }
    const maxTierProtocol =
      portfolio && portfolio.protocols.length > 0
        ? portfolio.protocols.reduce((pn, cn) => (cn.tier > pn.tier ? cn : pn))
        : undefined
    if (maxTierProtocol) {
      getGreenToRedColors(maxTierProtocol.tier)
    }
  }, [portfolio, appTheme])

  const getColorByTier = (tier: number) => {
    const index = tier - 1
    if (index < 0) {
      return tierColors[tierColors.length - 1]
    } else {
      return tierColors[index]
    }
  }

  return (
    <>
      {width > BKPT_5 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Protocol</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Risk Level</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {portfolio &&
              portfolio.protocols.map((d: SolaceRiskProtocol, i) => (
                <TableRow key={i}>
                  <TableData>{capitalizeFirstLetter(d.appId)}</TableData>
                  <TableData>{d.category}</TableData>
                  <TableData>{d.balanceUSD}</TableData>
                  {tierColors.length > 0 && (
                    <TableData style={{ color: getColorByTier(d.tier) }}>{d.tier == 0 ? 'Unrated' : d.tier}</TableData>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      ) : (
        <Flex column gap={30}>
          {portfolio &&
            portfolio.protocols.map((row, i) => (
              <GrayBgDiv
                key={i}
                style={{
                  borderRadius: '10px',
                  padding: '14px 24px',
                }}
              >
                <Flex gap={30} between itemsCenter>
                  <Flex col gap={8.5}>
                    <div>{capitalizeFirstLetter(row.appId)}</div>
                  </Flex>
                  <Flex
                    col
                    gap={8.5}
                    style={{
                      textAlign: 'right',
                    }}
                  >
                    <div>{row.category}</div>
                    <div>{row.balanceUSD}</div>
                    {tierColors.length > 0 && (
                      <div style={{ color: getColorByTier(row.tier) }}>{row.tier == 0 ? 'Unrated' : row.tier}</div>
                    )}{' '}
                  </Flex>
                </Flex>
              </GrayBgDiv>
            ))}
        </Flex>
      )}
    </>
  )
}

enum ReferralSource {
  'Custom',
  'Standard',
  'StakeDAO',
}

enum FormStages {
  'Welcome',
  'RegularUser',
}

function WelcomeMessage({
  portfolio,
  type,
  goToSecondStage,
}: {
  portfolio: SolaceRiskScore | undefined
  type: ReferralSource
  goToSecondStage: () => void
}): JSX.Element {
  const { appTheme } = useGeneral()
  const annualCost = useMemo(() => (portfolio && portfolio.address_rp ? portfolio.address_rp : 0), [portfolio])

  switch (type) {
    case ReferralSource.Custom:
      return (
        <Card>
          <Flex col gap={30} itemsCenter>
            <Text t2s>Solace Wallet Coverage</Text>
            <Flex col gap={10} itemsCenter>
              <Text t2>Your annual cost based on your portfolio: {truncateValue(annualCost, 2)} USD/yr</Text>
              <Text t5s>By funding a single policy for your entire portfolio, you will be covered.</Text>
              <Text t5s>The table below is a list of your positions on protocols available for coverage.</Text>
            </Flex>
            <Button info secondary pl={23} pr={23} onClick={goToSecondStage}>
              Get Started
            </Button>
            {appTheme == 'light' && (
              <Flex center>
                <img src={Zapper} style={{ width: '145px' }} />
              </Flex>
            )}
            {appTheme == 'dark' && (
              <Flex center>
                <img src={ZapperDark} style={{ width: '145px' }} />
              </Flex>
            )}
          </Flex>
        </Card>
      )
    case ReferralSource.Standard:
      return (
        <Card>
          <Flex col gap={30} itemsCenter>
            <Text t2s>Solace Wallet Coverage</Text>
            <Flex col gap={10} itemsCenter>
              <Text t2>Your annual cost based on your portfolio: {truncateValue(annualCost, 2)} USD/yr</Text>
              <Text t5s>By funding a single policy for your entire portfolio, you will be covered.</Text>
              <Text t5s>The table below is a list of your positions on protocols available for coverage.</Text>
            </Flex>
            <Button info secondary pl={23} pr={23} onClick={goToSecondStage}>
              Get Started
            </Button>
            {appTheme == 'light' && (
              <Flex center>
                <img src={Zapper} style={{ width: '200px' }} />
              </Flex>
            )}
            {appTheme == 'dark' && (
              <Flex center>
                <img src={ZapperDark} style={{ width: '200px' }} />
              </Flex>
            )}
          </Flex>
        </Card>
      )
    case ReferralSource.StakeDAO:
      return (
        <Card>
          <Flex col gap={30} itemsCenter>
            <Text t2s>Solace Wallet Coverage</Text>
            <Flex col gap={10} itemsCenter>
              <Text t2>Your annual cost based on your portfolio: {truncateValue(annualCost, 2)} USD/yr</Text>
              <Text t5s>By funding a single policy for your entire portfolio, you will be covered.</Text>
              <Text t5s>The table below is a list of your positions on protocols available for coverage.</Text>
            </Flex>
            <Button info secondary pl={23} pr={23} onClick={goToSecondStage}>
              Get Started
            </Button>
            {appTheme == 'light' && (
              <Flex center>
                <img src={Zapper} style={{ width: '200px' }} />
              </Flex>
            )}
            {appTheme == 'dark' && (
              <Flex center>
                <img src={ZapperDark} style={{ width: '200px' }} />
              </Flex>
            )}
          </Flex>
        </Card>
      )
  }
}

export default function Soteria(): JSX.Element {
  const { referralCode: referralCodeFromStorage } = useGeneral()
  const { account, library } = useWallet()
  const { latestBlock } = useProvider()
  const { activeNetwork } = useNetwork()
  const { version } = useCachedData()
  const canShowSoteria = useMemo(() => !activeNetwork.config.restrictedFeatures.noSoteria, [
    activeNetwork.config.restrictedFeatures.noSoteria,
  ])
  const portfolio = usePortfolio(account, 1)
  const { isMobile } = useWindowDimensions()
  const { policyId, status, coverageLimit, mounting } = useCheckIsCoverageActive(account)
  const {
    getMinRequiredAccountBalance,
    getIsReferralCodeUsed,
    getIsReferralCodeValid,
    getReferrerFromReferralCode,
    getPolicyOf,
    getPolicyStatus,
    getAvailableCoverCapacity,
  } = useFunctions()
  const balances = useTotalAccountBalance(account)
  const { amount, isAppropriateAmount, handleInputChange, resetAmount } = useInputAmount()

  const currentCoverageLimit = useMemo(() => coverageLimit, [coverageLimit])
  const { keyContracts } = useContracts()
  const { solaceCoverProduct } = useMemo(() => keyContracts, [keyContracts])
  const firstTime = useMemo(() => policyId.isZero(), [policyId])

  const [referralType, setReferralType] = useState<ReferralSource>(ReferralSource.Standard)
  const [formStage, setFormStage] = useState<FormStages>(FormStages.Welcome)
  const goToSecondStage = () => setFormStage(FormStages.RegularUser)
  const [referralCode, setReferralCode] = useState<string | undefined>(undefined)

  const [newCoverageLimit, setNewCoverageLimit] = useState<BigNumber>(ZERO)
  const [isEditing, setIsEditing] = useState(false)
  const [codeIsUsable, setCodeIsUsable] = useState<boolean>(true)
  const [codeIsValid, setCodeIsValid] = useState<boolean>(true)
  const [referrerIsActive, setIsReferrerIsActive] = useState<boolean>(true)
  const [referrerIsOther, setIsReferrerIsOther] = useState<boolean>(true)
  const [checkingReferral, setCheckingReferral] = useState<boolean>(false)

  const [minReqAccBal, setMinReqAccBal] = useState<BigNumber>(ZERO)

  const [walletAssetBalance, setWalletAssetBalance] = useState<BigNumber>(ZERO)
  const [walletAssetDecimals, setWalletAssetDecimals] = useState<number>(0)

  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const spenderAddress = useMemo(() => (solaceCoverProduct ? solaceCoverProduct.address : null), [solaceCoverProduct])
  const approval = useTokenAllowance(
    contractForAllowance,
    spenderAddress,
    amount && amount != '.' ? parseUnits(amount, walletAssetDecimals).toString() : '0'
  )

  const [availableCoverCapacity, setAvailableCoverCapacity] = useState<BigNumber>(ZERO)

  const canPurchaseNewCover = useMemo(() => {
    if (newCoverageLimit.lte(currentCoverageLimit)) return true
    return newCoverageLimit.sub(currentCoverageLimit).lt(availableCoverCapacity)
  }, [availableCoverCapacity, currentCoverageLimit, newCoverageLimit])

  const _checkMinReqAccountBal = useDebounce(async () => {
    const minReqAccountBal = await getMinRequiredAccountBalance(newCoverageLimit)
    setMinReqAccBal(minReqAccountBal)
  }, 300)

  const _checkReferralCode = useDebounce(async () => {
    if (!referralCode || referralCode.length == 0 || !account) {
      setCodeIsValid(false)
      setCheckingReferral(false)
      setIsReferrerIsOther(true)
      return
    }
    const isValid = await getIsReferralCodeValid(referralCode)
    if (isValid) {
      const referrer = await getReferrerFromReferralCode(referralCode)
      if (referrer == ADDRESS_ZERO) {
        setIsReferrerIsActive(false)
        setIsReferrerIsOther(true)
      } else if (referrer.toLowerCase() == account.toLowerCase()) {
        setIsReferrerIsOther(false)
      } else {
        const refId = await getPolicyOf(referrer)
        const refStatus = await getPolicyStatus(refId)
        setIsReferrerIsActive(refStatus)
        setIsReferrerIsOther(true)
      }
    }
    setCodeIsValid(isValid)
    setCheckingReferral(false)
  }, 300)

  const _getAvailableFunds = useDebounce(async () => {
    if (!library || !account) return
    const tokenContract = new Contract(DAI_ADDRESS[activeNetwork.chainId], IERC20.abi, library)
    const balance = await queryBalance(tokenContract, account)
    const decimals = await queryDecimals(tokenContract)
    setWalletAssetBalance(balance)
    setWalletAssetDecimals(decimals)
    setContractForAllowance(tokenContract)
  }, 300)

  const _getCapacity = useDebounce(async () => {
    const capacity = await getAvailableCoverCapacity()
    setAvailableCoverCapacity(capacity)
  }, 300)

  useEffect(() => {
    _getCapacity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestBlock, version])

  useEffect(() => {
    _getAvailableFunds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, activeNetwork.chainId, library, latestBlock])

  useEffect(() => {
    setCheckingReferral(true)
    _checkReferralCode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralCode])

  useEffect(() => {
    _checkReferralCode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestBlock, version])

  useEffect(() => {
    _checkMinReqAccountBal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newCoverageLimit])

  useEffect(() => {
    if (mounting) return
    setIsEditing(!status)
  }, [status, mounting])

  useEffect(() => {
    if (referralCodeFromStorage) setReferralCode(referralCodeFromStorage)
  }, [referralCodeFromStorage])

  useEffect(() => {
    ;async () => {
      if (!account) {
        setCodeIsUsable(false)
        return
      }
      const isUsed = await getIsReferralCodeUsed(account)
      setCodeIsUsable(!isUsed)
    }
  }, [account])

  return (
    <>
      {!account ? (
        <HeroContainer>
          <Text bold t1 textAlignCenter>
            Please connect wallet to view dashboard
          </Text>
          <WalletConnectButton info welcome secondary />
        </HeroContainer>
      ) : canShowSoteria ? (
        <>
          {mounting ? (
            <Flex col gap={24} m={isMobile ? 20 : undefined}>
              <Loader />
            </Flex>
          ) : (
            <Flex col gap={24} m={isMobile ? 20 : undefined}>
              {firstTime && formStage === FormStages.Welcome ? (
                <WelcomeMessage portfolio={portfolio} type={referralType} goToSecondStage={goToSecondStage} />
              ) : (
                <Flex gap={24} col={isMobile}>
                  {status ? (
                    <>
                      <Card thinner>
                        <CoverageLimit
                          referralChecks={{
                            codeIsUsable,
                            codeIsValid,
                            referrerIsActive,
                            checkingReferral,
                            referrerIsOther,
                          }}
                          balances={balances}
                          minReqAccBal={minReqAccBal}
                          currentCoverageLimit={currentCoverageLimit}
                          newCoverageLimit={newCoverageLimit}
                          setNewCoverageLimit={setNewCoverageLimit}
                          referralCode={referralCode}
                          isEditing={isEditing}
                          portfolio={portfolio}
                          setIsEditing={setIsEditing}
                          setReferralCode={setReferralCode}
                          canPurchaseNewCover={canPurchaseNewCover}
                        />{' '}
                      </Card>
                      <Card bigger horiz>
                        <PolicyBalance
                          referralChecks={{
                            codeIsUsable,
                            codeIsValid,
                            referrerIsActive,
                            checkingReferral,
                            referrerIsOther,
                          }}
                          balances={balances}
                          minReqAccBal={minReqAccBal}
                          portfolio={portfolio}
                          currentCoverageLimit={currentCoverageLimit}
                          newCoverageLimit={newCoverageLimit}
                          referralCode={referralCode}
                          walletAssetBalance={walletAssetBalance}
                          walletAssetDecimals={walletAssetDecimals}
                          approval={approval}
                          setReferralCode={setReferralCode}
                          inputProps={{
                            amount,
                            isAppropriateAmount,
                            handleInputChange,
                            resetAmount,
                          }}
                          coverageActivity={{
                            policyId,
                            status,
                            coverageLimit,
                            mounting,
                          }}
                        />
                      </Card>
                    </>
                  ) : (
                    // <>
                    <Card inactive horiz={!isMobile} noPadding gap={24}>
                      <Card innerThinner noShadow>
                        <CoverageLimit
                          referralChecks={{
                            codeIsUsable,
                            codeIsValid,
                            referrerIsActive,
                            checkingReferral,
                            referrerIsOther,
                          }}
                          balances={balances}
                          minReqAccBal={minReqAccBal}
                          currentCoverageLimit={currentCoverageLimit}
                          newCoverageLimit={newCoverageLimit}
                          setNewCoverageLimit={setNewCoverageLimit}
                          referralCode={referralCode}
                          isEditing={isEditing}
                          portfolio={portfolio}
                          setIsEditing={setIsEditing}
                          setReferralCode={setReferralCode}
                          canPurchaseNewCover={canPurchaseNewCover}
                          inactive
                        />
                      </Card>{' '}
                      <Card innerBigger noShadow>
                        <PolicyBalance
                          referralChecks={{
                            codeIsUsable,
                            codeIsValid,
                            referrerIsActive,
                            checkingReferral,
                            referrerIsOther,
                          }}
                          balances={balances}
                          minReqAccBal={minReqAccBal}
                          portfolio={portfolio}
                          currentCoverageLimit={currentCoverageLimit}
                          newCoverageLimit={newCoverageLimit}
                          referralCode={referralCode}
                          walletAssetBalance={walletAssetBalance}
                          walletAssetDecimals={walletAssetDecimals}
                          approval={approval}
                          setReferralCode={setReferralCode}
                          inputProps={{
                            amount,
                            isAppropriateAmount,
                            handleInputChange,
                            resetAmount,
                          }}
                          coverageActivity={{
                            policyId,
                            status,
                            coverageLimit,
                            mounting,
                          }}
                          inactive
                        />
                      </Card>
                    </Card>
                  )}
                  <Flex
                    col
                    stretch
                    gap={24}
                    style={{
                      flex: '0.8',
                    }}
                  >
                    <CoverageActive policyStatus={status} />
                    <ReferralSection
                      referralChecks={{
                        codeIsUsable,
                        codeIsValid,
                        referrerIsActive,
                        checkingReferral,
                        referrerIsOther,
                      }}
                      userCanRefer={status}
                      referralCode={referralCode}
                      setReferralCode={setReferralCode}
                    />
                  </Flex>
                </Flex>
              )}
              <Card>
                <Text t2 bold>
                  Portfolio Details
                </Text>
                {isMobile && (
                  <Flex pl={24} pr={24} pt={10} pb={10} between mt={20} mb={10}>
                    <Text bold t4s>
                      Sort by
                    </Text>
                    <Text bold t4s>
                      Amount
                    </Text>
                  </Flex>
                )}
                <PortfolioTable portfolio={portfolio} />
              </Card>
            </Flex>
          )}
        </>
      ) : (
        <Content>
          <Box error pt={10} pb={10} pl={15} pr={15}>
            <TextSpan light textAlignLeft>
              <StyledInfo size={30} />
            </TextSpan>
            <Text light bold style={{ margin: '0 auto' }}>
              This dashboard is not supported on this network.
            </Text>
          </Box>
        </Content>
      )}
    </>
  )
}
