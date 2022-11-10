import React, { useCallback, useState } from 'react'
import { StyledArrowDropDown } from '../../components/atoms/Icon'
import { Flex, Scrollable } from '../../components/atoms/Layout'
import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from '../../components/atoms/Table'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { Z_TABLE } from '../../constants'
import { truncateValue } from '../../utils/formatting'
import { useAnalyticsContext } from './AnalyticsContext'

export const TokenTable = ({ chosenHeightPx }: { chosenHeightPx: number }) => {
  const { data } = useAnalyticsContext()
  const { tokenDetails } = data

  const [selectedSort, setSelectedSort] = useState('WD')

  const modifiedSort = useCallback(
    (a, b) => {
      switch (selectedSort) {
        case 'TA':
          return a.symbol.localeCompare(b.symbol)
        case 'TD':
          return b.symbol.localeCompare(a.symbol)
        case 'PA':
          return a.price - b.price
        case 'PD':
          return b.price - a.price
        case 'WA':
          return a.weight - b.weight
        case 'WD':
        default:
          return b.weight - a.weight
      }
    },
    [selectedSort]
  )

  return (
    <Scrollable
      style={{ padding: '0 10px 0 10px' }}
      maxDesktopHeight={`${chosenHeightPx}px`}
      maxMobileHeight={`${chosenHeightPx}px`}
      raised={true}
    >
      <Table textAlignCenter style={{ borderSpacing: '0px 7px' }}>
        <TableHead sticky zIndex={Z_TABLE + 1}>
          <TableRow inheritBg>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex justifyCenter>
                <TextSpan info warning={selectedSort == 'TA'} autoAlignVertical onClick={() => setSelectedSort('TA')}>
                  <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                </TextSpan>
                <TextSpan autoAlignVertical>Token</TextSpan>
                <TextSpan info warning={selectedSort == 'TD'} autoAlignVertical onClick={() => setSelectedSort('TD')}>
                  <StyledArrowDropDown size={30} />
                </TextSpan>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex justifyCenter>
                <TextSpan info warning={selectedSort == 'PA'} autoAlignVertical onClick={() => setSelectedSort('PA')}>
                  <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                </TextSpan>
                <TextSpan autoAlignVertical>Price</TextSpan>
                <TextSpan info warning={selectedSort == 'PD'} autoAlignVertical onClick={() => setSelectedSort('PD')}>
                  <StyledArrowDropDown size={30} />
                </TextSpan>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex justifyCenter>
                <TextSpan info warning={selectedSort == 'WA'} autoAlignVertical onClick={() => setSelectedSort('WA')}>
                  <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                </TextSpan>
                <TextSpan autoAlignVertical>Weight</TextSpan>
                <TextSpan info warning={selectedSort == 'WD'} autoAlignVertical>
                  <StyledArrowDropDown size={30} onClick={() => setSelectedSort('WD')} />
                </TextSpan>
              </Flex>
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {tokenDetails
            .sort((a, b) => modifiedSort(a, b))
            .map((info, i) => (
              <TableRow key={i}>
                <TableData style={{ padding: '14px 4px' }}>
                  <Flex gap={5} justifyCenter>
                    <img src={`https://assets.solace.fi/${info.symbol.toLowerCase()}`} height={20} />
                    <Text autoAlignVertical semibold>
                      {info.symbol.toUpperCase()}
                    </Text>
                  </Flex>
                </TableData>
                <TableData style={{ padding: '14px 4px' }}>
                  <Text autoAlignVertical>${truncateValue(info.price, 4)}</Text>
                </TableData>
                <TableData style={{ padding: '14px 4px' }}>
                  <Text autoAlignVertical>{truncateValue(info.weight * 100, 2)}%</Text>
                </TableData>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Scrollable>
  )
}
