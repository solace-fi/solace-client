/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import context
    import components
    import hooks
    import utils

    styled components

    ProtocolStep function
      Hook variables
      useState variables
      Local helper functions
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useState } from 'react'

/* import packages */
import styled from 'styled-components'
import useDebounce from '@rooks/use-debounce'

/* import constants */
import { DAYS_PER_YEAR, NUM_BLOCKS_PER_DAY } from '../../constants'
import { PROTOCOLS_LIST } from '../../constants/protocols'

/* import context */
import { useContracts } from '../../context/ContractsManager'

/* import components */
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'
import { Table, TableData, TableHead, TableHeader, TableRow, TableBody } from '../../components/Table'
import { Search } from '../../components/Input'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/Protocol'

/* import hooks */
import { useGetAvailableCoverages, useGetYearlyCosts } from '../../hooks/usePolicy'

/* import utils */
import { fixed } from '../../utils/formatting'

/*************************************************************************************

  styled components

  *************************************************************************************/
const ActionsContainer = styled.div`
  padding-top: 20px;
  display: flex;
  align-items: center;
  ${Search} {
    width: 300px;
  }
`

export const ProtocolStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  /*************************************************************************************

  Hook variables

  *************************************************************************************/

  const availableCoverages = useGetAvailableCoverages()
  const yearlyCosts = useGetYearlyCosts()
  const { protocol } = formData
  const { setSelectedProtocolByName } = useContracts()

  /*************************************************************************************

  useState variables

  *************************************************************************************/
  const [searchValue, setSearchValue] = useState<string>('')

  /*************************************************************************************

  Local Helper Functions

  *************************************************************************************/

  const handleChange = (selectedProtocol: any) => {
    setSelectedProtocolByName(selectedProtocol.name.toLowerCase())
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

  /*************************************************************************************

  Render

  *************************************************************************************/

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
                <TableRow
                  key={protocol}
                  onClick={() =>
                    handleChange({
                      name: protocol,
                      availableCoverage: availableCoverages[protocol.toLowerCase()]?.split('.')[0] ?? '0',
                      yearlyCost:
                        parseFloat(yearlyCosts[protocol.toLowerCase()] ?? '0') *
                        Math.pow(10, 6) *
                        NUM_BLOCKS_PER_DAY *
                        DAYS_PER_YEAR,
                    })
                  }
                  style={{ cursor: 'pointer' }}
                >
                  <TableData>
                    <Protocol>
                      <ProtocolImage>
                        <img src={`https://assets.solace.fi/${protocol.toLowerCase()}.svg`} />
                      </ProtocolImage>
                      <ProtocolTitle>{protocol}</ProtocolTitle>
                    </Protocol>
                  </TableData>
                  <TableData>
                    {fixed(
                      parseFloat(yearlyCosts[protocol.toLowerCase()] ?? '0') *
                        Math.pow(10, 6) *
                        NUM_BLOCKS_PER_DAY *
                        DAYS_PER_YEAR *
                        100,
                      2
                    )}
                    %
                  </TableData>
                  <TableData>{availableCoverages[protocol.toLowerCase()]?.split('.')[0] ?? '0'} ETH</TableData>
                  <TableData textAlignRight>
                    <Button>Select</Button>
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
