import React, { useEffect, useState, useMemo } from 'react'
import { Flex, ShadowDiv, Content } from '../../components/atoms/Layout'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { ADDRESS_ZERO, ZERO } from '../../constants'
import {
  useCheckIsCoverageActive,
  useFunctions,
  usePortfolio,
  useTotalAccountBalance,
} from '../../hooks/policy/useSolaceCoverProduct'
import { BigNumber, Contract } from 'ethers'
import { useGeneral } from '../../context/GeneralManager'
import { useInputAmount } from '../../hooks/internal/useInputAmount'
import { parseUnits } from 'ethers/lib/utils'
import { useCachedData } from '../../context/CachedDataManager'
import { useProvider } from '../../context/ProviderManager'
import { DAI_TOKEN, FRAX_TOKEN } from '../../constants/mappings/token'
import { useNetwork } from '../../context/NetworkManager'
import { ERC20_ABI } from '../../constants/abi'
import { queryBalance } from '../../utils/contract'
import useDebounce from '@rooks/use-debounce'
import { useContracts } from '../../context/ContractsManager'
import { useTokenAllowance } from '../../hooks/contract/useToken'
import { Loader } from '../../components/atoms/Loader'
import { TextSpan, Text } from '../../components/atoms/Typography'
import { Box } from '../../components/atoms/Box'
import { StyledInfo } from '../../components/atoms/Icon'
import { Button, ButtonWrapper } from '../../components/atoms/Button'

import { PortfolioTable } from './PortfolioTable'
import { ReferralSection } from './ReferralSection'
import { CoverageActive } from './CoverageActive'
import { WelcomeMessage } from './WelcomeMessage'
import { PolicyBalance } from './PolicyBalance'
import { CoverageLimit } from './CoverageLimit'
import { useExistingPolicy, useGetPolicyChains } from '../../hooks/policy/usePolicy'

import Zapper from '../../resources/svg/zapper.svg'
import ZapperDark from '../../resources/svg/zapper-dark.svg'
import { CoveredChains } from './CoveredChains'
import { PleaseConnectWallet } from '../../components/molecules/PleaseConnectWallet'
import { ReadTokenData } from '../../constants/types'
import { useWeb3React } from '@web3-react/core'
import { TileCard } from '../../components/molecules/TileCard'

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
  const { account } = useWeb3React()
  const { latestBlock, signer } = useProvider()
  const { activeNetwork, changeNetwork } = useNetwork()
  const { version } = useCachedData()
  const canShowSoteria = useMemo(() => !activeNetwork.config.restrictedFeatures.noSoteria, [
    activeNetwork.config.restrictedFeatures.noSoteria,
  ])
  const { policyId, status, coverageLimit, mounting } = useCheckIsCoverageActive(account)
  const {
    portfolioChains,
    policyChainsChecked,
    coverableNetworks,
    chainsChecked,
    setChainsChecked,
    loading: chainsLoading,
  } = useGetPolicyChains(policyId ? policyId.toNumber() : undefined)
  const { portfolio, loading } = usePortfolio(account, portfolioChains, chainsLoading)
  const { isMobile } = useWindowDimensions()
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
  const [isEditingLimit, setIsEditingLimit] = useState(false)
  const [isEditingChains, setIsEditingChains] = useState(false)
  const [codeIsUsable, setCodeIsUsable] = useState<boolean>(true)
  const [codeIsValid, setCodeIsValid] = useState<boolean>(true)
  const [referrerIsActive, setIsReferrerIsActive] = useState<boolean>(true)
  const [referrerIsOther, setIsReferrerIsOther] = useState<boolean>(true)
  const [showExistingPolicyMessage, setShowExistingPolicyMessage] = useState<boolean>(true)
  const [stableCoin, setStableCoin] = useState<ReadTokenData>(DAI_TOKEN)
  const stableCoinData = useMemo(() => {
    return {
      ...stableCoin.constants,
      address: stableCoin.address[activeNetwork.chainId],
    }
  }, [stableCoin, activeNetwork.chainId])

  const [minReqAccBal, setMinReqAccBal] = useState<BigNumber>(ZERO)

  const [walletAssetBalance, setWalletAssetBalance] = useState<BigNumber>(ZERO)

  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const spenderAddress = useMemo(() => (solaceCoverProduct ? solaceCoverProduct.address : null), [solaceCoverProduct])
  const approval = useTokenAllowance(
    contractForAllowance,
    spenderAddress,
    amount && amount != '.' ? parseUnits(amount, stableCoinData.decimals).toString() : '0'
  )

  const [availableCoverCapacity, setAvailableCoverCapacity] = useState<BigNumber>(ZERO)

  const [checkingReferral, setCheckingReferral] = useState<boolean>(false)
  const [checkingMinReqAccBal, setCheckingMinReqAccBal] = useState<boolean>(false)

  const canPurchaseNewCover = useMemo(() => {
    if (newCoverageLimit.lte(currentCoverageLimit)) return true
    return newCoverageLimit.sub(currentCoverageLimit).lt(availableCoverCapacity)
  }, [availableCoverCapacity, currentCoverageLimit, newCoverageLimit])

  const _checkMinReqAccountBal = useDebounce(async () => {
    setCheckingMinReqAccBal(true)
    const minReqAccountBal = await getMinRequiredAccountBalance(newCoverageLimit)
    setMinReqAccBal(minReqAccountBal)
    setCheckingMinReqAccBal(false)
  }, 200)

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
    if (!signer || !account) return
    const tokenContract = new Contract(stableCoinData.address, ERC20_ABI, signer)
    const balance = await queryBalance(tokenContract, account)
    setWalletAssetBalance(balance)
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
        setStableCoin(FRAX_TOKEN)
        break
      default:
        setStableCoin(DAI_TOKEN)
    }
  }, [activeNetwork.chainId])

  useEffect(() => {
    _getCapacity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestBlock, version])

  useEffect(() => {
    _getAvailableFunds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, stableCoinData, signer, latestBlock])

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
    setIsEditingLimit(!status)
    setIsEditingChains(!status)
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
      {canShowSoteria && account ? (
        <>
          {mounting || existingPolicy.loading ? (
            <Flex col gap={24} m={isMobile ? 20 : undefined}>
              <Loader />
            </Flex>
          ) : (
            <Flex col gap={24} m={isMobile ? 20 : undefined}>
              {firstTime && formStage === FormStages.Welcome ? (
                <WelcomeMessage portfolio={portfolio} type={referralType} goToSecondStage={goToSecondStage} />
              ) : !firstTime && policyId?.isZero() && showExistingPolicyMessage ? (
                <TileCard>
                  <Flex col gap={30} itemsCenter>
                    <Text t2s>Solace Wallet Coverage</Text>
                    <Flex col gap={10} itemsCenter>
                      <Text t2>Cover your wallet on any of our supported chains with one policy!</Text>
                      <Text t2 warning>
                        It looks like you already have a policy on {existingPolicy.network.name}.
                      </Text>
                    </Flex>
                    <ButtonWrapper isColumn={isMobile}>
                      <Button
                        info
                        secondary
                        pl={23}
                        pr={23}
                        onClick={() => changeNetwork(existingPolicy.network.chainId)}
                      >
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
                </TileCard>
              ) : (
                <Flex gap={24} col={isMobile}>
                  {status ? (
                    <>
                      {activeNetwork.config.keyContracts.solaceCoverProduct.additionalInfo == 'v2' ? (
                        <Flex
                          col
                          stretch
                          gap={24}
                          style={{
                            flex: '0.8',
                          }}
                        >
                          <TileCard thinner>
                            <CoverageLimit
                              stableCoinData={stableCoinData}
                              referralChecks={{
                                codeIsUsable,
                                codeIsValid,
                                referrerIsActive,
                                checkingReferral,
                                referrerIsOther,
                              }}
                              balances={balances}
                              minReqAccBal={minReqAccBal}
                              checkingMinReqAccBal={checkingMinReqAccBal}
                              currentCoverageLimit={currentCoverageLimit}
                              newCoverageLimit={newCoverageLimit}
                              setNewCoverageLimit={setNewCoverageLimit}
                              referralCode={referralCode}
                              isEditing={isEditingLimit}
                              portfolio={portfolio}
                              setIsEditing={setIsEditingLimit}
                              setReferralCode={setReferralCode}
                              canPurchaseNewCover={canPurchaseNewCover}
                            />{' '}
                          </TileCard>
                          {activeNetwork.config.keyContracts.solaceCoverProduct.additionalInfo == 'v2' && (
                            <TileCard thinner>
                              <CoveredChains
                                coverageActivity={{
                                  status,
                                  mounting,
                                }}
                                chainActivity={{
                                  coverableNetworks,
                                  policyChainsChecked,
                                  chainsChecked,
                                  setChainsChecked,
                                  chainsLoading,
                                }}
                                isEditing={isEditingChains}
                                setIsEditing={setIsEditingChains}
                              />
                            </TileCard>
                          )}
                        </Flex>
                      ) : (
                        <TileCard thinner>
                          <CoverageLimit
                            stableCoinData={stableCoinData}
                            referralChecks={{
                              codeIsUsable,
                              codeIsValid,
                              referrerIsActive,
                              checkingReferral,
                              referrerIsOther,
                            }}
                            balances={balances}
                            minReqAccBal={minReqAccBal}
                            checkingMinReqAccBal={checkingMinReqAccBal}
                            currentCoverageLimit={currentCoverageLimit}
                            newCoverageLimit={newCoverageLimit}
                            setNewCoverageLimit={setNewCoverageLimit}
                            referralCode={referralCode}
                            isEditing={isEditingLimit}
                            portfolio={portfolio}
                            setIsEditing={setIsEditingLimit}
                            setReferralCode={setReferralCode}
                            canPurchaseNewCover={canPurchaseNewCover}
                          />{' '}
                        </TileCard>
                      )}
                      <TileCard bigger horiz>
                        <PolicyBalance
                          referralChecks={{
                            codeIsUsable,
                            codeIsValid,
                            referrerIsActive,
                            checkingReferral,
                            referrerIsOther,
                          }}
                          stableCoinData={stableCoinData}
                          chainsChecked={chainsChecked}
                          balances={balances}
                          minReqAccBal={minReqAccBal}
                          portfolio={portfolio}
                          currentCoverageLimit={currentCoverageLimit}
                          newCoverageLimit={newCoverageLimit}
                          referralCode={referralCode}
                          walletAssetBalance={walletAssetBalance}
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
                      </TileCard>
                    </>
                  ) : (
                    // <>
                    <TileCard inactive horiz={!isMobile} noPadding gap={24}>
                      <Flex
                        col
                        stretch
                        gap={24}
                        style={{
                          flex:
                            activeNetwork.config.keyContracts.solaceCoverProduct.additionalInfo == 'v2' ? '0.8' : '1',
                        }}
                      >
                        <TileCard innerThinner noShadow>
                          <CoverageLimit
                            stableCoinData={stableCoinData}
                            referralChecks={{
                              codeIsUsable,
                              codeIsValid,
                              referrerIsActive,
                              checkingReferral,
                              referrerIsOther,
                            }}
                            balances={balances}
                            minReqAccBal={minReqAccBal}
                            checkingMinReqAccBal={checkingMinReqAccBal}
                            currentCoverageLimit={currentCoverageLimit}
                            newCoverageLimit={newCoverageLimit}
                            setNewCoverageLimit={setNewCoverageLimit}
                            referralCode={referralCode}
                            isEditing={isEditingLimit}
                            portfolio={portfolio}
                            setIsEditing={setIsEditingLimit}
                            setReferralCode={setReferralCode}
                            canPurchaseNewCover={canPurchaseNewCover}
                            inactive
                          />
                        </TileCard>
                        {activeNetwork.config.keyContracts.solaceCoverProduct.additionalInfo == 'v2' && (
                          <TileCard innerThinner noShadow>
                            <CoveredChains
                              coverageActivity={{
                                status,
                                mounting,
                              }}
                              chainActivity={{
                                coverableNetworks,
                                policyChainsChecked,
                                chainsChecked,
                                setChainsChecked,
                                chainsLoading,
                              }}
                              isEditing={isEditingChains}
                              setIsEditing={setIsEditingChains}
                            />
                          </TileCard>
                        )}
                      </Flex>
                      <TileCard innerBigger noShadow>
                        <PolicyBalance
                          referralChecks={{
                            codeIsUsable,
                            codeIsValid,
                            referrerIsActive,
                            checkingReferral,
                            referrerIsOther,
                          }}
                          stableCoinData={stableCoinData}
                          chainsChecked={chainsChecked}
                          balances={balances}
                          minReqAccBal={minReqAccBal}
                          portfolio={portfolio}
                          currentCoverageLimit={currentCoverageLimit}
                          newCoverageLimit={newCoverageLimit}
                          referralCode={referralCode}
                          walletAssetBalance={walletAssetBalance}
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
                      </TileCard>
                    </TileCard>
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
              <TileCard>
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
              </TileCard>
            </Flex>
          )}
        </>
      ) : account ? (
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
      ) : (
        <PleaseConnectWallet />
      )}
    </>
  )
}
