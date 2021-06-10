import React, { Fragment, useState } from 'react'
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'
import styled from 'styled-components'
// import { ActionRadios, RadioCircle, RadioCircleFigure, RadioCircleInput } from '../../components/Radio/RadioCircle'
import { Table, TableData, TableHead, TableHeader, TableRow, TableBody } from '../../components/Table'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/Protocol'
import { PROTOCOLS_LIST } from '../../constants/protocols'
import useDebounce from '@rooks/use-debounce'

const Search = styled.input`
  ::placeholder {
    color: #fff;
    opacity: 0.5;
  }
  ::-webkit-search-cancel-button {
    -webkit-appearance: none;
    height: 1em;
    width: 1em;
    border-radius: 50em;
    background: url(https://pro.fontawesome.com/releases/v5.10.0/svgs/solid/times-circle.svg) no-repeat 50% 50%;
    background-size: contain;
    opacity: 0;
    pointer-events: none;
    filter: invert(1);
  }
  :focus::-webkit-search-cancel-button {
    opacity: 1;
    pointer-events: all;
  }
  border-radius: 30px;
  border: 1px solid #fff;
  padding: 10px 20px;
  outline: none;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0);
`

const ActionsContainer = styled.div`
  padding-top: 20px;
  display: flex;
  align-items: center;
  ${Search} {
    width: 300px;
  }
`

export const ProtocolStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const [searchValue, setSearchValue] = useState<string>('')
  const handleChange = (protocol: any) => {
    setForm({
      target: {
        name: 'protocol',
        value: protocol,
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
        {/* <ActionRadios>
          <RadioCircle>
            <RadioCircleInput type="radio" value="1" checked={selectedSort == 1} onChange={() => setSelectedSort(1)} />
            <RadioCircleFigure></RadioCircleFigure>
            <div>Yield Tokens</div>
          </RadioCircle>
          <RadioCircle>
            <RadioCircleInput type="radio" value="2" checked={selectedSort == 2} onChange={() => setSelectedSort(2)} />
            <RadioCircleFigure></RadioCircleFigure>
            <div>Protocols</div>
          </RadioCircle>
          <RadioCircle>
            <RadioCircleInput type="radio" value="3" checked={selectedSort == 3} onChange={() => setSelectedSort(3)} />
            <RadioCircleFigure></RadioCircleFigure>
            <div>Custodians</div>
          </RadioCircle>
        </ActionRadios> */}
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
          {PROTOCOLS_LIST.filter((protocol) => protocol.name.toLowerCase().includes(searchValue.toLowerCase())).map(
            (protocol) => {
              return (
                <TableRow key={protocol.name}>
                  <TableData>
                    <Protocol>
                      <ProtocolImage>
                        <img src={protocol.img} />
                      </ProtocolImage>
                      <ProtocolTitle>{protocol.name}</ProtocolTitle>
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
