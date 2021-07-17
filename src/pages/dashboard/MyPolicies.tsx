/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    MyPolicies function
      useState hooks
      custom hooks
      Contract functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { useEffect, useState, Fragment } from 'react'

/* import packages */
import { formatEther } from '@ethersproject/units'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import constants */
import { Policy } from '../../constants/types'

/* import components */
import { Table, TableBody, TableHead, TableRow, TableHeader, TableData, TableDataGroup } from '../../components/Table'
import { Button } from '../../components/Button'
import { Loader } from '../../components/Loader'
import { Heading2 } from '../../components/Text'
import { Unit, PolicyState } from '../../constants/enums'

/* import hooks */
import { usePolicyGetter } from '../../hooks/useGetter'

/* import utils */
import { truncateBalance } from '../../utils/formatting'
import { getDays, getDateStringWithMonthName, getDateExtended } from '../../utils/time'

interface MyPoliciesProps {
  openClaimModal: any
  openManageModal: any
  latestBlock: number
}

export const MyPolicies: React.FC<MyPoliciesProps> = ({ openClaimModal, openManageModal, latestBlock }) => {
  /*************************************************************************************

    useState hooks

  *************************************************************************************/
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const wallet = useWallet()
  const { getPolicies } = usePolicyGetter()

  /*************************************************************************************

    Local functions

  *************************************************************************************/
  const calculatePolicyExpirationDate = (expirationBlock: string): string => {
    const daysLeft = getDays(parseFloat(expirationBlock), latestBlock)
    return getDateStringWithMonthName(getDateExtended(daysLeft))
  }

  /*************************************************************************************

    useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    const fetchPolicies = async () => {
      if (!wallet.isActive || !wallet.account) return
      setLoading(true)
      const policies = await getPolicies(wallet.account)
      setPolicies(policies)
      setLoading(false)
    }
    fetchPolicies()
  }, [wallet.account, wallet.isActive, wallet.chainId])

  useEffect(() => {
    const fetchPolicies = async () => {
      if (!wallet.isActive || !wallet.account) return
      const policies = await getPolicies(wallet.account)
      setPolicies(policies)
    }
    fetchPolicies()
  }, [wallet.dataVersion, wallet.version])

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : policies.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>{'Id'}</TableHeader>
              <TableHeader>{'Status'}</TableHeader>
              <TableHeader>{'Product'}</TableHeader>
              <TableHeader>{'Position'}</TableHeader>
              <TableHeader>{'Expiration Date'}</TableHeader>
              <TableHeader>{'Covered Amount'}</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {policies.map((policy) => {
              return (
                <TableRow key={policy.policyId}>
                  <TableData>{policy.policyId}</TableData>
                  <TableData>{policy.status}</TableData>
                  <TableData>{policy.productName}</TableData>
                  <TableData>{policy.positionName}</TableData>
                  <TableData>{calculatePolicyExpirationDate(policy.expirationBlock)}</TableData>
                  <TableData>
                    {policy.coverAmount ? truncateBalance(parseFloat(formatEther(policy.coverAmount)), 2) : 0}{' '}
                    {Unit.ETH}
                  </TableData>

                  <TableData textAlignRight>
                    {policy.status === PolicyState.ACTIVE && (
                      <TableDataGroup>
                        <Button onClick={() => openClaimModal(policy)}>Claim</Button>
                        <Button onClick={() => openManageModal(policy)}>Manage</Button>
                      </TableDataGroup>
                    )}
                  </TableData>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      ) : (
        <Heading2 textAlignCenter>You do not own any policies.</Heading2>
      )}
    </Fragment>
  )
}
