/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import constants
    import components

    Dashboard 
      hooks
      local functions
      useEffect hooks

  *************************************************************************************/

/* import react */
import React, { Fragment, useState, useCallback, useEffect } from 'react'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'

/* import constants */
import { Policy } from '../../constants/types'

/* import components */
import { HeroContainer, Content } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { ManageModal } from '../../components/organisms/ManageModal'
import { ClaimModal } from '../../components/organisms/ClaimModal'
import { MyPolicies } from '../../components/molecules/MyPolicies'
import { MyClaims } from '../../components/molecules/MyClaims'
import { MyInvestments } from '../../components/molecules/MyInvestments'
import { StyledTooltip } from '../../components/molecules/Tooltip'
import { Accordion } from '../../components/atoms/Accordion/Accordion'
import { StyledArrowDropDown } from '../../components/atoms/Icon'
import { Button } from '../../components/atoms/Button'
import { Loader } from '../../components/atoms/Loader'
import { MyOptions } from '../../components/molecules/MyOptions'

function Dashboard(): any {
  /*************************************************************************************

    hooks

  *************************************************************************************/

  const [showClaimModal, setShowClaimModal] = useState<boolean>(false)
  const [showManageModal, setShowManageModal] = useState<boolean>(false)
  const [openPolicies, setOpenPolicies] = useState<boolean>(true)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | undefined>(undefined)

  const { setSelectedProtocolByName } = useContracts()
  const { latestBlock, userPolicyData } = useCachedData()
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
    if (selectedPolicy) {
      const matchingPolicy = userPolicyData.userPolicies.find(
        (policy: Policy) => policy.policyId == selectedPolicy.policyId
      )
      if (!matchingPolicy) return
      if (JSON.stringify(matchingPolicy) !== JSON.stringify(selectedPolicy)) {
        setPolicy(matchingPolicy)
      }
    }
  }, [userPolicyData.userPolicies])

  return (
    <Fragment>
      {!account ? (
        <HeroContainer>
          <Text bold t1 textAlignCenter>
            Please connect wallet to view dashboard
          </Text>
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
          <Content>
            <Text bold t1 mb={0}>
              Your Policies{' '}
              <StyledTooltip
                id={'user-policies'}
                tip={'A policy indicates the coverage for your positions on a protocol.'}
                link={`https://docs.solace.fi/docs/user-guides/buy-cover`}
              />
              <Button style={{ float: 'right' }} onClick={() => setOpenPolicies(!openPolicies)}>
                <StyledArrowDropDown
                  style={{ transform: openPolicies ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  size={20}
                />
                {openPolicies ? 'Hide Policies' : 'Show Policies'}
              </Button>
            </Text>
            <Text t4 pb={10}>
              Make changes to your existing policies or submit claims
            </Text>
            {!userPolicyData.policiesLoading ? (
              <Accordion isOpen={openPolicies} style={{ padding: '0 10px 0 10px' }}>
                <MyPolicies
                  latestBlock={latestBlock}
                  openClaimModal={openClaimModal}
                  openManageModal={openManageModal}
                />
              </Accordion>
            ) : (
              <Loader />
            )}
          </Content>
          <MyClaims />
          <MyInvestments />
          <MyOptions />
        </Fragment>
      )}
    </Fragment>
  )
}

export default Dashboard
