import React, { useEffect, useMemo, useState } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { capitalizeFirstLetter, filterAmount, truncateValue } from '../../utils/formatting'
import { SolaceRiskProtocol } from '../../constants/types'
import { useCoverageContext } from './CoverageContext'
import { Accordion } from '../../components/atoms/Accordion'
import { TileCard } from '../../components/molecules/TileCard'
import { DropdownInputSection, DropdownOptions } from './Dropdown'
import { StyledHelpCircle } from '../../components/atoms/Icon'
import { GenericInputSection } from '../../components/molecules/InputSection'
import usePrevious from '../../hooks/internal/usePrevious'

export const Protocol: React.FC<{
  protocol: SolaceRiskProtocol
  editableProtocols: SolaceRiskProtocol[]
  riskColor: string
  simulating: boolean
  deleteItem: (protocolAppId: string) => void
  editItem: (targetAppId: string, newAppId: string, newAmount: string) => void
}> = ({ protocol, editableProtocols, riskColor, simulating, deleteItem, editItem }): JSX.Element => {
  const { series, styles } = useCoverageContext()
  const { gradientTextStyle, bigButtonStyle } = styles
  const [enteredAmount, setEnteredAmount] = useState(protocol.balanceUSD.toString())
  const [enteredProtocolAppId, setEnteredProtocolAppId] = useState(protocol.appId)

  const edited = useMemo(
    () => enteredAmount !== protocol.balanceUSD.toString() || enteredProtocolAppId !== protocol.appId,
    [enteredAmount, enteredProtocolAppId, protocol.appId, protocol.balanceUSD]
  )

  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [protocolsOpen, setProtocolsOpen] = useState(false)
  const simulatingPrev = usePrevious(simulating)

  const isValidProtocol = useMemo(() => {
    if (!series) return false
    return series.data.protocolMap.find((p) => p.appId.toLowerCase() == protocol.appId.toLowerCase())
  }, [protocol, series])

  const isValidEnteredProtocol = useMemo(() => {
    if (!series) return false
    return series.data.protocolMap.find((p) => p.appId.toLowerCase() == enteredProtocolAppId.toLowerCase())
  }, [enteredProtocolAppId, series])

  const isValidEnteredUniqueProtocol = useMemo(() => {
    if (!series) return false
    return (
      (!editableProtocols.map((p) => p.appId.toLowerCase()).includes(enteredProtocolAppId.toLowerCase()) ||
        protocol.appId.toLowerCase() === enteredProtocolAppId.toLowerCase()) &&
      series.data.protocolMap.find((p) => p.appId.toLowerCase() == enteredProtocolAppId.toLowerCase())
    )
  }, [editableProtocols, enteredProtocolAppId, series, protocol.appId])

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

  const [searchTerm, setSearchTerm] = useState('')

  const activeList = useMemo(
    () => (searchTerm ? protocolOptions.filter((item) => item.label.includes(searchTerm)) : protocolOptions),
    [searchTerm, protocolOptions]
  )

  const close = () => {
    setEnteredProtocolAppId(protocol.appId)
    setEnteredAmount(protocol.balanceUSD.toString())
    setIsOpen(false)
    setIsEditing(false)
    setProtocolsOpen(false)
  }

  useEffect(() => {
    if (!simulatingPrev && simulating) close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulatingPrev, simulating])

  return (
    <div
      onClick={() => (!isOpen && !simulating ? setIsOpen(!isOpen) : undefined)}
      style={{ cursor: !isOpen ? 'pointer' : 'unset' }}
    >
      <TileCard>
        <Button
          noborder
          nohover
          style={{
            display: 'unset',
          }}
          onClick={isOpen ? () => close() : undefined}
        >
          <Flex col gap={8}>
            <Flex stretch between>
              <Text t3>
                <Flex gap={8}>
                  {isValidProtocol ? (
                    <img src={`https://assets.solace.fi/zapperLogos/${protocol.appId}`} height={24} />
                  ) : (
                    <StyledHelpCircle size={24} />
                  )}
                  {capitalizeFirstLetter(protocol.appId.includes('Unknown') ? 'Unknown' : protocol.appId)}
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
                <TextSpan>Risk Level: </TextSpan>
                <TextSpan style={{ color: riskColor }}>{protocol.tier}</TextSpan>
              </Text>
            </Flex>
          </Flex>
        </Button>
        <Accordion noScroll isOpen={isOpen} style={{ backgroundColor: 'inherit' }}>
          <div style={{ padding: 8 }}>
            {isEditing ? (
              <Flex col gap={8}>
                <div>
                  <DropdownInputSection
                    hasArrow
                    placeholder={'Enter USD amount'}
                    icon={
                      isValidEnteredProtocol ? (
                        <img src={`https://assets.solace.fi/zapperLogos/${enteredProtocolAppId}`} height={16} />
                      ) : undefined
                    }
                    text={capitalizeFirstLetter(
                      enteredProtocolAppId.includes('Unknown') ? 'Unknown' : enteredProtocolAppId
                    )}
                    value={enteredAmount}
                    onChange={(e) => setEnteredAmount(filterAmount(e.target.value, enteredAmount))}
                    onClick={() => setProtocolsOpen(!protocolsOpen)}
                    style={{ marginBottom: 8 }}
                  />
                  {protocolsOpen && (
                    <GenericInputSection
                      placeholder={'Search Protocol'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      h={48}
                    />
                  )}
                  <DropdownOptions
                    searchFeature
                    isOpen={protocolsOpen}
                    list={activeList}
                    noneText={'No matching protocols found'}
                    onClick={(value: string) => {
                      setEnteredProtocolAppId(value)
                      setProtocolsOpen(false)
                    }}
                  />
                </div>
                <ButtonWrapper style={{ width: '100%' }} isColumn p={0}>
                  <Button
                    secondary
                    separator
                    {...bigButtonStyle}
                    info
                    onClick={() => {
                      editItem(protocol.appId, enteredProtocolAppId, enteredAmount)
                      setIsEditing(false)
                    }}
                    disabled={!isValidEnteredUniqueProtocol || !edited}
                  >
                    Save Changes
                  </Button>
                  <Button
                    secondary
                    separator
                    {...bigButtonStyle}
                    matchBg
                    onClick={() => {
                      setEnteredProtocolAppId(protocol.appId)
                      setEnteredAmount(protocol.balanceUSD.toString())
                      setIsEditing(false)
                      setProtocolsOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                </ButtonWrapper>
              </Flex>
            ) : (
              <ButtonWrapper style={{ width: '100%' }} isColumn p={0}>
                <Button secondary {...bigButtonStyle} info onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button secondary {...bigButtonStyle} matchBg onClick={() => deleteItem(protocol.appId)}>
                  Delete
                </Button>
              </ButtonWrapper>
            )}
          </div>
        </Accordion>
      </TileCard>
    </div>
  )
}
