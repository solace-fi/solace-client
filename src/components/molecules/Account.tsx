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

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralManager'

/* import components */
import { Text } from '../atoms/Typography'
import { UserImage } from '../atoms/User'
import { Button, ButtonProps } from '../atoms/Button'
import { FlexCol, FlexRow } from '../atoms/Layout'
import { StyledNetworkChart, StyledWallet } from '../atoms/Icon'
import { GeneralElementProps } from '../generalInterfaces'

/* import utils */
import { shortenAddress, capitalizeFirstLetter } from '../../utils/formatting'

export const UserAccount: React.FC<ButtonProps & GeneralElementProps> = (props) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/
  const { appTheme } = useGeneral()
  const location = useLocation()
  const { activeNetwork } = useNetwork()
  const { account, name } = useWallet()
  const { openAccountModal } = useCachedData()
  const bgColor = useMemo(
    () => (location.pathname == '/' || appTheme == 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgb(242, 242, 242)'),
    [appTheme, location.pathname]
  )

  return (
    <Button noborder nohover p={0} onClick={openAccountModal} {...props}>
      <FlexCol
        style={{
          backgroundColor: bgColor,
          borderRadius: '10px',
          padding: '5px',
        }}
      >
        <FlexRow>
          <FlexCol>
            <UserImage pt={4} pb={4} pr={10}>
              {account ? (
                <img style={{ borderRadius: '10px' }} src={makeBlockie(account)} alt={'account'} />
              ) : (
                <StyledWallet size={40} />
              )}
            </UserImage>
          </FlexCol>
          <FlexCol jc={'space-around'}>
            {account ? (
              <Text textAlignLeft t4 {...props}>
                {name ?? shortenAddress(account)}
              </Text>
            ) : (
              <Text textAlignLeft t4 {...props}>
                Not Connected
              </Text>
            )}
            <FlexRow>
              <StyledNetworkChart size={25} />
              <Text t4 nowrap mt={5} {...props}>
                {capitalizeFirstLetter(activeNetwork.name)}
              </Text>
            </FlexRow>
          </FlexCol>
        </FlexRow>
      </FlexCol>
    </Button>
  )
}

export const MiniUserAccount: React.FC<ButtonProps & GeneralElementProps> = (props) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/
  const { appTheme } = useGeneral()
  const location = useLocation()
  const { account } = useWallet()
  const { openAccountModal } = useCachedData()
  const bgColor = useMemo(
    () => (location.pathname == '/' || appTheme == 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgb(242, 242, 242)'),
    [appTheme, location.pathname]
  )

  return (
    <Button noborder nohover p={0} onClick={openAccountModal} {...props}>
      <FlexCol
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
      </FlexCol>
    </Button>
  )
}
