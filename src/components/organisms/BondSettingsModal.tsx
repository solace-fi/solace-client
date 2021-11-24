import React, { useState, useEffect } from 'react'
import { Modal } from '../molecules/Modal'
import { ModalProps } from '../atoms/Modal'
import { Input } from '../atoms/Input'
import { Text } from '../atoms/Typography'
import { parseUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { Button, ButtonWrapper } from '../atoms/Button'
import { FlexRow, FlexCol } from '../atoms/Layout'
import { MAX_BPS } from '../../constants'
import { CheckboxOption } from './PoolModalRouter'
import { BondTellerDetails } from '../../constants/types'

interface BondSettingsModalProps extends ModalProps {
  bondRecipient: string | undefined
  setBondRecipient: any
  slippagePrct: string
  setSlippagePrct: any
  shouldUseNativeToken: boolean
  setShouldUseNativeToken: any
  isBondTellerErc20: boolean
  selectedBondDetail?: BondTellerDetails
}

export const BondSettingsModal: React.FC<BondSettingsModalProps> = ({
  bondRecipient,
  setBondRecipient,
  slippagePrct,
  setSlippagePrct,
  isOpen,
  modalTitle,
  shouldUseNativeToken,
  setShouldUseNativeToken,
  isBondTellerErc20,
  handleClose,
  selectedBondDetail,
}) => {
  const [slippage, setSlippage] = useState<string>(slippagePrct)
  const [recipient, setRecipient] = useState<string | undefined>(bondRecipient)
  const [useNative, setUseNative] = useState<boolean>(shouldUseNativeToken)

  const handleInputSlippage = (input: string) => {
    // allow only numbers and decimals
    const filtered = input.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')

    // if filtered is only "0." or "." or '', filtered becomes '0.0'
    const formatted = filtered == '0.' || filtered == '.' || filtered == '' ? '0.0' : filtered

    // if number has more than max decimal places, do not update
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 2) return

    // if number is greater than the max cover per user, do not update
    if (parseUnits(formatted, 2).gt(BigNumber.from(MAX_BPS))) return
    setSlippage(filtered)
  }

  const closeModal = () => {
    setSlippage(slippagePrct)
    setRecipient(bondRecipient)
    setUseNative(shouldUseNativeToken)
    handleClose()
  }

  const applyChanges = () => {
    setSlippagePrct(slippage)
    setBondRecipient(recipient)
    setShouldUseNativeToken(useNative)
    handleClose()
  }

  useEffect(() => {
    setSlippage(slippagePrct)
  }, [slippagePrct])

  useEffect(() => {
    setRecipient(bondRecipient)
  }, [bondRecipient])

  useEffect(() => {
    setUseNative(shouldUseNativeToken)
  }, [shouldUseNativeToken])

  return (
    <Modal isOpen={isOpen} modalTitle={modalTitle} handleClose={closeModal}>
      <FlexCol>
        <Text bold>Slippage Tolerance %</Text>
        <Input info bold type="string" value={slippage} onChange={(e) => handleInputSlippage(e.target.value)} />
        <Text textAlignCenter t4 mb={30}>
          Transaction may revert if price changes by more than slippage %
        </Text>
        {bondRecipient && (
          <>
            <Text bold>Recipient Address</Text>
            <Input info bold type="string" value={recipient ?? ''} onChange={(e) => setRecipient(e.target.value)} />
            <Text textAlignCenter t4 mb={30}>
              Choose recipient address. By default, this is your currently connected address.
            </Text>
          </>
        )}
        {!isBondTellerErc20 && selectedBondDetail && (
          <>
            <CheckboxOption
              isChecked={useNative}
              setChecked={setUseNative}
              text={`Deposit ${selectedBondDetail.tellerData.teller.name.substring(1)}`}
            />
            <Text textAlignCenter t4 mb={30}>
              Toggle between depositing native network token and its wrapped token
            </Text>
          </>
        )}
        <Text t4 warning textAlignCenter width={270} style={{ margin: '0 auto' }}>
          Changes to these settings will be reset when reopening the bond popup window.
        </Text>
      </FlexCol>
      <ButtonWrapper isColumn>
        <Button widthP={100} info onClick={applyChanges}>
          Apply Changes
        </Button>
      </ButtonWrapper>
    </Modal>
  )
}
