/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import constants
    import components

    Dashboard function
      useState hooks
      custom hooks
      local functions
      useEffect hooks
      Render

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
import { Heading1 } from '../../components/atoms/Typography'
import { ManageModal } from '../../components/organisms/ManageModal'
import { ClaimModal } from '../../components/organisms/ClaimModal'
import { MyPolicies } from '../../components/molecules/MyPolicies'
import { MyClaims } from '../../components/molecules/MyClaims'
import { MyInvestments } from '../../components/molecules/MyInvestments'
import { StyledTooltip } from '../../components/molecules/Tooltip'
import { Accordion } from '../../components/atoms/Accordion/Accordion'
import { StyledArrowDropDownCircle } from '../../components/atoms/Icon'
import { Button } from '../../components/atoms/Button'

function Dashboard(): any {
  /*************************************************************************************

    useState hooks

  *************************************************************************************/

  const [showClaimModal, setShowClaimModal] = useState<boolean>(false)
  const [showManageModal, setShowManageModal] = useState<boolean>(false)
  const [openPolicies, setOpenPolicies] = useState<boolean>(true)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | undefined>(undefined)

  /*************************************************************************************

    custom hooks

  *************************************************************************************/

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

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Fragment>
      {!account ? (
        <HeroContainer>
          <Heading1 textAlignCenter>Please connect wallet to view dashboard</Heading1>
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
            <Heading1>
              Your Policies{' '}
              <StyledTooltip
                id={'user-policies'}
                tip={
                  'Make changes to your existing policies or submit claims, \n if you do not own a policy, you may buy one.'
                }
                link={`https://docs.solace.fi/docs/user-guides/buy-cover`}
              />
              <Button style={{ float: 'right' }} onClick={() => setOpenPolicies(!openPolicies)}>
                <StyledArrowDropDownCircle
                  style={{ transform: openPolicies ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  size={30}
                />
                {openPolicies ? 'Hide Policies' : 'Show Policies'}
              </Button>
            </Heading1>
            {!showManageModal && !showClaimModal && (
              <Accordion isOpen={openPolicies}>
                <MyPolicies
                  latestBlock={latestBlock}
                  openClaimModal={openClaimModal}
                  openManageModal={openManageModal}
                />
              </Accordion>
            )}
          </Content>
          {!showManageModal && !showClaimModal && <MyClaims />}
          <MyInvestments />
        </Fragment>
      )}
    </Fragment>
  )
}

export default Dashboard
