/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components
    import hooks

    Dashboard 
      hooks
      local functions
      useEffect hooks

  *************************************************************************************/

/* import packages */
import React, { Fragment, useState, useCallback, useEffect } from 'react'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useProvider } from '../../context/ProviderManager'

/* import constants */
import { Policy } from '../../constants/types'

/* import components */
import { HeroContainer } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { ManageModal } from '../../components/organisms/ManageModal'
import { ClaimModal } from '../../components/organisms/ClaimModal'
import { MyPolicies } from '../../components/molecules/MyPolicies'
import { MyClaims } from '../../components/molecules/MyClaims'
import { MyInvestments } from '../../components/molecules/MyInvestments'
import { MyOptions } from '../../components/molecules/MyOptions'
import { WalletConnectButton } from '../../components/molecules/WalletConnectButton'

/* import hooks */

function Dashboard(): any {
  /*************************************************************************************

    hooks

  *************************************************************************************/

  const [showClaimModal, setShowClaimModal] = useState<boolean>(false)
  const [showManageModal, setShowManageModal] = useState<boolean>(false)
  const [openPolicies, setOpenPolicies] = useState<boolean>(true)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | undefined>(undefined)

  const { setSelectedProtocolByName } = useContracts()
  const { userPolicyData } = useCachedData()
  const { latestBlock } = useProvider()
  const { account } = useWallet()

  /*************************************************************************************

  local functions

  *************************************************************************************/

  const openClaimModal = async (policy: Policy) => {
    setShowClaimModal(true)
    setPolicy(policy)
  }

  const openManageModal = async (policy: Policy) => {
    setShowManageModal(true)
    setPolicy(policy)
  }

  const setPolicy = (policy: Policy) => {
    setSelectedProtocolByName(policy.productName)
    document.body.style.overflowY = 'hidden'
    setSelectedPolicy(policy)
  }

  const closeModal = useCallback(() => {
    setShowClaimModal(false)
    setShowManageModal(false)
    setSelectedPolicy(undefined)
    document.body.style.overflowY = 'scroll'
  }, [])

  /*************************************************************************************

    useEffect hooks

  *************************************************************************************/

  // if a policy is displayed on modal, always get latest policy
  useEffect(() => {
    if (!selectedPolicy) return
    const matchingPolicy = userPolicyData.userPolicies.find(
      (policy: Policy) => policy.policyId == selectedPolicy.policyId
    )
    if (!matchingPolicy) return
    if (JSON.stringify(matchingPolicy) !== JSON.stringify(selectedPolicy)) {
      setPolicy(matchingPolicy)
    }
  }, [selectedPolicy, userPolicyData.userPolicies])

  return (
    <Fragment>
      {!account ? (
        <HeroContainer>
          <Text bold t1 textAlignCenter>
            Please connect wallet to view dashboard
          </Text>
          <WalletConnectButton info welcome secondary />
        </HeroContainer>
      ) : (
        <Fragment>
          <ManageModal
            closeModal={closeModal}
            isOpen={showManageModal}
            latestBlock={latestBlock}
            selectedPolicy={selectedPolicy}
          />
          <ClaimModal
            closeModal={closeModal}
            isOpen={showClaimModal}
            latestBlock={latestBlock}
            selectedPolicy={selectedPolicy}
          />
          <MyPolicies
            latestBlock={latestBlock}
            openClaimModal={openClaimModal}
            openManageModal={openManageModal}
            isOpen={openPolicies}
            setOpen={setOpenPolicies}
          />
          <MyClaims />
          <MyInvestments />
          <MyOptions />
        </Fragment>
      )}
    </Fragment>
  )
}

export default Dashboard
