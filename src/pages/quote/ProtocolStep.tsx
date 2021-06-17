/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import components
    import hooks
    import utils

    styled components

    ProtocolStep function
      Hook variables
      useState variables
      Local helper functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useState, useEffect } from 'react'

/* import packages */
import styled from 'styled-components'
import useDebounce from '@rooks/use-debounce'

/* import constants */
import { DAYS_PER_YEAR, NUM_BLOCKS_PER_DAY, CHAIN_ID } from '../../constants'
import { PROTOCOLS_LIST } from '../../constants/protocols'

/* import components */
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'
import { Table, TableData, TableHead, TableHeader, TableRow, TableBody } from '../../components/Table'
import { Search } from '../../components/Input'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/Protocol'

/* import hooks */
import { useGetAvailableCoverage, useGetYearlyCost } from '../../hooks/usePolicy'
import { useWallet } from '../../context/WalletManager'

/* import utils */
import { fixed } from '../../utils/formatting'
import { getAllPoliciesOfUser } from '../../utils/policyGetter'
import { PolicyStatus } from '../../constants/enums'
import { Loader } from '../../components/Loader'

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

  const availableCoverage = useGetAvailableCoverage()
  const yearlyCost = useGetYearlyCost()
  const { protocol } = formData
  const wallet = useWallet()

  /*************************************************************************************

  useState variables

  *************************************************************************************/
  const [searchValue, setSearchValue] = useState<string>('')
  const [userPolicies, setUserPolicies] = useState<Map<string, boolean>>(new Map())
  const [pageLoaded, setPageLoaded] = useState<boolean>(false)

  /*************************************************************************************

  Local Helper Functions

  *************************************************************************************/

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

  const userHasActivePolicy = (product: string): boolean => {
    if (pageLoaded && userPolicies.has(product)) {
      const status = userPolicies.get(product) || false
      return status
    }
    return false
  }

  /*************************************************************************************

    useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    if (!wallet.isActive || !wallet.account) {
      return
    }

    try {
      const fetchPolicies = async () => {
        const policies = await getAllPoliciesOfUser(wallet.account as string, Number(CHAIN_ID))
        const userPolicyMap = new Map<string, boolean>()
        policies.forEach((policy) => {
          if (!userPolicyMap.has(policy.productName)) {
            userPolicyMap.set(policy.productName, policy.status === PolicyStatus.ACTIVE ? true : false)
          }
        })
        setUserPolicies(userPolicyMap)
        setPageLoaded(true)
      }
      fetchPolicies()
    } catch (err) {
      console.log(err)
    }
  }, [wallet.account, wallet.isActive])
  /*************************************************************************************

  Render

  *************************************************************************************/

  if (!pageLoaded) {
    return <Loader />
  }

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
                <TableRow key={protocol} disabled={userHasActivePolicy(protocol)}>
                  <TableData>
                    <Protocol>
                      <ProtocolImage>
                        <img src={`https://assets.solace.fi/${protocol.toLowerCase()}.svg`} />
                      </ProtocolImage>
                      <ProtocolTitle>{protocol}</ProtocolTitle>
                    </Protocol>
                  </TableData>
                  <TableData>
                    {fixed(parseFloat(yearlyCost) * Math.pow(10, 6) * NUM_BLOCKS_PER_DAY * DAYS_PER_YEAR * 100, 2)}%
                  </TableData>
                  <TableData>{availableCoverage.split('.')[0]} ETH</TableData>
                  <TableData cellAlignRight>
                    <Button
                      onClick={() =>
                        handleChange({
                          name: protocol,
                          availableCoverage: availableCoverage.split('.')[0],
                          yearlyCost: parseFloat(yearlyCost) * Math.pow(10, 6) * NUM_BLOCKS_PER_DAY * DAYS_PER_YEAR,
                        })
                      }
                    >
                      Select
                    </Button>
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
