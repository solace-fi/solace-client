/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components
    import hooks
    import utils

    UserAccount function
      custom hooks
      local functions
      Render
    Account function
      custom hooks
      local functions
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import packages */
import makeBlockie from 'ethereum-blockies-base64'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Text } from '../atoms/Typography'
import { SmallBox } from '../atoms/Box'
import { UserImage } from '../atoms/User'

/* import hooks */
import { useNativeTokenBalance } from '../../hooks/useBalance'

/* import utils */
import { shortenAddress, fixed, capitalizeFirstLetter } from '../../utils/formatting'
import { Button, ButtonProps } from '../atoms/Button'
import { FlexCol, FlexRow } from '../atoms/Layout'
import { StyledNetworkChart, StyledWallet } from '../atoms/Icon'

export const UserAccount: React.FC<ButtonProps> = (props) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { account } = useWallet()
  const balance = useNativeTokenBalance()
  const { activeNetwork } = useNetwork()
  const { openAccountModal } = useCachedData()

  /*************************************************************************************

  Render
  
  *************************************************************************************/
  return (
    <Button nohover noborder onClick={() => openAccountModal()} style={{ fontWeight: 500 }} {...props}>
      <FlexRow>
        <StyledNetworkChart size={25} style={{ margin: 'auto' }} />
        <Text t4 nowrap autoAlign {...props}>
          {capitalizeFirstLetter(activeNetwork.name)}
        </Text>
      </FlexRow>
      {account ? (
        <FlexRow>
          <FlexCol style={{ justifyContent: 'space-around' }} ml={10}>
            <Text textAlignRight t4 {...props}>
              {shortenAddress(account)}
            </Text>
            <Text textAlignRight t4 bold nowrap {...props}>
              {balance ? `${fixed(balance, 3)} ${activeNetwork.nativeCurrency.symbol}` : ''}
            </Text>
          </FlexCol>
          <FlexCol>
            <UserImage secureCircle p={2} ml={10}>
              <img src={makeBlockie(account)} alt={'account'} />
            </UserImage>
          </FlexCol>
        </FlexRow>
      ) : (
        <SmallBox ml={5} transparent outlined>
          <Text t4 autoAlign nowrap {...props}>
            Not connected
          </Text>
        </SmallBox>
      )}
    </Button>
  )
}

export const SidebarAccount: React.FC<ButtonProps> = (props) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { activeNetwork } = useNetwork()
  const { account } = useWallet()
  const balance = useNativeTokenBalance()
  const { openAccountModal } = useCachedData()

  /*************************************************************************************

  Render
  
  *************************************************************************************/

  return (
    <Button noborder nohover mt={15} p={0} onClick={() => openAccountModal()} {...props}>
      <FlexCol>
        {account ? (
          <FlexRow>
            <FlexCol>
              <UserImage pt={4} pb={4} pr={10}>
                <img style={{ borderRadius: '10px' }} src={makeBlockie(account)} alt={'account'} />
              </UserImage>
            </FlexCol>
            <FlexCol style={{ justifyContent: 'space-around' }}>
              <Text textAlignLeft t4 {...props}>
                {shortenAddress(account)}
              </Text>
              <Text textAlignLeft t4 bold nowrap {...props}>
                {balance ? `${fixed(balance, 3)} ${activeNetwork.nativeCurrency.symbol}` : ''}
              </Text>
            </FlexCol>
          </FlexRow>
        ) : (
          <FlexRow>
            <FlexCol>
              <StyledWallet size={25} />
            </FlexCol>
            <FlexCol style={{ justifyContent: 'space-around' }}>
              <Text textAlignLeft t4 {...props}>
                Not Connected
              </Text>
            </FlexCol>
          </FlexRow>
        )}
        <FlexRow mt={10}>
          <StyledNetworkChart size={25} />
          <Text t4 nowrap mt={5} {...props}>
            {capitalizeFirstLetter(activeNetwork.name)}
          </Text>
        </FlexRow>
      </FlexCol>
    </Button>
  )
}
