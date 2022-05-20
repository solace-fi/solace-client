import React, { useEffect, useMemo, useState } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { Button } from '../../components/atoms/Button'
import { capitalizeFirstLetter, filterAmount } from '../../utils/formatting'
import { LocalSolaceRiskProtocol, SolaceRiskProtocol } from '../../constants/types'
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
  editableProtocols: LocalSolaceRiskProtocol[]
  riskColor: string
  simulating: boolean
  addItem: (index?: number | undefined) => void
  deleteItem: (targetAppId: string) => void
  editId: (targetAppId: string, newAppId: string) => void
  editAmount: (targetAppId: string, newAmount: string) => void
}> = ({ protocol, editableProtocols, riskColor, simulating, addItem, deleteItem, editId, editAmount }): JSX.Element => {
  const { series, styles } = useCoverageContext()
  const { gradientStyle } = styles

  const [protocolsOpen, setProtocolsOpen] = useState(false)
  const [enteredAmount, setEnteredAmount] = useState(protocol.balanceUSD.toString())
  const [searchTerm, setSearchTerm] = useState('')

  const simulatingPrev = usePrevious(simulating)

  const isValidProtocol = useMemo(() => {
    if (!series) return false
    return series.data.protocolMap.find((p) => p.appId.toLowerCase() == protocol.appId.toLowerCase())
  }, [protocol, series])

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

  const activeList = useMemo(
    () => (searchTerm ? protocolOptions.filter((item) => item.label.includes(searchTerm)) : protocolOptions),
    [searchTerm, protocolOptions]
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

  return (
    <div>
      <TileCard>
        <Flex col gap={8} style={{ position: 'relative' }}>
          <Button
            width={30}
            height={30}
            style={{ position: 'absolute', top: '-25px', right: '-25px' }}
            noborder
            error
            onClick={() => deleteItem(protocol.appId)}
          >
            <StyledClose size={16} />
          </Button>
          <Flex stretch between gap={10}>
            <div
              onClick={() => setProtocolsOpen(!protocolsOpen)}
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
                  value={capitalizeFirstLetter(protocol.appId.includes('Unknown') ? 'Unknown' : protocol.appId)}
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
                  &#11206;
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
          {!protocolsOpen && (
            <Flex between itemsCenter>
              <Flex col w={100}>
                <Text t7 bold>
                  Category:
                </Text>
                <Text t6>{capitalizeFirstLetter(protocol.category)}</Text>
              </Flex>
              <Flex col w={52}>
                <Text t7 bold>
                  Risk Level:
                </Text>
                <Text style={{ color: riskColor }} t6>
                  {protocol.tier}
                </Text>
              </Flex>
              <Button {...gradientStyle} width={50} secondary onClick={() => addItem(protocol.index)} noborder>
                <StyledAdd size={20} />
              </Button>
            </Flex>
          )}
        </Flex>
        <Accordion noScroll isOpen={protocolsOpen} style={{ backgroundColor: 'inherit' }}>
          <div style={{ padding: 8 }}>
            <Flex col gap={8}>
              <div>
                {protocolsOpen && (
                  <GenericInputSection
                    placeholder={'Search Protocol'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    h={48}
                  />
                )}
                <DropdownOptionsUnique
                  comparingList={editableProtocols.map((p) => p.appId.toLowerCase())}
                  isOpen={protocolsOpen}
                  searchedList={activeList}
                  noneText={'No matching protocols found'}
                  onClick={(value: string) => {
                    editId(protocol.appId, value)
                    setProtocolsOpen(false)
                  }}
                />
              </div>
            </Flex>
          </div>
        </Accordion>
      </TileCard>
    </div>
  )
}
