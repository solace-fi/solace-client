import React, { useEffect, useMemo, useState } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { Button } from '../../components/atoms/Button'
import { capitalizeFirstLetter, filterAmount } from '../../utils/formatting'
import { LocalSolaceRiskProtocol } from '../../constants/types'
import { useCoverageContext } from './CoverageContext'
import { Accordion } from '../../components/atoms/Accordion'
import { TileCard } from '../../components/molecules/TileCard'
import { DropdownOptionsUnique } from './Dropdown'
import { StyledAdd, StyledClose, StyledHelpCircle } from '../../components/atoms/Icon'
import { GenericInputSection, StyledInput } from '../../components/molecules/InputSection'
import usePrevious from '../../hooks/internal/usePrevious'
import { InputSectionWrapper } from '../../components/atoms/Input'
import useDebounce from '@rooks/use-debounce'

export const Protocol: React.FC<{
  protocol: LocalSolaceRiskProtocol
  editableProtocolAppIds: string[]
  riskColor: string
  simulating: boolean
  editingItem: string | undefined
  addItem: (index?: number | undefined) => void
  deleteItem: (targetAppId: string) => void
  editId: (targetAppId: string, newAppId: string) => void
  editAmount: (targetAppId: string, newAmount: string) => void
  handleEditingItem: (appId: string | undefined) => void
}> = ({
  protocol,
  editableProtocolAppIds,
  riskColor,
  simulating,
  editingItem,
  addItem,
  deleteItem,
  editId,
  editAmount,
  handleEditingItem,
}): JSX.Element => {
  const { seriesKit, styles } = useCoverageContext()
  const { series, seriesLogos } = seriesKit
  const { gradientStyle } = styles

  const [protocolsOpen, setProtocolsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
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

  const cachedDropdownOptions = useMemo(
    () => (
      <DropdownOptionsUnique
        comparingList={editableProtocolAppIds}
        isOpen={dropdownOpen}
        searchedList={activeList}
        noneText={'No matching protocols found'}
        onClick={(value: string) => {
          editId(protocol.appId, value)
          handleEditingItem(undefined)
          setProtocolsOpen(false)
        }}
      />
    ),
    [editId, editableProtocolAppIds, handleEditingItem, dropdownOpen, protocol.appId, activeList]
  )

  const close = () => {
    setProtocolsOpen(false)
  }

  const _editAmount = useDebounce(() => {
    editAmount(protocol.appId, enteredAmount)
  }, 300)

  useEffect(() => {
    if (!simulatingPrev && simulating) close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulatingPrev, simulating])

  useEffect(() => {
    _editAmount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enteredAmount])

  useEffect(() => {
    setEnteredAmount(protocol.balanceUSD.toString() == '0' ? '' : protocol.balanceUSD.toString())
  }, [protocol.balanceUSD])

  useEffect(() => {
    if (!protocolsOpen) {
      setTimeout(() => {
        setDropdownOpen(false)
      }, 100)
    } else {
      setDropdownOpen(true)
    }
  }, [protocolsOpen])

  useEffect(() => {
    if (!editingItem || (editingItem && editingItem.toString() !== protocol.appId.toString())) {
      setProtocolsOpen(false)
    }
  }, [editingItem, protocol.appId])

  return (
    <div>
      <TileCard style={{ position: 'relative' }}>
        <Button
          {...gradientStyle}
          width={30}
          height={30}
          onClick={() => addItem(protocol.index - 1)}
          noborder
          nohover
          style={{ position: 'absolute', top: '0px', left: '0px' }}
        >
          <StyledAdd size={20} />
        </Button>
        <Button
          {...gradientStyle}
          width={30}
          height={30}
          onClick={() => addItem(protocol.index)}
          noborder
          nohover
          style={{ position: 'absolute', bottom: '0px', left: '0px' }}
        >
          <StyledAdd size={20} />
        </Button>
        <Button
          width={30}
          height={30}
          style={{ position: 'absolute', top: '0px', right: '0px' }}
          noborder
          nohover
          error
          onClick={() => deleteItem(protocol.appId)}
        >
          <StyledClose size={16} />
        </Button>
        <Flex between itemsCenter style={{ position: 'absolute', right: '30px', bottom: '5px' }} gap={20}>
          <Flex col w={200}>
            <Text t6 bold textAlignRight>
              {capitalizeFirstLetter(protocol.category)}
            </Text>
          </Flex>
          <Flex col w={100}>
            <Text t6 bold textAlignRight>
              Risk Level: <TextSpan style={{ color: riskColor }}>{protocol.tier}</TextSpan>
            </Text>
          </Flex>
        </Flex>
        <Flex col gap={8}>
          <Flex stretch between gap={10}>
            <div
              onClick={() => {
                setProtocolsOpen(!protocolsOpen)
                handleEditingItem(protocolsOpen ? undefined : protocol.appId)
              }}
              style={{
                width: '100%',
                cursor: 'pointer',
              }}
            >
              <InputSectionWrapper
                style={{
                  width: '100%',
                  height: '40px',
                }}
              >
                <Text autoAlignVertical p={5}>
                  {isValidProtocol ? (
                    <img src={`https://assets.solace.fi/zapperLogos/${protocol.appId}`} height={16} />
                  ) : (
                    <StyledHelpCircle size={16} />
                  )}
                </Text>
                <StyledInput
                  type="text"
                  className="py-3 lg:py-5 px-2 outline-none rounded-xl lg:border-0 lg:rounded-none"
                  value={capitalizeFirstLetter(protocol.appId.includes('Empty') ? 'Empty' : protocol.appId)}
                  onChange={() => undefined}
                  style={{
                    backgroundColor: 'inherit',
                    color: 'inherit',
                    borderRadius: 'inherit',
                    width: '100%',
                    cursor: 'pointer',
                  }}
                  readOnly
                />
                <Text
                  p={5}
                  autoAlignVertical
                  {...gradientStyle}
                  style={{ transform: protocolsOpen ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '12px' }}
                >
                  ⯆
                </Text>
              </InputSectionWrapper>
            </div>
            <InputSectionWrapper
              style={{
                width: '60%',
                height: '40px',
              }}
            >
              <StyledInput
                type="text"
                className="py-3 lg:py-5 px-3 outline-none rounded-xl lg:border-0 lg:rounded-none"
                value={enteredAmount}
                onChange={(e) => setEnteredAmount(filterAmount(e.target.value, enteredAmount))}
                style={{
                  backgroundColor: 'inherit',
                  color: 'inherit',
                  borderRadius: 'inherit',
                  width: '100%',
                }}
              />
            </InputSectionWrapper>
          </Flex>
        </Flex>
        <Accordion noScroll isOpen={protocolsOpen} style={{ backgroundColor: 'inherit' }}>
          <div style={{ padding: 8 }}>
            <Flex col gap={8}>
              <div>
                <GenericInputSection
                  placeholder={'Search Protocol'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  h={48}
                />
                {dropdownOpen && cachedDropdownOptions}
              </div>
            </Flex>
          </div>
        </Accordion>
      </TileCard>
    </div>
  )
}
