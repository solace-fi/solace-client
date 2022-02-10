import React, { useEffect, useState, useMemo } from 'react'
import Flex from '../stake/atoms/Flex'
import RaisedBox from '../../components/atoms/RaisedBox'
import ShadowDiv from '../stake/atoms/ShadowDiv'
import { Text } from '../../components/atoms/Typography'
import { QuestionCircle } from '@styled-icons/bootstrap/QuestionCircle'
// src/components/atoms/Button/index.ts
import { Button } from '../../components/atoms/Button'
// src/resources/svg/icons/usd.svg
import USD from '../../resources/svg/icons/usd.svg'
import DAI from '../../resources/svg/icons/dai.svg'
import ToggleSwitch from '../../components/atoms/ToggleSwitch'
import GrayBox, { FixedHeightGrayBox, StyledGrayBox } from '../stake/components/GrayBox'
import { GenericInputSection } from '../stake/sections/InputSection'
import { StyledSlider } from '../../components/atoms/Input'
import commaNumber from '../../utils/commaNumber'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableData } from '../../components/atoms/Table'
import { StyledTooltip } from '../../components/molecules/Tooltip'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { BKPT_5, ZERO } from '../../constants'
import GrayBgDiv from '../stake/atoms/BodyBgCss'
import {
  useCheckIsCoverageActive,
  useCooldownDetails,
  useFunctions,
  usePortfolio,
} from '../../hooks/useSolaceCoverProduct'
import { useWallet } from '../../context/WalletManager'
import { BigNumber, Contract } from 'ethers'
import { VerticalSeparator } from '../stake/components/VerticalSeparator'
import { useGeneral } from '../../context/GeneralManager'
import { StyledCopy, TechyGradientCopy } from '../../components/atoms/Icon'
import { SolaceRiskProtocol } from '../../constants/types'
import { accurateMultiply, capitalizeFirstLetter, filterAmount, floatUnits, formatAmount } from '../../utils/formatting'
import { getTimeFromMillis } from '../../utils/time'
import { useInputAmount, useTransactionExecution } from '../../hooks/useInputAmount'
import { FunctionName } from '../../constants/enums'
import { parseUnits } from 'ethers/lib/utils'
import { useCachedData } from '../../context/CachedDataManager'
import { useProvider } from '../../context/ProviderManager'
import { DAI_ADDRESS } from '../../constants/mappings/tokenAddressMapping'
import { useNetwork } from '../../context/NetworkManager'
import IERC20 from '../../constants/metadata/IERC20Metadata.json'
import { queryBalance, queryDecimals } from '../../utils/contract'
import useDebounce from '@rooks/use-debounce'
import { formatUnits } from 'ethers/lib/utils'

function Card({
  children,
  style,
  thinner,
  innerBigger,
  innerThinner,
  bigger,
  normous,
  horiz,
  firstTime,
  noShadow,
  noPadding,
  gap,
  ...rest
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  /** first card - `flex: 0.8` */ thinner?: boolean
  /** second card - `flex 1` */ bigger?: boolean
  /** second card firstTime - `flex 1.2` */ innerBigger?: boolean
  /** second card - `flex: 0.8` */ innerThinner?: boolean
  /* big box under coverage active toggle - flex: 12*/ normous?: boolean
  /** first time 2-form card - `flex 2` */ firstTime?: boolean
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
      if (firstTime) return 2
    })(),
    // alignItems: 'stretch',
    // justifyContent: between ? 'space-between' : 'flex-start',
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
    <Flex
      style={combinedStyle}
      {...rest}
      col
      // style={innerBigger || innerThinner ? { ...combinedStyle, border: '1px solid #e6e6e6' } : { ...combinedStyle }}
    >
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

function CoverageLimitBasicForm({
  portfolio,
  currentCoverageLimit,
  isEditing,
  setIsEditing,
  setNewCoverageLimit,
}: {
  portfolio: SolaceRiskProtocol[]
  currentCoverageLimit: BigNumber
  isEditing: boolean
  setIsEditing: (b: boolean) => void
  setNewCoverageLimit: (newCoverageLimit: BigNumber) => void
}) {
  // const [isEditing, setIsEditing] = React.useState(false)
  // const startEditing = () => setIsEditing(true)
  // const stopEditing = () => setIsEditing(false)
  const [usd, setUsd] = useState<number>(0)
  const { latestBlock } = useProvider()
  const { version } = useCachedData()

  const highestPosition = useMemo(
    () => (portfolio.length > 0 ? portfolio.reduce((pn, cn) => (cn.balanceUSD > pn.balanceUSD ? cn : pn)) : undefined),
    [portfolio]
  )

  const { getAvailableCoverCapacity } = useFunctions()

  const [highestAmount, setHighestAmount] = useState<BigNumber>(ZERO)
  const [defaultAmount, setDefaultAmount] = useState<BigNumber>(ZERO)
  const [customInputAmount, setCustomInputAmount] = useState<string>('')

  const [availableCoverCapacity, setAvailableCoverCapacity] = useState<BigNumber>(ZERO)

  useEffect(() => {
    if (!highestPosition) return
    const bnBal = BigNumber.from(accurateMultiply(highestPosition.balanceUSD, 18))
    const bnHigherBal = bnBal.add(bnBal.div(BigNumber.from('5')))
    setHighestAmount(bnHigherBal)
    setDefaultAmount(bnBal)
  }, [highestPosition])

  const _getCapacity = useDebounce(async () => {
    const capacity = await getAvailableCoverCapacity()
    setAvailableCoverCapacity(capacity)
  }, 300)

  useEffect(() => {
    _getCapacity()
  }, [latestBlock, version])

  const handleInputChange = (input: string) => {
    // allow only numbers and decimals
    const filtered = filterAmount(input, customInputAmount)

    // if filtered is only "0." or "." or '', filtered becomes '0.0'
    const formatted = formatAmount(filtered)

    // if number has more than max decimal places, do not update
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 18) return

    // if number is greater than available cover capacity, do not update
    if (parseUnits(formatted, 18).gt(availableCoverCapacity)) return

    setCustomInputAmount(filtered)
    setNewCoverageLimit(BigNumber.from(accurateMultiply(filtered, 18)))
  }

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
                {commaNumber(floatUnits(currentCoverageLimit, 18))}{' '}
                <Text techygradient t4 bold inline>
                  USD
                </Text>
              </Text>
            </Flex>
          </FixedHeightGrayBox>
        ) : (
          <Flex col stretch>
            <Flex justifyCenter>
              <Text t4s>Set Limit to</Text>
            </Flex>
            <Flex between itemsCenter mt={10}>
              <div
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: '#fafafa',
                  color: 'purple',
                  flexShrink: 0,
                }}
              >
                &lt;
              </div>
              <Flex col itemsCenter>
                <Text info t4s bold>
                  Highest position
                </Text>
                <Text info t5s>
                  in Portfolio
                </Text>
              </Flex>
              <div
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: '#fafafa',
                  color: 'purple',
                  flexShrink: 0,
                }}
              >
                &gt;
              </div>
            </Flex>
            <GenericInputSection
              icon={<img src={USD} height={20} />}
              onChange={(e) => setUsd(Number(e.target.value))}
              text="USD"
              value={usd > 0 ? String(usd) : ''}
              disabled={false}
              w={300}
              style={{
                marginTop: '20px',
              }}
              displayIconOnMobile
            />
          </Flex>
        )}
        <Flex col stretch>
          <Flex center mt={4}>
            <Flex baseline gap={4} center>
              <Text t4>Highest position:</Text>
              <Flex gap={4} baseline mt={2}>
                <Text
                  t3
                  bold
                  style={{
                    fontSize: '18px',
                  }}
                >
                  {1234567}
                </Text>
                <Text t4 bold>
                  USD
                </Text>
              </Flex>
            </Flex>
          </Flex>
          <Flex center mt={5}>
            <Text t4>
              Risk level:{' '}
              <Text
                t3
                warning
                bold
                style={{
                  display: 'inline',
                }}
              >
                Medium
              </Text>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </>
  )
}

// second line is an svg circle with a text inside
// third line is a text below the circle
// fourth line is 1 submit and 1 cancel button

function CoverageLimit({
  currentCoverageLimit,
  isEditing,
  portfolio,
  referralCode,
  setNewCoverageLimit,
  setIsEditing,
  firstTime,
}: {
  currentCoverageLimit: BigNumber
  isEditing: boolean
  portfolio: SolaceRiskProtocol[]
  referralCode: string | undefined
  setNewCoverageLimit: (newCoverageLimit: BigNumber) => void
  setIsEditing: (isEditing: boolean) => void
  firstTime?: boolean
}) {
  const startEditing = () => setIsEditing(true)
  const stopEditing = () => setIsEditing(false)

  const { account } = useWallet()

  const { updateCoverLimit } = useFunctions()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  const callUpdateCoverLimit = async (amount: BigNumber) => {
    if (!account) return
    await updateCoverLimit(amount, referralCode ?? '')
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callUpdateCoverLimit', err, FunctionName.SOTERIA_UPDATE))
  }

  return (
    // <Card thinner>
    <Flex
      between
      col
      stretch
      style={{
        flex: '1',
      }}
    >
      <Flex
        itemsCenter
        // style={{
        //   // just between
        //   justifyContent: 'space-between',
        // }}
        between
      >
        <Text t2 bold>
          Coverage Limit
        </Text>
        <StyledTooltip id={'coverage-limit'} tip={'Coverage Limit tip'}>
          <QuestionCircle height={20} width={20} color={'#aaa'} />
        </StyledTooltip>
      </Flex>
      <CoverageLimitBasicForm
        currentCoverageLimit={currentCoverageLimit}
        isEditing={isEditing}
        portfolio={portfolio}
        setIsEditing={setIsEditing}
        setNewCoverageLimit={setNewCoverageLimit}
      />
      <Flex justifyCenter={!isEditing} between={isEditing} gap={isEditing ? 20 : undefined}>
        {firstTime ? (
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
            <Button info secondary pt={8} pb={8} style={{ fontWeight: 600, flex: 1, transition: '0s' }}>
              Save
            </Button>
          </>
        )}
      </Flex>
    </Flex>
  )
}
/*

#plan :

remove Card wrappers for CoverageLimit and PolicyBalance
make two components, one will be a div containing the two, the other will <><CustomContainers 1 & 2>Stuff</></>
Wrap everything in something that gives stuff props & setters, as well as submitters

CoverageLimit: <Card thinner>
PolicyBalance: <Card bigger horiz>

*/

// 18px 14px value pair
function ValuePair({
  bigText, // 18px
  smallText, // 14px
  info,
  bigger,
  mediumSized,
}: {
  bigText: string
  smallText: string
  info?: boolean
  bigger?: boolean
  mediumSized?: boolean
}) {
  return (
    <Flex
      gap={4}
      baseline
      style={
        {
          // justifyContent: 'space-between',
        }
      }
    >
      <Text t2s={!mediumSized} t2_5s={mediumSized} bold info={info}>
        {bigText}
      </Text>
      <Text t4s={bigger} bold info={info}>
        {smallText}
      </Text>
    </Flex>
  )
}

const ifStringZeroUndefined = (str: string) => (Number(str) === 0 ? undefined : str)

function PolicyBalance({
  newCoverageLimit,
  referralCode,
  firstTime,
}: {
  newCoverageLimit: BigNumber
  referralCode: string | undefined
  firstTime?: boolean
}) {
  // setters for usd and days
  const [usd, setUsd] = React.useState('0')
  const [doesReachMinReqAccountBal, setDoesReachMinReqAccountBal] = useState(false)

  const { ifDesktop } = useWindowDimensions()
  const { account, library } = useWallet()
  const { activeNetwork } = useNetwork()
  const { amount, maxSelected, isAppropriateAmount, handleInputChange, setMax, resetAmount } = useInputAmount()

  const [accountBalance, setAccountBalance] = useState<BigNumber>(ZERO)
  const [walletAssetBalance, setWalletAssetBalance] = useState<BigNumber>(ZERO)
  const [walletAssetDecimals, setWalletAssetDecimals] = useState<number>(0)

  const { getAccountBalanceOf, deposit, withdraw, getMinRequiredAccountBalance, activatePolicy } = useFunctions()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  const isAcceptableAmount = useMemo(() => isAppropriateAmount(amount, walletAssetDecimals, walletAssetBalance), [
    amount,
    walletAssetBalance,
    walletAssetDecimals,
  ])

  const callDeposit = async () => {
    if (!account) return
    await deposit(account, parseUnits(amount, 18))
      .then((res) => handleToast(res.tx, res.localTx))
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
    await activatePolicy(account, newCoverageLimit, parseUnits(amount, 18), referralCode ?? '')
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callActivatePolicy', err, FunctionName.SOTERIA_ACTIVATE))
  }

  const _handleInputChange = () => {
    handleInputChange(amount, walletAssetDecimals, formatUnits(walletAssetBalance, walletAssetDecimals))
  }

  const _checkMinReqAccountBal = useDebounce(async () => {
    const minReqAccountBal = await getMinRequiredAccountBalance(newCoverageLimit)
    const bnAmount = BigNumber.from(accurateMultiply(amount, 18))
    setDoesReachMinReqAccountBal(accountBalance.add(bnAmount).gt(minReqAccountBal))
  }, 300)

  const _getAvailableFunds = useDebounce(async () => {
    if (!library || !account) return
    const tokenContract = new Contract(DAI_ADDRESS[activeNetwork.chainId], IERC20.abi, library)
    const balance = await queryBalance(tokenContract, account)
    const decimals = await queryDecimals(tokenContract)
    setWalletAssetBalance(balance)
    setWalletAssetDecimals(decimals)
  }, 300)

  useEffect(() => {
    ;async () => {
      if (!account) return
      const bal = await getAccountBalanceOf(account)
      setAccountBalance(bal)
    }
  }, [account])

  useEffect(() => {
    _checkMinReqAccountBal()
  }, [newCoverageLimit, accountBalance, amount])

  useEffect(() => {
    _getAvailableFunds()
  }, [account, activeNetwork.chainId, library])

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
        <Text t2 bold>
          Policy Balance
        </Text>
        <StyledTooltip id={'policy-balance'} tip={'Policy Balance'}>
          <QuestionCircle height={20} width={20} color={'#aaa'} />
        </StyledTooltip>
      </Flex>
      <Flex
        col
        between
        stretch
        gap={30}
        pl={ifDesktop(24)}
        pr={ifDesktop(24)}
        style={{
          height: '100%',
        }}
      >
        <Flex col gap={10} stretch>
          <StyledGrayBox>
            <Flex
              stretch
              gap={24}
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
                  <Text t2s bold>
                    0
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
                    0 DAI
                  </Text>
                </Flex>
                <Flex between>
                  <Text t4s bold techygradient>
                    Bonus
                  </Text>
                  <Text t4s bold techygradient>
                    0 DAI
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </StyledGrayBox>
          {/* coverage price (dynamic): 0.00189 DAI/day; Approximate policy duration: 0 days */}
          <Flex pl={24} pr={24} mt={10} col gap={10}>
            <Flex between>
              <Text t4s>Coverage Price</Text>
              <Text t4s bold>
                0.00189{' '}
                <Text t6s inline>
                  DAI/Day
                </Text>
              </Text>
            </Flex>
            <Flex between>
              <Text t4s>Approximate Policy Duration</Text>
              <Text t4s bold>
                0{' '}
                <Text t6s inline>
                  Days
                </Text>
              </Text>
            </Flex>
          </Flex>
          {/* <Flex gap={4} baseline justifyCenter>
              <Text t5s>Approximate policy duration:</Text>
              <Text t4s bold>
                185 Days
              </Text>
            </Flex> */}
        </Flex>
        <Flex col gap={20}>
          <GenericInputSection
            icon={<img src={DAI} height={20} />}
            onChange={(e) => setUsd(e.target.value)}
            text="DAI"
            value={ifStringZeroUndefined(usd)}
            disabled={false}
            displayIconOnMobile
          />
          <StyledSlider />
        </Flex>
        {firstTime ? (
          <Flex flex1 col stretch>
            <Button info secondary>
              Activate my policy
            </Button>
          </Flex>
        ) : (
          <Flex gap={20}>
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
            >
              Withdraw
            </Button>
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
            >
              Deposit
            </Button>
          </Flex>
        )}
      </Flex>
    </Flex>
    // </Card>
  )
}

function CoverageActive({ coverageActive }: { coverageActive: boolean }) {
  const { deactivatePolicy } = useFunctions()
  const { account } = useWallet()
  const { isCooldownActive, cooldownLeft } = useCooldownDetails(account)
  const showCooldown = useMemo(() => isCooldownActive && cooldownLeft.gt(ZERO), [isCooldownActive, cooldownLeft])
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
            <Text t2s bold info={!isCooldownActive} warning={isCooldownActive}>
              {!isCooldownActive ? 'Active' : 'Inactive'}
            </Text>
          </Flex>
          {showCooldown && (
            <Flex gap={4}>
              <Text t5s bold>
                Cooldown:
              </Text>
              <Text info t5s bold>
                {getTimeFromMillis(cooldownLeft.toNumber())}
              </Text>
            </Flex>
          )}
        </Flex>
        <Flex between itemsCenter>
          {/* <ToggleSwitch
            id="bird"
            toggled={!isCooldownActive}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoverageActive(e.target.checked)}
          /> */}
        </Flex>
      </Flex>
    </Card>
  )
}

function ReferralSection({
  referralCode,
  setReferralCode,
}: {
  referralCode: string | undefined
  setReferralCode: (referralCode: string | undefined) => void
}) {
  return (
    <Card normous horiz>
      {/* top part / title */}
      {/* <Flex col stretch between> */}
      <Flex
        stretch
        col
        style={{
          width: '100%',
        }}
        gap={40}
      >
        <Flex between itemsCenter>
          <Text t2 bold techygradient>
            Bonuses
          </Text>
          <StyledTooltip id={'coverage-price'} tip={'ReferralSection - Bonuses tooltip'}>
            <QuestionCircle height={20} width={20} color={'#aaa'} />
          </StyledTooltip>
        </Flex>
        {/* middle has padding l and r 40px, rest is p l and r 24px (comes with Card); vertical justify-between */}
        <Flex col flex1 gap={40} stretch justifyCenter>
          <Flex col gap={10} stretch>
            <Text t4s>Get more bonuses for everyone who gets coverage via your referral link:</Text>
            <Text t4s bold techygradient>
              solace.fi/referral/s37asodfkj1o3ig...{' '}
              <TechyGradientCopy
                style={{
                  height: '14px',
                  width: '14px',
                  // backgroundColor: 'red',
                }}
              />
            </Text>
          </Flex>
          <Flex col gap={10} stretch>
            <Text t4s>
              <Text t4s inline bold techygradient>
                Got a promo code?
              </Text>{' '}
              Enter here to claim:
            </Text>
            <GrayBgDiv
              style={{
                borderRadius: '10px',
              }}
            >
              <Flex flex1 stretch itemsCenter justifyCenter pl={24} pr={24} pt={20} pb={20}>
                <Text techygradient bold t2s>
                  {referralCode}
                </Text>
              </Flex>
            </GrayBgDiv>
          </Flex>
        </Flex>
      </Flex>
      {/* </Flex> */}
    </Card>
  )
}

function CoveragePrice() {
  return (
    <Card normous horiz>
      {/* top part / title */}
      {/* <Flex col stretch between> */}
      <Flex
        between
        col
        style={{
          width: '100%',
        }}
        gap={40}
      >
        <Flex between itemsCenter>
          <Text t2 bold techygradient>
            Bonuses*
          </Text>
          <StyledTooltip id={'coverage-price'} tip={'ReferralSection - Bonuses tooltip'}>
            <QuestionCircle height={20} width={20} color={'#aaa'} />
          </StyledTooltip>
        </Flex>
        {/* middle has padding l and r 40px, rest is p l and r 24px (comes with Card); vertical justify-between */}
        <Flex col gap={20} pl={40} pr={40}>
          <Flex between itemsCenter>
            <ValuePair bigText="0.00184" smallText="USD" info />
            <Text t5s>/ Day</Text>
          </Flex>
          <Flex between itemsCenter>
            <ValuePair bigText="0.0552" smallText="USD" info />
            <Text t5s>/ Month</Text>
          </Flex>
          <Flex between itemsCenter>
            <ValuePair bigText="0.6716" smallText="USD" info />
            <Text t5s>/ Year</Text>
          </Flex>
        </Flex>
        <Text t5s textAlignCenter>
          *The price updates continuously according to changes in your portfolio.
        </Text>
      </Flex>
      {/* </Flex> */}
    </Card>
  )
}

// const StyledTable = styled.table`
//   background-color: ${(props) => props.theme.v2.raised};
//   border-collapse: separate;
//   border-spacing: 0 10px;
//   font-size: 14px;
// `
// const StyledTr = styled.tr``

// const StyledTd = styled.td<{
//   first?: boolean
//   last?: boolean
// }>`
//   background-color: ${(props) => props.theme.body.bg_color};
//   padding: 10px 24px;
//   /* first and last ones have border-radius left and right 10px respectively */
//   ${(props) =>
//     props.first &&
//     css`
//       border-top-left-radius: 10px;
//       border-bottom-left-radius: 10px;
//     `}
//   ${(props) =>
//     props.last &&
//     css`
//       border-top-right-radius: 10px;
//       border-bottom-right-radius: 10px;
//     `}
// `

function PortfolioTable({ portfolio }: { portfolio: SolaceRiskProtocol[] }) {
  /* table like this:
|protocol|type| positions |amount|risk level|
|:-------|:---|:---------:|:-----:|:--------|
|Uniswap |DEX |ETH,BTC,DAI|42345 USD|Low|
|Nexus Mutual| Derivatives| ETH,DAI|34562 USD|High|
|Aave |Lending |ETH,DAI|12809 USD|Medium|
|Yearn Finance |Assets |BTC|2154 USD|Medium|

  */
  const { width } = useWindowDimensions()

  return (
    <>
      {width > BKPT_5 ? (
        <Table>
          <TableHead>
            <TableHeader>Protocol</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Amount</TableHeader>
            <TableHeader>Risk Level</TableHeader>
          </TableHead>
          <TableBody>
            {portfolio.map((d: SolaceRiskProtocol) => (
              <TableRow key={d.network}>
                <TableData>{capitalizeFirstLetter(d.network)}</TableData>
                <TableData>{d.category}</TableData>
                <TableData>{d.balanceUSD}</TableData>
                <TableData>{d.tier}</TableData>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Flex column gap={30}>
          {portfolio.map((row) => (
            <GrayBgDiv
              key={row.network}
              style={{
                borderRadius: '10px',
                padding: '14px 24px',
              }}
            >
              <Flex gap={30} between itemsCenter>
                <Flex col gap={8.5}>
                  <div>{row.network}</div>
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
                  <div>{row.tier}</div>
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
  'InitialSetup',
  'RegularUser',
}

function WelcomeMessage({ type, goToSecondStage }: { type: ReferralSource; goToSecondStage: () => void }): JSX.Element {
  const handleClick = () => goToSecondStage()
  switch (type) {
    case ReferralSource.Custom:
      return (
        <Card>
          <Flex col gap={30} itemsCenter>
            <Text t2s>When the flies fly they do unfly</Text>
            <Flex col gap={10} itemsCenter>
              <Text t5s>The table below is a list of your funds in protocols available for coverage.</Text>
              <Text t5s>By subscribing to Solace Wallet Coverage, all funds in the list are covered.</Text>
              <Text t5s italics>
                <Text bold inline t5s>
                  Tip:
                </Text>{' '}
                all future changes to your portfolio are also covered automatically.
              </Text>
            </Flex>
            <Button info secondary pl={23} pr={23} onClick={goToSecondStage}>
              Sounds good, what&apos;s next?
            </Button>
          </Flex>
        </Card>
      )
    case ReferralSource.Standard:
      return (
        <Card>
          <Flex col gap={30} itemsCenter>
            <Text t2s>When the flies fly they do unfly</Text>
            <Flex col gap={10} itemsCenter>
              <Text t5s>The table below is a list of your funds in protocols available for coverage.</Text>
              <Text t5s>By subscribing to Solace Wallet Coverage, all funds in the list are covered.</Text>
              <Text t5s italics>
                <Text bold inline t5s>
                  Tip:
                </Text>{' '}
                all future changes to your portfolio are also covered automatically.
              </Text>
            </Flex>
            <Button info secondary pl={23} pr={23} onClick={goToSecondStage}>
              Sounds good, what&apos;s next?
            </Button>
          </Flex>
        </Card>
      )
    case ReferralSource.StakeDAO:
      return (
        <Card>
          <Flex col gap={30} itemsCenter>
            <Text t2s>When the flies fly they do unfly</Text>
            <Flex col gap={10} itemsCenter>
              <Text t5s>The table below is a list of your funds in protocols available for coverage.</Text>
              <Text t5s>By subscribing to Solace Wallet Coverage, all funds in the list are covered.</Text>
              <Text t5s italics>
                <Text bold inline t5s>
                  Tip:
                </Text>{' '}
                all future changes to your portfolio are also covered automatically.
              </Text>
            </Flex>
            <Button info secondary pl={23} pr={23} onClick={goToSecondStage}>
              Sounds good, what&apos;s next?
            </Button>
          </Flex>
        </Card>
      )
  }
}

export default function Soteria(): JSX.Element {
  const { referralCode: referralCodeFromStorage } = useGeneral()
  const { account } = useWallet()

  const portfolio = usePortfolio('0x09748f07b839edd1d79a429d3ad918f670d602cd', 1)
  const { isMobile } = useWindowDimensions()
  const { policyId, status, coverageLimit } = useCheckIsCoverageActive(account)

  const currentCoverageLimit = useMemo(() => coverageLimit, [coverageLimit])
  const coverageActive = useMemo(() => status, [status])
  const firstTime = useMemo(() => policyId.isZero(), [policyId])

  const [referralType, setReferralType] = useState<ReferralSource>(ReferralSource.Standard)
  const [formStage, setFormStage] = useState<FormStages>(FormStages.Welcome)
  const goToSecondStage = () => setFormStage(FormStages.InitialSetup)
  const [referralCode, setReferralCode] = useState<string | undefined>(undefined)
  const [newCoverageLimit, setNewCoverageLimit] = useState<BigNumber>(ZERO)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (referralCodeFromStorage) setReferralCode(referralCodeFromStorage)
  }, [referralCodeFromStorage])

  return (
    <Flex col gap={24} m={isMobile ? 20 : undefined}>
      {firstTime && formStage === FormStages.Welcome ? (
        <WelcomeMessage type={referralType} goToSecondStage={goToSecondStage} />
      ) : (
        <Flex gap={24} col={isMobile}>
          {/* <RaisedBox>
            <Flex gap={24}> */}
          {!coverageActive ? (
            <>
              <Card thinner>
                <CoverageLimit
                  currentCoverageLimit={currentCoverageLimit}
                  setNewCoverageLimit={setNewCoverageLimit}
                  referralCode={referralCode}
                  isEditing={isEditing}
                  portfolio={portfolio}
                  setIsEditing={setIsEditing}
                />{' '}
              </Card>
              <Card bigger horiz>
                <PolicyBalance newCoverageLimit={newCoverageLimit} referralCode={referralCode} />
              </Card>
            </>
          ) : (
            // <>
            <Card firstTime horiz noPadding gap={24}>
              <Card innerThinner noShadow>
                <CoverageLimit
                  currentCoverageLimit={currentCoverageLimit}
                  setNewCoverageLimit={setNewCoverageLimit}
                  referralCode={referralCode}
                  isEditing={isEditing}
                  portfolio={portfolio}
                  setIsEditing={setIsEditing}
                  firstTime
                />
              </Card>{' '}
              <Card innerBigger noShadow>
                <PolicyBalance newCoverageLimit={newCoverageLimit} referralCode={referralCode} firstTime />
              </Card>
            </Card>
            // </>
          )}

          {/* </Flex>
          </RaisedBox> */}
          <Flex
            col
            stretch
            gap={24}
            style={{
              flex: '0.8',
            }}
          >
            <CoverageActive coverageActive={coverageActive} />
            <ReferralSection referralCode={referralCode} setReferralCode={setReferralCode} />
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
  )
}
