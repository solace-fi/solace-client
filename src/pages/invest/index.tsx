/*************************************************************************************

    Table of Contents:

    import react
    import constants
    import managers
    import components
    import hooks
    import utils

    Invest function
      custom hooks
      Local functions
      Render

  *************************************************************************************/

/* import react */
import React, { useState, Fragment } from 'react'

/* import constants */
import { FunctionName } from '../../constants/enums'

import { PoolModal } from './PoolModal'
import { RiskBackingCapitalPool } from './RiskBackingCapitalPool'
import { CapitalProviderPool } from './CapitalProviderPool'
import { LiquidityPool } from './LiquidityPool'
import { TransactionHistory } from './TransactionHistory'

function Invest(): any {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const [func, setFunc] = useState<FunctionName>(FunctionName.DEPOSIT)
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

  const closeModal = () => {
    setShowPoolModal(false)
    document.body.style.overflowY = 'scroll'
  }

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Fragment>
      <PoolModal isOpen={showPoolModal} modalTitle={modalTitle} func={func} closeModal={closeModal} />
      <RiskBackingCapitalPool openModal={openModal} />
      <CapitalProviderPool openModal={openModal} />
      <LiquidityPool openModal={openModal} />
      <TransactionHistory />
    </Fragment>
  )
}

export default Invest
