import React from 'react'
import { Card } from '../atoms/Card'
import { Flex, Scrollable } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { useCachedData } from '../../context/CachedDataManager'
import { useProvider } from '../../context/ProviderManager'
import { useNetwork } from '../../context/NetworkManager'
import ToggleSwitch from '../atoms/ToggleSwitch'

export function NetworkPopupPanel(): JSX.Element {
  const { networkModal } = useCachedData()

  const { adjustedNetworks, showTestnets, handleShowTestnets } = useProvider()
  const { activeNetwork, changeNetwork } = useNetwork()

  return (
    <>
      {networkModal && (
        <div style={{ position: 'fixed', top: '72px', right: '20px', zIndex: '1000' }}>
          <Card>
            <Flex col gap={10}>
              {/* <Flex justifyCenter itemsCenter>
                <Text t4>Show Testnets</Text>
                <ToggleSwitch
                  id="show-testnets"
                  toggled={showTestnets}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShowTestnets(!e.target.checked)}
                />
              </Flex> */}
              <Scrollable maxMobileHeight={'40vh'}>
                <Flex col style={{ margin: 'auto' }} gap={10}>
                  {adjustedNetworks.map((network) => (
                    <Card
                      px={20}
                      py={10}
                      canHover
                      key={network.name}
                      onClick={() => changeNetwork(network.chainId)}
                      jc="center"
                      info={network.chainId === activeNetwork.chainId}
                    >
                      <Text t4 bold light={network.chainId === activeNetwork.chainId}>
                        {network.name}
                      </Text>
                    </Card>
                  ))}
                </Flex>
              </Scrollable>
            </Flex>
          </Card>
        </div>
      )}
    </>
  )
}

export function NetworkPopupPanelMobile(): JSX.Element {
  const { networkModal } = useCachedData()

  const { adjustedNetworks, showTestnets, handleShowTestnets } = useProvider()
  const { activeNetwork, changeNetwork } = useNetwork()

  return (
    <>
      {networkModal && (
        <div style={{ position: 'fixed', top: '65px', zIndex: '1000', width: '100%' }}>
          <Card style={{ borderRadius: '0' }}>
            <Flex col gap={10}>
              {/* <Flex justifyCenter itemsCenter>
                <Text t4>Show Testnets</Text>
                <ToggleSwitch
                  id="show-testnets"
                  toggled={showTestnets}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShowTestnets(!e.target.checked)}
                />
              </Flex> */}
              <Scrollable maxMobileHeight={'40vh'}>
                <Flex col style={{ margin: 'auto' }} gap={10}>
                  {adjustedNetworks.map((network) => (
                    <Card
                      px={20}
                      py={10}
                      canHover
                      key={network.name}
                      onClick={() => changeNetwork(network.chainId)}
                      info={network.chainId === activeNetwork.chainId}
                    >
                      <Flex justifyCenter>
                        <Text t4 bold light={network.chainId === activeNetwork.chainId}>
                          {network.name}
                        </Text>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              </Scrollable>
            </Flex>
          </Card>
        </div>
      )}
    </>
  )
}
