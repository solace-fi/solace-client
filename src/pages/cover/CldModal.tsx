import { useWeb3React } from '@web3-react/core'
import { parseUnits } from 'ethers/lib/utils'
import React, { useState } from 'react'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { Flex } from '../../components/atoms/Layout'
import { ModalCloseButton } from '../../components/molecules/Modal'
import { useGeneral } from '../../context/GeneralManager'
import { CoverageLimitSelector2 } from '../soteria/CoverageLimitSelector'
import { Text } from '../../components/atoms/Typography'
import { FunctionName } from '../../constants/enums'
import { useNetwork } from '../../context/NetworkManager'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { useCoverageFunctions } from '../../hooks/policy/useSolaceCoverProductV3'
import { filterAmount, formatAmount } from '../../utils/formatting'
import { useCoverageContext } from './CoverageContext'
import { BalanceDropdownOptions, DropdownInputSection } from './Dropdown'

export const CldModal = ({ show }: { show: boolean }) => {
  const { account } = useWeb3React()
  const { appTheme } = useGeneral()
  const { activeNetwork } = useNetwork()
  const { purchaseWithStable, purchaseWithNonStable, purchase } = useCoverageFunctions()
  const { intrface, portfolioKit, input, dropdowns, styles, policy } = useCoverageContext()
  const { handleShowCLDModal, transactionLoading, handleTransactionLoading } = intrface
  const {
    enteredDeposit,
    handleEnteredDeposit,
    enteredCoverLimit,
    handleEnteredCoverLimit,
    selectedCoin,
    handleSelectedCoin,
  } = input
  const { curPortfolio } = portfolioKit
  const { batchBalanceData } = dropdowns
  const { bigButtonStyle, gradientStyle } = styles
  const { signatureObj, depositApproval } = policy

  const { handleToast, handleContractCallError } = useTransactionExecution()
  const [localCoinsOpen, setLocalCoinsOpen] = useState<boolean>(false)

  const callPurchase = async () => {
    if (!account) return
    handleTransactionLoading(true)
    await purchase(account, enteredCoverLimit)
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callPurchase', err, FunctionName.COVER_PURCHASE))
  }

  const callPurchaseWithStable = async () => {
    if (!account) return
    handleTransactionLoading(true)
    await purchaseWithStable(
      account,
      enteredCoverLimit,
      selectedCoin.address,
      parseUnits(enteredDeposit, selectedCoin.decimals)
    )
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callPurchaseWithStable', err, FunctionName.COVER_PURCHASE_WITH_STABLE))
  }

  const callPurchaseWithNonStable = async () => {
    if (!account || !depositApproval || !signatureObj) return
    const signature = signatureObj.signatures[`${activeNetwork.chainId}`]
    const tokenSignature: any = Object.values(signature)[0]
    handleTransactionLoading(true)
    await purchaseWithNonStable(
      account,
      enteredCoverLimit,
      selectedCoin.address,
      parseUnits(enteredDeposit, selectedCoin.decimals),
      tokenSignature.price,
      tokenSignature.deadline,
      tokenSignature.signature
    )
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) =>
        _handleContractCallError('callPurchaseWithNonStable', err, FunctionName.COVER_PURCHASE_WITH_NON_STABLE)
      )
  }

  const handlePurchase = async () => {
    if (parseUnits(formatAmount(enteredDeposit), selectedCoin.decimals).isZero()) {
      callPurchase()
    } else if (selectedCoin.stablecoin) {
      callPurchaseWithStable()
    } else {
      callPurchaseWithNonStable()
    }
  }

  const _handleToast = (tx: any, localTx: any) => {
    handleTransactionLoading(false)
    handleToast(tx, localTx)
  }

  const _handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    handleContractCallError(functionName, err, txType)
    handleTransactionLoading(false)
  }

  return (
    // <Modal isOpen={show} modalTitle={'Set Cover Limit'} handleClose={() => handleShowCLDModal(false)}>
    //   <CoverageLimitSelector portfolioScore={curPortfolio} setNewCoverageLimit={handleEnteredCoverLimit} />
    //   <ButtonWrapper>
    //     <Button {...gradientStyle} {...bigButtonStyle} onClick={callPurchase} secondary noborder>
    //       Save
    //     </Button>
    //   </ButtonWrapper>
    //   <Flex col gap={12}>
    //     <div>
    //       <DropdownInputSection
    //         hasArrow
    //         isOpen={localCoinsOpen}
    //         placeholder={'Enter amount'}
    //         icon={<img src={`https://assets.solace.fi/${selectedCoin.name.toLowerCase()}`} height={16} />}
    //         text={selectedCoin.symbol}
    //         value={enteredDeposit}
    //         onChange={(e) => setEnteredDeposit(filterAmount(e.target.value, enteredDeposit))}
    //         onClick={() => setLocalCoinsOpen(!localCoinsOpen)}
    //       />
    //       <BalanceDropdownOptions
    //         isOpen={localCoinsOpen}
    //         searchedList={batchBalanceData}
    //         onClick={(value: string) => {
    //           handleSelectedCoin(value)
    //           setLocalCoinsOpen(false)
    //         }}
    //       />
    //     </div>
    //     <ButtonWrapper style={{ width: '100%' }} p={0}>
    //       <Button {...bigButtonStyle} {...gradientStyle} secondary noborder onClick={handlePurchase}>
    //         <Text>Deposit &amp; Save</Text>
    //       </Button>
    //     </ButtonWrapper>
    //   </Flex>
    // </Modal>
    <Flex col style={{ height: 'calc(100vh - 170px)', position: 'relative' }} justifyCenter>
      <Flex
        itemsCenter
        justifyCenter
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '50px',
          width: '50px',
        }}
      >
        <Flex onClick={() => handleShowCLDModal(false)}>
          <ModalCloseButton lightColor={appTheme == 'dark'} />
        </Flex>
      </Flex>
      <Flex justifyCenter mb={4}>
        <Text big3 mont semibold style={{ lineHeight: '29.26px' }}>
          Set Cover Limit
        </Text>
      </Flex>
      <CoverageLimitSelector2 portfolioScore={curPortfolio} setNewCoverageLimit={handleEnteredCoverLimit} />
      <ButtonWrapper>
        <Button {...gradientStyle} {...bigButtonStyle} onClick={callPurchase} secondary noborder>
          Save
        </Button>
      </ButtonWrapper>
      {curPortfolio && curPortfolio.protocols.length > 0 && (
        <Flex col gap={12}>
          <div>
            <DropdownInputSection
              hasArrow
              isOpen={localCoinsOpen}
              placeholder={'Enter amount'}
              icon={<img src={`https://assets.solace.fi/${selectedCoin.name.toLowerCase()}`} height={16} />}
              text={selectedCoin.symbol}
              value={enteredDeposit}
              onChange={(e) => handleEnteredDeposit(filterAmount(e.target.value, enteredDeposit))}
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
      )}
    </Flex>
  )
}
