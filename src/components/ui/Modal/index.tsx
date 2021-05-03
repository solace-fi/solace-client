import React, { useState } from 'react'
import styled from 'styled-components'

import { Button } from '../../ui/Button'

const ModalBase = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
`

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  cursor: pointer;
`

const ModalBox = styled.div`
  position: relative;
  width: 80%;
  margin: 0 10%;
  padding: 50px;
  box-sizing: border-box;
  border-radius: 10px;
  background-color: white;
  cursor: auto;
`

const ModalContent = styled.div`
  margin-top: 30px;
  color: #6b6b6b;
  font-size: 16px;
`

const ModalClose = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  transition: transform 250ms ease-in-out;
  transform-origin: 50% 50%;
`

interface props {
  showModal: boolean
  disabled: boolean
  setShowModal: any
  setDisabled: any
  children?: React.ReactNode
  callbackFunc: any
}

export const Modal: React.FC<props> = ({ showModal, setShowModal, callbackFunc, disabled, setDisabled, children }) => {
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
