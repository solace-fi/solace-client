/* import packages */
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { parseUnits } from '@ethersproject/units'
import { BigNumber, Contract } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

/* import managers */
import { useWallet } from '../../../context/WalletManager'
import { useGeneral } from '../../../context/GeneralManager'
import { useContracts } from '../../../context/ContractsManager'
import { useProvider } from '../../../context/ProviderManager'
import { useCachedData } from '../../../context/CachedDataManager'
import { useNetwork } from '../../../context/NetworkManager'

/* import constants */
import { FunctionName, TransactionCondition } from '../../../constants/enums'
import { ZERO } from '../../../constants'
import { LocalTx } from '../../../constants/types'

/* import components */
import { Button, ButtonWrapper } from '../../../components/atoms/Button'
import { Card } from '../../../components/atoms/Card'
import { FormCol, FormRow } from '../../../components/atoms/Form'
import { ModalCell } from '../../../components/atoms/Modal'
import { Modal } from '../../../components/molecules/Modal'
import { Text } from '../../../components/atoms/Typography'
import { Flex, VerticalSeparator } from '../../../components/atoms/Layout'
import { InputSection } from '../../../components/molecules/InputSection'

/* import hooks */
import { useBridgeBalance, useSolaceBalance } from '../../../hooks/useBalance'
import { useInputAmount, useTransactionExecution } from '../../../hooks/useInputAmount'
import { useTokenAllowance } from '../../../hooks/useToken'
import { ModalProps } from '../../../components/atoms/Modal'
import { useBridge } from '../../../hooks/useBridge'
import useDebounce from '@rooks/use-debounce'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import { useNotifications } from '../../../context/NotificationsManager'
import { Loader } from '../../../components/atoms/Loader'

export const BridgeModal: React.FC<ModalProps> = ({ modalTitle, handleClose, isOpen }) => {
  const [isWrapping, setIsWrapping] = useState<boolean>(false)
  const solaceBalance = useSolaceBalance()
  const { bridgeWrapper, bSolace, getBridgeLiquidity, bSolaceToSolace, solaceToBSolace } = useBridge()
  const bridgeBalance = useBridgeBalance()
  const { latestBlock } = useProvider()
  const { keyContracts } = useContracts()
  const { activeNetwork } = useNetwork()
  const { account } = useWallet()
  const { solace } = useMemo(() => keyContracts, [keyContracts])
  const { amount, setMax, handleInputChange, isAppropriateAmount, resetAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { reload } = useCachedData()
  const { makeTxToast } = useNotifications()
  const { haveErrors } = useGeneral()
  const [buttonLoading, setButtonLoading] = useState<boolean>(false)
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const approval = useTokenAllowance(
    contractForAllowance,
    spenderAddress,
    amount && amount != '.' ? parseUnits(amount, 18).toString() : '0'
  )
  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)
  const [bridgeLiquidity, setBridgeLiquidity] = useState<BigNumber>(ZERO)

  const approve = async () => {
    if (!solace || !account || !bSolace || !bridgeWrapper) return
    try {
      const token = isWrapping ? solace : bSolace
      const tx: TransactionResponse = await token.approve(bridgeWrapper.address, parseUnits(amount, 18))
      const txHash = tx.hash
      setButtonLoading(true)
      makeTxToast(FunctionName.APPROVE, TransactionCondition.PENDING, txHash)
      await tx.wait(activeNetwork.rpc.blockConfirms).then((receipt: TransactionReceipt) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(FunctionName.APPROVE, status, txHash)
        reload()
      })
      setButtonLoading(false)
    } catch (err) {
      handleContractCallError('approve', err, FunctionName.APPROVE)
    }
  }

  const confirm = async () => {
    setButtonLoading(true)
    isWrapping
      ? await solaceToBSolace(parseUnits(amount, 18))
          .then((res) => _handleToast(res.tx, res.localTx))
          .catch((err) =>
            _handleContractCallError('callConfirm:solaceToBSolace', err, FunctionName.BRIDGE_SOLACE_TO_BSOLACE)
          )
      : await bSolaceToSolace(parseUnits(amount, 18))
          .then((res) => _handleToast(res.tx, res.localTx))
          .catch((err) =>
            _handleContractCallError('callConfirm:bSolaceToSolace', err, FunctionName.BRIDGE_BSOLACE_TO_SOLACE)
          )
  }

  const _handleToast = async (tx: any, localTx: LocalTx | null) => {
    _handleClose()
    await handleToast(tx, localTx)
  }

  const _handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    handleContractCallError(functionName, err, txType)
    setButtonLoading(false)
  }

  const _setMax = () => {
    const bal = isWrapping
      ? bridgeLiquidity.gt(parseUnits(solaceBalance, 18))
        ? parseUnits(solaceBalance, 18)
        : bridgeLiquidity
      : parseUnits(bridgeBalance, 18)
    const decimals = 18
    setMax(bal, decimals)
  }

  const _getBridgeLiquidity = useDebounce(async () => {
    const liquidity = await getBridgeLiquidity()
    setBridgeLiquidity(liquidity)
  }, 300)

  const _handleClose = useCallback(() => {
    setButtonLoading(false)
    resetAmount()
    handleClose()
  }, [handleClose])

  useEffect(() => {
    const decimals = 18
    const acceptableBalance = isWrapping
      ? bridgeLiquidity.gt(parseUnits(solaceBalance, 18))
        ? parseUnits(solaceBalance, 18)
        : bridgeLiquidity
      : parseUnits(bridgeBalance, 18)
    const isAcceptable = isAppropriateAmount(amount, decimals, acceptableBalance)
    setIsAcceptableAmount(isAcceptable)
  }, [amount, isWrapping, solaceBalance, bridgeBalance, bridgeLiquidity])

  useEffect(() => {
    _getBridgeLiquidity()
  }, [latestBlock])

  useEffect(() => {
    if (!bSolace || !bridgeWrapper || !solace) return
    setContractForAllowance(isWrapping ? solace : bSolace)
    setSpenderAddress(bridgeWrapper.address)
  }, [bSolace, bridgeWrapper, isWrapping, solace])

  return (
    <Modal isOpen={isOpen} handleClose={_handleClose} modalTitle={modalTitle}>
      <Card mb={10}>
        <div style={{ gridTemplateColumns: '1fr 0fr 1fr', display: 'grid', position: 'relative' }}>
          <ModalCell
            pt={5}
            pb={10}
            pl={0}
            pr={0}
            onClick={() => setIsWrapping(false)}
            jc={'center'}
            style={{ cursor: 'pointer', backgroundColor: isWrapping ? 'rgba(0, 0, 0, .05)' : 'inherit' }}
          >
            <Text t1 bold info={!isWrapping}>
              Unwrap
            </Text>
          </ModalCell>
          <VerticalSeparator />
          <ModalCell
            pt={5}
            pb={10}
            pl={0}
            pr={0}
            onClick={() => setIsWrapping(true)}
            jc={'center'}
            style={{
              cursor: 'pointer',
              backgroundColor: !isWrapping ? 'rgba(0, 0, 0, .05)' : 'inherit',
            }}
          >
            <Text t1 bold info={isWrapping}>
              Wrap
            </Text>
          </ModalCell>
        </div>
        <FormRow mt={20} mb={10}>
          <FormCol>
            <Text fade={isWrapping} t3={!isWrapping} t4={isWrapping}>
              bSOLACE
            </Text>
          </FormCol>
          <FormCol>
            <Text fade={isWrapping} t3={!isWrapping} t4={isWrapping} textAlignRight info>
              {bridgeBalance}
            </Text>
          </FormCol>
        </FormRow>
        <FormRow mt={10} mb={20}>
          <FormCol>
            <Text fade={!isWrapping} t3={isWrapping} t4={!isWrapping}>
              SOLACE
            </Text>
          </FormCol>
          <FormCol>
            <Text fade={!isWrapping} t3={isWrapping} t4={!isWrapping} textAlignRight info>
              {solaceBalance}
            </Text>
          </FormCol>
        </FormRow>
      </Card>
      <Flex column gap={24}>
        <div>
          <InputSection value={amount} onChange={(e) => handleInputChange(e.target.value, 18)} setMax={_setMax} />
        </div>
      </Flex>
      {isWrapping && (
        <Flex>
          <Text t4 bold textAlignCenter style={{ margin: '7px auto' }}>
            Available Bridge Liquidity: {formatUnits(bridgeLiquidity, 18)}
          </Text>
        </Flex>
      )}
      <ButtonWrapper isColumn>
        {buttonLoading ? (
          <Loader />
        ) : (
          <>
            {!approval && (
              <Button
                widthP={100}
                info
                disabled={amount == '' || parseUnits(amount, 18).eq(ZERO) || haveErrors}
                onClick={approve}
              >
                Approve
              </Button>
            )}
            <Button widthP={100} info disabled={!isAcceptableAmount || haveErrors} onClick={confirm}>
              {isWrapping ? 'Wrap' : 'Unwrap'}
            </Button>
          </>
        )}
      </ButtonWrapper>
    </Modal>
  )
}
