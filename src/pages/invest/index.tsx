/*************************************************************************************

    Table of Contents:

    import packages
    import context
    import components
    import constants

    Invest 
      hooks
      local functions

  *************************************************************************************/

/* import packages */
import React, { useState, Fragment, useCallback } from 'react'

/* import context */

/* import components */
import { UnderwritingPool } from '../../components/organisms/UnderwritingPool'
import { CapitalProviderPool } from '../../components/organisms/CapitalProviderPool'
import { LiquidityPool } from '../../components/organisms/LiquidityPool'
import { MyOptions } from '../../components/molecules/MyOptions'

/* import constants */
import { FunctionName } from '../../constants/enums'
import { PoolModalRouter } from '../../components/organisms/PoolModalRouter'
import { Box } from '../../components/atoms/Box'
import { TextSpan, Text } from '../../components/atoms/Typography'
import { StyledInfo } from '../../components/atoms/Icon'
import { Content } from '../../components/atoms/Layout'
import { V1RewardsWindow } from '../../components/organisms/V1RewardsWindow'

function Invest(): any {
  /*************************************************************************************

  hooks

  *************************************************************************************/
  const [func, setFunc] = useState<FunctionName>(FunctionName.DEPOSIT_ETH)
  const [modalTitle, setModalTitle] = useState<string>('')
  const [showPoolModal, setShowPoolModal] = useState<boolean>(false)
  const [farmName, setFarmName] = useState<string>('uw')

  /*************************************************************************************

  Local functions

  *************************************************************************************/

  const openModal = (func: FunctionName, modalTitle: string, farmName: string) => {
    document.body.style.overflowY = 'hidden'
    setModalTitle(modalTitle)
    setFunc(func)
    setFarmName(farmName)
    setShowPoolModal((prev) => !prev)
  }

  const closeModal = useCallback(() => {
    setShowPoolModal(false)
    document.body.style.overflowY = 'scroll'
  }, [])

  return (
    <Fragment>
      <PoolModalRouter
        isOpen={showPoolModal}
        modalTitle={modalTitle}
        func={func}
        closeModal={closeModal}
        farmName={farmName}
      />
      <Content>
        <Box warning pt={10} pb={10} pl={15} pr={15}>
          <TextSpan light textAlignLeft>
            <StyledInfo size={30} />
          </TextSpan>
          <Text light bold style={{ margin: '0 auto' }}>
            This page will be deprecated soon. Users should withdraw their funds.
          </Text>
        </Box>
      </Content>
      <Content>
        <V1RewardsWindow />
      </Content>
      <UnderwritingPool openModal={openModal} />
      <CapitalProviderPool openModal={openModal} />
      {/* <LiquidityPool openModal={openModal} /> */}
      <MyOptions />
    </Fragment>
  )
}

export default Invest
