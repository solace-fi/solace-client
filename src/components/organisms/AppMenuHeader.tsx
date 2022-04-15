import React, { useMemo } from 'react'
import { Flex, ShadowDiv } from '../atoms/Layout'

import { UserImage } from '../atoms/User'
import { useWallet } from '../../context/WalletManager'
import makeBlockie from 'ethereum-blockies-base64'
import { StyledWallet } from '../atoms/Icon'
import { Button } from '../atoms/Button'
import { Text } from '../atoms/Typography'
import { useLocation } from 'react-router-dom'
import { PageInfo } from '../../constants/types'
import { SolaceGradientCircle } from '../molecules/SolaceGradientCircle'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'

export const AppMenuHeader: React.FC<{ pages: PageInfo[]; setShow: (show: boolean) => void }> = ({
  pages,
  setShow,
}) => {
  const { scrollPosition } = useWindowDimensions()
  const { account } = useWallet()
  const location = useLocation()
  const title = useMemo(() => {
    const to = location.pathname
    const page = pages.find((p) => p.to === to)
    if (page) {
      return page.title
    }
    return ''
  }, [location.pathname, pages])

  return (
    <Flex stretch between itemsCenter p={10}>
      <Text bold big2>
        {title}
      </Text>
      <ShadowDiv style={{ borderRadius: '28px', position: 'fixed', right: '50px' }}>
        <Button
          secondary
          nohover
          noborder
          p={8}
          style={{ borderRadius: '28px', backgroundColor: '#fff', minWidth: 'unset' }}
          onClick={() => setShow(true)}
        >
          <Flex>
            {account ? (
              <SolaceGradientCircle>
                <UserImage style={{ width: '30px', height: '30px', margin: 'auto' }}>
                  <img src={makeBlockie(account)} alt={'account'} />
                </UserImage>
              </SolaceGradientCircle>
            ) : (
              <Text dark>
                <StyledWallet size={30} />
              </Text>
            )}
            {scrollPosition == 0 && (
              <Text t4 bold techygradient autoAlignVertical ml={8}>
                My Solace
              </Text>
            )}
          </Flex>
        </Button>
      </ShadowDiv>
    </Flex>
  )
}
