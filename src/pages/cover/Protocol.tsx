import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { Button, GraySquareButton, ThinButton } from '../../components/atoms/Button'
import { capitalizeFirstLetter, filterAmount, truncateValue } from '../../utils/formatting'
import { LocalSolaceRiskProtocol } from '../../constants/types'
import { useCoverageContext } from './CoverageContext'
import { Accordion } from '../../components/atoms/Accordion'
import { TileCard } from '../../components/molecules/TileCard'
import { DropdownOptionsUnique, processProtocolName } from './Dropdown'
import { StyledArrowDropDown, StyledClose, StyledHelpCircle } from '../../components/atoms/Icon'
import { SmallerInputSection } from '../../components/molecules/InputSection'
import { networks } from '../../context/NetworkManager'
import commaNumber from '../../utils/commaNumber'

function mapNumberToLetter(number: number): string {
  const grade = {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
  }[number]
  if (grade) return grade
  return 'F'
}

export const ReadOnlyProtocol: React.FC<{
  protocol: LocalSolaceRiskProtocol
  riskColor: string
}> = ({ protocol, riskColor }): JSX.Element => {
  const networkLogos = useMemo(() => {
    return protocol.networks.map((_n) => {
      return networks.find((n) => n.name.toLowerCase() === _n.toLowerCase())?.logo
    })
  }, [protocol])

  return (
    <div>
      <TileCard padding={16} style={{ position: 'relative' }}>
        <Flex col gap={8}>
          <Flex stretch between gap={10}>
            <div
              style={{
                width: '100%',
              }}
            >
              <Flex between>
                <Flex itemsCenter gap={8}>
                  {/* protocol icon */}
                  <Flex>
                    <Text autoAlignVertical>
                      <img src={`https://assets.solace.fi/zapperLogos/${protocol.appId}`} height={36} />
                    </Text>
                  </Flex>
                  <Flex col gap={5}>
                    {/* protocol name */}
                    <Text t5s bold>
                      {capitalizeFirstLetter(
                        protocol.appId.includes('Empty') ? 'Empty' : processProtocolName(protocol.appId)
                      )}
                    </Text>
                    <Flex>
                      {networkLogos.map((logo, i) => {
                        if (logo) return <img key={i} src={logo} width={16} height={16} />
                        return <StyledHelpCircle key={i} size={16} />
                      })}
                    </Flex>
                  </Flex>
                </Flex>
                <Flex col itemsEnd gap={2}>
                  {/* balance */}
                  <Flex itemsCenter>
                    <Text t3s bold>
                      $
                      {commaNumber(
                        truncateValue(protocol.balanceUSD.toString() == '0' ? '0' : protocol.balanceUSD.toString(), 2)
                      )}
                    </Text>
                  </Flex>
                  {/* risl level */}
                  <Flex itemsCenter gap={4}>
                    <Text t6s>Risk Level:</Text>
                    <Text t6s extrabold style={{ color: riskColor }}>
                      {mapNumberToLetter(protocol.tier)}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </div>
          </Flex>
        </Flex>
      </TileCard>
    </div>
  )
}

export const Protocol: React.FC<{
  protocol: LocalSolaceRiskProtocol
  editableProtocolAppIds: string[]
  riskColor: string
  simulating: boolean
  editingItem: string | undefined
  saveEditedItem: (targetAppId: string, newAppId: string, newAmount: string) => boolean
  deleteItem: (targetAppId: string) => void
  handleEditingItem: (appId?: string) => void
}> = ({
  protocol,
  editableProtocolAppIds,
  riskColor,
  simulating,
  editingItem,
  deleteItem,
  saveEditedItem,
  handleEditingItem,
}): JSX.Element => {
  const { seriesKit } = useCoverageContext()
  const { series, seriesLogos } = seriesKit

  const [isEditing, setIsEditing] = useState(false)
  const [accordionOpen, setAccordionOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [enteredAppId, setEnteredAppId] = useState<string>(protocol.appId)
  const [enteredAmount, setEnteredAmount] = useState(
    protocol.balanceUSD.toString() == '0' ? '' : protocol.balanceUSD.toString()
  )
  const [searchTerm, setSearchTerm] = useState('')
  const networkLogos = useMemo(() => {
    return protocol.networks.map((_n) => {
      return networks.find((n) => n.name.toLowerCase() === _n.toLowerCase())?.logo
    })
  }, [protocol])

  const isValidProtocol = useMemo(() => {
    if (!series) return false
    return series.data.protocolMap.find((p) => p.appId.toLowerCase() == protocol.appId.toLowerCase())
  }, [protocol, series])

  const protocolOptions = useMemo(() => seriesLogos, [seriesLogos])

  const activeList = useMemo(
    () =>
      searchTerm ? protocolOptions.filter((item) => item.label.includes(searchTerm.toLowerCase())) : protocolOptions,
    [searchTerm, protocolOptions]
  )

  const cachedDropdownOptions = useMemo(
    () => (
      <DropdownOptionsUnique
        comparingList={editableProtocolAppIds}
        isOpen={dropdownOpen}
        searchedList={activeList}
        noneText={'No matching protocols found'}
        onClick={(value: string) => {
          setEnteredAppId(value)
          setDropdownOpen(false)
          setAccordionOpen(false)
        }}
      />
    ),
    [editableProtocolAppIds, dropdownOpen, activeList]
  )

  const handleSaveEditedItem = useCallback(() => {
    const status = saveEditedItem(protocol.appId, enteredAppId, enteredAmount)
    if (status) handleEditingItem(undefined)
  }, [enteredAmount, enteredAppId, protocol, saveEditedItem, handleEditingItem])

  useEffect(() => {
    setEnteredAmount(protocol.balanceUSD.toString() == '0' ? '' : protocol.balanceUSD.toString())
  }, [protocol.balanceUSD, editingItem])

  useEffect(() => {
    setEnteredAppId(protocol.appId)
  }, [protocol.appId, editingItem])

  useEffect(() => {
    if (!accordionOpen) {
      setTimeout(() => {
        setDropdownOpen(false)
      }, 100)
    } else {
      setDropdownOpen(true)
    }
  }, [accordionOpen])

  useEffect(() => {
    if (!editingItem || editingItem.toString() !== protocol.appId.toString()) {
      setIsEditing(false)
      setAccordionOpen(false)
      setDropdownOpen(false)
    }
  }, [editingItem, protocol])

  useEffect(() => {
    if (simulating) handleEditingItem(undefined)
  }, [simulating, handleEditingItem])

  return (
    <div>
      <TileCard
        padding={16}
        onClick={
          isEditing
            ? undefined
            : () => {
                if (!isEditing) {
                  setIsEditing(true)
                  handleEditingItem(protocol.appId)
                }
              }
        }
        style={{ position: 'relative', cursor: isEditing ? 'default' : 'pointer' }}
      >
        <Flex col gap={8}>
          <Flex stretch between gap={10}>
            {isEditing ? (
              <>
                <div
                  style={{
                    width: '100%',
                  }}
                >
                  <ThinButton
                    onClick={() => {
                      setAccordionOpen(!accordionOpen)
                    }}
                  >
                    <Flex itemsCenter={!!isValidProtocol} style={!isValidProtocol ? { width: '100%' } : {}}>
                      <Text autoAlignVertical p={5}>
                        {isValidProtocol ? (
                          <img src={`https://assets.solace.fi/zapperLogos/${enteredAppId}`} height={16} />
                        ) : null}
                      </Text>
                      <Text t5s style={!isValidProtocol ? { width: '100%' } : {}}>
                        {isValidProtocol ? (
                          processProtocolName(enteredAppId)
                        ) : (
                          <Flex between>
                            <Text t5s>
                              {capitalizeFirstLetter(enteredAppId.includes('Empty') ? 'Choose Protocol' : enteredAppId)}
                            </Text>
                            <StyledArrowDropDown size={16} />
                          </Flex>
                        )}
                      </Text>
                      <StyledArrowDropDown
                        style={{ transform: accordionOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        size={18}
                      />
                    </Flex>
                  </ThinButton>
                </div>
                <SmallerInputSection
                  placeholder={'Enter USD Amount'}
                  value={enteredAmount}
                  onChange={(e) => setEnteredAmount(filterAmount(e.target.value, enteredAmount))}
                  style={{
                    maxWidth: '110px',
                    width: '110px',
                    minWidth: '110px',
                    maxHeight: '36px',
                  }}
                  asideBg
                />
                <GraySquareButton width={32} height={32} noborder onClick={() => handleEditingItem(undefined)} darkText>
                  <StyledClose size={16} />
                </GraySquareButton>
              </>
            ) : (
              <div
                style={{
                  width: '100%',
                }}
              >
                <Flex between>
                  <Flex itemsCenter gap={8}>
                    {/* protocol icon */}
                    <Flex>
                      <Text autoAlignVertical>
                        {isValidProtocol ? (
                          <img src={`https://assets.solace.fi/zapperLogos/${protocol.appId}`} height={36} />
                        ) : (
                          <StyledHelpCircle size={36} />
                        )}
                      </Text>
                    </Flex>
                    <Flex col gap={5}>
                      {/* protocol name */}
                      <Text t5s bold>
                        {capitalizeFirstLetter(processProtocolName(protocol.appId))}
                      </Text>
                      <Flex>
                        {networkLogos.map((logo, i) => {
                          if (logo) return <img key={i} src={logo} width={16} height={16} />
                          return <StyledHelpCircle key={i} size={16} />
                        })}
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex col itemsEnd gap={2}>
                    {/* balance */}
                    <Flex itemsCenter>
                      <Text t3s bold>
                        $
                        {commaNumber(
                          truncateValue(protocol.balanceUSD.toString() == '0' ? '0' : protocol.balanceUSD.toString(), 2)
                        )}
                      </Text>
                    </Flex>
                    {/* risl level */}
                    <Flex itemsCenter gap={4}>
                      <Text t6s>Risk Level:</Text>
                      <Text t6s extrabold style={{ color: riskColor }}>
                        {mapNumberToLetter(protocol.tier)}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </div>
            )}
            {/* </InputSectionWrapper> */}
          </Flex>
        </Flex>
        {isEditing && (
          <Flex gap={8} mt={12}>
            <Button
              height={32}
              error
              onClick={() => deleteItem(protocol.appId)}
              width={100}
              style={{ borderRadius: '8px' }}
            >
              <Flex gap={4} itemsCenter>
                <StyledClose size={13.33} />
                <Text t5s bold>
                  Remove
                </Text>
              </Flex>
            </Button>
            <Button
              height={32}
              techygradient
              secondary
              noborder
              onClick={() => {
                handleSaveEditedItem()
              }}
              style={{ width: '100%', borderRadius: '8px' }}
            >
              <Flex gap={4} itemsCenter>
                <Text t5s bold>
                  Save
                </Text>
              </Flex>
            </Button>
          </Flex>
        )}
        <Accordion noScroll isOpen={accordionOpen} style={{ backgroundColor: 'inherit' }}>
          {/* <div style={{ padding: 8 }}> */}
          <Flex col gap={8} mt={12}>
            <div>
              {accordionOpen && (
                <SmallerInputSection
                  placeholder={'Search Protocol'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                  }}
                />
              )}
              {dropdownOpen && cachedDropdownOptions}
            </div>
          </Flex>
          {/* </div> */}
        </Accordion>
      </TileCard>
    </div>
  )
}
