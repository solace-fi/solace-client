/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

    BondModal
      custom hooks
      contract functions
      local functions
      useEffect hooks

  *************************************************************************************/

/* import packages */
import React, { useCallback, useState, useMemo, useEffect } from 'react'
import { Contract } from '@ethersproject/contracts'
import { formatUnits, parseUnits } from '@ethersproject/units'
import useDebounce from '@rooks/use-debounce'
import { BigNumber } from 'ethers'

/* import constants */
import { BondTellerDetails, BondToken, LocalTx } from '../../constants/types'
import { BKPT_3, MAX_BPS, MAX_APPROVAL_AMOUNT, ZERO } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'
import { useCachedData } from '../../context/CachedDataManager'
import { useNotifications } from '../../context/NotificationsManager'
import { useContracts } from '../../context/ContractsManager'

/* import components */
import { WalletConnectButton } from '../molecules/WalletConnectButton'
import { ModalContainer, ModalBase, ModalHeader, ModalCell } from '../atoms/Modal'
import { ModalCloseButton } from '../molecules/Modal'
import { Content, FlexCol, HeroContainer, HorizRule, MultiTabIndicator, Scrollable } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { Button, ButtonWrapper } from '../atoms/Button'
import { FormCol, FormRow } from '../../components/atoms/Form'
import { Input } from '../../components/atoms/Input'
import { DeFiAssetImage } from '../../components/atoms/DeFiAsset'
import { Card, CardContainer } from '../atoms/Card'
import { Loader } from '../atoms/Loader'
import { CheckboxOption } from './PoolModalRouter'
import { FlexRow } from '../../components/atoms/Layout'
import { SmallBox } from '../atoms/Box'
import { StyledGear, StyledGraphDown, StyledSendPlane } from '../atoms/Icon'
import { BondSettingsModal } from './BondSettingsModal'

/* import hooks */
import { useInputAmount } from '../../hooks/useInputAmount'
import { useTokenAllowance } from '../../hooks/useTokenAllowance'
import { useSolaceBalance, useXSolaceBalance } from '../../hooks/useBalance'
import { useNativeTokenBalance } from '../../hooks/useBalance'
import { useBondTeller } from '../../hooks/useBondTeller'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { getLongtimeFromMillis, getTimeFromMillis } from '../../utils/time'
import { queryBalance } from '../../utils/contract'
import { accurateMultiply, shortenAddress, truncateBalance } from '../../utils/formatting'

interface BondModalProps {
  closeModal: () => void
  isOpen: boolean
  selectedBondDetail?: BondTellerDetails
}

export const BondModal: React.FC<BondModalProps> = ({ closeModal, isOpen, selectedBondDetail }) => {
  /* 
  
  custom hooks 
  
  */
  const { haveErrors } = useGeneral()
  const { account, library } = useWallet()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { reload, latestBlock } = useCachedData()
  const { makeTxToast } = useNotifications()
  const { solace, xSolace } = useContracts()

  const [canCloseOnLoading, setCanCloseOnLoading] = useState<boolean>(false)
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [showBondSettingsModal, setShowBondSettingsModal] = useState<boolean>(false)

  const [bondRecipient, setBondRecipient] = useState<string | undefined>(undefined)
  const [calculatedAmountIn, setCalculatedAmountIn] = useState<BigNumber | undefined>(ZERO)
  const [calculatedAmountIn_X, setCalculatedAmountIn_X] = useState<BigNumber | undefined>(ZERO)
  const [calculatedAmountOut, setCalculatedAmountOut] = useState<BigNumber | undefined>(ZERO)
  const [calculatedAmountOut_X, setCalculatedAmountOut_X] = useState<BigNumber | undefined>(ZERO)
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [func, setFunc] = useState<FunctionName>(FunctionName.DEPOSIT_ETH)
  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)
  const [isBondTellerErc20, setIsBondTellerErc20] = useState<boolean>(false)
  const [isBonding, setIsBonding] = useState<boolean>(true)
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const [ownedBondTokens, setOwnedBondTokens] = useState<BondToken[]>([])
  const [principalBalance, setPrincipalBalance] = useState<string>('0')
  const [shouldUseNativeToken, setShouldUseNativeToken] = useState<boolean>(true)
  const [slippagePrct, setSlippagePrct] = useState<string>('0.5')
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)

  const [timestamp, setTimestamp] = useState<number>(0)
  const [vestingTermInMillis, setVestingTermInMillis] = useState<number>(0)
  const [maxPayout, setMaxPayout] = useState<BigNumber>(ZERO)
  const [maxPayout_X, setMaxPayout_X] = useState<BigNumber>(ZERO)

  const solaceBalanceData = useSolaceBalance()
  const xSolaceBalanceData = useXSolaceBalance()
  const nativeTokenBalance = useNativeTokenBalance()
  const tokenAllowance = useTokenAllowance(contractForAllowance, spenderAddress)
  const { deposit, redeem } = useBondTeller(selectedBondDetail)
  const { width } = useWindowDimensions()
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
  const approval = useMemo(() => contractForAllowance && spenderAddress && tokenAllowance != '0', [
    contractForAllowance,
    spenderAddress,
    tokenAllowance,
  ])
  const assetBalance = useMemo(() => {
    switch (func) {
      case FunctionName.BOND_DEPOSIT_ERC20:
      case FunctionName.BOND_DEPOSIT_WETH:
        return parseUnits(principalBalance, selectedBondDetail?.principalData?.principalProps.decimals)
      case FunctionName.DEPOSIT_ETH:
      default:
        return parseUnits(nativeTokenBalance, currencyDecimals)
    }
  }, [func, nativeTokenBalance, principalBalance, selectedBondDetail])
  /*************************************************************************************

  contract functions

  *************************************************************************************/

  const approve = async () => {
    if (!selectedBondDetail?.principalData?.principal) return
    setModalLoading(true)
    try {
      const tx = await selectedBondDetail.principalData.principal.approve(
        selectedBondDetail.tellerData.teller.contract.address,
        MAX_APPROVAL_AMOUNT
      )
      const txHash = tx.hash
      setCanCloseOnLoading(true)
      makeTxToast(FunctionName.APPROVE, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(FunctionName.APPROVE, status, txHash)
        reload()
      })
      setCanCloseOnLoading(false)
      setModalLoading(false)
    } catch (err) {
      _handleContractCallError('approve', err, FunctionName.APPROVE)
    }
  }

  const callDepositBond = async (stake: boolean) => {
    if (
      !selectedBondDetail?.principalData ||
      !library ||
      !calculatedAmountOut ||
      !calculatedAmountOut_X ||
      !bondRecipient
    )
      return
    setModalLoading(true) // await calculateAmountOut(amount, stake)
    const slippageInt = parseInt(accurateMultiply(slippagePrct, 2))
    const calcAOut = stake ? calculatedAmountOut_X : calculatedAmountOut
    const minAmountOut = calcAOut.mul(BigNumber.from(MAX_BPS - slippageInt)).div(BigNumber.from(MAX_BPS))
    await deposit(
      parseUnits(amount, selectedBondDetail.principalData.principalProps.decimals),
      minAmountOut,
      bondRecipient,
      stake,
      `${truncateBalance(amount)} ${selectedBondDetail.principalData.principalProps.decimals}`,
      func,
      gasConfig
    )
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callDepositBond', err, func))
  }

  const callRedeemBond = async (bondId: BigNumber) => {
    if (bondId.eq(ZERO)) return
    setModalLoading(true)
    await redeem(bondId, `#${bondId.toString()}`, gasConfig)
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callRedeemBond', err, func))
  }

  /*************************************************************************************

  local functions

  *************************************************************************************/

  const _handleToast = async (tx: any, localTx: LocalTx | null) => {
    handleClose()
    await handleToast(tx, localTx)
  }

  const _handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    handleContractCallError(functionName, err, txType)
    setModalLoading(false)
  }

  const handleClose = useCallback(() => {
    setBondRecipient(account)
    setCalculatedAmountIn(ZERO)
    setCalculatedAmountIn_X(ZERO)
    setCalculatedAmountOut(ZERO)
    setCalculatedAmountOut_X(ZERO)
    setContractForAllowance(null)
    setFunc(FunctionName.DEPOSIT_ETH)
    setIsAcceptableAmount(false)
    setIsBondTellerErc20(false)
    setIsBonding(true)
    setIsStaking(false)
    setOwnedBondTokens([])
    setPrincipalBalance('0')
    setShouldUseNativeToken(true)
    setSlippagePrct('0.5')
    setSpenderAddress(null)

    setModalLoading(false)
    resetAmount()
    closeModal()
  }, [closeModal])

  const _setMax = () => {
    if (!selectedBondDetail?.principalData || !calculatedAmountIn || !calculatedAmountIn_X) return
    const calcAIn = isStaking ? calculatedAmountIn_X : calculatedAmountIn
    setMax(
      assetBalance.gt(calcAIn) ? calcAIn : assetBalance,
      selectedBondDetail.principalData.principalProps.decimals,
      func
    )
  }

  const _calculateAmountOut = useDebounce(
    async (_amount: string, stake: boolean) => calculateAmountOut(_amount, stake),
    300
  )

  const calculateAmountOut = async (_amount: string, stake: boolean): Promise<BigNumber | undefined> => {
    if (selectedBondDetail?.principalData && _amount) {
      let _calculatedAmountOut: BigNumber | undefined = ZERO
      let _calculatedAmountOut_X: BigNumber | undefined = ZERO
      try {
        const aO: BigNumber = await selectedBondDetail.tellerData.teller.contract.calculateAmountOut(
          accurateMultiply(_amount, selectedBondDetail.principalData.principalProps.decimals),
          false
        )
        _calculatedAmountOut = aO
      } catch (e) {
        _calculatedAmountOut = undefined
      }
      setCalculatedAmountOut(_calculatedAmountOut)
      try {
        const aO_X: BigNumber = await selectedBondDetail.tellerData.teller.contract.calculateAmountOut(
          accurateMultiply(_amount, selectedBondDetail.principalData.principalProps.decimals),
          true
        )
        _calculatedAmountOut_X = aO_X
      } catch (e) {
        _calculatedAmountOut_X = undefined
      }
      setCalculatedAmountOut_X(_calculatedAmountOut_X)
      return stake ? _calculatedAmountOut_X : _calculatedAmountOut
    }
    setCalculatedAmountOut(ZERO)
    setCalculatedAmountOut_X(ZERO)
    return ZERO
  }

  const calculateAmountIn = async (stake: boolean): Promise<BigNumber | undefined> => {
    if (selectedBondDetail && xSolace) {
      const maxPayout = selectedBondDetail.tellerData.maxPayout
      const maxPayout_X = await xSolace.solaceToXSolace(selectedBondDetail.tellerData.maxPayout)
      setMaxPayout(maxPayout)
      setMaxPayout_X(maxPayout_X)

      let _calculatedAmountIn: BigNumber | undefined = ZERO
      let _calculatedAmountIn_X: BigNumber | undefined = ZERO
      try {
        const aI: BigNumber = await selectedBondDetail.tellerData.teller.contract.calculateAmountIn(
          maxPayout
            .mul(BigNumber.from(MAX_BPS).sub(selectedBondDetail.tellerData.stakeFeeBps))
            .div(BigNumber.from(MAX_BPS)),
          false
        )
        _calculatedAmountIn = aI
      } catch (e) {
        _calculatedAmountIn = undefined
      }
      setCalculatedAmountIn(_calculatedAmountIn)
      try {
        const aI_X: BigNumber = await selectedBondDetail.tellerData.teller.contract.calculateAmountIn(
          maxPayout_X
            .mul(BigNumber.from(MAX_BPS).sub(selectedBondDetail.tellerData.stakeFeeBps))
            .div(BigNumber.from(MAX_BPS)),
          true
        )
        _calculatedAmountIn_X = aI_X
      } catch (e) {
        _calculatedAmountIn_X = undefined
      }
      setCalculatedAmountIn_X(_calculatedAmountIn_X)
      return stake ? _calculatedAmountIn_X : _calculatedAmountIn
    }
    setCalculatedAmountIn(ZERO)
    setCalculatedAmountIn_X(ZERO)
    return ZERO
  }

  /* 
  
  useEffect hooks
  
  */

  useEffect(() => {
    const getBondData = async () => {
      if (!selectedBondDetail?.principalData) return
      setVestingTermInMillis(selectedBondDetail.tellerData.vestingTermInSeconds.toNumber() * 1000)
      setContractForAllowance(selectedBondDetail.principalData.principal)
      setSpenderAddress(selectedBondDetail.tellerData.teller.contract.address)
    }
    getBondData()
  }, [selectedBondDetail, account, isOpen])

  useEffect(() => {
    const getUserBondData = async () => {
      if (!selectedBondDetail?.principalData || !account || !solace || !xSolace || !isOpen) return
      const principalBal = await queryBalance(selectedBondDetail.principalData.principal, account)
      const ownedTokenIds: BigNumber[] = await selectedBondDetail.tellerData.teller.contract.listTokensOfOwner(account)
      const ownedBondData = await Promise.all(
        ownedTokenIds.map(async (id) => await selectedBondDetail.tellerData.teller.contract.bonds(id))
      )
      const ownedBonds: BondToken[] = ownedTokenIds.map((id, idx) => {
        const payoutToken: string =
          ownedBondData[idx].payoutToken == solace.address
            ? solaceBalanceData.tokenData.symbol
            : ownedBondData[idx].payoutToken == xSolace.address
            ? xSolaceBalanceData.tokenData.symbol
            : ''
        return {
          id,
          payoutToken,
          payoutAmount: ownedBondData[idx].payoutAmount,
          pricePaid: ownedBondData[idx].pricePaid,
          maturation: ownedBondData[idx].maturation,
        }
      })
      setPrincipalBalance(formatUnits(principalBal, selectedBondDetail.principalData.principalProps.decimals))
      setOwnedBondTokens(ownedBonds.sort((a, b) => a.id.toNumber() - b.id.toNumber()))
    }
    getUserBondData()
  }, [account, isOpen, selectedBondDetail])

  useEffect(() => {
    const getTellerType = async () => {
      if (!selectedBondDetail) return
      const isBondTellerErc20 = selectedBondDetail.tellerData.teller.isBondTellerErc20
      const tempFunc = isBondTellerErc20 ? FunctionName.BOND_DEPOSIT_ERC20 : FunctionName.DEPOSIT_ETH
      setIsBondTellerErc20(isBondTellerErc20)
      setFunc(tempFunc)
    }
    getTellerType()
  }, [selectedBondDetail?.tellerData.teller.isBondTellerErc20, isOpen])

  useEffect(() => {
    calculateAmountIn(isStaking)
  }, [selectedBondDetail, isStaking, xSolace])

  useEffect(() => {
    _calculateAmountOut(amount, isStaking)
  }, [selectedBondDetail, isStaking, amount])

  useEffect(() => {
    if (!selectedBondDetail?.principalData) return
    setIsAcceptableAmount(
      isAppropriateAmount(amount, selectedBondDetail.principalData.principalProps.decimals, assetBalance)
    )
  }, [selectedBondDetail?.principalData, assetBalance, amount])

  useEffect(() => {
    resetAmount()
  }, [isBonding])

  useEffect(() => {
    if (!latestBlock) return
    setTimestamp(latestBlock.timestamp)
  }, [latestBlock])

  useEffect(() => {
    setBondRecipient(account)
  }, [account])

  useEffect(() => {
    if (isBondTellerErc20) return
    setFunc(shouldUseNativeToken ? FunctionName.DEPOSIT_ETH : FunctionName.BOND_DEPOSIT_WETH)
  }, [shouldUseNativeToken])

  return (
    <ModalContainer isOpen={isOpen}>
      <ModalBase isOpen={isOpen}>
        <BondSettingsModal
          bondRecipient={bondRecipient}
          setBondRecipient={setBondRecipient}
          slippagePrct={slippagePrct}
          setSlippagePrct={setSlippagePrct}
          isOpen={showBondSettingsModal}
          modalTitle={`Bond Settings`}
          handleClose={() => setShowBondSettingsModal(false)}
          selectedBondDetail={selectedBondDetail}
        />
        <ModalHeader style={{ position: 'relative', marginTop: '20px' }}>
          {approval && (
            <FlexRow style={{ cursor: 'pointer', position: 'absolute', left: '0', bottom: '-10px' }}>
              <StyledGear size={25} onClick={() => setShowBondSettingsModal(true)} />
            </FlexRow>
          )}
          <FlexRow style={{ position: 'absolute', left: '50%', transform: 'translate(-50%)' }}>
            {selectedBondDetail?.principalData &&
              (selectedBondDetail.principalData.token0 && selectedBondDetail.principalData.token1 ? (
                <>
                  <DeFiAssetImage mr={5} noborder>
                    <img
                      src={`https://assets.solace.fi/${selectedBondDetail.principalData.token0.toLowerCase()}`}
                      alt={selectedBondDetail?.principalData.token0.toLowerCase()}
                    />
                  </DeFiAssetImage>
                  <DeFiAssetImage noborder>
                    <img
                      src={`https://assets.solace.fi/${selectedBondDetail.principalData.token1.toLowerCase()}`}
                      alt={selectedBondDetail?.principalData.token1.toLowerCase()}
                    />
                  </DeFiAssetImage>
                </>
              ) : (
                <DeFiAssetImage noborder>
                  <img
                    src={`https://assets.solace.fi/${selectedBondDetail.principalData.principalProps.name.toLowerCase()}`}
                    alt={selectedBondDetail?.principalData.principalProps.symbol}
                  />
                </DeFiAssetImage>
              ))}
          </FlexRow>
          <FlexRow style={{ position: 'absolute', right: '0', bottom: '-10px' }}>
            <ModalCloseButton hidden={modalLoading && !canCloseOnLoading} onClick={handleClose} />
          </FlexRow>
        </ModalHeader>
        <div
          style={{
            gridTemplateColumns: '1fr 1fr',
            display: 'grid',
            position: 'relative',
            width: width > BKPT_3 ? '500px' : undefined,
          }}
        >
          <MultiTabIndicator style={{ left: isBonding ? '0' : '50%' }} />
          <ModalCell
            pt={5}
            pb={10}
            pl={0}
            pr={0}
            onClick={() => setIsBonding(true)}
            jc={'center'}
            style={{ cursor: 'pointer' }}
          >
            <Text t1 info={isBonding}>
              Bond
            </Text>
          </ModalCell>
          <ModalCell
            pt={5}
            pb={10}
            pl={0}
            pr={0}
            onClick={() => setIsBonding(false)}
            jc={'center'}
            style={{ cursor: 'pointer' }}
          >
            <Text t1 info={!isBonding}>
              Redeem
            </Text>
          </ModalCell>
        </div>
        {!account ? (
          <ButtonWrapper>
            <WalletConnectButton info welcome secondary />
          </ButtonWrapper>
        ) : isBonding ? (
          approval ? (
            <div style={{ textAlign: 'center', display: 'grid', gridTemplateColumns: '1fr 80px', marginTop: '20px' }}>
              <Input
                autoComplete="off"
                autoCorrect="off"
                placeholder="0.0"
                textAlignCenter
                type="text"
                onChange={(e) =>
                  handleInputChange(
                    e.target.value,
                    func == FunctionName.DEPOSIT_ETH
                      ? currencyDecimals
                      : selectedBondDetail?.principalData?.principalProps.decimals
                  )
                }
                value={amount}
              />
              <Button info ml={10} pt={4} pb={4} pl={8} pr={8} width={70} height={30} onClick={_setMax}>
                MAX
              </Button>
            </div>
          ) : modalLoading ? (
            <Content>
              <Loader />
            </Content>
          ) : (
            <>
              <Content>
                <Text textAlignCenter bold>
                  First time bonding?
                </Text>
                <Text textAlignCenter t4>
                  Please approve Solace DAO to use your token for bonding.
                </Text>
                <ButtonWrapper>
                  <Button info secondary onClick={approve}>
                    Sign
                  </Button>
                </ButtonWrapper>
              </Content>
            </>
          )
        ) : null}
        {isBonding && (
          <>
            {account && approval && (
              <>
                <FormRow mt={40} mb={10}>
                  <FormCol>
                    <Text bold>My Balance</Text>
                  </FormCol>
                  <FormCol>
                    <Text info textAlignRight bold>
                      {formatUnits(assetBalance, selectedBondDetail?.principalData?.principalProps.decimals)}{' '}
                      {func == FunctionName.DEPOSIT_ETH
                        ? activeNetwork.nativeCurrency.symbol
                        : selectedBondDetail?.principalData?.principalProps?.symbol}
                    </Text>
                  </FormCol>
                </FormRow>
                <FormRow mb={5}>
                  <FormCol>
                    <Text bold>You Will Get</Text>
                  </FormCol>
                  <FormCol>
                    <Text info textAlignRight bold>
                      {calculatedAmountOut
                        ? `${formatUnits(calculatedAmountOut, solaceBalanceData.tokenData.decimals)} ${
                            solaceBalanceData.tokenData.symbol
                          }`
                        : `-`}
                    </Text>
                  </FormCol>
                </FormRow>
                <FormRow mb={30} jc={'right'}>
                  <SmallBox transparent collapse={!isStaking} m={0} p={0}>
                    <FormRow mb={10}>
                      <FormCol></FormCol>
                      <FormCol>
                        <Text t4 textAlignRight>
                          {'( '}
                          {calculatedAmountOut_X
                            ? `${formatUnits(calculatedAmountOut_X, xSolaceBalanceData.tokenData.decimals)} ${
                                xSolaceBalanceData.tokenData.symbol
                              }`
                            : `-`}
                          {' )'}
                        </Text>
                      </FormCol>
                    </FormRow>
                  </SmallBox>
                </FormRow>
              </>
            )}
            <HorizRule />
            <FormRow mt={20} mb={10}>
              <FormCol>
                <Text t4>MAX You Can Buy</Text>
              </FormCol>
              <FormCol>
                <Text t4 info textAlignRight>
                  {`${formatUnits(maxPayout, solaceBalanceData.tokenData.decimals)} ${
                    solaceBalanceData.tokenData.symbol
                  }
                  `}
                </Text>
              </FormCol>
            </FormRow>
            {/* <SmallBox transparent collapse={!isStaking} m={0} p={0} jc={'right}>
              <FormRow mb={10}>
                <FormCol></FormCol>
                <FormCol>
                  <Text t4 textAlignRight>
                    {'( '}
                    {`${formatUnits(maxPayout_X, xSolaceBalanceData.tokenData.decimals)} ${
                      xSolaceBalanceData.tokenData.symbol
                    }`}
                    {' )'}
                  </Text>
                </FormCol>
              </FormRow>
            </SmallBox> */}
            <FormRow>
              <FormCol>
                <Text t4>Vesting Term</Text>
              </FormCol>
              <FormCol>
                <Text t4 info textAlignRight>
                  {getLongtimeFromMillis(vestingTermInMillis)}
                </Text>
              </FormCol>
            </FormRow>
          </>
        )}
        {account &&
          isBonding &&
          approval &&
          (modalLoading ? (
            <Loader />
          ) : (
            <FlexCol mt={20}>
              <FlexCol style={{ margin: 'auto' }}>
                {!isBondTellerErc20 && selectedBondDetail && (
                  <>
                    <CheckboxOption
                      mb={10}
                      isChecked={!shouldUseNativeToken}
                      setChecked={() => setShouldUseNativeToken(!shouldUseNativeToken)}
                      text={`Deposit ${selectedBondDetail.principalData?.principalProps.name} instead`}
                    />
                  </>
                )}
                <CheckboxOption
                  isChecked={isStaking}
                  setChecked={setIsStaking}
                  text={'Autostake and receive xSOLACE'}
                />
              </FlexCol>
              <ButtonWrapper isColumn>
                <Button
                  widthP={100}
                  info
                  disabled={!isAcceptableAmount || haveErrors}
                  onClick={() => callDepositBond(isStaking)}
                >
                  Bond
                </Button>
                <FlexRow>
                  <StyledGraphDown size={15} />
                  <Text t4 ml={5}>
                    {slippagePrct}%
                  </Text>
                  {bondRecipient && (
                    <FlexRow ml={10}>
                      <StyledSendPlane size={15} />
                      <Text t4 ml={5}>
                        {shortenAddress(bondRecipient)}
                      </Text>
                    </FlexRow>
                  )}
                </FlexRow>
              </ButtonWrapper>
            </FlexCol>
          ))}
        {!isBonding &&
          account &&
          (ownedBondTokens.length > 0 ? (
            <Scrollable maxMobileHeight={45} maxDesktopHeight={45} mt={20}>
              <CardContainer cardsPerRow={1}>
                {ownedBondTokens.map((token) => {
                  return (
                    <Card p={15} key={token.id.toString()}>
                      <FormRow mb={10}>
                        <FormCol>
                          <Text>ID</Text>
                        </FormCol>
                        <FormCol>{token.id.toString()}</FormCol>
                      </FormRow>
                      <FormRow mb={10}>
                        <FormCol>
                          <Text>Paid Price</Text>
                        </FormCol>
                        <FormCol>
                          <Text textAlignRight>
                            {formatUnits(token.pricePaid, selectedBondDetail?.principalData?.principalProps.decimals)}
                          </Text>
                        </FormCol>
                      </FormRow>
                      <FormRow mb={10}>
                        <FormCol>
                          <Text>Payout</Text>
                        </FormCol>
                        <FormCol>
                          <Text textAlignRight>
                            {formatUnits(token.payoutAmount, solaceBalanceData.tokenData.decimals)} {token.payoutToken}
                          </Text>
                        </FormCol>
                      </FormRow>
                      {token.maturation.toNumber() > timestamp ? (
                        <FormRow mb={10}>
                          <FormCol>Time Until Fully Vested</FormCol>
                          <FormCol>{getTimeFromMillis((token.maturation.toNumber() - timestamp) * 1000)}</FormCol>
                        </FormRow>
                      ) : (
                        <>
                          <Text textAlignCenter success mb={10}>
                            Fully Vested
                          </Text>
                          <Button widthP={100} info disabled={haveErrors} onClick={() => callRedeemBond(token.id)}>
                            Claim
                          </Button>
                        </>
                      )}
                    </Card>
                  )
                })}
              </CardContainer>
            </Scrollable>
          ) : (
            <HeroContainer>
              <Text t2 textAlignCenter>
                You do not have any bond tokens.
              </Text>
            </HeroContainer>
          ))}
      </ModalBase>
    </ModalContainer>
  )
}
