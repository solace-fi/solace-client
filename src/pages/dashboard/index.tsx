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
      useState variables
      Local helper functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useRef, useEffect, useState } from 'react'

/* import packages */
import { Contract } from '@ethersproject/contracts'

/* import constants */
import { Unit, PolicyStatus } from '../../constants/enums'
import { CHAIN_ID, NUM_BLOCKS_PER_DAY } from '../../constants'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Content } from '../../components/Layout'
import { CardContainer, InvestmentCardComponent, CardHeader, CardTitle, CardBlock } from '../../components/Card'
import { Heading1, Heading3 } from '../../components/Text'
import { Button } from '../../components/Button'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableData, TableDataGroup } from '../../components/Table'
import { Text3 } from '../../components/Text'

/* import hooks */
import { useUserStakedValue } from '../../hooks/useUserStakedValue'
import { useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'

/* import utils */
import { fixed } from '../../utils/formatting'
import { Policy, getAllPoliciesOfUser } from '../../utils/policyGetter'
import { formatEther } from 'ethers/lib/utils'
import { fetchEtherscanLatestBlock } from '../../utils/etherscan'

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

    useState variables

  *************************************************************************************/

  const [policies, setPolicies] = useState<Policy[]>([])
  const [latestBlock, setLatestBlock] = useState<number>(0)

  /*************************************************************************************

  Local helper functions

  *************************************************************************************/

  const calculatePolicyExpirationDate = (expirationBlock: string): string => {
    const days = Math.floor((parseFloat(expirationBlock) - latestBlock) / NUM_BLOCKS_PER_DAY)
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toLocaleDateString()
  }

  const renderPolicies = () => {
    return policies.map((policy) => {
      return (
        <TableRow key={policy.policyId}>
          <TableData>{policy.policyId}</TableData>
          <TableData>{policy.status}</TableData>
          <TableData>{policy.productName}</TableData>
          <TableData>{policy.positionName}</TableData>
          <TableData>{calculatePolicyExpirationDate(policy.expirationBlock)}</TableData>
          <TableData>
            {policy.coverAmount ? formatEther(policy.coverAmount) : 0} {Unit.ETH}
          </TableData>

          <TableData cellAlignRight>
            {policy.status === PolicyStatus.ACTIVE ? (
              <TableDataGroup>
                <Button>Claim</Button>
                <Button>Edit</Button>
                <Button>Renew</Button>
              </TableDataGroup>
            ) : (
              <TableDataGroup>
                <Button>View</Button>
              </TableDataGroup>
            )}
          </TableData>
        </TableRow>
      )
    })
  }

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    cpFarmContract.current = cpFarm
    lpFarmContract.current = lpFarm
  }, [cpFarm, lpFarm])

  useEffect(() => {
    try {
      const fetchLatestBlock = async () => {
        const { latestBlockNumber } = await fetchEtherscanLatestBlock(Number(CHAIN_ID))
        setLatestBlock(latestBlockNumber)
      }
      fetchLatestBlock()
    } catch (e) {
      console.log(e)
    }
  }, [policies])

  useEffect(() => {
    if (!wallet.isActive || !wallet.account) {
      return
    }

    try {
      const fetchPolicies = async () => {
        const policies = await getAllPoliciesOfUser(wallet.account as string, Number(CHAIN_ID))
        setPolicies(policies)
      }
      fetchPolicies()
    } catch (err) {
      console.log(err)
    }
  }, [wallet.account, wallet.isActive])

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
              <TableHeader>{'Position'}</TableHeader>
              <TableHeader>{'Expiration Date'}</TableHeader>
              <TableHeader>{'Amount'}</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>{renderPolicies()}</TableBody>
        </Table>
      </Content>
      <Content>
        <Heading1>Your Investments</Heading1>
        <CardContainer>
          <InvestmentCardComponent>
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
          </InvestmentCardComponent>
          <InvestmentCardComponent>
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
          </InvestmentCardComponent>
        </CardContainer>
      </Content>
    </Fragment>
  )
}

export default Dashboard
