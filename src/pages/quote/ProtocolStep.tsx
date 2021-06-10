import React, { Fragment, useState } from 'react'
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'
import styled from 'styled-components'
import { ActionRadios, RadioCircle, RadioCircleFigure, RadioCircleInput } from '../../components/Radio/RadioCircle'
import { Table, TableData, TableHead, TableHeader, TableRow, TableBody } from '../../components/Table'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/Protocol'

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
  const { protocol } = formData

  const [selectedSort, setSelectedSort] = useState<number>(1)

  /*
  setForm({
    target: {
      name: 'protocol', // form element
      value: result // the data/url
    }
  })
  */

  return (
    <Fragment>
      <ActionsContainer>
        <Search type="search" placeholder="Search" />
        <ActionRadios>
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
        </ActionRadios>
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
          <TableRow>
            <TableData>
              <Protocol>
                <ProtocolImage>
                  <img src="" />
                </ProtocolImage>
                <ProtocolTitle>Aave V2</ProtocolTitle>
              </Protocol>
            </TableData>
            <TableData>2.60%</TableData>
            <TableData>43 ETH</TableData>
            <TableData cellAlignRight>
              <Button onClick={() => navigation.next()}>Select</Button>
            </TableData>
          </TableRow>
          <TableRow>
            <TableData>
              <Protocol>
                <ProtocolImage>
                  <img src="" />
                </ProtocolImage>
                <ProtocolTitle>Yearn</ProtocolTitle>
              </Protocol>
            </TableData>
            <TableData>2.60%</TableData>
            <TableData>43 ETH</TableData>
            <TableData cellAlignRight>
              <Button onClick={() => navigation.next()}>Select</Button>
            </TableData>
          </TableRow>
        </TableBody>
      </Table>
    </Fragment>
  )
}
