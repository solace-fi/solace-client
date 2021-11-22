import React, { useCallback, useState, useMemo, useEffect } from 'react'
import { Block } from '@ethersproject/contracts/node_modules/@ethersproject/abstract-provider'
import { Contract } from '@ethersproject/contracts'
import { formatUnits, parseUnits } from '@ethersproject/units'
import useDebounce from '@rooks/use-debounce'

import { BondTellerDetails, BondToken, LocalTx } from '../../constants/types'

import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'

import { WalletConnectButton } from '../molecules/WalletConnectButton'
import { ModalContainer, ModalBase, ModalHeader, ModalCell } from '../atoms/Modal'
import { ModalCloseButton } from '../molecules/Modal'
import { Content, MultiTabIndicator, Scrollable } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { Button, ButtonWrapper } from '../atoms/Button'
import { FormCol, FormRow } from '../../components/atoms/Form'
import { Input } from '../../components/atoms/Input'

import { useInputAmount } from '../../hooks/useInputAmount'
import { useTokenAllowance } from '../../hooks/useTokenAllowance'

import { getLongtimeFromMillis, getTimeFromMillis } from '../../utils/time'
import { queryBalance, queryDecimals, querySymbol } from '../../utils/contract'
import { BigNumber } from 'ethers'
import { MAX_APPROVAL_AMOUNT, ZERO } from '../../constants'
import { useSolaceBalance, useXSolaceBalance } from '../../hooks/useBalance'
import { useGeneral } from '../../context/GeneralProvider'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { useCachedData } from '../../context/CachedDataManager'
import { useNotifications } from '../../context/NotificationsManager'
import { useNativeTokenBalance } from '../../hooks/useBalance'
import { useBondTeller } from '../../hooks/useBondTeller'
import { accurateMultiply, truncateBalance } from '../../utils/formatting'
import { Card, CardContainer } from '../atoms/Card'
import { Loader } from '../atoms/Loader'
import { useContracts } from '../../context/ContractsManager'

interface BondModalProps {
  closeModal: () => void
  isOpen: boolean
  selectedBondDetail?: BondTellerDetails
}

export const BondModal: React.FC<BondModalProps> = ({ closeModal, isOpen, selectedBondDetail }) => {
  const { haveErrors } = useGeneral()
  const { account, library } = useWallet()
  const { currencyDecimals } = useNetwork()
  const { reload, latestBlock } = useCachedData()
  const { makeTxToast } = useNotifications()
  const { solace, xSolace } = useContracts()

  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [isBonding, setIsBonding] = useState<boolean>(true)
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const [maxPayout, setMaxPayout] = useState<BigNumber>(ZERO)
  const [timestamp, setTimestamp] = useState<number>(0)
  const [func, setFunc] = useState<FunctionName>(FunctionName.DEPOSIT_ETH)
  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)
  const [principalBalance, setPrincipalBalance] = useState<string>('0')
  const [calculatedAmountIn, setCalculatedAmountIn] = useState<BigNumber>(ZERO)
  const [calculatedAmountOut, setCalculatedAmountOut] = useState<BigNumber>(ZERO)
  const [canCloseOnLoading, setCanCloseOnLoading] = useState<boolean>(false)
  const [vestingTermInMillis, setVestingTermInMillis] = useState<number>(0)
  const [ownedBondTokens, setOwnedBondTokens] = useState<BondToken[]>([])

  const tokenAllowance = useTokenAllowance(contractForAllowance, spenderAddress)
  const solaceBalanceData = useSolaceBalance()
  const xSolaceBalanceData = useXSolaceBalance()
  const nativeTokenBalance = useNativeTokenBalance()
  const { deposit, redeem } = useBondTeller(selectedBondDetail)
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
  /*************************************************************************************

  contract functions

  *************************************************************************************/

  const approve = async () => {
    if (!selectedBondDetail?.principalData.principal) return
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

  const callDepositBond = async () => {
    if (!selectedBondDetail?.principalData.principal || !library) return
    setModalLoading(true)
    const decimals: number = await queryDecimals(selectedBondDetail.principalData.principal)
    const symbol: string = await querySymbol(selectedBondDetail.principalData.principal, library)
    const minAmountOut = calculatedAmountOut.mul('95').div('100')
    await deposit(parseUnits(amount, decimals), minAmountOut, `${truncateBalance(amount)} ${symbol}`, gasConfig)
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

  const getAssetBalanceByFunc = (f: FunctionName): BigNumber => {
    switch (f) {
      case FunctionName.BOND_DEPOSIT_ERC20:
      case FunctionName.BOND_DEPOSIT_WETH:
        return parseUnits(principalBalance, selectedBondDetail?.principalData.principalProps.decimals)
      case FunctionName.DEPOSIT_ETH:
      default:
        return parseUnits(nativeTokenBalance, currencyDecimals)
    }
  }

  const handleClose = useCallback(() => {
    setContractForAllowance(null)
    setSpenderAddress(null)
    resetAmount()
    setPrincipalBalance('0')
    setCalculatedAmountOut(ZERO)
    setIsAcceptableAmount(false)
    setModalLoading(false)
    setIsBonding(true)
    closeModal()
  }, [closeModal])

  const _setMax = () => {
    if (selectedBondDetail) {
      setMax(
        getAssetBalanceByFunc(func).gt(calculatedAmountIn) ? calculatedAmountIn : getAssetBalanceByFunc(func),
        selectedBondDetail.principalData.principalProps.decimals,
        func
      )
    }
  }

  const calculateAmountOut = useDebounce(async (_amount: string) => {
    if (selectedBondDetail && _amount) {
      const calculatedAmountOut: BigNumber = await selectedBondDetail.tellerData.teller.contract.calculateAmountOut(
        accurateMultiply(_amount, selectedBondDetail.principalData.principalProps.decimals),
        false
      )
      setCalculatedAmountOut(calculatedAmountOut)
    }
    if (!_amount) {
      setCalculatedAmountOut(ZERO)
    }
  }, 300)

  const calculateAmountIn = async () => {
    if (selectedBondDetail) {
      const calculatedAmountIn: BigNumber = await selectedBondDetail.tellerData.teller.contract.calculateAmountIn(
        selectedBondDetail.tellerData.maxPayout
          .mul(BigNumber.from(10000).sub(selectedBondDetail.tellerData.stakeFeeBps))
          .div(BigNumber.from(10000)),
        false
      )
      setCalculatedAmountIn(calculatedAmountIn)
    }
  }

  useEffect(() => {
    const getBondData = async () => {
      if (isOpen && selectedBondDetail && account && solace && xSolace) {
        const principalBal = await queryBalance(selectedBondDetail.principalData.principal, account)
        const principalDecimals = await queryDecimals(selectedBondDetail.principalData.principal)
        const tempFunc = selectedBondDetail.tellerData.teller.isBondTellerErc20
          ? FunctionName.BOND_DEPOSIT_ERC20
          : FunctionName.DEPOSIT_ETH
        const ownedTokenIds: BigNumber[] = await selectedBondDetail.tellerData.teller.contract.listTokensOfOwner(
          account
        )
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
        setOwnedBondTokens(ownedBonds)
        setVestingTermInMillis(selectedBondDetail.tellerData.vestingTermInSeconds * 1000)
        setPrincipalBalance(formatUnits(principalBal, principalDecimals))
        setMaxPayout(selectedBondDetail.tellerData.maxPayout)
        setContractForAllowance(selectedBondDetail.principalData.principal)
        setSpenderAddress(selectedBondDetail.tellerData.teller.contract.address)
        setFunc(tempFunc)
        calculateAmountIn()
      }
    }
    getBondData()
  }, [selectedBondDetail, account, isOpen])

  useEffect(() => {
    if (selectedBondDetail) {
      setIsAcceptableAmount(
        isAppropriateAmount(
          amount,
          selectedBondDetail.principalData.principalProps.decimals,
          getAssetBalanceByFunc(func)
        )
      )
      calculateAmountOut(amount)
    }
  }, [amount])

  useEffect(() => {
    resetAmount()
  }, [isBonding])

  useEffect(() => {
    if (!latestBlock) return
    setTimestamp(latestBlock.timestamp)
  }, [latestBlock])

  return (
    <ModalContainer isOpen={isOpen}>
      <ModalBase isOpen={isOpen}>
        <ModalHeader>
          <Text t2 bold>
            Token
          </Text>
          <ModalCloseButton hidden={modalLoading && !canCloseOnLoading} onClick={handleClose} />
        </ModalHeader>
        <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', position: 'relative' }}>
          <MultiTabIndicator style={{ left: isBonding ? '0' : '50%' }} />
          <ModalCell
            pt={5}
            pb={10}
            pl={0}
            pr={0}
            onClick={() => setIsBonding(true)}
            style={{ cursor: 'pointer', justifyContent: 'center' }}
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
            style={{ cursor: 'pointer', justifyContent: 'center' }}
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
                onChange={(e) => handleInputChange(e.target.value)}
                value={amount}
              />
              <Button ml={10} pt={4} pb={4} pl={8} pr={8} width={70} height={30} onClick={_setMax}>
                MAX
              </Button>
            </div>
          ) : (
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
          )
        ) : null}
        {isBonding && (
          <>
            <FormRow mt={20} mb={10}>
              <FormCol>
                <Text bold>Your Balance</Text>
              </FormCol>
              <FormCol>
                <Text info bold>
                  {principalBalance} {selectedBondDetail?.tellerData.teller.name}
                </Text>
              </FormCol>
            </FormRow>
            <FormRow mb={10}>
              <FormCol>
                <Text bold>You Will Get</Text>
              </FormCol>
              <FormCol>
                <Text info nowrap bold>
                  {formatUnits(calculatedAmountOut, solaceBalanceData.tokenData.decimals)}{' '}
                  {solaceBalanceData.tokenData.symbol}
                </Text>
              </FormCol>
            </FormRow>
            <FormRow mb={10}>
              <FormCol>
                <Text>MAX You Can Buy</Text>
              </FormCol>
              <FormCol>
                <Text info nowrap>
                  {formatUnits(maxPayout, solaceBalanceData.tokenData.decimals)} {solaceBalanceData.tokenData.symbol}
                </Text>
              </FormCol>
            </FormRow>
            <FormRow mt={10} mb={10}>
              <FormCol>
                <Text>Vesting Term</Text>
              </FormCol>
              <FormCol>
                <Text info nowrap>
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
            <Button widthP={100} info disabled={!isAcceptableAmount || haveErrors} onClick={callDepositBond}>
              Bond
            </Button>
          ))}
        {!isBonding && (
          <>
            <FormRow mt={20} mb={10}>
              <FormCol>
                <Text>Vesting Term</Text>
              </FormCol>
              <FormCol>
                <Text info nowrap>
                  {getLongtimeFromMillis(vestingTermInMillis)}
                </Text>
              </FormCol>
            </FormRow>
            <Scrollable maxMobileHeight={65} maxDesktopHeight={40}>
              {ownedBondTokens.length > 0 ? (
                <CardContainer cardsPerRow={1}>
                  {ownedBondTokens.map((token) => {
                    return (
                      <Card key={token.id.toString()}>
                        <FormRow>
                          <FormCol>ID</FormCol>
                          <FormCol>{token.id.toString()}</FormCol>
                        </FormRow>
                        <FormRow>
                          <FormCol>Paid Price</FormCol>
                          <FormCol>
                            {formatUnits(token.pricePaid, selectedBondDetail?.principalData.principalProps.decimals)}{' '}
                            {selectedBondDetail?.principalData.principalProps.symbol}
                          </FormCol>
                        </FormRow>
                        <FormRow>
                          <FormCol>Payout</FormCol>
                          <FormCol>
                            {formatUnits(token.payoutAmount, solaceBalanceData.tokenData.decimals)} {token.payoutToken}
                          </FormCol>
                        </FormRow>
                        {token.maturation.toNumber() > timestamp ? (
                          <FormRow>
                            <FormCol>Time Until Fully Vested</FormCol>
                            <FormCol>{getTimeFromMillis((token.maturation.toNumber() - timestamp) * 1000)}</FormCol>
                          </FormRow>
                        ) : (
                          <Text textAlignCenter success>
                            Your vesting period has passed.
                          </Text>
                        )}
                        <ButtonWrapper isColumn>
                          <Button widthP={100} info disabled={haveErrors} onClick={() => callRedeemBond(token.id)}>
                            Claim
                          </Button>
                          <Button widthP={100} info disabled={haveErrors}>
                            Claim and Autostake
                          </Button>
                        </ButtonWrapper>
                      </Card>
                    )
                  })}
                </CardContainer>
              ) : (
                <Text t2 textAlignCenter>
                  You do not have any bond tokens.
                </Text>
              )}
            </Scrollable>
          </>
        )}
      </ModalBase>
    </ModalContainer>
  )
}
