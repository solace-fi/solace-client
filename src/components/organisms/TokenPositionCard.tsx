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
  const { appTheme, errors } = useGeneral()
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
  const lightText = (isSelected || isActive) && appTheme == 'light'

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
      {isActive && (
        <PositionCardText style={{ opacity: '.8' }} light={lightText}>
          This position is already covered
        </PositionCardText>
      )}
      <DeFiAssetImage noborder style={{ opacity: isActive ? '.5' : '1' }}>
        <img src={`https://assets.solace.fi/${token.underlying.address.toLowerCase()}`} alt={token.underlying.name} />
      </DeFiAssetImage>
      <PositionCardName style={{ opacity: isActive ? '.5' : '1' }} light={lightText}>
        {token.underlying.name}
      </PositionCardName>
      <PositionCardText t1 style={{ opacity: isActive ? '.5' : '1' }} light={lightText}>
        {truncateBalance(fixedTokenPositionBalance(token.underlying))}{' '}
        <TextSpan style={{ fontSize: '12px' }} light={lightText}>
          {token.underlying.symbol}
        </TextSpan>
      </PositionCardText>
      <PositionCardText t3 style={{ opacity: isActive ? '.5' : '1' }} light={lightText}>
        {truncateBalance(fixedTokenPositionBalance(token.token))}{' '}
        <TextSpan style={{ fontSize: '12px' }} light={lightText}>
          {token.underlying.symbol}
        </TextSpan>
      </PositionCardText>
      <PositionCardButton>
        {isActive ? (
          <Button widthP={width > MAX_MOBILE_SCREEN_WIDTH ? undefined : 100} light={lightText}>
            Manage
          </Button>
        ) : (
          <Button widthP={width > MAX_MOBILE_SCREEN_WIDTH ? undefined : 100} light={lightText}>
            {isSelected ? 'Deselect' : 'Select'}
          </Button>
        )}
      </PositionCardButton>
    </PositionCard>
  )
}
