import React, { useMemo } from 'react'

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

  const token: Token = useMemo(() => position.position as Token, [position.position])
  const isSelected = useMemo(
    () =>
      selectedPositions.some(
        (selectedPosition) => (selectedPosition.position as Token).underlying.address == token.underlying.address
      ),
    [selectedPositions, token]
  )
  const isActive = useMemo(() => userHasActiveProductPosition(protocolName, token.underlying.symbol), [
    protocolName,
    token,
    userHasActiveProductPosition,
  ])

  return (
    <PositionCard
      key={token.underlying.address}
      color1={isSelected}
      glow={isSelected}
      fade={isActive}
      onClick={
        errors.length > 0
          ? undefined
          : isActive
          ? () =>
              openManageModal(
                userPolicies.filter(
                  (policy) =>
                    policy.productName == protocolName && policy.positionNames.includes(token.underlying.symbol)
                )[0]
              )
          : () => handleSelect(position)
      }
    >
      {isActive && <PositionCardText style={{ opacity: '.8' }}>This position is already covered</PositionCardText>}
      <DeFiAssetImage borderless style={{ opacity: isActive ? '.5' : '1' }}>
        <img src={`https://assets.solace.fi/${token.underlying.address.toLowerCase()}`} alt={token.underlying.name} />
      </DeFiAssetImage>
      <PositionCardName high_em style={{ opacity: isActive ? '.5' : '1' }}>
        {token.underlying.name}
      </PositionCardName>
      <PositionCardText t1 high_em style={{ opacity: isActive ? '.5' : '1' }}>
        {truncateBalance(fixedTokenPositionBalance(token.underlying))}{' '}
        <TextSpan style={{ fontSize: '12px' }}>{token.underlying.symbol}</TextSpan>
      </PositionCardText>
      <PositionCardText t3 style={{ opacity: isActive ? '.5' : '1' }}>
        {truncateBalance(fixedTokenPositionBalance(token.token))}{' '}
        <TextSpan style={{ fontSize: '12px' }}>{token.underlying.symbol}</TextSpan>
      </PositionCardText>
      <PositionCardButton>
        {isActive ? (
          <Button widthP={width > MAX_MOBILE_SCREEN_WIDTH ? undefined : 100}>Manage</Button>
        ) : (
          <Button widthP={width > MAX_MOBILE_SCREEN_WIDTH ? undefined : 100}>
            {isSelected ? 'Deselect' : 'Select'}
          </Button>
        )}
      </PositionCardButton>
    </PositionCard>
  )
}
