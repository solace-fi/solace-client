import React, { useCallback, useState, useMemo } from 'react'
import { Block } from '@ethersproject/contracts/node_modules/@ethersproject/abstract-provider'
import { Contract } from '@ethersproject/contracts'
import { formatUnits, parseUnits } from '@ethersproject/units'

import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'

import { ModalContainer, ModalBase, ModalHeader, ModalCell } from '../atoms/Modal'
import { ModalCloseButton } from '../molecules/Modal'
import { Content, HorizRule, MultiTabIndicator } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { Button, ButtonWrapper } from '../atoms/Button'
import { FormCol, FormRow } from '../../components/atoms/Form'
import { Input } from '../../components/atoms/Input'
import { usePoolModal } from './PoolModalRouter'

import { useTokenAllowance } from '../../hooks/useTokenAllowance'

import { hasApproval } from '../../utils'
import { WalletConnectButton } from '../molecules/WalletConnectButton'

interface BondModalProps {
  closeModal: () => void
  isOpen: boolean
}

export const BondModal: React.FC<BondModalProps> = ({ closeModal, isOpen }) => {
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [isBonding, setIsBonding] = useState<boolean>(true)
  const { account, openWalletModal } = useWallet()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const tokenAllowance = useTokenAllowance(contractForAllowance, spenderAddress)
  const {
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
  } = usePoolModal()
  const approval = useMemo(
    () => hasApproval(tokenAllowance, amount && amount != '.' ? parseUnits(amount, currencyDecimals).toString() : '0'),
    [amount, currencyDecimals, tokenAllowance]
  )

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
              <Input autoComplete="off" autoCorrect="off" placeholder="0.0" textAlignCenter type="text" />
              <Button ml={10} pt={4} pb={4} pl={8} pr={8} width={70} height={30}>
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
                <Button info secondary>
                  Sign
                </Button>
              </ButtonWrapper>
            </Content>
          )
        ) : null}
        {isBonding ? (
          <>
            <FormRow mt={20} mb={10}>
              <FormCol>
                <Text bold>Your Balance</Text>
              </FormCol>
              <FormCol>
                <Text info bold>
                  0 DAI
                </Text>
              </FormCol>
            </FormRow>
            <FormRow mb={10}>
              <FormCol>
                <Text bold>You Will Get</Text>
              </FormCol>
              <FormCol>
                <Text info nowrap bold>
                  0 SOLACE
                </Text>
              </FormCol>
            </FormRow>
            <FormRow mb={10}>
              <FormCol>
                <Text>MAX You Can Buy</Text>
              </FormCol>
              <FormCol>
                <Text info nowrap>
                  42731 SOLACE
                </Text>
              </FormCol>
            </FormRow>
          </>
        ) : (
          <>
            <FormRow mt={20} mb={10}>
              <FormCol>
                <Text bold>Pending Rewards</Text>
              </FormCol>
              <FormCol>
                <Text info bold>
                  0.01 SOLACE
                </Text>
              </FormCol>
            </FormRow>
            <FormRow mb={10}>
              <FormCol>
                <Text bold>Claimable Rewards</Text>
              </FormCol>
              <FormCol>
                <Text info nowrap bold>
                  0.01 SOLACE
                </Text>
              </FormCol>
            </FormRow>
            <FormRow mb={10}>
              <FormCol>
                <Text>Time Until Fully Vested</Text>
              </FormCol>
              <FormCol>
                <Text info nowrap>
                  0
                </Text>
              </FormCol>
            </FormRow>
          </>
        )}
        <FormRow mb={10}>
          <FormCol>
            <Text>ROI</Text>
          </FormCol>
          <FormCol>
            <Text info nowrap>
              35%
            </Text>
          </FormCol>
        </FormRow>
        <FormRow mb={10}>
          <FormCol>
            <Text>Debt Ratio</Text>
          </FormCol>
          <FormCol>
            <Text info nowrap>
              75%
            </Text>
          </FormCol>
        </FormRow>
        <FormRow>
          <FormCol>
            <Text>Vesting Term</Text>
          </FormCol>
          <FormCol>
            <Text info nowrap>
              5 Days
            </Text>
          </FormCol>
        </FormRow>
        {approval && account && (
          <ButtonWrapper isColumn>
            {/* <Button widthP={100} info>
              {isBonding ? 'Bond' : 'Redeem'}
            </Button> */}
            {isBonding ? (
              <Button widthP={100} info>
                Bond
              </Button>
            ) : (
              <>
                <Button widthP={100} info>
                  Claim
                </Button>
                <Button widthP={100} info>
                  Claim and Autostake
                </Button>
              </>
            )}
          </ButtonWrapper>
        )}
      </ModalBase>
    </ModalContainer>
  )
}
