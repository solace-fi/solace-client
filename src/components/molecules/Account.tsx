/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import components
    import utils

    UserAccount
      hooks
      local functions
      
    Account
      hooks
      local functions

  *************************************************************************************/

/* import packages */
import React, { useMemo } from 'react'
import makeBlockie from 'ethereum-blockies-base64'
import { useLocation } from 'react-router'
import { useWeb3React } from '@web3-react/core'

/* import managers */
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralManager'

/* import components */
import { Text } from '../atoms/Typography'
import { UserImage } from '../atoms/User'
import { Button, ButtonProps } from '../atoms/Button'
import { Flex } from '../atoms/Layout'
import { StyledWallet } from '../atoms/Icon'
import { GeneralElementProps } from '../generalInterfaces'

/* hooks */
import { useENS } from '../../hooks/wallet/useENS'

/* import utils */
import { shortenAddress } from '../../utils/formatting'

export const UserAccount: React.FC<ButtonProps & GeneralElementProps> = (props) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/
  const { appTheme } = useGeneral()
  const location = useLocation()
  const { activeNetwork } = useNetwork()
  const { account } = useWeb3React()
  const name = useENS()
  const { openAccountModal } = useCachedData()
  const bgColor = useMemo(
    () => (location.pathname == '/' || appTheme == 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgb(242, 242, 242)'),
    [appTheme, location.pathname]
  )

  return (
    <Button noborder nohover p={0} onClick={openAccountModal} {...props}>
      <Flex
        col
        style={{
          backgroundColor: bgColor,
          borderRadius: '10px',
          padding: '5px',
        }}
      >
        <Flex>
          <Flex col>
            <UserImage pt={4} pb={4} pr={10}>
              {account ? (
                <img style={{ borderRadius: '10px' }} src={makeBlockie(account)} alt={'account'} />
              ) : (
                <StyledWallet size={40} />
              )}
            </UserImage>
          </Flex>
          <Flex col around>
            {account ? (
              <Text textAlignLeft t4 {...props}>
                {name ?? shortenAddress(account)}
              </Text>
            ) : (
              <Text textAlignLeft t4 {...props}>
                Not Connected
              </Text>
            )}
            <Flex>
              {activeNetwork.logo && (
                <img src={activeNetwork.logo} width={25} height={25} style={{ marginRight: '2px' }} />
              )}
              <Text t5s nowrap mt={5} autoAlignVertical {...props}>
                {activeNetwork.name}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Button>
  )
}

export const MiniUserAccount: React.FC<ButtonProps & GeneralElementProps> = (props) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/
  const { appTheme } = useGeneral()
  const location = useLocation()
  const { account } = useWeb3React()
  const { openAccountModal } = useCachedData()
  const bgColor = useMemo(
    () => (location.pathname == '/' || appTheme == 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgb(242, 242, 242)'),
    [appTheme, location.pathname]
  )

  return (
    <Button noborder nohover p={0} onClick={openAccountModal} {...props}>
      <Flex
        col
        style={{
          backgroundColor: bgColor,
          borderRadius: '10px',
          padding: '5px',
        }}
      >
        <UserImage style={{ width: '30px', height: '30px' }}>
          {account ? (
            <img style={{ borderRadius: '10px' }} src={makeBlockie(account)} alt={'account'} />
          ) : (
            <StyledWallet size={30} />
          )}
        </UserImage>
      </Flex>
    </Button>
  )
}
