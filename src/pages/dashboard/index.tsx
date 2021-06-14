/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

    Dashboard function
      useRef variables
      Hook variables
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useRef, useEffect } from 'react'

/* import packages */
import { Contract } from '@ethersproject/contracts'

/* import constants */
import { Unit } from '../../constants/enums'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Content } from '../../components/Layout'
import { CardContainer, Card, CardHeader, CardTitle, CardBlock } from '../../components/Card'
import { Heading1, Heading3 } from '../../components/Text'
import { Button } from '../../components/Button'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableData, TableDataGroup } from '../../components/Table'

/* import hooks */
import { useUserStakedValue } from '../../hooks/useUserStakedValue'
import { useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'

/* import utils */
import { fixed } from '../../utils/formatting'

function Dashboard(): any {
  /************************************************************************************* 

    useRef variables 

  *************************************************************************************/

  const cpFarmContract = useRef<Contract | null>()
  const lpFarmContract = useRef<Contract | null>()

  /*************************************************************************************

    Hook variables

  *************************************************************************************/

  const [cpUserRewards] = useUserPendingRewards(cpFarmContract.current)
  const [cpUserRewardsPerDay] = useUserRewardsPerDay(1, cpFarmContract.current)
  const [lpUserRewards] = useUserPendingRewards(lpFarmContract.current)
  const [lpUserRewardsPerDay] = useUserRewardsPerDay(2, lpFarmContract.current)
  const cpUserStakeValue = useUserStakedValue(cpFarmContract.current)
  const lpUserStakeValue = useUserStakedValue(lpFarmContract.current)
  const { cpFarm, lpFarm } = useContracts()

  const wallet = useWallet()

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    cpFarmContract.current = cpFarm
    lpFarmContract.current = lpFarm
  }, [cpFarm, lpFarm])

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Fragment>
      <Content>
        <Heading1>Your Policies</Heading1>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>{'Id'}</TableHeader>
              <TableHeader>{'Status'}</TableHeader>
              <TableHeader>{'Product'}</TableHeader>
              <TableHeader>{'Expiration Date'}</TableHeader>
              <TableHeader>{'Amount'}</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableData>{'23'}</TableData>
              <TableData>{'Active'}</TableData>
              <TableData>{'Uniswap'}</TableData>
              <TableData>{'1-6-2021'}</TableData>
              <TableData>{'3000 ETH'}</TableData>
              <TableData cellAlignRight>
                <TableDataGroup>
                  <Button>Claim</Button>
                  <Button>Edit</Button>
                  <Button>Renew</Button>
                </TableDataGroup>
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>{'20'}</TableData>
              <TableData>{'Expired'}</TableData>
              <TableData>{'Badger DAO'}</TableData>
              <TableData>{'1-5-2021'}</TableData>
              <TableData>{'30 ETH'}</TableData>
              <TableData cellAlignRight>
                <TableDataGroup>
                  <Button>View</Button>
                </TableDataGroup>
              </TableData>
            </TableRow>
          </TableBody>
        </Table>
      </Content>
      <Content>
        <Heading1>Your Investments</Heading1>
        <CardContainer>
          <Card>
            <CardHeader>
              <CardTitle h2>Capital Pool</CardTitle>
              <Heading3>
                {wallet.account ? fixed(parseFloat(cpUserStakeValue), 2) : 0} {Unit.ETH}
              </Heading3>
            </CardHeader>
            <CardBlock>
              <CardTitle t2>Daily Earnings</CardTitle>
              <CardTitle t3>
                {wallet.account ? fixed(parseFloat(cpUserRewardsPerDay), 2) : 0} {Unit.SOLACE}
              </CardTitle>
            </CardBlock>
            <CardBlock>
              <CardTitle t2>Total Earnings</CardTitle>
              <CardTitle t3>
                {wallet.account ? fixed(parseFloat(cpUserRewards), 2) : 0} {Unit.SOLACE}
              </CardTitle>
            </CardBlock>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle h2>Liquidity Pool</CardTitle>
              <Heading3>
                {wallet.account ? fixed(parseFloat(lpUserStakeValue), 2) : 0} {Unit.SOLACE}
              </Heading3>
            </CardHeader>
            <CardBlock>
              <CardTitle t2>Daily Earnings</CardTitle>
              <CardTitle t3>
                {wallet.account ? fixed(parseFloat(lpUserRewardsPerDay), 2) : 0} {Unit.SOLACE}
              </CardTitle>
            </CardBlock>
            <CardBlock>
              <CardTitle t2>Total Earnings</CardTitle>
              <CardTitle t3>
                {wallet.account ? fixed(parseFloat(lpUserRewards), 2) : 0} {Unit.SOLACE}
              </CardTitle>
            </CardBlock>
          </Card>
        </CardContainer>
      </Content>
    </Fragment>
  )
}

export default Dashboard
