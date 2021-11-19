import React, { useCallback, useState, useMemo } from 'react'
import { Block } from '@ethersproject/contracts/node_modules/@ethersproject/abstract-provider'
import { Contract } from '@ethersproject/contracts'

import { useWallet } from '../../context/WalletManager'

import { ModalContainer, ModalBase, ModalHeader, ModalCell } from '../atoms/Modal'
import { ModalCloseButton } from '../molecules/Modal'
import { HorizRule } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { Button, ButtonWrapper } from '../atoms/Button'
import { FormCol, FormRow } from '../../components/atoms/Form'
import { Input } from '../../components/atoms/Input'

import { useTokenAllowance } from '../../hooks/useTokenAllowance'

import { hasApproval } from '../../utils'

interface BondModalProps {
  closeModal: () => void
  isOpen: boolean
  latestBlock: Block | undefined
}

export const BondModal: React.FC<BondModalProps> = ({ closeModal, isOpen, latestBlock }) => {
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [isBonding, setIsBonding] = useState<boolean>(true)
  const { account, openWalletModal } = useWallet()
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const tokenAllowance = useTokenAllowance(contractForAllowance, spenderAddress)
  //   const approval = useMemo(
  //     () => hasApproval(tokenAllowance, amount && amount != '.' ? parseUnits(amount, currencyDecimals).toString() : '0'),
  //     [amount, currencyDecimals, tokenAllowance]
  //   )

  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  return (
    <ModalContainer isOpen={isOpen}>
      <ModalBase isOpen={isOpen}>
        <ModalHeader>
          <Text t2 bold>
            Token
          </Text>
          <ModalCloseButton hidden={modalLoading} onClick={handleClose} />
        </ModalHeader>
        <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', position: 'relative' }}>
          <ModalCell
            pt={5}
            pb={10}
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
            onClick={() => setIsBonding(false)}
            style={{ cursor: 'pointer', justifyContent: 'center' }}
          >
            <Text t1 info={!isBonding}>
              Redeem
            </Text>
          </ModalCell>
        </div>
        <HorizRule mb={20} />
        {account ? (
          <ButtonWrapper>
            <Button info secondary style={{ padding: '15px 50px', borderRadius: '55px' }} onClick={openWalletModal}>
              Connect Wallet
            </Button>
          </ButtonWrapper>
        ) : (
          <>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '20px' }}>
                <Input
                  width={240}
                  mt={20}
                  mb={5}
                  minLength={1}
                  maxLength={79}
                  autoComplete="off"
                  autoCorrect="off"
                  inputMode="decimal"
                  placeholder="0.0"
                  textAlignCenter
                  type="text"
                />
                <Button ml={10} pt={4} pb={4} pl={8} pr={8} width={70} height={30}>
                  MAX
                </Button>
              </div>
            </div>
            <FormRow mb={10}>
              <FormCol>
                <Text>Unstaked Balance</Text>
              </FormCol>
              <FormCol>
                <Text info>0.01 SOLACE</Text>
              </FormCol>
            </FormRow>
            <FormRow mb={10}>
              <FormCol>
                <Text>Staked Balance</Text>
              </FormCol>
              <FormCol>
                <Text info nowrap>
                  0.01 xSOLACE
                </Text>
              </FormCol>
            </FormRow>
            <HorizRule />
            <FormRow>
              <FormCol>
                <Text bold>Next Reward Amount</Text>
              </FormCol>
              <FormCol>
                <Text bold info nowrap>
                  0.02 xSOLACE
                </Text>
              </FormCol>
            </FormRow>
            <FormRow>
              <FormCol>
                <Text bold>Next Reward Yield</Text>
              </FormCol>
              <FormCol>
                <Text bold info nowrap>
                  35%
                </Text>
              </FormCol>
            </FormRow>
            <FormRow>
              <FormCol>
                <Text bold>ROI (5-Day Rate)</Text>
              </FormCol>
              <FormCol>
                <Text bold info nowrap>
                  75%
                </Text>
              </FormCol>
            </FormRow>
            <ButtonWrapper>
              <Button widthP={100} info>
                {isBonding ? 'Bond' : 'Redeem'}
              </Button>
            </ButtonWrapper>
          </>
        )}
      </ModalBase>
    </ModalContainer>
  )
}
