/*

  import packages
  import managers
  import constants
  import hooks
  import utils

  NftPositionCard
    hooks

*/

/* import packages */
import React, { useMemo } from 'react'

/* import managers */
import { useGeneral } from '../../../context/GeneralProvider'

/* import constants */
import { BKPT_3 } from '../../../constants'
import { Position, Token, Policy, TokenData } from '../../../constants/types'

/* import components */
import { PositionCard } from '../../atoms/Card'
import { PositionCardButton, PositionCardText, PositionCardName } from '../../atoms/DeFiAsset'
import { Button } from '../../atoms/Button'

/* import hooks */
import { useWindowDimensions } from '../../../hooks/useWindowDimensions'

/* import utils */
import { trim0x } from '../../../utils/formatting'
import { userHasActiveProductPosition } from '../../../utils/policy'

interface NftPositionCardProps {
  position: Position
  protocolName: string
  selectedPositions: Position[]
  userPolicies: Policy[]
  openManageModal: (policy: Policy) => Promise<void>
  handleSelect: (position: Position) => void
}

export const NftPositionCard: React.FC<NftPositionCardProps> = ({
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

  const token: Token = useMemo(() => position.position as Token, [position.position])
  const isSelected = useMemo(
    () =>
      selectedPositions.some(
        (selectedPosition) => (selectedPosition.position as Token).token.address == token.token.address
      ),
    [selectedPositions, token]
  )
  const isActive = useMemo(() => userHasActiveProductPosition(userPolicies, protocolName, token.token.address), [
    protocolName,
    token,
    userPolicies,
  ])
  const lightText = useMemo(() => isSelected || isActive, [isSelected, isActive])
  const foundPosition = useMemo(
    () =>
      userPolicies.filter(
        (policy) =>
          policy.productName == protocolName && policy.positionDescription.includes(trim0x(token.token.address))
      )[0],
    [protocolName, token.token.address, userPolicies]
  )

  return (
    <PositionCard
      key={token.token.address}
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
