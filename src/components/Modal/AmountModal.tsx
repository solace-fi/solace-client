import React, { useState } from 'react'
import { Button } from '../../components/Button'
import { ModalBase, ModalBox, ModalOverlay, ModalContent, props } from '../Modal'

export const AmountModal: React.FC<props> = ({
  showModal,
  setShowModal,
  callbackFunc,
  disabled,
  setDisabled,
  children,
}) => {
  const outsideRef = React.useRef(null)

  const [amount, setAmount] = useState<number>(5)
  const [maxLoss, setMaxLoss] = useState<number>(5)

  const handleCloseOnOverlay = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (e.target === outsideRef.current && !disabled) {
      setShowModal(false)
    }
  }

  const handleCallback = async () => {
    console.log('callback')
    setDisabled(true)
    await callbackFunc(amount, maxLoss)
  }

  return showModal ? (
    <ModalBase>
      <ModalOverlay ref={outsideRef} onClick={handleCloseOnOverlay} />
      <ModalBox>
        <ModalContent>{children}</ModalContent>
        <ModalContent>
          {' '}
          <label htmlFor="amount">Amount</label>
          <input type="number" value={`${amount}`} id="amount" onChange={(e) => setAmount(parseInt(e.target.value))} />
          <label htmlFor="maxLoss">Max Loss: {maxLoss}</label>
          <input
            type="range"
            name="maxLoss"
            id="maxLoss"
            min="1"
            max="10"
            value={maxLoss}
            step="1"
            onChange={(e) => setMaxLoss(parseInt(e.target.value))}
          />
        </ModalContent>
        <Button disabled={disabled} onClick={handleCallback}>
          {!disabled ? 'confirm' : 'Loading'}
        </Button>
        {!disabled ? <Button onClick={() => setShowModal(false)}>cancel</Button> : null}
      </ModalBox>
    </ModalBase>
  ) : null
}
