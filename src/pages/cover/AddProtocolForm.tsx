import { ProtocolMap } from '@solace-fi/sdk-nightly'
import React, { useMemo, useState } from 'react'
import { ThinButton, GraySquareButton } from '../../components/atoms/Button'
import { StyledArrowDropDown, StyledClose } from '../../components/atoms/Icon'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { SmallerInputSection } from '../../components/molecules/InputSection'
import { LocalSolaceRiskProtocol } from '../../constants/types'
import { filterAmount } from '../../utils/formatting'
import { useCoverageContext } from './CoverageContext'
import { DropdownOptionsUnique, processProtocolName } from './Dropdown'
import { formatAmount } from '../../utils/formatting'
import { Button } from '../../components/atoms/Button'

export default function AddProtocolForm({
  editableProtocols,
  onAddProtocol,
  setIsAddingProtocol,
}: {
  editableProtocols: LocalSolaceRiskProtocol[]
  onAddProtocol: (protocolMap: ProtocolMap, balance: string) => void
  setIsAddingProtocol: (bool: boolean) => void
}): React.ReactElement {
  const { seriesKit } = useCoverageContext()
  const { series, seriesLogos } = seriesKit
  const [dropdownOpen, setDropdownOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const [enteredBalance, setEnteredBalance] = useState<string>('')
  const [enteredProtocolMap, setEnteredProtocolMap] = useState<ProtocolMap | undefined>(undefined)

  // input ref to focus
  const inputRef = React.useRef<HTMLInputElement>(null)
  // when enteredProtocolMap changes and is not undefined, focus input
  React.useEffect(() => {
    if (enteredProtocolMap) {
      inputRef.current?.focus()
    }
  }, [enteredProtocolMap])

  const isValidProtocol = useMemo(() => {
    if (!series) return false
    return series.data.protocolMap.find((p) => p.appId.toLowerCase() == enteredProtocolMap?.appId.toLowerCase())
  }, [enteredProtocolMap, series])

  const protocolOptions = useMemo(() => seriesLogos, [seriesLogos])

  const activeList = useMemo(
    () =>
      searchTerm ? protocolOptions.filter((item) => item.label.includes(searchTerm.toLowerCase())) : protocolOptions,
    [searchTerm, protocolOptions]
  )

  const cachedDropdownOptions = useMemo(
    () => (
      <DropdownOptionsUnique
        comparingList={editableProtocols.map((p) => p.appId)}
        isOpen={dropdownOpen}
        searchedList={activeList}
        noneText={'No matching protocols found'}
        onClick={(value: string) => {
          if (!series) return
          const foundProtocol = series.data.protocolMap.find((p) => p.appId.toLowerCase() == value.toLowerCase())
          if (!foundProtocol) return
          setEnteredProtocolMap(foundProtocol)
          setDropdownOpen(false)
        }}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editableProtocols, dropdownOpen, activeList]
  )

  return (
    <>
      <Flex
        gap={8}
        style={{
          width: '100%',
        }}
      >
        <ThinButton
          onClick={() => {
            setDropdownOpen(!dropdownOpen)
          }}
        >
          <Flex style={{ width: '100%' }} itemsCenter>
            <Text autoAlignVertical p={5}>
              {enteredProtocolMap && isValidProtocol && (
                <img src={`https://assets.solace.fi/zapperLogos/${enteredProtocolMap.appId}`} height={16} />
              )}
            </Text>
            <Text t5s style={{ width: '100%' }}>
              <Flex between>
                <Text t5s techygradient mont>
                  {enteredProtocolMap ? processProtocolName(enteredProtocolMap.appId) : 'Choose Protocol'}
                </Text>
                <StyledArrowDropDown size={16} />
              </Flex>
            </Text>
          </Flex>
        </ThinButton>
        <SmallerInputSection
          ref={inputRef}
          placeholder={'Enter amount'}
          value={enteredBalance}
          onChange={(e) => {
            const filtered = filterAmount(e.target.value, enteredBalance)
            setEnteredBalance(filtered)
          }}
          style={{
            maxWidth: '120px',
            width: '120px',
            minWidth: '120px',
            maxHeight: '36px',
          }}
          asideBg
        />
        <GraySquareButton
          width={32}
          height={32}
          noborder
          onClick={() => {
            setIsAddingProtocol(false)
          }}
          darkText
        >
          <StyledClose size={16} />
        </GraySquareButton>
      </Flex>
      {dropdownOpen && (
        <SmallerInputSection
          placeholder={'Search Protocol'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            border: 'none',
            marginTop: '5px',
          }}
        />
      )}
      {cachedDropdownOptions}
      <Button
        techygradient
        noscaledown
        secondary
        noborder
        mt={12}
        onClick={() => {
          if (enteredProtocolMap) onAddProtocol(enteredProtocolMap, formatAmount(enteredBalance))
          setIsAddingProtocol(false)
        }}
        disabled={!enteredProtocolMap}
      >
        Save
      </Button>
    </>
  )
}
