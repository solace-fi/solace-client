import React, { useMemo, useEffect, useState } from 'react'
import { Flex, ShadowDiv } from '../atoms/Layout'

import { UserImage } from '../atoms/User'
import makeBlockie from 'ethereum-blockies-base64'
import { Button } from '../atoms/Button'
import { Text } from '../atoms/Typography'
import { useLocation } from 'react-router-dom'
import { PageInfo } from '../../constants/types'
import { SolaceGradientCircle } from '../molecules/SolaceGradientCircle'
import UserGradient from '../../resources/svg/user_gradient.svg'
import { useWeb3React } from '@web3-react/core'
import { shortenAddress } from '../../utils/formatting'
import { useENS } from '../../hooks/wallet/useENS'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralManager'
import { Z_NAV } from '../../constants'

export const AppMenuHeader: React.FC<{ pages: PageInfo[]; setShow: (show: boolean) => void }> = ({
  pages,
  setShow,
}) => {
  const { rightSidebar } = useGeneral()
  const { account } = useWeb3React()
  const name = useENS()
  const { activeNetwork } = useNetwork()
  const [scrollPosition, setScrollPosition] = useState(0)
  const location = useLocation()
  const title = useMemo(() => {
    const to = location.pathname
    const page = pages.find((p) => p.to === to)
    if (page) {
      return page.title
    }
    return ''
  }, [location.pathname, pages])

  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset
      setScrollPosition(position)
    }
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <Flex stretch between itemsCenter pb={40}>
      <Text bold big2>
        {title}
      </Text>
      <ShadowDiv
        style={{
          transition: '350ms',
          borderRadius: '28px',
          position: 'fixed',
          right: rightSidebar ? '425px' : '50px',
          opacity: rightSidebar ? '0' : '1',
          zIndex: Z_NAV,
        }}
      >
        <Button
          secondary
          nohover
          noborder
          p={8}
          style={{ borderRadius: '28px', backgroundColor: '#fff', minWidth: 'unset' }}
          onClick={() => setShow(true)}
        >
          <Flex between gap={5} itemsCenter>
            {account ? (
              <SolaceGradientCircle>
                <UserImage style={{ width: '24px', height: '24px', margin: 'auto' }}>
                  <img src={makeBlockie(account)} alt={'account'} />
                </UserImage>
              </SolaceGradientCircle>
            ) : (
              <img src={UserGradient} />
            )}
            {scrollPosition <= 40 &&
              (account ? (
                <Flex col around>
                  <Text textAlignLeft t4 dark techygradient>
                    {name ?? shortenAddress(account)}
                  </Text>
                  <Flex>
                    {activeNetwork.logo && (
                      <img src={activeNetwork.logo} width={20} height={20} style={{ marginRight: '2px' }} />
                    )}
                    <Text t5s nowrap autoAlignVertical dark>
                      {activeNetwork.name}
                    </Text>
                  </Flex>
                </Flex>
              ) : (
                <Flex col around>
                  <Text textAlignLeft t5s dark>
                    Not connected
                  </Text>
                  <Text textAlignLeft t4>
                    <Flex>
                      {activeNetwork.logo && (
                        <img src={activeNetwork.logo} width={20} height={20} style={{ marginRight: '2px' }} />
                      )}
                      <Text t5s nowrap autoAlignVertical dark>
                        {activeNetwork.name}
                      </Text>
                    </Flex>
                  </Text>
                </Flex>
              ))}
          </Flex>
        </Button>
      </ShadowDiv>
    </Flex>
  )
}
