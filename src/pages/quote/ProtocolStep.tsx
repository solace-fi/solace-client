import React, { Fragment, useState } from 'react'
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'
import styled from 'styled-components'
// import { ActionRadios, RadioCircle, RadioCircleFigure, RadioCircleInput } from '../../components/Radio/RadioCircle'
import { Table, TableData, TableHead, TableHeader, TableRow, TableBody } from '../../components/Table'
import { Search } from '../../components/Input'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/Protocol'
import { PROTOCOLS_LIST } from '../../constants/protocols'
import useDebounce from '@rooks/use-debounce'

const ActionsContainer = styled.div`
  padding-top: 20px;
  display: flex;
  align-items: center;
  ${Search} {
    width: 300px;
  }
`

export const ProtocolStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { protocol } = formData
  const [searchValue, setSearchValue] = useState<string>('')
  const handleChange = (selectedProtocol: any) => {
    setForm({
      target: {
        name: 'lastProtocol',
        value: protocol,
      },
    })
    setForm({
      target: {
        name: 'protocol',
        value: selectedProtocol,
      },
    })
    navigation.next()
  }

  const handleSearch = useDebounce((searchValue: string) => {
    setSearchValue(searchValue)
  }, 300)

  return (
    <Fragment>
      <ActionsContainer>
        <Search type="search" placeholder="Search" onChange={(e) => handleSearch(e.target.value)} />
      </ActionsContainer>
      <Table isQuote>
        <TableHead>
          <TableRow>
            <TableHeader>Protocol</TableHeader>
            <TableHeader>Yearly Cost</TableHeader>
            <TableHeader>Coverage Available</TableHeader>
            <TableHeader></TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {PROTOCOLS_LIST.filter((protocol) => protocol.toLowerCase().includes(searchValue.toLowerCase())).map(
            (protocol) => {
              return (
                <TableRow key={protocol}>
                  <TableData>
                    <Protocol>
                      <ProtocolImage>
                        <img src={`https://assets.solace.fi/${protocol.toLowerCase()}.svg`} />
                      </ProtocolImage>
                      <ProtocolTitle>{protocol}</ProtocolTitle>
                    </Protocol>
                  </TableData>
                  <TableData>2.60%</TableData>
                  <TableData>4003 ETH</TableData>
                  <TableData cellAlignRight>
                    <Button onClick={() => handleChange(protocol)}>Select</Button>
                  </TableData>
                </TableRow>
              )
            }
          )}
        </TableBody>
      </Table>
    </Fragment>
  )
}
