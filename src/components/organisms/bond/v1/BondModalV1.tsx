/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

    BondModalV1
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
import { BondTellerDetails, BondTokenV1, LocalTx } from '../../../../constants/types'
import { BKPT_3, MAX_BPS, ZERO } from '../../../../constants'
import { FunctionName, TransactionCondition } from '../../../../constants/enums'

/* import managers */
import { useWallet } from '../../../../context/WalletManager'
import { useNetwork } from '../../../../context/NetworkManager'
import { useCachedData } from '../../../../context/CachedDataManager'
import { useNotifications } from '../../../../context/NotificationsManager'
import { useContracts } from '../../../../context/ContractsManager'

/* import components */
import { WalletConnectButton } from '../../../molecules/WalletConnectButton'
import { ModalContainer, ModalBase, ModalHeader, ModalCell } from '../../../atoms/Modal'
import { ModalCloseButton } from '../../../molecules/Modal'
import { FlexCol, HorizRule, MultiTabIndicator } from '../../../atoms/Layout'
import { Text } from '../../../atoms/Typography'
import { Button, ButtonWrapper } from '../../../atoms/Button'
import { Input } from '../../../atoms/Input'
import { DeFiAssetImage } from '../../../atoms/DeFiAsset'
import { Loader } from '../../../atoms/Loader'
import { FlexRow } from '../../../atoms/Layout'
import { StyledGear } from '../../../atoms/Icon'
import { BondSettingsModal } from '../BondSettingsModal'
import { OwnedBondListV1 } from './OwnedBondListV1'
import { BondOptionsV1 } from './BondOptionsV1'
import { PublicBondInfo } from '../PublicBondInfo'

/* import hooks */
import { useInputAmount, useTransactionExecution } from '../../../../hooks/useInputAmount'
import { useReadToken, useTokenAllowance } from '../../../../hooks/useToken'
import { useNativeTokenBalance } from '../../../../hooks/useBalance'
import { useBondTellerV1, useUserBondDataV1 } from '../../../../hooks/useBondTellerV1'
import { useWindowDimensions } from '../../../../hooks/useWindowDimensions'

/* import utils */
import { accurateMultiply, formatAmount } from '../../../../utils/formatting'
import { queryBalance } from '../../../../utils/contract'
import { PrivateBondInfoV1 } from './PrivateBondInfoV1'
import { FunctionGasLimits } from '../../../../constants/mappings/gasMapping'

interface BondModalV1Props {
  closeModal: () => void
  isOpen: boolean
  selectedBondDetail?: BondTellerDetails
}

export const BondModalV1: React.FC<BondModalV1Props> = ({ closeModal, isOpen, selectedBondDetail }) => {
  /* 
  
  custom hooks 
  
  */
  const { account } = useWallet()
  // const { currencyDecimals } = useNetwork()
  // const { reload } = useCachedData()
  // const { makeTxToast } = useNotifications()
  const { keyContracts } = useContracts()
  const { solace, xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])

  const [canCloseOnLoading, setCanCloseOnLoading] = useState<boolean>(false)
  // const [canMax, setCanMax] = useState<boolean>(true)
  // const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)
  // const [isBondTellerErc20, setIsBondTellerErc20] = useState<boolean>(false)
  const [isBonding, setIsBonding] = useState<boolean>(false)
  // const [isStaking, setIsStaking] = useState<boolean>(false)
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  // const [shouldUseNativeToken, setShouldUseNativeToken] = useState<boolean>(true)
  const [showBondSettingsModal, setShowBondSettingsModal] = useState<boolean>(false)
  const [ownedBondTokens, setOwnedBondTokens] = useState<BondTokenV1[]>([])

  const [bondRecipient, setBondRecipient] = useState<string | undefined>(undefined)
  // const [calculatedAmountIn, setCalculatedAmountIn] = useState<BigNumber | undefined>(ZERO)
  // const [calculatedAmountIn_X, setCalculatedAmountIn_X] = useState<BigNumber | undefined>(ZERO)
  // const [calculatedAmountOut, setCalculatedAmountOut] = useState<BigNumber | undefined>(ZERO)
  // const [calculatedAmountOut_X, setCalculatedAmountOut_X] = useState<BigNumber | undefined>(ZERO)
  const [func, setFunc] = useState<FunctionName>(FunctionName.BOND_DEPOSIT_ETH_V1)
  // const [principalBalance, setPrincipalBalance] = useState<string>('0')
  const [slippagePrct, setSlippagePrct] = useState<string>('20')

  // const pncplDecimals = useMemo(() => selectedBondDetail?.principalData.principalProps.decimals, [
  //   selectedBondDetail?.principalData.principalProps.decimals,
  // ])
  const readSolaceToken = useReadToken(solace)
  const readXSolaceToken = useReadToken(xSolaceV1)
  // const nativeTokenBalance = useNativeTokenBalance()
  const { deposit, redeem } = useBondTellerV1(selectedBondDetail)
  // const { width } = useWindowDimensions()
  const { getUserBondDataV1 } = useUserBondDataV1()
  // const { amount, isAppropriateAmount, handleInputChange, setMax, resetAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  // const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  // const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  // const approval = useTokenAllowance(
  //   contractForAllowance,
  //   spenderAddress,
  //   amount && amount != '.' ? parseUnits(amount, pncplDecimals).toString() : '0'
  // )
  // const assetBalance = useMemo(() => {
  //   switch (func) {
  //     case FunctionName.BOND_DEPOSIT_ERC20_V1:
  //     case FunctionName.BOND_DEPOSIT_WETH_V1:
  //       return parseUnits(principalBalance, pncplDecimals)
  //     case FunctionName.BOND_DEPOSIT_ETH_V1:
  //     default:
  //       return parseUnits(nativeTokenBalance, currencyDecimals)
  //   }
  // }, [func, nativeTokenBalance, principalBalance, pncplDecimals])

  /*************************************************************************************

  contract functions

  *************************************************************************************/

  // const approve = async () => {
  //   const pncpl = selectedBondDetail?.principalData.principal
  //   if (!pncpl || !selectedBondDetail) return
  //   setModalLoading(true)
  //   try {
  //     const tx = await pncpl.approve(
  //       selectedBondDetail.tellerData.teller.contract.address,
  //       parseUnits(amount, pncplDecimals)
  //     )
  //     const txHash = tx.hash
  //     setCanCloseOnLoading(true)
  //     makeTxToast(FunctionName.APPROVE, TransactionCondition.PENDING, txHash)
  //     await tx.wait(activeNetwork.rpc.blockConfirms).then((receipt: any) => {
  //       const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
  //       makeTxToast(FunctionName.APPROVE, status, txHash)
  //       reload()
  //     })
  //     setCanCloseOnLoading(false)
  //     setModalLoading(false)
  //   } catch (err) {
  //     _handleContractCallError('approve', err, FunctionName.APPROVE)
  //   }
  // }

  // const callDepositBond = async (stake: boolean) => {
  //   if (!pncplDecimals || !calculatedAmountOut || !calculatedAmountOut_X || !bondRecipient) return
  //   setModalLoading(true)
  //   const slippageInt = parseInt(accurateMultiply(slippagePrct, 2))
  //   const calcAOut = stake ? calculatedAmountOut_X : calculatedAmountOut
  //   const minAmountOut = calcAOut.mul(BigNumber.from(MAX_BPS - slippageInt)).div(BigNumber.from(MAX_BPS))
  //   await deposit(parseUnits(amount, pncplDecimals), minAmountOut, bondRecipient, stake, func)
  //     .then((res) => _handleToast(res.tx, res.localTx))
  //     .catch((err) => _handleContractCallError('callDepositBond', err, func))
  // }

  const callRedeemBond = async (bondId: BigNumber) => {
    if (bondId.isZero()) return
    setModalLoading(true)
    await redeem(bondId)
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
    // setCalculatedAmountIn(ZERO)
    // setCalculatedAmountIn_X(ZERO)
    // setCalculatedAmountOut(ZERO)
    // setCalculatedAmountOut_X(ZERO)
    // setContractForAllowance(null)
    setFunc(FunctionName.BOND_DEPOSIT_ETH_V1)
    // setIsAcceptableAmount(false)
    // setIsBondTellerErc20(false)
    setIsBonding(false)
    // setIsStaking(false)
    // setPrincipalBalance('0')
    // setShouldUseNativeToken(true)
    setSlippagePrct('0.5')
    // setSpenderAddress(null)
    setOwnedBondTokens([])

    setModalLoading(false)
    // resetAmount()
    closeModal()
  }, [closeModal])

  // const _setMax = () => {
  //   if (!pncplDecimals || !calculatedAmountIn || !calculatedAmountIn_X) return
  //   const calcAIn = isStaking ? calculatedAmountIn_X : calculatedAmountIn
  //   if (func == FunctionName.BOND_DEPOSIT_ETH_V1) {
  //   }
  //   setMax(
  //     assetBalance.gt(calcAIn) ? calcAIn : assetBalance,
  //     pncplDecimals,
  //     func == FunctionName.BOND_DEPOSIT_ETH_V1 ? FunctionGasLimits['tellerEth_v1.depositEth'] : undefined
  //   )
  // }

  // const calculateAmountOut = async (_amount: string): Promise<void> => {
  //   if (selectedBondDetail && pncplDecimals) {
  //     const formattedAmount = formatAmount(_amount)
  //     const tellerContract = selectedBondDetail.tellerData.teller.contract
  //     try {
  //       const aO: BigNumber = await tellerContract.calculateAmountOut(
  //         accurateMultiply(formattedAmount, pncplDecimals),
  //         false
  //       )
  //       setCalculatedAmountOut(aO)
  //     } catch (e) {
  //       setCalculatedAmountOut(undefined)
  //     }
  //     try {
  //       const aO_X: BigNumber = await tellerContract.calculateAmountOut(
  //         accurateMultiply(formattedAmount, pncplDecimals),
  //         true
  //       )
  //       setCalculatedAmountOut_X(aO_X)
  //     } catch (e) {
  //       setCalculatedAmountOut_X(undefined)
  //     }
  //   } else {
  //     setCalculatedAmountOut(ZERO)
  //     setCalculatedAmountOut_X(ZERO)
  //   }
  // }

  // const calculateAmountIn = async (): Promise<void> => {
  //   setCanMax(false)
  //   if (selectedBondDetail && xSolaceV1) {
  //     const maxPayout = selectedBondDetail.tellerData.maxPayout
  //     const maxPayout_X = await xSolaceV1.solaceToXSolace(selectedBondDetail.tellerData.maxPayout)

  //     const tellerContract = selectedBondDetail.tellerData.teller.contract
  //     const bondFeeBps = selectedBondDetail.tellerData.bondFeeBps

  //     try {
  //       // not including bond fee to remain below maxPayout
  //       const aI: BigNumber = await tellerContract.calculateAmountIn(
  //         maxPayout.mul(BigNumber.from(MAX_BPS).sub(bondFeeBps ?? ZERO)).div(BigNumber.from(MAX_BPS)),
  //         false
  //       )
  //       setCalculatedAmountIn(aI)
  //     } catch (e) {
  //       setCalculatedAmountIn(undefined)
  //     }
  //     try {
  //       // not including bond fee to remain below maxPayout
  //       const aI_X: BigNumber = await tellerContract.calculateAmountIn(
  //         maxPayout_X.mul(BigNumber.from(MAX_BPS).sub(bondFeeBps ?? ZERO)).div(BigNumber.from(MAX_BPS)),
  //         true
  //       )
  //       setCalculatedAmountIn_X(aI_X)
  //     } catch (e) {
  //       setCalculatedAmountIn_X(undefined)
  //     }
  //   } else {
  //     setCalculatedAmountIn(ZERO)
  //     setCalculatedAmountIn_X(ZERO)
  //   }
  //   setCanMax(true)
  // }

  /* 
  
  useEffect hooks
  
  */

  // const _calculateAmountOut = useDebounce(async (_amount: string) => calculateAmountOut(_amount), 300)

  // useEffect(() => {
  //   const getBondData = async () => {
  //     if (!selectedBondDetail?.principalData) return
  //     setContractForAllowance(selectedBondDetail.principalData.principal)
  //     setSpenderAddress(selectedBondDetail.tellerData.teller.contract.address)
  //   }
  //   getBondData()
  // }, [selectedBondDetail, account, isOpen])

  useEffect(() => {
    const getUserBonds = async () => {
      if (!selectedBondDetail?.principalData || !account || !isOpen) return
      const ownedBonds = await getUserBondDataV1(selectedBondDetail, account)
      setOwnedBondTokens(ownedBonds.sort((a, b) => a.id.toNumber() - b.id.toNumber()))
      // const principalBal = await queryBalance(selectedBondDetail.principalData.principal, account)
      // setPrincipalBalance(formatUnits(principalBal, selectedBondDetail.principalData.principalProps.decimals))
    }
    getUserBonds()
  }, [account, isOpen, selectedBondDetail, readSolaceToken, readXSolaceToken])

  // useEffect(() => {
  //   const getTellerType = async () => {
  //     if (!selectedBondDetail) return
  //     const isBondTellerErc20 = selectedBondDetail.tellerData.teller.isBondTellerErc20
  //     const tempFunc = isBondTellerErc20 ? FunctionName.BOND_DEPOSIT_ERC20_V1 : FunctionName.BOND_DEPOSIT_ETH_V1
  //     setIsBondTellerErc20(isBondTellerErc20)
  //     setFunc(tempFunc)
  //   }
  //   getTellerType()
  // }, [selectedBondDetail?.tellerData.teller.isBondTellerErc20, isOpen])

  // useEffect(() => {
  //   calculateAmountIn()
  // }, [selectedBondDetail, xSolaceV1])

  // useEffect(() => {
  //   _calculateAmountOut(amount)
  // }, [selectedBondDetail, amount])

  // useEffect(() => {
  //   if (!pncplDecimals) return
  //   setIsAcceptableAmount(isAppropriateAmount(amount, pncplDecimals, assetBalance))
  // }, [pncplDecimals, assetBalance, amount])

  useEffect(() => {
    setBondRecipient(account)
  }, [account])

  // useEffect(() => {
  //   if (isBondTellerErc20) return
  //   setFunc(shouldUseNativeToken ? FunctionName.BOND_DEPOSIT_ETH_V1 : FunctionName.BOND_DEPOSIT_WETH_V1)
  // }, [shouldUseNativeToken])

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
          {/* {(approval || func == FunctionName.BOND_DEPOSIT_ETH_V1) && (
            <FlexRow style={{ cursor: 'pointer', position: 'absolute', left: '0', bottom: '-10px' }}>
              <StyledGear size={25} onClick={() => setShowBondSettingsModal(true)} />
            </FlexRow>
          )} */}
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
        {/* <div
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
        </div> */}
        {!account ? (
          <ButtonWrapper>
            <WalletConnectButton info welcome secondary />
          </ButtonWrapper>
        ) : isBonding ? (
          // <div style={{ textAlign: 'center', display: 'grid', gridTemplateColumns: '1fr 80px', marginTop: '20px' }}>
          //   <Input
          //     autoComplete="off"
          //     autoCorrect="off"
          //     placeholder="0.0"
          //     textAlignCenter
          //     type="text"
          //     onChange={(e) =>
          //       handleInputChange(
          //         e.target.value,
          //         func == FunctionName.BOND_DEPOSIT_ETH_V1 ? currencyDecimals : pncplDecimals
          //       )
          //     }
          //     value={amount}
          //   />
          //   <Button
          //     info
          //     ml={10}
          //     pt={4}
          //     pb={4}
          //     pl={8}
          //     pr={8}
          //     width={70}
          //     height={30}
          //     onClick={_setMax}
          //     disabled={!canMax}
          //   >
          //     MAX
          //   </Button>
          // </div>
          <></>
        ) : null}
        {/* {isBonding && (
          <>
            <PrivateBondInfoV1
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
                  <BondOptionsV1
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
        )} */}
        {!isBonding && account && (
          <OwnedBondListV1
            ownedBondTokens={ownedBondTokens}
            selectedBondDetail={selectedBondDetail}
            callRedeemBond={callRedeemBond}
          />
        )}
      </ModalBase>
    </ModalContainer>
  )
}
