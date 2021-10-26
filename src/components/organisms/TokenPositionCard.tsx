/*

  import packages
  import managers
  import constants
  import hooks
  import utils

  TokenPositionCard
    hooks

*/

/* import packages */
import React, { useMemo } from 'react'

/* import managers */
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */
import { BKPT_3 } from '../../constants'
import { Position, Token, Policy, TokenData } from '../../constants/types'

/* import components */
import { PositionCard } from '../atoms/Card'
import { PositionCardButton, PositionCardText, DeFiAssetImage, PositionCardName } from '../atoms/DeFiAsset'
import { Button } from '../atoms/Button'
import { TextSpan } from '../atoms/Typography'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { fixedTokenPositionBalance, truncateBalance } from '../../utils/formatting'

interface TokenPositionCardProps {
  position: Position
  protocolName: string
  selectedPositions: Position[]
  userPolicies: Policy[]
  openManageModal: (policy: Policy) => Promise<void>
  handleSelect: (position: Position) => void
  userHasActiveProductPosition: (product: string, address: string) => boolean
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
  /*

    hooks

  */

  const { haveErrors } = useGeneral()
  const { width } = useWindowDimensions()

  const token: Token = useMemo(() => position.position as Token, [position.position])
  const isSelected = useMemo(
    () =>
      selectedPositions.some(
        (selectedPosition) => (selectedPosition.position as Token).token.address == token.token.address
      ),
    [selectedPositions, token]
  )
  const isActive = useMemo(() => userHasActiveProductPosition(protocolName, token.token.address), [
    protocolName,
    token,
    userHasActiveProductPosition,
  ])
  const lightText = isSelected || isActive
  return (
    <PositionCard
      key={token.token.address}
      color1={isSelected}
      glow={isSelected}
      fade={isActive}
      onClick={
        haveErrors
          ? undefined
          : isActive
          ? () => {
              openManageModal(
                userPolicies.filter(
                  (policy) =>
                    policy.productName == protocolName && policy.positionDescription.includes(token.token.address)
                )[0]
              )
            }
          : () => handleSelect(position)
      }
    >
      {isActive && (
        <PositionCardText style={{ opacity: '.8' }} light={lightText}>
          This position is already covered
        </PositionCardText>
      )}
      <DeFiAssetImage noborder style={{ opacity: isActive ? '.5' : '1' }} key={token.token.address}>
        <img src={`https://assets.solace.fi/${token.token.address.toLowerCase()}`} alt={token.token.name} />
      </DeFiAssetImage>
      <PositionCardName bold style={{ opacity: isActive ? '.5' : '1' }} light={lightText}>
        {token.token.name}
      </PositionCardName>
      {!(token.underlying.length == 1 && token.underlying[0].name == token.token.name) && (
        <PositionCardName style={{ opacity: isActive ? '.5' : '1' }} light={lightText}>
          {token.underlying.map((underlyingToken: TokenData, i) => {
            if (i + 1 < token.underlying.length) return `${underlyingToken.name} - `
            return `${underlyingToken.name}`
          })}
        </PositionCardName>
      )}
      <PositionCardText t2 style={{ opacity: isActive ? '.5' : '1' }} light={lightText}>
        {truncateBalance(fixedTokenPositionBalance(token.token))}{' '}
        <TextSpan style={{ fontSize: '12px' }} light={lightText}>
          {token.token.symbol}
        </TextSpan>
      </PositionCardText>
      {/* {token.underlying.map((underlyingToken: TokenData, i) => (
        <PositionCardText t3 style={{ opacity: isActive ? '.5' : '1' }} light={lightText} key={i}>
          {truncateBalance(fixedTokenPositionBalance(underlyingToken))}{' '}
          <TextSpan style={{ fontSize: '12px' }} light={lightText}>
            {underlyingToken.symbol}
          </TextSpan>
        </PositionCardText>
      ))} */}
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
