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
import { BondTellerDetails, BondToken, LocalTx } from '../../../constants/types'
import { BKPT_3, MAX_BPS, ZERO } from '../../../constants'
import { FunctionName, TransactionCondition } from '../../../constants/enums'

/* import managers */
import { useWallet } from '../../../context/WalletManager'
import { useNetwork } from '../../../context/NetworkManager'
import { useCachedData } from '../../../context/CachedDataManager'
import { useNotifications } from '../../../context/NotificationsManager'
import { useContracts } from '../../../context/ContractsManager'

/* import components */
import { WalletConnectButton } from '../../molecules/WalletConnectButton'
import { ModalContainer, ModalBase, ModalHeader, ModalCell } from '../../atoms/Modal'
import { ModalCloseButton } from '../../molecules/Modal'
import { FlexCol, HorizRule, MultiTabIndicator } from '../../atoms/Layout'
import { Text } from '../../atoms/Typography'
import { Button, ButtonWrapper } from '../../atoms/Button'
import { Input } from '../../atoms/Input'
import { DeFiAssetImage } from '../../atoms/DeFiAsset'
import { Loader } from '../../atoms/Loader'
import { FlexRow } from '../../atoms/Layout'
import { StyledGear } from '../../atoms/Icon'
import { BondSettingsModal } from './BondSettingsModal'
import { OwnedBondList } from './OwnedBondList'
import { BondOptions } from './BondOptions'
import { PublicBondInfo } from './PublicBondInfo'

/* import hooks */
import { useInputAmount } from '../../../hooks/useInputAmount'
import { useReadToken, useTokenAllowance } from '../../../hooks/useToken'
import { useNativeTokenBalance } from '../../../hooks/useBalance'
import { useBondTeller, useUserBondData } from '../../../hooks/useBondTeller'
import { useWindowDimensions } from '../../../hooks/useWindowDimensions'

/* import utils */
import { accurateMultiply, formatAmount, truncateBalance } from '../../../utils/formatting'
import { queryBalance } from '../../../utils/contract'
import { PrivateBondInfo } from './PrivateBondInfo'

interface BondModalProps {
  closeModal: () => void
  isOpen: boolean
  selectedBondDetail?: BondTellerDetails
}

export const BondModal: React.FC<BondModalProps> = ({ closeModal, isOpen, selectedBondDetail }) => {
  /* 
  
  custom hooks 
  
  */
  const { account } = useWallet()
  const { currencyDecimals } = useNetwork()
  const { reload } = useCachedData()
  const { makeTxToast } = useNotifications()
  const { keyContracts } = useContracts()
  const { solace, xSolace } = useMemo(() => keyContracts, [keyContracts])

  const [canCloseOnLoading, setCanCloseOnLoading] = useState<boolean>(false)
  const [canMax, setCanMax] = useState<boolean>(true)
  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)
  const [isBondTellerErc20, setIsBondTellerErc20] = useState<boolean>(false)
  const [isBonding, setIsBonding] = useState<boolean>(true)
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [shouldUseNativeToken, setShouldUseNativeToken] = useState<boolean>(true)
  const [showBondSettingsModal, setShowBondSettingsModal] = useState<boolean>(false)
  const [ownedBondTokens, setOwnedBondTokens] = useState<BondToken[]>([])

  const [bondRecipient, setBondRecipient] = useState<string | undefined>(undefined)
  const [calculatedAmountIn, setCalculatedAmountIn] = useState<BigNumber | undefined>(ZERO)
  const [calculatedAmountIn_X, setCalculatedAmountIn_X] = useState<BigNumber | undefined>(ZERO)
  const [calculatedAmountOut, setCalculatedAmountOut] = useState<BigNumber | undefined>(ZERO)
  const [calculatedAmountOut_X, setCalculatedAmountOut_X] = useState<BigNumber | undefined>(ZERO)
  const [func, setFunc] = useState<FunctionName>(FunctionName.DEPOSIT_ETH)
  const [principalBalance, setPrincipalBalance] = useState<string>('0')
  const [slippagePrct, setSlippagePrct] = useState<string>('20')

  const pncplDecimals = useMemo(() => selectedBondDetail?.principalData.principalProps.decimals, [
    selectedBondDetail?.principalData.principalProps.decimals,
  ])
  const readSolaceToken = useReadToken(solace)
  const readXSolaceToken = useReadToken(xSolace)
  const nativeTokenBalance = useNativeTokenBalance()
  const { deposit, redeem } = useBondTeller(selectedBondDetail)
  const { width } = useWindowDimensions()
  const { getUserBondData } = useUserBondData()
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
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const approval = useTokenAllowance(
    contractForAllowance,
    spenderAddress,
    amount && amount != '.' ? parseUnits(amount, pncplDecimals).toString() : '0'
  )
  const assetBalance = useMemo(() => {
    switch (func) {
      case FunctionName.BOND_DEPOSIT_ERC20:
      case FunctionName.BOND_DEPOSIT_WETH:
        return parseUnits(principalBalance, pncplDecimals)
      case FunctionName.DEPOSIT_ETH:
      default:
        return parseUnits(nativeTokenBalance, currencyDecimals)
    }
  }, [func, nativeTokenBalance, principalBalance, pncplDecimals, currencyDecimals])

  /*************************************************************************************

  contract functions

  *************************************************************************************/

  const approve = async () => {
    const pncpl = selectedBondDetail?.principalData.principal
    if (!pncpl || !selectedBondDetail) return
    setModalLoading(true)
    try {
      const tx = await pncpl.approve(
        selectedBondDetail.tellerData.teller.contract.address,
        parseUnits(amount, pncplDecimals)
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
    setPrincipalBalance('0')
    setShouldUseNativeToken(true)
    setSlippagePrct('0.5')
    setSpenderAddress(null)
    setOwnedBondTokens([])

    setModalLoading(false)
    resetAmount()
    closeModal()
  }, [closeModal, account])

  const _setMax = () => {
    if (!pncplDecimals || !calculatedAmountIn || !calculatedAmountIn_X) return
    const calcAIn = isStaking ? calculatedAmountIn_X : calculatedAmountIn
    setMax(assetBalance.gt(calcAIn) ? calcAIn : assetBalance, pncplDecimals, func)
  }

  const calculateAmountOut = async (_amount: string): Promise<void> => {
    if (selectedBondDetail && pncplDecimals) {
      const formattedAmount = formatAmount(_amount)
      const tellerContract = selectedBondDetail.tellerData.teller.contract
      try {
        const aO: BigNumber = await tellerContract.calculateAmountOut(
          accurateMultiply(formattedAmount, pncplDecimals),
          false
        )
        setCalculatedAmountOut(aO)
      } catch (e) {
        setCalculatedAmountOut(undefined)
      }
      try {
        const aO_X: BigNumber = await tellerContract.calculateAmountOut(
          accurateMultiply(formattedAmount, pncplDecimals),
          true
        )
        setCalculatedAmountOut_X(aO_X)
      } catch (e) {
        setCalculatedAmountOut_X(undefined)
      }
    } else {
      setCalculatedAmountOut(ZERO)
      setCalculatedAmountOut_X(ZERO)
    }
  }

  const calculateAmountIn = async (): Promise<void> => {
    setCanMax(false)
    if (selectedBondDetail && xSolace) {
      const maxPayout = selectedBondDetail.tellerData.maxPayout
      const maxPayout_X = await xSolace.solaceToXSolace(selectedBondDetail.tellerData.maxPayout)

      const tellerContract = selectedBondDetail.tellerData.teller.contract
      const bondFeeBps = selectedBondDetail.tellerData.bondFeeBps

      try {
        // not including bond fee to remain below maxPayout
        const aI: BigNumber = await tellerContract.calculateAmountIn(
          maxPayout.mul(BigNumber.from(MAX_BPS).sub(bondFeeBps)).div(BigNumber.from(MAX_BPS)),
          false
        )
        setCalculatedAmountIn(aI)
      } catch (e) {
        setCalculatedAmountIn(undefined)
      }
      try {
        // not including bond fee to remain below maxPayout
        const aI_X: BigNumber = await tellerContract.calculateAmountIn(
          maxPayout_X.mul(BigNumber.from(MAX_BPS).sub(bondFeeBps)).div(BigNumber.from(MAX_BPS)),
          true
        )
        setCalculatedAmountIn_X(aI_X)
      } catch (e) {
        setCalculatedAmountIn_X(undefined)
      }
    } else {
      setCalculatedAmountIn(ZERO)
      setCalculatedAmountIn_X(ZERO)
    }
    setCanMax(true)
  }

  /* 
  
  useEffect hooks
  
  */

  const _calculateAmountOut = useDebounce(async (_amount: string) => calculateAmountOut(_amount), 300)

  useEffect(() => {
    const getBondData = async () => {
      if (!selectedBondDetail?.principalData) return
      setContractForAllowance(selectedBondDetail.principalData.principal)
      setSpenderAddress(selectedBondDetail.tellerData.teller.contract.address)
    }
    getBondData()
  }, [selectedBondDetail, account, isOpen])

  useEffect(() => {
    const getUserBonds = async () => {
      if (!selectedBondDetail?.principalData || !account || !isOpen) return
      const ownedBonds = await getUserBondData(selectedBondDetail, account)
      setOwnedBondTokens(ownedBonds.sort((a, b) => a.id.toNumber() - b.id.toNumber()))
      const principalBal = await queryBalance(selectedBondDetail.principalData.principal, account)
      setPrincipalBalance(formatUnits(principalBal, selectedBondDetail.principalData.principalProps.decimals))
    }
    getUserBonds()
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
  }, [selectedBondDetail, selectedBondDetail?.tellerData.teller.isBondTellerErc20, isOpen])

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
    setBondRecipient(account)
  }, [account])

  useEffect(() => {
    if (isBondTellerErc20) return
    setFunc(shouldUseNativeToken ? FunctionName.DEPOSIT_ETH : FunctionName.BOND_DEPOSIT_WETH)
  }, [shouldUseNativeToken, isBondTellerErc20])

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
            <Button
              info
              ml={10}
              pt={4}
              pb={4}
              pl={8}
              pr={8}
              width={70}
              height={30}
              onClick={_setMax}
              disabled={!canMax}
            >
              MAX
            </Button>
          </div>
        ) : null}
        {isBonding && (
          <>
            <PrivateBondInfo
              func={func}
              selectedBondDetail={selectedBondDetail}
              assetBalance={assetBalance}
              pncplDecimals={pncplDecimals}
              calculatedAmountOut={calculatedAmountOut}
              calculatedAmountOut_X={calculatedAmountOut_X}
              isStaking={isStaking}
            />
            <HorizRule mb={20} />
            <PublicBondInfo selectedBondDetail={selectedBondDetail} />
            {account &&
              (modalLoading ? (
                <Loader />
              ) : (
                <FlexCol mt={20}>
                  <BondOptions
                    isBondTellerErc20={isBondTellerErc20}
                    selectedBondDetail={selectedBondDetail}
                    isStaking={isStaking}
                    shouldUseNativeToken={shouldUseNativeToken}
                    approval={approval}
                    func={func}
                    isAcceptableAmount={isAcceptableAmount}
                    slippagePrct={slippagePrct}
                    bondRecipient={bondRecipient}
                    setIsStaking={setIsStaking}
                    setShouldUseNativeToken={setShouldUseNativeToken}
                    approve={approve}
                    callDepositBond={callDepositBond}
                  />
                </FlexCol>
              ))}
          </>
        )}
        {!isBonding && account && (
          <OwnedBondList
            ownedBondTokens={ownedBondTokens}
            selectedBondDetail={selectedBondDetail}
            callRedeemBond={callRedeemBond}
          />
        )}
      </ModalBase>
    </ModalContainer>
  )
}
