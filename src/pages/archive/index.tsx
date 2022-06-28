/* import packages */
import React, { useState, useCallback } from 'react'

/* import context */
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { CapitalProviderPool } from '../../components/organisms/capital-pool/CapitalProviderPool'
import { PoolModalRouter } from '../../components/organisms/PoolModalRouter'
import { UnderwritingPool } from '../../components/organisms/underwriting-pool/UnderwritingPool'

import { Box } from '../../components/atoms/Box'
import { TextSpan, Text } from '../../components/atoms/Typography'
import { StyledInfo } from '../../components/atoms/Icon'
import { Content } from '../../components/atoms/Layout'

/* import constants */
import { FunctionName } from '../../constants/enums'
import { BondV1 } from '../bond/BondV1'

function Archive(): any {
  /*************************************************************************************

  hooks

  *************************************************************************************/
  const { activeNetwork } = useNetwork()
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
    <>
      <Content>
        <Box warning pt={10} pb={10} pl={15} pr={15}>
          <TextSpan light textAlignLeft>
            <StyledInfo size={30} />
          </TextSpan>
          <Text light bold style={{ margin: '0 auto' }}>
            These features are deprecated. Users are encouraged to withdraw their funds or claim rewards.
          </Text>
        </Box>
      </Content>
      {!activeNetwork.config.restrictedFeatures.noFarmingV1 ? (
        <>
          <PoolModalRouter
            isOpen={showPoolModal}
            modalTitle={modalTitle}
            func={func}
            closeModal={closeModal}
            farmName={farmName}
          />
          <UnderwritingPool openModal={openModal} />
          <CapitalProviderPool openModal={openModal} />
        </>
      ) : (
        <Content>
          <Box error pt={10} pb={10} pl={15} pr={15}>
            <TextSpan light textAlignLeft>
              <StyledInfo size={30} />
            </TextSpan>
            <Text light bold style={{ margin: '0 auto' }}>
              No farms are on this network.
            </Text>
          </Box>
        </Content>
      )}
      <BondV1 />
    </>
  )
}

export default Archive
