import React, { useEffect, useState, useMemo } from 'react'
import { Flex, HorizRule, VerticalSeparator } from '../../components/atoms/Layout'
import { QuestionCircle } from '@styled-icons/bootstrap/QuestionCircle'
// src/components/atoms/Button/index.ts
import { Button } from '../../components/atoms/Button'
// src/resources/svg/icons/usd.svg
import DAI from '../../resources/svg/icons/dai.svg'
import { StyledGrayBox } from '../../components/molecules/GrayBox'
import { GenericInputSection } from '../../components/molecules/InputSection'
import { Checkbox, StyledSlider } from '../../components/atoms/Input'
import commaNumber from '../../utils/commaNumber'
import { StyledTooltip } from '../../components/molecules/Tooltip'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { MAX_APPROVAL_AMOUNT, ZERO } from '../../constants'
import { useCooldownDetails, useFunctions } from '../../hooks/useSolaceCoverProduct'
import { useWallet } from '../../context/WalletManager'
import { BigNumber } from 'ethers'
import { LocalTx, SolaceRiskScore } from '../../constants/types'
import {
  accurateMultiply,
  filterAmount,
  floatUnits,
  truncateValue,
  convertSciNotaToPrecise,
} from '../../utils/formatting'
import { getTimeFromMillis } from '../../utils/time'
import { useTransactionExecution } from '../../hooks/useInputAmount'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { parseUnits } from 'ethers/lib/utils'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import IERC20 from '../../constants/metadata/IERC20Metadata.json'
import useDebounce from '@rooks/use-debounce'
import { formatUnits } from 'ethers/lib/utils'
import { getContract } from '../../utils'
import { useContracts } from '../../context/ContractsManager'
import { useNotifications } from '../../context/NotificationsManager'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import { Text } from '../../components/atoms/Typography'
import { CheckboxData } from '../stake/types/LockCheckbox'
import updateLockCheck from '../stake/utils/stake/batchActions/checkboxes/updateLockCheck'
import lockIsChecked from '../stake/utils/stake/batchActions/checkboxes/lockIsChecked'

export function CoveredChains({
  isEditing,
  setIsEditing,
}: {
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
}): JSX.Element {
  const { ifDesktop } = useWindowDimensions()
  const { networks } = useNetwork()
  const startEditing = () => setIsEditing(true)
  const stopEditing = () => setIsEditing(false)
  const [chainsChecked, setChainsChecked] = useState<CheckboxData[]>([])

  const coverableNetworks = useMemo(
    () => networks.filter((m) => m.config.keyContracts.solaceCoverProduct && !m.isTestnet),
    [networks]
  )

  const handleChainCheck = (id: BigNumber) => {
    const checkboxStatus = lockIsChecked(chainsChecked, id)
    const newArr = updateLockCheck(chainsChecked, id, !checkboxStatus)
    setChainsChecked(newArr)
  }

  const updateLocksChecked = (chains: number[], oldArray: CheckboxData[]): CheckboxData[] => {
    if (oldArray.length === 0) return chains.map((c) => ({ id: BigNumber.from(c), checked: false }))
    return chains.map((c) => {
      const oldBox = oldArray.find((oldBox) => oldBox.id.eq(BigNumber.from(c)))
      return oldBox ? { id: BigNumber.from(c), checked: oldBox.checked } : { id: BigNumber.from(c), checked: false }
    })
  }

  useEffect(() => {
    setChainsChecked(updateLocksChecked([1, 137], chainsChecked))
  }, [])

  return (
    <Flex
      col
      stretch
      gap={40}
      style={{
        width: '100%',
      }}
    >
      <Flex between itemsCenter>
        <Text t2 bold techygradient>
          Covered Chains
        </Text>
        <StyledTooltip
          id={'covered-chains'}
          tip={['You can choose the chains to cover with your policy here, even if your policy is made on one chain.']}
        >
          <QuestionCircle height={20} width={20} color={'#aaa'} />
        </StyledTooltip>
      </Flex>
      <Flex
        col
        between
        stretch
        gap={30}
        pl={ifDesktop(2)}
        pr={ifDesktop(2)}
        style={{
          height: '100%',
        }}
      >
        {!isEditing ? (
          <Button
            info
            secondary
            pl={46.75}
            pr={46.75}
            pt={8}
            pb={8}
            style={{
              fontWeight: 600,
            }}
            onClick={startEditing}
          >
            Edit Chains
          </Button>
        ) : (
          <>
            <Flex justifyCenter col>
              {coverableNetworks.map((n, i) => (
                <Flex key={n.chainId}>
                  <Checkbox
                    type="checkbox"
                    checked={lockIsChecked(chainsChecked, BigNumber.from(n.chainId))}
                    onChange={() => handleChainCheck(BigNumber.from(n.chainId))}
                  />
                  <div>{n.name}</div>
                </Flex>
              ))}
            </Flex>
            <Flex justifyCenter={!isEditing} between={isEditing} gap={isEditing ? 20 : undefined} pt={10} pb={10}>
              <Button info pt={8} pb={8} style={{ fontWeight: 600, flex: 1, transition: '0s' }} onClick={stopEditing}>
                Discard
              </Button>
              <Button info secondary pt={8} pb={8} style={{ fontWeight: 600, flex: 1, transition: '0s' }}>
                Save
              </Button>
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  )
}
