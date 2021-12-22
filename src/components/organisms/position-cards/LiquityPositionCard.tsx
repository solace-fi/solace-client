/*

  import packages
  import managers
  import constants
  import hooks
  import utils

  LiquityPositionCard
    hooks

*/

/* import packages */
import React, { useMemo } from 'react'

/* import managers */
import { useGeneral } from '../../../context/GeneralManager'

/* import constants */
import { Position, LiquityPosition, Policy } from '../../../constants/types'
import { BKPT_3 } from '../../../constants'

/* import components */
import { Button } from '../../atoms/Button'
import { TextSpan } from '../../atoms/Typography'
import { PositionCard } from '../../../components/atoms/Card'
import {
  PositionCardButton,
  PositionCardText,
  DeFiAssetImage,
  PositionCardName,
} from '../../../components/atoms/DeFiAsset'

/* import hooks */
import { useWindowDimensions } from '../../../hooks/useWindowDimensions'

/* import utils */
import { fixedPositionBalance, truncateBalance, trim0x } from '../../../utils/formatting'
import { userHasActiveProductPosition } from '../../../utils/policy'

interface LiquityPositionCardProps {
  position: Position
  protocolName: string
  selectedPositions: Position[]
  userPolicies: Policy[]
  openManageModal: (policy: Policy) => Promise<void>
  handleSelect: (position: Position) => void
}

export const LiquityPositionCard: React.FC<LiquityPositionCardProps> = ({
  position,
  protocolName,
  selectedPositions,
  userPolicies,
  openManageModal,
  handleSelect,
}) => {
  /*

    hooks

  */
  const { haveErrors } = useGeneral()
  const { width } = useWindowDimensions()
  const liquityPosition = useMemo(() => position.position as LiquityPosition, [position.position])
  const isActive = userHasActiveProductPosition(userPolicies, protocolName, liquityPosition.positionAddress)
  const isSelected = selectedPositions.some(
    (selectedPosition) =>
      (selectedPosition.position as LiquityPosition).positionAddress == liquityPosition.positionAddress
  )
  const lightText = isSelected || isActive
  const foundPosition = userPolicies.filter(
    (policy) =>
      policy.productName == protocolName && policy.positionDescription.includes(trim0x(liquityPosition.positionAddress))
  )[0]

  return (
    <PositionCard
      key={liquityPosition.positionAddress}
      color1={isSelected}
      glow={isSelected}
      fade={isActive}
      onClick={haveErrors ? undefined : isActive ? () => openManageModal(foundPosition) : () => handleSelect(position)}
    >
      {isActive && (
        <PositionCardText style={{ opacity: '.8' }} light={lightText}>
          This position is already covered
        </PositionCardText>
      )}
      <DeFiAssetImage
        noborder
        style={{
          opacity: isActive ? '.5' : '1',
        }}
      >
        <img
          src={`https://assets.solace.fi/${liquityPosition.positionAddress.toLowerCase()}`}
          alt={liquityPosition.positionName}
        />
      </DeFiAssetImage>
      <PositionCardName
        style={{
          opacity: isActive ? '.5' : '1',
        }}
        light={lightText}
      >
        {liquityPosition.positionName}
      </PositionCardName>
      <PositionCardText
        t1
        style={{
          opacity: isActive ? '.5' : '1',
        }}
        light={lightText}
      >
        {truncateBalance(fixedPositionBalance(liquityPosition.amount.toString(), 18))}{' '}
        <TextSpan style={{ fontSize: '12px' }} light={lightText}>
          {liquityPosition.associatedToken.symbol}
        </TextSpan>
      </PositionCardText>
      <PositionCardButton>
        {isActive ? (
          <Button widthP={width > BKPT_3 ? undefined : 100} light>
            Manage
          </Button>
        ) : isSelected ? (
          <Button widthP={width > BKPT_3 ? undefined : 100} light>
            Deselect
          </Button>
        ) : (
          <Button widthP={width > BKPT_3 ? undefined : 100} info>
            Select
          </Button>
        )}
      </PositionCardButton>
    </PositionCard>
  )
}
