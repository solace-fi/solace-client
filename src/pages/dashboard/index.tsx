/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import components
    import hooks
    import utils

    Dashboard function
      useState hooks
      custom hooks
      Local functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useState } from 'react'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'

/* import components */
import { HeroContainer, Content } from '../../components/Layout'
import { Heading1 } from '../../components/Text'
import { ManageModal } from './ManageModal'
import { StatusModal } from './StatusModal'
import { MyPolicies } from './MyPolicies'
import { MyClaims } from './MyClaims'

/* import hooks */
import { Policy } from '../../hooks/useGetter'

/* import utils */
import { MyInvestments } from './MyInvestments'
import { useGetLatestBlockNumber } from '../../hooks/useGetLatestBlockNumber'

function Dashboard(): any {
  /*************************************************************************************

    useState hooks

  *************************************************************************************/

  const [showStatusModal, setShowStatusModal] = useState<boolean>(false)
  const [showManageModal, setShowManageModal] = useState<boolean>(false)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | undefined>(undefined)

  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const { setSelectedProtocolByName } = useContracts()
  const latestBlock = useGetLatestBlockNumber()
  const wallet = useWallet()

  /*************************************************************************************

  Local functions

  *************************************************************************************/

  const openStatusModal = async (policy: Policy) => {
    setShowStatusModal((prev) => !prev)
    setPolicy(policy)
  }

  const openManageModal = async (days: number, policy: Policy) => {
    setShowManageModal((prev) => !prev)
    setPolicy(policy)
  }

  const setPolicy = (policy: Policy) => {
    setSelectedProtocolByName(policy.productName.toLowerCase())
    document.body.style.overflowY = 'hidden'
    setSelectedPolicy(policy)
  }

  const closeModal = () => {
    setShowStatusModal(false)
    setShowManageModal(false)
    document.body.style.overflowY = 'scroll'
  }

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Fragment>
      {!wallet.account ? (
        <HeroContainer>
          <Heading1>Please connect wallet to view dashboard</Heading1>
        </HeroContainer>
      ) : (
        <Fragment>
          <ManageModal
            closeModal={closeModal}
            isOpen={showManageModal}
            latestBlock={latestBlock}
            selectedPolicy={selectedPolicy}
          />
          <StatusModal
            closeModal={closeModal}
            isOpen={showStatusModal}
            latestBlock={latestBlock}
            selectedPolicy={selectedPolicy}
          />
          <Content>
            <Heading1>Your Policies</Heading1>
            {!showManageModal && !showStatusModal && (
              <MyPolicies
                latestBlock={latestBlock}
                openStatusModal={openStatusModal}
                openManageModal={openManageModal}
              />
            )}
          </Content>
          {!showManageModal && !showStatusModal && <MyClaims />}
          <MyInvestments />
        </Fragment>
      )}
    </Fragment>
  )
}

export default Dashboard
