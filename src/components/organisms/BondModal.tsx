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
import { useProvider } from '../../context/ProviderManager'

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
import { useReadToken, useTokenAllowance } from '../../hooks/useToken'
import { useNativeTokenBalance } from '../../hooks/useBalance'
import { useBondTeller } from '../../hooks/useBondTeller'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { getLongtimeFromMillis, getTimeFromMillis } from '../../utils/time'
import { accurateMultiply, shortenAddress, truncateBalance } from '../../utils/formatting'
import { queryBalance } from '../../utils/contract'

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
  const { account } = useWallet()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { reload } = useCachedData()
  const { latestBlock } = useProvider()
  const { makeTxToast } = useNotifications()
  const { keyContracts } = useContracts()
  const { solace, xSolace } = useMemo(() => keyContracts, [keyContracts])

  const [canCloseOnLoading, setCanCloseOnLoading] = useState<boolean>(false)
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [showBondSettingsModal, setShowBondSettingsModal] = useState<boolean>(false)

  const [bondRecipient, setBondRecipient] = useState<string | undefined>(undefined)
  const [calculatedAmountIn, setCalculatedAmountIn] = useState<BigNumber | undefined>(ZERO)
  const [calculatedAmountIn_X, setCalculatedAmountIn_X] = useState<BigNumber | undefined>(ZERO)
  const [calculatedAmountOut, setCalculatedAmountOut] = useState<BigNumber | undefined>(ZERO)
  const [calculatedAmountOut_X, setCalculatedAmountOut_X] = useState<BigNumber | undefined>(ZERO)
  const [func, setFunc] = useState<FunctionName>(FunctionName.DEPOSIT_ETH)
  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)
  const [isBondTellerErc20, setIsBondTellerErc20] = useState<boolean>(false)
  const [isBonding, setIsBonding] = useState<boolean>(true)
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const [ownedBondTokens, setOwnedBondTokens] = useState<BondToken[]>([])
  const [principalBalance, setPrincipalBalance] = useState<string>('0')
  const [shouldUseNativeToken, setShouldUseNativeToken] = useState<boolean>(true)
  const [slippagePrct, setSlippagePrct] = useState<string>('20')

  const [timestamp, setTimestamp] = useState<number>(0)
  const [vestingTermInMillis, setVestingTermInMillis] = useState<number>(0)
  const [maxPayout, setMaxPayout] = useState<BigNumber>(ZERO)
  const pncplDecimals = useMemo(() => selectedBondDetail?.principalData?.principalProps.decimals, [
    selectedBondDetail?.principalData?.principalProps.decimals,
  ])
  const readSolaceToken = useReadToken(solace)
  const readXSolaceToken = useReadToken(xSolace)
  const nativeTokenBalance = useNativeTokenBalance()
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
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
        return parseUnits(principalBalance, pncplDecimals)
      case FunctionName.DEPOSIT_ETH:
      default:
        return parseUnits(nativeTokenBalance, currencyDecimals)
    }
  }, [func, nativeTokenBalance, principalBalance, pncplDecimals])
  /*************************************************************************************

  contract functions

  *************************************************************************************/

  const approve = async () => {
    const pncpl = selectedBondDetail?.principalData?.principal
    if (!pncpl || !selectedBondDetail) return
    setModalLoading(true)
    try {
      const tx = await pncpl.approve(selectedBondDetail.tellerData.teller.contract.address, MAX_APPROVAL_AMOUNT)
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
    if (!pncplDecimals || !calculatedAmountOut || !calculatedAmountOut_X || !bondRecipient) return
    setModalLoading(true)
    const slippageInt = parseInt(accurateMultiply(slippagePrct, 2))
    const calcAOut = stake ? calculatedAmountOut_X : calculatedAmountOut
    const minAmountOut = calcAOut.mul(BigNumber.from(MAX_BPS - slippageInt)).div(BigNumber.from(MAX_BPS))
    await deposit(
      parseUnits(amount, pncplDecimals),
      minAmountOut,
      bondRecipient,
      stake,
      `${truncateBalance(amount)} ${pncplDecimals}`,
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
    if (!pncplDecimals || !calculatedAmountIn || !calculatedAmountIn_X) return
    const calcAIn = isStaking ? calculatedAmountIn_X : calculatedAmountIn
    setMax(assetBalance.gt(calcAIn) ? calcAIn : assetBalance, pncplDecimals, func)
  }

  const calculateAmountOut = async (_amount: string): Promise<void> => {
    if (selectedBondDetail && pncplDecimals && _amount) {
      let _calculatedAmountOut: BigNumber | undefined = ZERO
      let _calculatedAmountOut_X: BigNumber | undefined = ZERO
      const tellerContract = selectedBondDetail.tellerData.teller.contract
      try {
        const aO: BigNumber = await tellerContract.calculateAmountOut(accurateMultiply(_amount, pncplDecimals), false)
        _calculatedAmountOut = aO
      } catch (e) {
        _calculatedAmountOut = undefined
      }
      setCalculatedAmountOut(_calculatedAmountOut)
      try {
        const aO_X: BigNumber = await tellerContract.calculateAmountOut(accurateMultiply(_amount, pncplDecimals), true)
        _calculatedAmountOut_X = aO_X
      } catch (e) {
        _calculatedAmountOut_X = undefined
      }
      setCalculatedAmountOut_X(_calculatedAmountOut_X)
    } else {
      setCalculatedAmountOut(ZERO)
      setCalculatedAmountOut_X(ZERO)
    }
  }

  const calculateAmountIn = async (): Promise<void> => {
    if (selectedBondDetail && xSolace) {
      const maxPayout = selectedBondDetail.tellerData.maxPayout
      const maxPayout_X = await xSolace.solaceToXSolace(selectedBondDetail.tellerData.maxPayout)
      setMaxPayout(maxPayout)

      let _calculatedAmountIn: BigNumber | undefined = ZERO
      let _calculatedAmountIn_X: BigNumber | undefined = ZERO
      const tellerContract = selectedBondDetail.tellerData.teller.contract
      const bondFeeBps = selectedBondDetail.tellerData.bondFeeBps

      try {
        // not including bond fee to remain below maxPayout
        const aI: BigNumber = await tellerContract.calculateAmountIn(
          maxPayout.mul(BigNumber.from(MAX_BPS).sub(bondFeeBps)).div(BigNumber.from(MAX_BPS)),
          false
        )
        _calculatedAmountIn = aI
      } catch (e) {
        _calculatedAmountIn = undefined
      }
      setCalculatedAmountIn(_calculatedAmountIn)
      try {
        // not including bond fee to remain below maxPayout
        const aI_X: BigNumber = await tellerContract.calculateAmountIn(
          maxPayout_X.mul(BigNumber.from(MAX_BPS).sub(bondFeeBps)).div(BigNumber.from(MAX_BPS)),
          true
        )
        _calculatedAmountIn_X = aI_X
      } catch (e) {
        _calculatedAmountIn_X = undefined
      }
      setCalculatedAmountIn_X(_calculatedAmountIn_X)
    } else {
      setCalculatedAmountIn(ZERO)
      setCalculatedAmountIn_X(ZERO)
    }
  }

  /* 
  
  useEffect hooks
  
  */

  const _calculateAmountOut = useDebounce(async (_amount: string) => calculateAmountOut(_amount), 300)

  useEffect(() => {
    const getBondData = async () => {
      if (!selectedBondDetail?.principalData) return
      setVestingTermInMillis(selectedBondDetail.tellerData.vestingTermInSeconds * 1000)
      setContractForAllowance(selectedBondDetail.principalData.principal)
      setSpenderAddress(selectedBondDetail.tellerData.teller.contract.address)
    }
    getBondData()
  }, [selectedBondDetail, account, isOpen])

  useEffect(() => {
    const getUserBondData = async () => {
      if (!selectedBondDetail?.principalData || !account || !isOpen) return
      const principalBal = await queryBalance(selectedBondDetail.principalData.principal, account)
      const ownedTokenIds: BigNumber[] = await selectedBondDetail.tellerData.teller.contract.listTokensOfOwner(account)
      const ownedBondData = await Promise.all(
        ownedTokenIds.map(async (id) => await selectedBondDetail.tellerData.teller.contract.bonds(id))
      )
      const ownedBonds: BondToken[] = ownedTokenIds.map((id, idx) => {
        const payoutToken: string =
          ownedBondData[idx].payoutToken == readSolaceToken.address
            ? readSolaceToken.symbol
            : ownedBondData[idx].payoutToken == readXSolaceToken.address
            ? readXSolaceToken.symbol
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
  }, [account, isOpen, selectedBondDetail, readSolaceToken, readXSolaceToken])

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
    calculateAmountIn()
  }, [selectedBondDetail, xSolace])

  useEffect(() => {
    _calculateAmountOut(amount)
  }, [selectedBondDetail, amount])

  useEffect(() => {
    if (!pncplDecimals) return
    setIsAcceptableAmount(isAppropriateAmount(amount, pncplDecimals, assetBalance))
  }, [pncplDecimals, assetBalance, amount])

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
          {(approval || func == FunctionName.DEPOSIT_ETH) && (
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
          approval || func == FunctionName.DEPOSIT_ETH ? (
            <div style={{ textAlign: 'center', display: 'grid', gridTemplateColumns: '1fr 80px', marginTop: '20px' }}>
              <Input
                autoComplete="off"
                autoCorrect="off"
                placeholder="0.0"
                textAlignCenter
                type="text"
                onChange={(e) =>
                  handleInputChange(e.target.value, func == FunctionName.DEPOSIT_ETH ? currencyDecimals : pncplDecimals)
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
                {func == FunctionName.BOND_DEPOSIT_WETH && selectedBondDetail && (
                  <FlexCol style={{ margin: 'auto' }}>
                    <CheckboxOption
                      jc={'center'}
                      mb={10}
                      isChecked={!shouldUseNativeToken}
                      setChecked={() => setShouldUseNativeToken(!shouldUseNativeToken)}
                      text={`Deposit ${selectedBondDetail.principalData?.principalProps.name} instead`}
                    />
                  </FlexCol>
                )}
              </Content>
            </>
          )
        ) : null}
        {isBonding && (
          <>
            {account && (approval || func == FunctionName.DEPOSIT_ETH) && (
              <>
                <FormRow mt={40} mb={10}>
                  <FormCol>
                    <Text bold>My Balance</Text>
                  </FormCol>
                  <FormCol>
                    <Text info textAlignRight bold>
                      {formatUnits(assetBalance, pncplDecimals)}{' '}
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
                        ? `${formatUnits(calculatedAmountOut, readSolaceToken.decimals)} ${readSolaceToken.symbol}`
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
                            ? `${formatUnits(calculatedAmountOut_X, readXSolaceToken.decimals)} ${
                                readXSolaceToken.symbol
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
                  {`${formatUnits(maxPayout, readSolaceToken.decimals)} ${readSolaceToken.symbol}
                  `}
                </Text>
              </FormCol>
            </FormRow>
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
          (approval || func == FunctionName.DEPOSIT_ETH) &&
          (modalLoading ? (
            <Loader />
          ) : (
            <FlexCol mt={20}>
              <FlexCol style={{ margin: 'auto' }}>
                {!isBondTellerErc20 && (
                  <>
                    <CheckboxOption
                      mb={10}
                      isChecked={!shouldUseNativeToken}
                      setChecked={() => setShouldUseNativeToken(!shouldUseNativeToken)}
                      text={`Deposit ${
                        selectedBondDetail?.principalData?.principalProps.name ?? 'wrapped token'
                      } instead`}
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
                    {parseInt(accurateMultiply(slippagePrct, 2)) / 100}%
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
                {ownedBondTokens.map((token) => (
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
                        <Text textAlignRight>{formatUnits(token.pricePaid, pncplDecimals)}</Text>
                      </FormCol>
                    </FormRow>
                    <FormRow mb={10}>
                      <FormCol>
                        <Text>Payout</Text>
                      </FormCol>
                      <FormCol>
                        <Text textAlignRight>
                          {`${formatUnits(token.payoutAmount, readSolaceToken.decimals)} ${token.payoutToken}`}
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
                ))}
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
