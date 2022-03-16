/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    Erc721PoolModalGeneric
      hooks
      contract functions
      local functions
      useEffect hooks

  *************************************************************************************/

/* import packages */
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { Contract } from '@ethersproject/contracts'

/* import managers */
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralManager'

/* import constants */
import { ZERO } from '../../constants'
import { FunctionName } from '../../constants/enums'
import { GasConfiguration, LocalTx, NftTokenInfo, TxResult } from '../../constants/types'

/* import components */
import { Modal } from '../molecules/Modal'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Loader } from '../atoms/Loader'
import { GasRadioGroup } from '../molecules/GasRadioGroup'
import { Erc721InputPanel, PoolModalProps } from './PoolModalRouter'
import { SourceContract } from './SourceContract'

/* import hooks */
import { useUserStakedValue } from '../../hooks/_legacy/useFarm'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'

/* import utils */
import { getUnit, truncateValue } from '../../utils/formatting'
import { useGetFunctionGas } from '../../hooks/provider/useGas'

interface Erc721PoolModalGenericProps {
  farmContract: Contract | null | undefined
  depositFunc: {
    name: FunctionName
    func: (nftId: BigNumber, gasConfig: GasConfiguration) => Promise<TxResult>
  }
  withdrawFunc: {
    name: FunctionName
    func: (nftId: BigNumber, gasConfig: GasConfiguration) => Promise<TxResult>
  }
  userNftTokenInfo: NftTokenInfo[]
  depositedNftTokenInfo: NftTokenInfo[]
}

export const Erc721PoolModalGeneric: React.FC<PoolModalProps & Erc721PoolModalGenericProps> = ({
  modalTitle,
  func,
  isOpen,
  closeModal,
  farmContract,
  depositFunc,
  withdrawFunc,
  userNftTokenInfo,
  depositedNftTokenInfo,
}) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/

  const { haveErrors } = useGeneral()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [nftId, setNftId] = useState<BigNumber>(ZERO)
  const [nftSelection, setNftSelection] = useState<{ value: string; label: string }>({ value: '', label: '' })
  const canSetSelection = useRef(true)
  const userStakeValue = useUserStakedValue(farmContract)
  const { gasConfig } = useGetFunctionGas()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const assetBalance = useMemo(() => {
    switch (func) {
      case depositFunc.name:
        return userNftTokenInfo.reduce((a, b) => a.add(b.value), ZERO)
      case withdrawFunc.name:
      default:
        if (userStakeValue.includes('.') && userStakeValue.split('.')[1].length > (currencyDecimals ?? 0)) return ZERO
        return parseUnits(userStakeValue, currencyDecimals)
    }
  }, [currencyDecimals, depositFunc.name, func, userNftTokenInfo, userStakeValue, withdrawFunc.name])

  /*************************************************************************************

  contract functions

  *************************************************************************************/

  const callDeposit = async () => {
    setModalLoading(true)
    await depositFunc
      .func(nftId, gasConfig)
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callDeposit', err, depositFunc.name))
  }

  const callWithdraw = async () => {
    setModalLoading(true)
    await withdrawFunc
      .func(nftId, gasConfig)
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callWithdraw', err, withdrawFunc.name))
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

  const getAssetTokensByFunc = (): NftTokenInfo[] => {
    if (func == depositFunc.name) return userNftTokenInfo
    if (func == withdrawFunc.name) return depositedNftTokenInfo
    return []
  }

  const handleCallbackFunc = async () => {
    if (func == depositFunc.name) await callDeposit()
    if (func == withdrawFunc.name) await callWithdraw()
  }

  const handleClose = useCallback(() => {
    setModalLoading(false)
    handleNft({ value: '0', label: '' })
    canSetSelection.current = true
    closeModal()
  }, [closeModal])

  const handleNft = useCallback((target: { value: string; label: string }) => {
    setNftId(BigNumber.from(target.value))
    setNftSelection(target)
  }, [])

  const bootNft = useCallback(
    (tokenInfo: NftTokenInfo[]) => {
      if (tokenInfo.length > 0 && canSetSelection.current) {
        canSetSelection.current = false
        setNftId(tokenInfo[0].id)
        setNftSelection({
          value: `${tokenInfo[0].id.toString()}`,
          label: `#${tokenInfo[0].id.toString()} - ${formatUnits(tokenInfo[0].value, currencyDecimals)}`,
        })
      } else {
        handleNft({ value: '0', label: '' })
      }
    },
    [currencyDecimals, handleNft]
  )

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    if (isOpen) {
      if (func == depositFunc.name) bootNft(userNftTokenInfo)
      if (func == withdrawFunc.name) bootNft(depositedNftTokenInfo)
    }
  }, [isOpen, func, currencyDecimals])

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={modalTitle} disableCloseButton={modalLoading}>
      <Erc721InputPanel
        unit={getUnit(func, activeNetwork)}
        assetTokens={getAssetTokensByFunc()}
        availableBalance={truncateValue(formatUnits(assetBalance, currencyDecimals))}
        nftSelection={nftSelection}
        handleNft={handleNft}
        nftId={nftId}
      />
      {modalLoading ? (
        <Loader />
      ) : (
        <ButtonWrapper>
          <Button
            widthP={100}
            hidden={modalLoading}
            disabled={haveErrors || nftId.isZero()}
            onClick={handleCallbackFunc}
            info
          >
            Confirm
          </Button>
        </ButtonWrapper>
      )}
      {farmContract && <SourceContract contract={farmContract} />}
    </Modal>
  )
}
