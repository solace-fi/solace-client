import React, { useMemo, useState } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { capitalizeFirstLetter, truncateValue } from '../../utils/formatting'
import { SolaceRiskProtocol } from '../../constants/types'
import { useCoverageContext } from './CoverageContext'
import { useGeneral } from '../../context/GeneralManager'
import { Accordion } from '../../components/atoms/Accordion'
import { TileCard } from '../../components/molecules/TileCard'
import { DropdownInputSection, DropdownOptions } from './Dropdown'

export const Protocol: React.FC<{
  protocol: SolaceRiskProtocol
  editableProtocols: SolaceRiskProtocol[]
  riskColor: string
  deleteItem: (protocolAppId: string) => void
}> = ({ protocol, editableProtocols, riskColor, deleteItem }): JSX.Element => {
  const { appTheme } = useGeneral()
  const { series, styles } = useCoverageContext()
  const { gradientTextStyle, bigButtonStyle } = styles
  const [enteredAmount, setEnteredAmount] = useState('')
  const [enteredProtocolAppId, setEnteredProtocolAppId] = useState('')

  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [protocolsOpen, setProtocolsOpen] = useState(false)

  const protocolOptions = useMemo(
    () =>
      series
        ? series.data.protocolMap.map((s) => {
            return {
              label: s.appId,
              value: s.appId,
              icon: <img src={`https://assets.solace.fi/zapperLogos/${s.appId}`} height={24} />,
            }
          })
        : [],
    [series]
  )

  return (
    <TileCard>
      <Button
        noborder
        nohover
        style={{
          display: 'unset',
          backgroundColor: appTheme === 'light' ? '#FFFFFF' : '#2a2f3b',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Flex col gap={8}>
          <Flex stretch between>
            <Text t3>
              <Flex gap={8}>
                <img src={`https://assets.solace.fi/zapperLogos/${protocol.appId}`} height={24} />
                {capitalizeFirstLetter(protocol.appId)}
              </Flex>
            </Text>
            <Text t3 bold {...gradientTextStyle}>
              ${truncateValue(protocol.balanceUSD, 2)}
            </Text>
          </Flex>
          <Flex stretch between>
            <Text t4>
              <TextSpan bold>Category:</TextSpan> {capitalizeFirstLetter(protocol.category)}
            </Text>
            <Text t4>
              <TextSpan>Risk Level:</TextSpan>
              <TextSpan style={{ color: riskColor }}>{protocol.tier}</TextSpan>
            </Text>
          </Flex>
        </Flex>
      </Button>
      <Accordion noScroll isOpen={isOpen} style={{ backgroundColor: 'inherit' }}>
        <Flex pt={8}>
          {isEditing ? (
            <Flex col gap={8}>
              <div>
                <DropdownInputSection
                  hasArrow
                  placeholder={'Enter USD amount'}
                  icon={<img src={`https://assets.solace.fi/zapperLogos/${protocol.appId}`} height={16} />}
                  text={capitalizeFirstLetter(protocol.appId)}
                  value={enteredAmount}
                  onChange={(e) => setEnteredAmount(e.target.value)}
                  onClick={() => setProtocolsOpen(!protocolsOpen)}
                />
                <DropdownOptions
                  searchFeature
                  isOpen={protocolsOpen}
                  list={protocolOptions}
                  onClick={(value: string) => {
                    setEnteredProtocolAppId(value)
                    setProtocolsOpen(false)
                  }}
                />
              </div>
              <ButtonWrapper style={{ width: '100%' }} isColumn p={0}>
                <Button secondary {...bigButtonStyle} info onClick={() => setIsEditing(!isEditing)}>
                  Save Changes
                </Button>
                <Button secondary {...bigButtonStyle} matchBg onClick={() => deleteItem(protocol.appId)}>
                  Cancel
                </Button>
              </ButtonWrapper>
            </Flex>
          ) : (
            <ButtonWrapper style={{ width: '100%' }} isColumn p={0}>
              <Button secondary {...bigButtonStyle} info onClick={() => setIsEditing(!isEditing)}>
                Edit
              </Button>
              <Button secondary {...bigButtonStyle} matchBg onClick={() => deleteItem(protocol.appId)}>
                Delete
              </Button>
            </ButtonWrapper>
          )}
        </Flex>
      </Accordion>
    </TileCard>
  )
}
