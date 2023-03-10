import { BigNumber, ZERO } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import { formatUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useState } from 'react'
import { Box } from '../../components/atoms/Box'
import { Button } from '../../components/atoms/Button'
import { StyledInfo } from '../../components/atoms/Icon'
import { Content, Flex } from '../../components/atoms/Layout'
import { Loader } from '../../components/atoms/Loader'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { TileCard } from '../../components/molecules/TileCard'
import { WalletList } from '../../components/molecules/WalletList'
import { FunctionName } from '../../constants/enums'
import { SOLACE_TOKEN } from '../../constants/mappings/token'
import { useCachedData } from '../../context/CachedDataManager'
import { useContracts } from '../../context/ContractsManager'
import { useGeneral } from '../../context/GeneralManager'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { useMigrate } from '../../hooks/migrate/useMigrate'

function Migrate(): JSX.Element {
  const { account, chainId } = useWeb3React()
  const { appTheme } = useGeneral()
  const { balanceOf, migrate } = useMigrate()
  const { handleContractCallError, handleToast } = useTransactionExecution()
  const { keyContracts } = useContracts()
  const { migration } = keyContracts

  // 'eligible', 'ineligible', 'failed', 'successful', 'loading'
  const [pageState, setPageState] = useState<number>(0)

  const [migratableAmount, setMigratableAmount] = useState<BigNumber>(ZERO)

  const getMigratableAmount = useCallback(async () => {
    if (chainId && account) {
      const migratableAmount = await balanceOf(account)
      if (migratableAmount.eq(ZERO)) {
        setPageState(1)
      } else {
        setPageState(0)
      }
      setMigratableAmount(migratableAmount)
    }
  }, [chainId, account])

  const callMigrate = useCallback(async () => {
    if (!chainId || !account) return
    setPageState(4)
    await migrate()
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callVoteForBribe', err, FunctionName.MIGRATE))
  }, [chainId, account])

  const _handleToast = async (tx: any, localTx: any) => {
    const res = await handleToast(tx, localTx)
    if (res) {
      setPageState(3)
    } else {
      setPageState(2)
    }
  }

  const _handleContractCallError = (functionName: string, err: any, functionNameEnum: FunctionName) => {
    handleContractCallError(functionName, err, functionNameEnum)
    setPageState(2)
  }

  useEffect(() => {
    getMigratableAmount()
  }, [getMigratableAmount])

  return (
    <>
      {migration ? (
        <Content>
          <Flex justifyCenter>
            <Flex col gap={30}>
              <Button mt={10} onClick={() => setPageState((pageState) => (pageState == 4 ? 0 : pageState + 1))}>
                Change page state
              </Button>
              {pageState == 0 && (
                <Text textAlignCenter t3>
                  Your wallet contains SOLACE-V1 tokens. You can migrate those tokens from SOLACE-V1 to SOLACE-V2.
                </Text>
              )}
              {pageState == 1 && (
                <Text textAlignCenter t3>
                  It seems that you have no SOLACE-V1 tokens in your wallet.
                </Text>
              )}
              {account && (
                <TileCard>
                  <Text textAlignCenter semibold t5s>
                    Migratable SOLACE-V1 Amount
                  </Text>
                  <Text textAlignCenter bold t1>
                    {formatUnits(migratableAmount, SOLACE_TOKEN.constants.decimals)}
                  </Text>
                  <Flex col pt={10}>
                    {pageState == 4 ? (
                      <Loader />
                    ) : pageState == 3 ? (
                      <>
                        <Text textAlignCenter t2 success bold>
                          Migration process completed
                        </Text>
                        <Text textAlignCenter t4>
                          Check your wallet for the migrated SOLACE-V2 tokens
                        </Text>
                      </>
                    ) : pageState == 2 ? (
                      <>
                        <Text textAlignCenter t2 warning bold>
                          Migration process failed
                        </Text>
                        <Text textAlignCenter t4>
                          Something went wrong, please try again later or contact the Solace team
                        </Text>
                      </>
                    ) : (
                      <>
                        {pageState == 1 && (
                          <Text textAlignCenter t4>
                            The above amount is not eligible for migration
                          </Text>
                        )}
                        <Button
                          techygradient={appTheme == 'light'}
                          warmgradient={appTheme == 'dark'}
                          secondary
                          py={16}
                          noborder
                          disabled={pageState == 1}
                          onClick={callMigrate}
                        >
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
                    Please connect your wallet to see if you can migrate SOLACE-V1 tokens.
                  </Text>
                  <WalletList />
                </>
              )}
            </Flex>
          </Flex>
        </Content>
      ) : (
        <Content>
          <Box error pt={10} pb={10} pl={15} pr={15}>
            <TextSpan light textAlignLeft>
              <StyledInfo size={30} />
            </TextSpan>
            <Text light bold style={{ margin: '0 auto' }}>
              Migration is not available on this network.
            </Text>
          </Box>
        </Content>
      )}
    </>
  )
}

export default Migrate
