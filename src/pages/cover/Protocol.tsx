import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { Button, GraySquareButton, ThinButton } from '../../components/atoms/Button'
import { capitalizeFirstLetter, filterAmount } from '../../utils/formatting'
import { LocalSolaceRiskProtocol } from '../../constants/types'
import { useCoverageContext } from './CoverageContext'
import { Accordion } from '../../components/atoms/Accordion'
import { TileCard } from '../../components/molecules/TileCard'
import { DropdownOptionsUnique, processProtocolName } from './Dropdown'
import { StyledArrowDropDown, StyledClose, StyledHelpCircle } from '../../components/atoms/Icon'
import { SmallerInputSection } from '../../components/molecules/InputSection'
import usePrevious from '../../hooks/internal/usePrevious'
import useDebounce from '@rooks/use-debounce'

function mapNumberToLetter(number: number): string {
  return String.fromCharCode(97 + number - 1).toUpperCase()
}

export const Protocol: React.FC<{
  protocol: LocalSolaceRiskProtocol
  editableProtocolAppIds: string[]
  riskColor: string
  simulating: boolean
  editingItem: string | undefined
  // addItem: (index?: number | undefined) => void
  saveEditedItem: (targetAppId: string, newAppId: string, newAmount: string) => boolean
  deleteItem: (targetAppId: string) => void
  handleEditingItem: (appId: string | undefined) => void
}> = ({
  protocol,
  editableProtocolAppIds,
  riskColor,
  simulating,
  editingItem,
  // addItem,
  deleteItem,
  saveEditedItem,
  handleEditingItem,
}): JSX.Element => {
  const { seriesKit, styles } = useCoverageContext()
  const { series, seriesLogos } = seriesKit
  const { gradientStyle } = styles

  const [isEditing, setIsEditing] = useState(false)
  const [accordionOpen, setAccordionOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [enteredAppId, setEnteredAppId] = useState<string>(protocol.appId)
  const [enteredAmount, setEnteredAmount] = useState(
    protocol.balanceUSD.toString() == '0' ? '' : protocol.balanceUSD.toString()
  )
  const [searchTerm, setSearchTerm] = useState('')

  const simulatingPrev = usePrevious(simulating)

  const isValidProtocol = useMemo(() => {
    if (!series) return false
    return series.data.protocolMap.find((p) => p.appId.toLowerCase() == protocol.appId.toLowerCase())
  }, [protocol, series])

  const protocolOptions = useMemo(() => seriesLogos, [seriesLogos])

  const activeList = useMemo(
    () => (searchTerm ? protocolOptions.filter((item) => item.label.includes(searchTerm)) : protocolOptions),
    [searchTerm, protocolOptions]
  )

  // const processListItem = (listItem: { label: string; value: string; icon: JSX.Element }) => ({
  //   label: listItem.label,
  //   value: listItem.value,
  //   icon: listItem.icon,
  //   name: processProtocolName(listItem.value),
  // })

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

  // useEffect(() => {
  //   if (!simulatingPrev && simulating) close()
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [simulatingPrev, simulating])

  const handleSaveEditedItem = useCallback(() => {
    const status = saveEditedItem(protocol.appId, enteredAppId, enteredAmount)
    if (status) handleEditingItem(undefined)
  }, [enteredAmount, enteredAppId, protocol.appId, saveEditedItem, handleEditingItem])

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
    if (!editingItem || (editingItem && editingItem.toString() !== protocol.appId.toString())) {
      setIsEditing(false)
      setAccordionOpen(false)
      setDropdownOpen(false)
    }
  }, [editingItem, protocol])

  return (
    <div>
      <TileCard
        padding={16}
        onClick={() => {
          if (!isEditing) {
            setIsEditing(true)
            handleEditingItem(protocol.appId)
          }
        }}
        style={{ position: 'relative', width: '100%', cursor: isEditing ? 'default' : 'pointer' }}
      >
        {/* <Button
          {...gradientStyle}
          width={30}
          height={30}
          onClick={() => addItem(protocol.index - 1)}
          noborder
          nohover
          style={{ position: 'absolute', top: '0px', left: '0px' }}
        >
          <StyledAdd size={20} />
        </Button> */}
        {/* <Button
          {...gradientStyle}
          width={30}
          height={30}
          onClick={() => addItem(protocol.index)}
          noborder
          nohover
          style={{ position: 'absolute', bottom: '0px', left: '0px' }}
        >
          <StyledAdd size={20} />
        </Button> */}
        {/* <Button
          width={30}
          height={30}
          style={{ position: 'absolute', top: '0px', right: '0px' }}
          noborder
          nohover
          error
          onClick={() => deleteItem(protocol.appId)}
        >
          <StyledClose size={16} />
        </Button> */}
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
                        ) : (
                          // <StyledHelpCircle size={16} />
                          <></>
                        )}
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
                    </Flex>
                  </ThinButton>
                </div>
                <SmallerInputSection
                  placeholder={'Enter USD Amount'}
                  value={enteredAmount}
                  onChange={(e) => setEnteredAmount(filterAmount(e.target.value, enteredAmount))}
                  style={{
                    maxWidth: '106px',
                    width: '106px',
                    minWidth: '106px',
                    maxHeight: '32px',
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
                    <Text autoAlignVertical>
                      {isValidProtocol ? (
                        <img src={`https://assets.solace.fi/zapperLogos/${protocol.appId}`} height={36} />
                      ) : (
                        <StyledHelpCircle size={36} />
                      )}
                    </Text>
                    <Flex col gap={5}>
                      {/* protocol name */}
                      <Text t5s bold>
                        {capitalizeFirstLetter(
                          protocol.appId.includes('Empty') ? 'Empty' : processProtocolName(protocol.appId)
                        )}
                      </Text>
                      {/* protocol category */}
                      <Text t5s>{capitalizeFirstLetter(protocol.category)}</Text>
                    </Flex>
                  </Flex>
                  <Flex col itemsEnd gap={2}>
                    {/* balance */}
                    <Flex itemsCenter>
                      <Text t3s bold>
                        ${protocol.balanceUSD.toString() == '0' ? '0' : protocol.balanceUSD.toString()}
                      </Text>
                    </Flex>
                    {/* risl level */}
                    <Flex itemsCenter gap={4}>
                      <Text t6s>Risk Level:</Text>
                      <Text t6s extrabold warmgradient>
                        {mapNumberToLetter(protocol.tier > 0 ? protocol.tier : 25)}
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
