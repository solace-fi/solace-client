import React, { useEffect, useState, useMemo } from 'react'
import { Flex, ShadowDiv, Content, HeroContainer } from '../../components/atoms/Layout'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { ADDRESS_ZERO, ZERO } from '../../constants'
import {
  useCheckIsCoverageActive,
  useFunctions,
  usePortfolio,
  useTotalAccountBalance,
} from '../../hooks/useSolaceCoverProduct'
import { useWallet } from '../../context/WalletManager'
import { BigNumber, Contract } from 'ethers'
import { useGeneral } from '../../context/GeneralManager'
import { useInputAmount } from '../../hooks/useInputAmount'
import { parseUnits } from 'ethers/lib/utils'
import { useCachedData } from '../../context/CachedDataManager'
import { useProvider } from '../../context/ProviderManager'
import { DAI_ADDRESS, FRAX_ADDRESS } from '../../constants/mappings/tokenAddressMapping'
import { useNetwork } from '../../context/NetworkManager'
import IERC20 from '../../constants/metadata/IERC20Metadata.json'
import { queryBalance, queryDecimals } from '../../utils/contract'
import useDebounce from '@rooks/use-debounce'
import { useContracts } from '../../context/ContractsManager'
import { useTokenAllowance } from '../../hooks/useToken'
import { Loader } from '../../components/atoms/Loader'
import { TextSpan, Text } from '../../components/atoms/Typography'
import { Box, RaisedBox } from '../../components/atoms/Box'
import { StyledInfo } from '../../components/atoms/Icon'
import { WalletConnectButton } from '../../components/molecules/WalletConnectButton'
import { Button, ButtonWrapper } from '../../components/atoms/Button'

import { PortfolioTable } from './PortfolioTable'
import { ReferralSection } from './ReferralSection'
import { CoverageActive } from './CoverageActive'
import { WelcomeMessage } from './WelcomeMessage'
import { PolicyBalance } from './PolicyBalance'
import { CoverageLimit } from './CoverageLimit'
import { useExistingPolicy } from '../../hooks/usePolicy'

import Zapper from '../../resources/svg/zapper.svg'
import ZapperDark from '../../resources/svg/zapper-dark.svg'
import { CoveredChains } from './CoveredChains'

export function Card({
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
}): JSX.Element {
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

export enum ReferralSource {
  'Custom',
  'Standard',
  'StakeDAO',
}

enum FormStages {
  'Welcome',
  'RegularUser',
}

export default function Soteria(): JSX.Element {
  const { referralCode: referralCodeFromStorage, appTheme } = useGeneral()
  const { account, library } = useWallet()
  const { latestBlock, switchNetwork } = useProvider()
  const { activeNetwork } = useNetwork()
  const { version } = useCachedData()
  const canShowSoteria = useMemo(() => !activeNetwork.config.restrictedFeatures.noSoteria, [
    activeNetwork.config.restrictedFeatures.noSoteria,
  ])
  const { portfolio, loading } = usePortfolio(account)
  const { isMobile } = useWindowDimensions()
  const { policyId, status, coverageLimit, mounting } = useCheckIsCoverageActive(account)
  const existingPolicy = useExistingPolicy(account)
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
  const firstTime = useMemo(() => existingPolicy.policyId.isZero(), [existingPolicy.policyId])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const [showExistingPolicyMessage, setShowExistingPolicyMessage] = useState<boolean>(true)
  const [stableCoin, setStableCoin] = useState<string>(DAI_ADDRESS[activeNetwork.chainId])

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
    const tokenContract = new Contract(stableCoin, IERC20.abi, library)
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
    setShowExistingPolicyMessage(true)
    switch (activeNetwork.chainId) {
      case 80001:
      case 137:
        setStableCoin(FRAX_ADDRESS[activeNetwork.chainId])
        break
      default:
        setStableCoin(DAI_ADDRESS[activeNetwork.chainId])
    }
  }, [activeNetwork.chainId])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          {mounting || existingPolicy.loading ? (
            <Flex col gap={24} m={isMobile ? 20 : undefined}>
              <Loader />
            </Flex>
          ) : (
            <Flex col gap={24} m={isMobile ? 20 : undefined}>
              {firstTime && formStage === FormStages.Welcome ? (
                <WelcomeMessage portfolio={portfolio} type={referralType} goToSecondStage={goToSecondStage} />
              ) : !firstTime && policyId.isZero() && showExistingPolicyMessage ? (
                <Card>
                  <Flex col gap={30} itemsCenter>
                    <Text t2s>Solace Wallet Coverage</Text>
                    <Flex col gap={10} itemsCenter>
                      <Text t2>Cover your wallet on any of our supported chains with one policy!</Text>
                      <Text t2 warning>
                        It looks like you already have a policy on {existingPolicy.network.name}.
                      </Text>
                    </Flex>
                    <ButtonWrapper isColumn={isMobile}>
                      <Button info secondary pl={23} pr={23} onClick={() => switchNetwork(existingPolicy.network.name)}>
                        Switch to {existingPolicy.network.name}
                      </Button>
                      <Button info pl={23} pr={23} onClick={() => setShowExistingPolicyMessage(false)}>
                        Continue Anyway
                      </Button>
                    </ButtonWrapper>
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
                          stableCoin={stableCoin}
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
                      <Flex
                        col
                        stretch
                        gap={24}
                        style={{
                          flex: '0.8',
                        }}
                      >
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
                        </Card>
                        <Card innerThinner noShadow>
                          <CoveredChains isEditing={isEditing} setIsEditing={setIsEditing} />
                        </Card>
                      </Flex>
                      <Card innerBigger noShadow>
                        <PolicyBalance
                          referralChecks={{
                            codeIsUsable,
                            codeIsValid,
                            referrerIsActive,
                            checkingReferral,
                            referrerIsOther,
                          }}
                          stableCoin={stableCoin}
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
                <PortfolioTable portfolio={portfolio} loading={loading} />
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
