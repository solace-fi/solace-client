/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

    BondModalV2
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
import { useWeb3React } from '@web3-react/core'

/* import constants */
import { BondTellerFullDetails, BondTokenV2, LocalTx } from '../../../../constants/types'
import { BKPT_3, MAX_APPROVAL_AMOUNT, MAX_BPS, ZERO } from '../../../../constants'
import { FunctionName, TransactionCondition } from '../../../../constants/enums'

/* import managers */
import { useNetwork } from '../../../../context/NetworkManager'
import { useCachedData } from '../../../../context/CachedDataManager'
import { useNotifications } from '../../../../context/NotificationsManager'
import { useGeneral } from '../../../../context/GeneralManager'

/* import components */
import { WalletConnectButton } from '../../../molecules/WalletConnectButton'
import { ModalContainer, ModalBase, ModalHeader, ModalCell } from '../../../atoms/Modal'
import { ModalCloseButton } from '../../../molecules/Modal'
import { Flex, HorizRule, MultiTabIndicator } from '../../../atoms/Layout'
import { Text } from '../../../atoms/Typography'
import { Button, ButtonWrapper } from '../../../atoms/Button'
import { Input } from '../../../atoms/Input'
import { DeFiAssetImage } from '../../../atoms/DeFiAsset'
import { Loader } from '../../../atoms/Loader'
import { StyledGear } from '../../../atoms/Icon'
import { BondSettingsModal } from '../BondSettingsModal'
import { OwnedBondListV2 } from './OwnedBondListV2'
import { BondOptionsV2 } from './BondOptionsV2'
import { PublicBondInfo } from '../PublicBondInfo'
import { PrivateBondInfoV2 } from './PrivateBondInfoV2'

/* import hooks */
import { useInputAmount, useTransactionExecution } from '../../../../hooks/internal/useInputAmount'
import { useTokenAllowance } from '../../../../hooks/contract/useToken'
import { useNativeTokenBalance } from '../../../../hooks/balance/useBalance'
import { useBondTellerV2, useUserBondDataV2 } from '../../../../hooks/bond/useBondTellerV2'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'

/* import utils */
import { accurateMultiply, formatAmount } from '../../../../utils/formatting'
import { queryBalance } from '../../../../utils/contract'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import { useTellerConfig } from '../../../../hooks/bond/useDetectTeller'
import { withBackoffRetries } from '../../../../utils/time'

interface BondModalV2Props {
  closeModal: () => void
  isOpen: boolean
  selectedBondDetail?: BondTellerFullDetails
}

export const BondModalV2: React.FC<BondModalV2Props> = ({ closeModal, isOpen, selectedBondDetail }) => {
  /* 
  
  custom hooks 
  
  */
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { reload, version } = useCachedData()
  const { makeTxToast } = useNotifications()
  const { appTheme } = useGeneral()

  const [canCloseOnLoading, setCanCloseOnLoading] = useState<boolean>(false)
  const [canMax, setCanMax] = useState<boolean>(true)
  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)
  const [isBondTellerErc20, setIsBondTellerErc20] = useState<boolean>(false)
  const [isBonding, setIsBonding] = useState<boolean>(true)
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [shouldUseNativeToken, setShouldUseNativeToken] = useState<boolean>(true)
  const [showBondSettingsModal, setShowBondSettingsModal] = useState<boolean>(false)
  const [ownedBondTokens, setOwnedBondTokens] = useState<BondTokenV2[]>([])

  const [bondRecipient, setBondRecipient] = useState<string | null | undefined>(undefined)
  const [calculatedAmountIn, setCalculatedAmountIn] = useState<BigNumber | undefined>(ZERO)
  const [calculatedAmountOut, setCalculatedAmountOut] = useState<BigNumber | undefined>(ZERO)
  const { bondDepositFunctionName, bondDepositWrappedFunctionName, bondDepositFunctionGas } = useTellerConfig(
    activeNetwork
  )
  const [func, setFunc] = useState<FunctionName>(bondDepositFunctionName)
  const [principalBalance, setPrincipalBalance] = useState<string>('0')
  const [slippagePrct, setSlippagePrct] = useState<string>('100')

  const pncplDecimals = useMemo(() => selectedBondDetail?.principalData.principalProps.decimals, [
    selectedBondDetail?.principalData.principalProps.decimals,
  ])
  const nativeTokenBalance = useNativeTokenBalance()
  const { deposit, claimPayout } = useBondTellerV2(selectedBondDetail)
  const { width } = useWindowDimensions()
  const { getUserBondDataV2 } = useUserBondDataV2()
  const { amount, isAppropriateAmount, handleInputChange, setMax, resetAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const approval = useTokenAllowance(
    contractForAllowance,
    spenderAddress,
    amount && amount != '.' ? parseUnits(amount, pncplDecimals).toString() : '0'
  )

  const assetBalance = useMemo(() => {
    switch (func) {
      case FunctionName.BOND_DEPOSIT_ERC20_V2:
      case bondDepositWrappedFunctionName:
        if (principalBalance.includes('.') && principalBalance.split('.')[1].length > (pncplDecimals ?? 0)) return ZERO
        return parseUnits(principalBalance, pncplDecimals)
      case bondDepositFunctionName:
      default:
        if (
          nativeTokenBalance.includes('.') &&
          nativeTokenBalance.split('.')[1].length > (activeNetwork.nativeCurrency.decimals ?? 0)
        )
          return ZERO
        return parseUnits(nativeTokenBalance, activeNetwork.nativeCurrency.decimals)
    }
  }, [func, nativeTokenBalance, principalBalance, pncplDecimals, activeNetwork.nativeCurrency.decimals])

  /*************************************************************************************

  contract functions

  *************************************************************************************/

  const unlimitedApprove = async () => {
    const pncpl = selectedBondDetail?.principalData.principal
    if (!pncpl || !selectedBondDetail) return
    setModalLoading(true)
    try {
      const tx: TransactionResponse = await pncpl.approve(
        selectedBondDetail.tellerData.teller.contract.address,
        MAX_APPROVAL_AMOUNT
      )
      const txHash = tx.hash
      setCanCloseOnLoading(true)
      makeTxToast(FunctionName.APPROVE, TransactionCondition.PENDING, txHash)
      await tx.wait(activeNetwork.rpc.blockConfirms).then((receipt: TransactionReceipt) => {
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
    if (!pncplDecimals || !calculatedAmountOut || !bondRecipient) return
    setModalLoading(true)
    const slippageInt = parseInt(accurateMultiply(slippagePrct, 2))
    const minAmountOut = calculatedAmountOut.mul(BigNumber.from(MAX_BPS - slippageInt)).div(BigNumber.from(MAX_BPS))

    await deposit(parseUnits(amount, pncplDecimals), minAmountOut, bondRecipient, stake, func)
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callDepositBond', err, func))
  }

  const callRedeemBond = async (bondId: BigNumber) => {
    if (bondId.isZero()) return
    setModalLoading(true)
    await claimPayout(bondId)
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
    setIsAcceptableAmount(false)
    setIsBonding(true)
    setIsStaking(false)
    setShouldUseNativeToken(true)
    setSlippagePrct('100')

    setModalLoading(false)
    resetAmount()
    closeModal()
  }, [closeModal])

  const _setMax = () => {
    if (!pncplDecimals || !calculatedAmountIn) return
    setMax(
      assetBalance.gt(calculatedAmountIn) ? calculatedAmountIn : assetBalance,
      pncplDecimals,
      func == bondDepositFunctionName ? bondDepositFunctionGas : undefined
    )
  }

  const calculateAmountOut = async (_amount: string): Promise<void> => {
    if (selectedBondDetail && pncplDecimals) {
      const formattedAmount = formatAmount(_amount)
      const tellerContract = selectedBondDetail.tellerData.teller.contract
      try {
        const aO: BigNumber = await withBackoffRetries(async () =>
          tellerContract.calculateAmountOut(accurateMultiply(formattedAmount, pncplDecimals), false)
        )
        setCalculatedAmountOut(aO)
      } catch (e) {
        setCalculatedAmountOut(undefined)
      }
    } else {
      setCalculatedAmountOut(ZERO)
    }
  }

  const calculateAmountIn = async (): Promise<void> => {
    setCanMax(false)
    if (selectedBondDetail) {
      const maxPayout = selectedBondDetail.tellerData.maxPayout

      const tellerContract = selectedBondDetail.tellerData.teller.contract
      const bondFeeBps = selectedBondDetail.tellerData.bondFeeBps

      try {
        // not including bond fee to remain below maxPayout
        const aI: BigNumber = await withBackoffRetries(async () =>
          tellerContract.calculateAmountIn(
            maxPayout.mul(BigNumber.from(MAX_BPS).sub(bondFeeBps ?? ZERO)).div(BigNumber.from(MAX_BPS)),
            false
          )
        )
        setCalculatedAmountIn(aI)
      } catch (e) {
        setCalculatedAmountIn(undefined)
      }
    } else {
      setCalculatedAmountIn(ZERO)
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
  }, [selectedBondDetail, account])

  useEffect(() => {
    const getUserBonds = async () => {
      if (!selectedBondDetail?.principalData || !account || !isOpen) return
      const ownedBonds = await getUserBondDataV2(selectedBondDetail.tellerData.teller.contract.address, account)
      setOwnedBondTokens(ownedBonds.sort((a, b) => a.id.toNumber() - b.id.toNumber()))
      const principalBal = await queryBalance(selectedBondDetail.principalData.principal, account)
      setPrincipalBalance(formatUnits(principalBal, selectedBondDetail.principalData.principalProps.decimals))
    }
    getUserBonds()
  }, [account, selectedBondDetail, version])

  useEffect(() => {
    const getTellerType = async () => {
      if (!selectedBondDetail) return
      const isBondTellerErc20 = selectedBondDetail.metadata.isBondTellerErc20
      const tempFunc = isBondTellerErc20 ? FunctionName.BOND_DEPOSIT_ERC20_V2 : bondDepositFunctionName
      setIsBondTellerErc20(isBondTellerErc20)
      setFunc(tempFunc)
    }
    getTellerType()
  }, [selectedBondDetail?.metadata.isBondTellerErc20])

  useEffect(() => {
    calculateAmountIn()
  }, [selectedBondDetail])

  useEffect(() => {
    _calculateAmountOut(amount)
  }, [selectedBondDetail, amount])

  useEffect(() => {
    if (!pncplDecimals) return
    setIsAcceptableAmount(isAppropriateAmount(amount, pncplDecimals, assetBalance))
  }, [pncplDecimals, assetBalance, amount])

  useEffect(() => {
    setBondRecipient(account)
  }, [account])

  useEffect(() => {
    if (isBondTellerErc20) return
    setFunc(shouldUseNativeToken ? bondDepositFunctionName : bondDepositWrappedFunctionName)
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
          {(approval || func == bondDepositFunctionName) && (
            <Flex style={{ cursor: 'pointer', position: 'absolute', left: '0', bottom: '-10px' }}>
              <StyledGear size={25} onClick={() => setShowBondSettingsModal(true)} />
            </Flex>
          )}
          <Flex style={{ position: 'absolute', left: '50%', transform: 'translate(-50%)' }}>
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
          </Flex>
          <Flex style={{ position: 'absolute', right: '0', bottom: '-10px' }}>
            <ModalCloseButton
              hidden={modalLoading && !canCloseOnLoading}
              onClick={handleClose}
              lightColor={appTheme == 'dark'}
            />
          </Flex>
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
                handleInputChange(
                  e.target.value,
                  func == bondDepositFunctionName ? activeNetwork.nativeCurrency.decimals : pncplDecimals
                )
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
            <PrivateBondInfoV2
              func={func}
              selectedBondDetail={selectedBondDetail}
              assetBalance={assetBalance}
              pncplDecimals={pncplDecimals}
              calculatedAmountOut={calculatedAmountOut}
            />
            <HorizRule mb={20} />
            <PublicBondInfo selectedBondDetail={selectedBondDetail} />
            {account &&
              (modalLoading ? (
                <Loader />
              ) : (
                <Flex col mt={20}>
                  <BondOptionsV2
                    isBondTellerErc20={isBondTellerErc20}
                    selectedBondDetail={selectedBondDetail}
                    isStaking={isStaking}
                    shouldUseNativeToken={shouldUseNativeToken}
                    approval={approval}
                    func={func}
                    isAcceptableAmount={isAcceptableAmount}
                    slippagePrct={slippagePrct}
                    bondRecipient={bondRecipient}
                    calculatedAmountOut={calculatedAmountOut}
                    setIsStaking={setIsStaking}
                    setShouldUseNativeToken={setShouldUseNativeToken}
                    approve={unlimitedApprove}
                    callDepositBond={callDepositBond}
                  />
                </Flex>
              ))}
          </>
        )}
        {!isBonding && account && (
          <OwnedBondListV2
            ownedBondTokens={ownedBondTokens}
            selectedBondDetail={selectedBondDetail}
            callRedeemBond={callRedeemBond}
          />
        )}
      </ModalBase>
    </ModalContainer>
  )
}
