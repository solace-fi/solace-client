/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    PoolModalRouter

    Erc20InputPanel

    Erc721InputPanel

    usePoolModal

  *************************************************************************************/

/* import packages */
import React, { useEffect, useState, useMemo } from 'react'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'

/* import managers */
import { useNotifications } from '../../context/NotificationsManager'
import { useGeneral } from '../../context/GeneralProvider'
import { useNetwork } from '../../context/NetworkManager'
import { useCachedData } from '../../context/CachedDataManager'

/* import constants */
import { GAS_LIMIT, POW_NINE, ZERO } from '../../constants'
import { FunctionName, TransactionCondition, Unit } from '../../constants/enums'
import { GasFeeOption, LocalTx, NftTokenInfo } from '../../constants/types'

/* import components */
import { CpPoolModal } from './CpPoolModal'
import { LpPoolModal } from './LpPoolModal'
import { UnderwritingPoolModal } from './UnderwritingPoolModal'
import { Input } from '../atoms/Input'
import { ModalRow, ModalCell } from '../atoms/Modal'
import { Button } from '../atoms/Button'
import { StyledSelect } from '../molecules/Select'

/* import hooks */
import { useGetFunctionGas } from '../../hooks/useGas'

/* import utils */
import { fixed, filteredAmount } from '../../utils/formatting'

export interface PoolModalProps {
  modalTitle: string
  func: FunctionName
  isOpen: boolean
  closeModal: () => void
}

interface PoolModalRouterProps {
  modalTitle: string
  func: FunctionName
  isOpen: boolean
  closeModal: () => void
  farmName: string
}

interface Erc20InputPanelProps {
  unit: Unit
  availableBalance: string
  amount: string
  handleInputChange: (input: string) => void
  setMax: () => void
}

interface Erc721InputPanelProps {
  unit: Unit
  assetTokens: NftTokenInfo[]
  availableBalance: string
  nftSelection: { value: string; label: string }
  handleNft: (target: { value: string; label: string }) => void
  nftId: BigNumber
}

export const PoolModalRouter: React.FC<PoolModalRouterProps> = ({ modalTitle, func, isOpen, closeModal, farmName }) => {
  const modals: { [key: string]: JSX.Element } = {
    ['uw']: <UnderwritingPoolModal isOpen={isOpen} modalTitle={modalTitle} func={func} closeModal={closeModal} />,
    ['cp']: <CpPoolModal isOpen={isOpen} modalTitle={modalTitle} func={func} closeModal={closeModal} />,
    ['lp']: <LpPoolModal isOpen={isOpen} modalTitle={modalTitle} func={func} closeModal={closeModal} />,
  }

  return modals[farmName]
}

export const Erc20InputPanel: React.FC<Erc20InputPanelProps> = ({
  unit,
  availableBalance,
  amount,
  handleInputChange,
  setMax,
}) => {
  const { haveErrors } = useGeneral()

  return (
    <ModalRow>
      <ModalCell t2>{unit}</ModalCell>
      <ModalCell>
        <Input
          widthP={100}
          t3
          textAlignRight
          type="text"
          autoComplete="off"
          autoCorrect="off"
          inputMode="decimal"
          placeholder="0.0"
          minLength={1}
          maxLength={79}
          onChange={(e) => handleInputChange(e.target.value)}
          value={amount}
        />
        <div style={{ position: 'absolute', top: '70%' }}>Available: {availableBalance}</div>
      </ModalCell>
      <ModalCell t3>
        <Button disabled={haveErrors} onClick={setMax} info>
          MAX
        </Button>
      </ModalCell>
    </ModalRow>
  )
}

export const Erc721InputPanel: React.FC<Erc721InputPanelProps> = ({
  unit,
  assetTokens,
  availableBalance,
  nftSelection,
  handleNft,
  nftId,
}) => {
  const { currencyDecimals } = useNetwork()

  return (
    <>
      <ModalRow style={{ display: 'block' }}>
        <ModalCell t2>{unit}</ModalCell>
        <ModalCell style={{ display: 'block' }}>
          <StyledSelect
            value={nftSelection}
            onChange={handleNft}
            options={assetTokens.map((token) => ({
              value: `${token.id.toString()}`,
              label: `#${token.id.toString()} - ${formatUnits(token.value, currencyDecimals)}`,
            }))}
          />
          <div style={{ position: 'absolute', top: '77%' }}>Available: {availableBalance}</div>
        </ModalCell>
      </ModalRow>
      <div style={{ marginBottom: '20px' }}>
        {/* {assetTokens.length > 0 && (
          <ModalCell style={{ justifyContent: 'center' }} p={0}>
            <NftPosition tokenId={nftId} />
          </ModalCell>
        )} */}
      </div>
    </>
  )
}

export const usePoolModal = () => {
  const { currencyDecimals } = useNetwork()
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const { makeTxToast } = useNotifications()
  const [selectedGasOption, setSelectedGasOption] = useState<GasFeeOption | undefined>(gasPrices.selected)
  const { getGasConfig } = useGetFunctionGas()
  const gasConfig = useMemo(() => getGasConfig(selectedGasOption ? selectedGasOption.value : undefined), [
    selectedGasOption,
    getGasConfig,
  ])
  const [amount, setAmount] = useState<string>('')
  const [maxSelected, setMaxSelected] = useState<boolean>(false)

  const isAppropriateAmount = (amount: string, assetBalance: BigNumber): boolean => {
    if (!amount || amount == '.' || parseUnits(amount, currencyDecimals).lte(ZERO)) return false
    return assetBalance.gte(parseUnits(amount, currencyDecimals))
  }

  const handleSelectChange = (option: GasFeeOption | undefined) => setSelectedGasOption(option)

  const handleToast = async (tx: any, localTx: LocalTx) => {
    addLocalTransactions(localTx)
    reload()
    makeTxToast(localTx.type, TransactionCondition.PENDING, localTx.hash)
    await tx.wait().then((receipt: any) => {
      const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
      makeTxToast(localTx.type, status, localTx.hash)
      reload()
    })
  }

  const handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    console.log(functionName, err)
    makeTxToast(txType, TransactionCondition.CANCELLED)
    reload()
  }

  const calculateMaxEth = (balance: BigNumber, func: FunctionName) => {
    const bal = formatUnits(balance, currencyDecimals)
    if (func !== FunctionName.DEPOSIT_ETH || !selectedGasOption) return bal
    const gasInEth = (GAS_LIMIT / POW_NINE) * selectedGasOption.value
    return Math.max(fixed(fixed(bal, 6) - fixed(gasInEth, 6), 6), 0)
  }

  const handleInputChange = (input: string) => {
    setAmount(filteredAmount(input, amount))
    setMaxSelected(false)
  }

  const setMax = (balance: BigNumber, func: FunctionName) => {
    setAmount(calculateMaxEth(balance, func).toString())
    setMaxSelected(true)
  }

  const resetAmount = () => {
    setAmount('')
    setMaxSelected(false)
  }

  useEffect(() => {
    if (!gasPrices.selected) return
    handleSelectChange(gasPrices.selected)
  }, [gasPrices])

  return {
    gasConfig,
    gasPrices,
    selectedGasOption,
    amount,
    maxSelected,
    handleSelectChange,
    isAppropriateAmount,
    handleToast,
    handleContractCallError,
    calculateMaxEth,
    handleInputChange,
    setMax,
    setAmount,
    resetAmount,
  }
}
