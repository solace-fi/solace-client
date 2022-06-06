import useDebounce from '@rooks/use-debounce'
import { useWeb3React } from '@web3-react/core'
import { parseUnits } from 'ethers/lib/utils'
import React, { useEffect, useState } from 'react'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { Modal } from '../../components/molecules/Modal'
import { FunctionName } from '../../constants/enums'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { useCoverageFunctions } from '../../hooks/policy/useSolaceCoverProductV3'
import { filterAmount } from '../../utils/formatting'
import { CoverageLimitSelector } from '../soteria/CoverageLimitSelector'
import { useCoverageContext } from './CoverageContext'
import { BalanceDropdownOptions, DropdownInputSection } from './Dropdown'

export const CldModal = ({ show }: { show: boolean }) => {
  const { account } = useWeb3React()
  const { purchaseWithStable, purchaseWithNonStable, purchase } = useCoverageFunctions()
  const { intrface, portfolioKit, input, dropdowns, styles } = useCoverageContext()
  const { handleShowCLDModal } = intrface
  const {
    enteredDeposit: asyncEnteredDeposit,
    handleEnteredDeposit,
    enteredCoverLimit,
    handleEnteredCoverLimit,
    selectedCoin,
    handleSelectedCoin,
  } = input
  const { curPortfolio } = portfolioKit
  const { batchBalanceData } = dropdowns
  const { bigButtonStyle, gradientStyle } = styles

  const { handleToast, handleContractCallError } = useTransactionExecution()
  const [enteredDeposit, setEnteredDeposit] = useState<string>(asyncEnteredDeposit)
  const [localCoinsOpen, setLocalCoinsOpen] = useState<boolean>(false)

  const callPurchase = async () => {
    if (!account) return
    await purchase(account, enteredCoverLimit)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callPurchase', err, FunctionName.COVER_PURCHASE))
  }

  const callPurchaseWithStable = async () => {
    if (!account) return
    await purchaseWithStable(
      account,
      enteredCoverLimit,
      selectedCoin.address,
      parseUnits(enteredDeposit, selectedCoin.decimals)
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callPurchaseWithStable', err, FunctionName.COVER_PURCHASE_WITH_STABLE))
  }

  const handlePurchase = async () => {
    if (parseUnits(enteredDeposit, selectedCoin.decimals).isZero()) {
      callPurchase()
    } else {
      callPurchaseWithStable()
    }
  }

  const _editDeposit = useDebounce(() => {
    handleEnteredDeposit(enteredDeposit)
  }, 200)

  useEffect(() => {
    _editDeposit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enteredDeposit])

  useEffect(() => {
    setEnteredDeposit(asyncEnteredDeposit)
  }, [asyncEnteredDeposit])

  return (
    <Modal isOpen={show} modalTitle={'Set Cover Limit'} handleClose={() => handleShowCLDModal(false)}>
      <CoverageLimitSelector portfolioScore={curPortfolio} setNewCoverageLimit={handleEnteredCoverLimit} />
      <ButtonWrapper>
        <Button {...gradientStyle} {...bigButtonStyle} onClick={callPurchase} secondary noborder>
          Save
        </Button>
      </ButtonWrapper>
      <Flex col gap={12}>
        <div>
          <DropdownInputSection
            hasArrow
            isOpen={localCoinsOpen}
            placeholder={'Enter amount'}
            icon={<img src={`https://assets.solace.fi/${selectedCoin.name.toLowerCase()}`} height={16} />}
            text={selectedCoin.symbol}
            value={enteredDeposit}
            onChange={(e) => setEnteredDeposit(filterAmount(e.target.value, enteredDeposit))}
            onClick={() => setLocalCoinsOpen(!localCoinsOpen)}
          />
          <BalanceDropdownOptions
            isOpen={localCoinsOpen}
            searchedList={batchBalanceData}
            onClick={(value: string) => {
              handleSelectedCoin(value)
              setLocalCoinsOpen(false)
            }}
          />
        </div>
        <ButtonWrapper style={{ width: '100%' }} p={0}>
          <Button {...bigButtonStyle} {...gradientStyle} secondary noborder onClick={handlePurchase}>
            <Text>Deposit &amp; Save</Text>
          </Button>
        </ButtonWrapper>
      </Flex>
    </Modal>
  )
}
