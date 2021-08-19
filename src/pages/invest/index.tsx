/*************************************************************************************

    Table of Contents:

    import react
    import context
    import components
    import constants

    Invest function
      custom hooks
      Local functions
      Render

  *************************************************************************************/

/* import react */
import React, { useState, Fragment, useCallback } from 'react'

/* import context */
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { PoolModal } from '../../components/organisms/PoolModal'
import { RiskBackingCapitalPool } from '../../components/molecules/RiskBackingCapitalPool'
import { CapitalProviderPool } from '../../components/molecules/CapitalProviderPool'
import { LiquidityPool } from '../../components/molecules/LiquidityPool'
import { HeroContainer } from '../../components/atoms/Layout'
import { Heading1 } from '../../components/atoms/Typography'

/* import constants */
import { FunctionName } from '../../constants/enums'

function Invest(): any {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { chainId } = useNetwork()
  const [func, setFunc] = useState<FunctionName>(FunctionName.DEPOSIT_ETH)
  const [modalTitle, setModalTitle] = useState<string>('')
  const [showPoolModal, setShowPoolModal] = useState<boolean>(false)

  /*************************************************************************************

  Local functions

  *************************************************************************************/

  const openModal = (func: FunctionName, modalTitle: string) => {
    setShowPoolModal((prev) => !prev)
    document.body.style.overflowY = 'hidden'
    setModalTitle(modalTitle)
    setFunc(func)
  }

  const closeModal = useCallback(() => {
    setShowPoolModal(false)
    document.body.style.overflowY = 'scroll'
  }, [])

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Fragment>
      <PoolModal isOpen={showPoolModal} modalTitle={modalTitle} func={func} closeModal={closeModal} />
      <RiskBackingCapitalPool openModal={openModal} />
      {chainId == 1 ? (
        <HeroContainer>
          <Heading1 textAlignCenter>More pools coming soon!</Heading1>
        </HeroContainer>
      ) : (
        <>
          <CapitalProviderPool openModal={openModal} />
          <LiquidityPool openModal={openModal} />
        </>
      )}
    </Fragment>
  )
}

export default Invest
