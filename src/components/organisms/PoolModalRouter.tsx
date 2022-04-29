/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components
    import utils

    PoolModalRouter

    Erc20InputPanel

    Erc721InputPanel

    CheckboxOption

  *************************************************************************************/

/* import packages */
import React from 'react'
import { BigNumber } from 'ethers'
import { formatUnits } from '@ethersproject/units'

/* import managers */
import { useGeneral } from '../../context/GeneralManager'
import { useNetwork } from '../../context/NetworkManager'

/* import constants */
import { FunctionName, Unit } from '../../constants/enums'
import { NftTokenInfo } from '../../constants/types'

/* import components */
import { CpPoolModal } from './capital-pool/CpPoolModal'
import { UnderwritingPoolModal } from './underwriting-pool/UnderwritingPoolModal'
import { Input } from '../atoms/Input'
import { ModalRow, ModalCell } from '../atoms/Modal'
import { Button } from '../atoms/Button'
import { StyledSelect } from '../molecules/Select'
import { Text } from '../atoms/Typography'

/* import utils */
import { GeneralElementProps } from '../generalInterfaces'
import { Checkbox } from '../../components/atoms/Input'
import { Flex } from '../../components/atoms/Layout'

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

interface CheckboxProps {
  isChecked: boolean
  setChecked: any
  text: string
}

export const PoolModalRouter: React.FC<PoolModalRouterProps> = ({ modalTitle, func, isOpen, closeModal, farmName }) => {
  const modals: { [key: string]: JSX.Element } = {
    ['uw']: <UnderwritingPoolModal isOpen={isOpen} modalTitle={modalTitle} func={func} closeModal={closeModal} />,
    ['cp']: <CpPoolModal isOpen={isOpen} modalTitle={modalTitle} func={func} closeModal={closeModal} />,
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
  const { activeNetwork } = useNetwork()

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
              label: `#${token.id.toString()} - ${formatUnits(token.value, activeNetwork.nativeCurrency.decimals)}`,
            }))}
          />
          <div style={{ position: 'absolute', top: '77%' }}>Available: {availableBalance}</div>
        </ModalCell>
      </ModalRow>
    </>
  )
}

export const CheckboxOption: React.FC<CheckboxProps & GeneralElementProps> = ({
  isChecked,
  setChecked,
  text,
  ...props
}) => (
  <Flex {...props}>
    <Checkbox type="checkbox" checked={isChecked} onChange={(e) => setChecked(e.target.checked)} />
    <Text info textAlignCenter t3 pl={5}>
      {text}
    </Text>
  </Flex>
)
