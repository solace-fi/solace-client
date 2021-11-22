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

    useInputAmount

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
