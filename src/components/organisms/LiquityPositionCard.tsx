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
import React from 'react'

/* import managers */
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */
import { Position, LiquityPosition, Policy } from '../../constants/types'
import { BKPT_3 } from '../../constants'

/* import components */
import { Button } from '../atoms/Button'
import { TextSpan } from '../atoms/Typography'
import { PositionCard } from '../../components/atoms/Card'
import {
  PositionCardButton,
  PositionCardText,
  DeFiAssetImage,
  PositionCardName,
} from '../../components/atoms/DeFiAsset'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { fixedPositionBalance, truncateBalance, trim0x } from '../../utils/formatting'
import { userHasActiveProductPosition } from '../../utils/policy'

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
  const isActive = userHasActiveProductPosition(
    userPolicies,
    protocolName,
    (position.position as LiquityPosition).positionAddress
  )
  const isSelected = selectedPositions.some(
    (selectedPosition) =>
      (selectedPosition.position as LiquityPosition).positionAddress ==
      (position.position as LiquityPosition).positionAddress
  )
  const lightText = isSelected || isActive
  const foundPosition = userPolicies.filter(
    (policy) =>
      policy.productName == protocolName &&
      policy.positionDescription.includes(trim0x((position.position as LiquityPosition).positionAddress))
  )[0]

  return (
    <PositionCard
      key={(position.position as LiquityPosition).positionAddress}
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
          src={`https://assets.solace.fi/${(position.position as LiquityPosition).positionAddress.toLowerCase()}`}
          alt={(position.position as LiquityPosition).positionName}
        />
      </DeFiAssetImage>
      <PositionCardName
        style={{
          opacity: isActive ? '.5' : '1',
        }}
        light={lightText}
      >
        {(position.position as LiquityPosition).positionName}
      </PositionCardName>
      <PositionCardText
        t1
        style={{
          opacity: isActive ? '.5' : '1',
        }}
        light={lightText}
      >
        {truncateBalance(fixedPositionBalance((position.position as LiquityPosition).amount.toString(), 18))}{' '}
        <TextSpan style={{ fontSize: '12px' }} light={lightText}>
          {(position.position as LiquityPosition).associatedToken.symbol}
        </TextSpan>
      </PositionCardText>
      <PositionCardButton>
        {isActive ? (
          <Button widthP={width > BKPT_3 ? undefined : 100} light>
            Manage
          </Button>
        ) : isSelected ? (
          <Button widthP={width > BKPT_3 ? undefined : 100} light>
            {'Deselect'}
          </Button>
        ) : (
          <Button widthP={width > BKPT_3 ? undefined : 100} info>
            {'Select'}
          </Button>
        )}
      </PositionCardButton>
    </PositionCard>
  )
}
