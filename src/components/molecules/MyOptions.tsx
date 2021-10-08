/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components
    import constants
    import hooks
    import utils

    MyOptions function
      custom hooks
      contract functions
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useState } from 'react'

/* import packages */
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useToasts } from '../../context/NotificationsManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import components */
import { CardContainer, Card } from '../atoms/Card'
import { Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Text } from '../atoms/Typography'
import { Content } from '../atoms/Layout'
import { StyledArrowDropDown } from '../../components/atoms/Icon'
import { Accordion } from '../atoms/Accordion/Accordion'

/* import constants */
import { Option } from '../../constants/types'

export const MyOptions: React.FC = () => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const [openOptions, setOpenOptions] = useState<boolean>(true)

  const options: Option[] = []

  /*************************************************************************************

    contract functions

  *************************************************************************************/

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Fragment>
      {options.length > 0 && (
        <Content>
          <Text t1 bold mb={0}>
            Your Options
            <Button style={{ float: 'right' }} onClick={() => setOpenOptions(!openOptions)}>
              <StyledArrowDropDown style={{ transform: openOptions ? 'rotate(180deg)' : 'rotate(0deg)' }} size={20} />
              {openOptions ? 'Hide Options' : 'Show Options'}
            </Button>
          </Text>
          <Accordion isOpen={openOptions}>
            <CardContainer cardsPerRow={2} p={10}>
              {options.map((option: Option) => {
                return (
                  <Card key={option.id}>
                    <Box pt={20} pb={20} success>
                      <BoxItem>
                        <BoxItemTitle t4>ID</BoxItemTitle>
                        <Text t4>{option.id}</Text>
                      </BoxItem>
                      <BoxItem>
                        <BoxItemTitle t4>Reward Amount</BoxItemTitle>
                        <Text t4>{option.rewardAmount}</Text>
                      </BoxItem>
                      <BoxItem>
                        <BoxItemTitle t4>Strike Price</BoxItemTitle>
                        <Text t4>{option.strikePrice}</Text>
                      </BoxItem>
                      <BoxItem>
                        <BoxItemTitle t4>Expiry</BoxItemTitle>
                        <Text t4>{option.expiry}</Text>
                      </BoxItem>
                    </Box>
                    <ButtonWrapper mb={0} mt={20}>
                      <Button widthP={100}>Exercise Option</Button>
                    </ButtonWrapper>
                  </Card>
                )
              })}
            </CardContainer>
          </Accordion>
        </Content>
      )}
    </Fragment>
  )
}
