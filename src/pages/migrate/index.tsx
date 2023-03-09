import { useWeb3React } from '@web3-react/core'
import React, { useState } from 'react'
import { Button } from '../../components/atoms/Button'
import { Content, Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { GenericInputSection } from '../../components/molecules/InputSection'
import { TileCard } from '../../components/molecules/TileCard'
import { WalletList } from '../../components/molecules/WalletList'

function Migrate(): JSX.Element {
  const { account } = useWeb3React()
  const value = '90'

  // 'eligible', 'ineligible', 'failed', 'successful'
  const [pageState, setPageState] = useState<number>(0)

  return (
    <Content>
      <Flex justifyCenter>
        <Flex col gap={30}>
          <Button mt={10} onClick={() => setPageState((pageState) => (pageState == 3 ? 0 : pageState + 1))}>
            Change page state
          </Button>
          {pageState == 0 && (
            <Text textAlignCenter t3>
              You have legacy SOLACE tokens. You can migrate your tokens to the SOLACE-V2 (New SOLACE Token).
            </Text>
          )}
          {pageState == 1 && (
            <Text textAlignCenter t3>
              It seems that you have no SOLACE in your wallet.
            </Text>
          )}
          {account && (
            <TileCard>
              <Text textAlignCenter semibold t5s>
                Available Amount
              </Text>
              <Text textAlignCenter bold t1>
                {value}
              </Text>
              <Flex col pt={10}>
                {pageState == 3 ? (
                  <>
                    <Text textAlignCenter t2 success bold>
                      Migration process completed
                    </Text>
                    <Text textAlignCenter t4>
                      Check your wallet for the migrated tokens
                    </Text>
                  </>
                ) : pageState == 2 ? (
                  <>
                    <Text textAlignCenter t2 warning bold>
                      Migration process failed
                    </Text>
                    <Text textAlignCenter t4>
                      Please try again later or contact the Solace team
                    </Text>
                  </>
                ) : (
                  <>
                    {pageState == 1 && (
                      <Text textAlignCenter t4>
                        The above amount is not eligible for migration
                      </Text>
                    )}
                    <Button techygradient secondary py={16} noborder disabled={pageState == 1}>
                      Migrate
                    </Button>
                  </>
                )}
              </Flex>
            </TileCard>
          )}
          {!account && (
            <>
              <Text t2 textAlignCenter>
                Please connect your wallet to see if your account is eligible to migrate legacy SOLACE tokens.
              </Text>
              <WalletList />
            </>
          )}
        </Flex>
      </Flex>
    </Content>
  )
}

export default Migrate
