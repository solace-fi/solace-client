import React from 'react'

import { PositionCard } from '../atoms/Card'
import { PositionCardButton, PositionCardText, DeFiAssetImage, PositionCardName } from '../atoms/DeFiAsset'
import { Button } from '../atoms/Button'
import { TextSpan } from '../atoms/Typography'

import { useGeneral } from '../../context/GeneralProvider'

import { Position, Token, Policy } from '../../constants/types'
import { MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

import { useWindowDimensions } from '../../hooks/useWindowDimensions'

import { fixedTokenPositionBalance, truncateBalance } from '../../utils/formatting'

interface TokenPositionCardProps {
  position: Position
  protocolName: string
  selectedPositions: Position[]
  userPolicies: Policy[]
  openManageModal: (policy: Policy) => Promise<void>
  handleSelect: (position: Position) => void
  userHasActiveProductPosition: (product: string, position: string) => boolean
}

export const TokenPositionCard: React.FC<TokenPositionCardProps> = ({
  position,
  protocolName,
  selectedPositions,
  userPolicies,
  openManageModal,
  handleSelect,
  userHasActiveProductPosition,
}) => {
  const { errors } = useGeneral()
  const { width } = useWindowDimensions()

  return (
    <PositionCard
      key={(position.position as Token).underlying.address}
      blue={selectedPositions.some(
        (selectedPosition) =>
          (selectedPosition.position as Token).underlying.address == (position.position as Token).underlying.address
      )}
      glow={selectedPositions.some(
        (selectedPosition) =>
          (selectedPosition.position as Token).underlying.address == (position.position as Token).underlying.address
      )}
      fade={userHasActiveProductPosition(protocolName, (position.position as Token).underlying.symbol)}
      onClick={
        errors.length > 0
          ? undefined
          : userHasActiveProductPosition(protocolName, (position.position as Token).underlying.symbol)
          ? () =>
              openManageModal(
                userPolicies.filter(
                  (policy) =>
                    policy.productName == protocolName &&
                    policy.positionNames.includes((position.position as Token).underlying.symbol)
                )[0]
              )
          : () => handleSelect(position)
      }
    >
      {userHasActiveProductPosition(protocolName, (position.position as Token).underlying.symbol) && (
        <PositionCardText style={{ opacity: '.8' }}>This position is already covered</PositionCardText>
      )}
      <DeFiAssetImage
        borderless
        style={{
          opacity: userHasActiveProductPosition(protocolName, (position.position as Token).underlying.symbol)
            ? '.5'
            : '1',
        }}
      >
        <img
          src={`https://assets.solace.fi/${(position.position as Token).underlying.address.toLowerCase()}`}
          alt={(position.position as Token).underlying.name}
        />
      </DeFiAssetImage>
      <PositionCardName
        high_em
        style={{
          opacity: userHasActiveProductPosition(protocolName, (position.position as Token).underlying.symbol)
            ? '.5'
            : '1',
        }}
      >
        {(position.position as Token).underlying.name}
      </PositionCardName>
      <PositionCardText
        t1
        high_em
        style={{
          opacity: userHasActiveProductPosition(protocolName, (position.position as Token).underlying.symbol)
            ? '.5'
            : '1',
        }}
      >
        {truncateBalance(fixedTokenPositionBalance((position.position as Token).underlying))}{' '}
        <TextSpan style={{ fontSize: '12px' }}>{(position.position as Token).underlying.symbol}</TextSpan>
      </PositionCardText>
      <PositionCardText
        t3
        style={{
          opacity: userHasActiveProductPosition(protocolName, (position.position as Token).underlying.symbol)
            ? '.5'
            : '1',
        }}
      >
        {truncateBalance(fixedTokenPositionBalance((position.position as Token).token))}{' '}
        <TextSpan style={{ fontSize: '12px' }}>{(position.position as Token).underlying.symbol}</TextSpan>
      </PositionCardText>
      <PositionCardButton>
        {userHasActiveProductPosition(protocolName, (position.position as Token).underlying.symbol) ? (
          <Button widthP={width > MAX_MOBILE_SCREEN_WIDTH ? undefined : 100}>Manage</Button>
        ) : (
          <Button widthP={width > MAX_MOBILE_SCREEN_WIDTH ? undefined : 100}>
            {selectedPositions.some(
              (selectedPosition) =>
                (selectedPosition.position as Token).underlying.address ==
                (position.position as Token).underlying.address
            )
              ? 'Deselect'
              : 'Select'}
          </Button>
        )}
      </PositionCardButton>
    </PositionCard>
  )
}
