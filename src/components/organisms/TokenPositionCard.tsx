import React, { useMemo } from 'react'

import { PositionCard } from '../atoms/Card'
import { PositionCardButton, PositionCardText, DeFiAssetImage, PositionCardName } from '../atoms/DeFiAsset'
import { Button } from '../atoms/Button'
import { TextSpan } from '../atoms/Typography'

import { useGeneral } from '../../context/GeneralProvider'

import { Position, Token, Policy, TokenData } from '../../constants/types'
import { BKPT_3 } from '../../constants'

import { useWindowDimensions } from '../../hooks/useWindowDimensions'

import { fixedTokenPositionBalance, truncateBalance } from '../../utils/formatting'

interface TokenPositionCardProps {
  position: Position
  protocolName: string
  selectedPositions: Position[]
  userPolicies: Policy[]
  openManageModal: (policy: Policy) => Promise<void>
  handleSelect: (position: Position) => void
  checkUserPositionsForAllUnderlying: (protocolName: string, underlying: TokenData[]) => boolean
}

export const TokenPositionCard: React.FC<TokenPositionCardProps> = ({
  position,
  protocolName,
  selectedPositions,
  userPolicies,
  openManageModal,
  handleSelect,
  checkUserPositionsForAllUnderlying,
}) => {
  const { errors } = useGeneral()
  const { width } = useWindowDimensions()

  const token: Token = useMemo(() => position.position as Token, [position.position])
  const isSelected = useMemo(
    () =>
      selectedPositions.some(
        (selectedPosition) => (selectedPosition.position as Token).token.address == token.token.address
      ),
    [selectedPositions, token]
  )

  const isActive = useMemo(() => checkUserPositionsForAllUnderlying(protocolName, token.underlying), [
    protocolName,
    token,
    checkUserPositionsForAllUnderlying,
  ])
  const lightText = isSelected || isActive

  const checkPolicyPositionsForAllUnderlying = (positionNames: string[], underlying: TokenData[]) => {
    for (let i = 0; i < underlying.length; i++) {
      if (positionNames.includes(underlying[i].symbol)) return true
    }
    return false
  }

  return (
    <PositionCard
      key={token.token.address}
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
                    policy.productName == protocolName &&
                    checkPolicyPositionsForAllUnderlying(policy.positionNames, token.underlying)
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
      {token.underlying.map((underlyingToken: TokenData) => (
        <DeFiAssetImage noborder style={{ opacity: isActive ? '.5' : '1' }} key={underlyingToken.address}>
          <img src={`https://assets.solace.fi/${underlyingToken.address.toLowerCase()}`} alt={underlyingToken.name} />
        </DeFiAssetImage>
      ))}
      <PositionCardName style={{ opacity: isActive ? '.5' : '1' }} light={lightText}>
        {token.underlying.map((underlyingToken: TokenData, i) => {
          if (i + 1 < token.underlying.length) return `${underlyingToken.name} - `
          return `${underlyingToken.name}`
        })}
      </PositionCardName>
      {token.underlying.map((underlyingToken: TokenData) => (
        <PositionCardText t1 style={{ opacity: isActive ? '.5' : '1' }} light={lightText} key={underlyingToken.symbol}>
          {truncateBalance(fixedTokenPositionBalance(underlyingToken))}{' '}
          <TextSpan style={{ fontSize: '12px' }} light={lightText}>
            {underlyingToken.symbol}
          </TextSpan>
        </PositionCardText>
      ))}
      <PositionCardText t3 style={{ opacity: isActive ? '.5' : '1' }} light={lightText}>
        {truncateBalance(fixedTokenPositionBalance(token.token))}{' '}
        <TextSpan style={{ fontSize: '12px' }} light={lightText}>
          {token.token.symbol}
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
