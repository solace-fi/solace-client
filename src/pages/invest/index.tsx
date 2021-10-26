/*************************************************************************************

    Table of Contents:

    import packages
    import context
    import components
    import constants

    Invest 
      hooks
      Local functions

  *************************************************************************************/

/* import packages */
import React, { useState, Fragment, useCallback } from 'react'

/* import context */
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { PoolModal } from '../../components/organisms/PoolModal'
import { UnderwritingPool } from '../../components/organisms/UnderwritingPool'
import { CapitalProviderPool } from '../../components/organisms/CapitalProviderPool'
import { LiquidityPool } from '../../components/organisms/LiquidityPool'
import { MyOptions } from '../../components/molecules/MyOptions'
import { SptPool } from '../../components/organisms/SptPool'

/* import constants */
import { FunctionName } from '../../constants/enums'

function Invest(): any {
  /*************************************************************************************

  hooks

  *************************************************************************************/
  const { activeNetwork } = useNetwork()
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

  return (
    <Fragment>
      <PoolModal isOpen={showPoolModal} modalTitle={modalTitle} func={func} closeModal={closeModal} />
      <UnderwritingPool openModal={openModal} />
      <CapitalProviderPool openModal={openModal} />
      {activeNetwork.chainId != 1 && <SptPool openModal={openModal} />}
      {/* <LiquidityPool openModal={openModal} /> */}
      <MyOptions />
    </Fragment>
  )
}

export default Invest
