import { BigNumber, ZERO } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import axios from 'axios'
import { formatUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
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

const migrations = [
  {
    account: '0x34Bb9e91dC8AC1E13fb42A0e23f7236999e063D4',
    amount: '100',
    proof: [
      '0x25d4da69e3d9b31bff47e00fc6d8ecdbeafbef5cb2c701438cd71e4930d8985e',
      '0xab430e10e4f5f8d08be5d21acc0505afab7d9ec58df80c38a9173105afa7754a',
      '0x6ff272e0a6165ac0f5b28ee7acc3c44da4624c6b32241dd6f31756a4a5697205',
      '0xcef30c0db95c3274a6915192aa6195ed4f61b3d5db0e5290221d1c5df08059d4',
      '0x2ad6c2592d536ca4a5259504d9b7616d052db0d87ab34b84b84fe61cb3d770a2',
      '0x42b3c318e6e756f2e4b567ca0a8efd10147e4554af361c2bb78d3eac7e02eea9',
      '0xfd10c89d063c69f8029084e437d06fc14f81752e706eed3d789e4f41ea1683c8',
      '0x3d02c13b07207fe8bba7883d2a7c63e43a60f3d797d7d6c21dbb115e5c6ea804',
      '0xd753835a34d7b0c52aea9650b391687e6706a1010711afc12b98fc52641f23c5',
      '0x2ff0cc2651ae584dd4804de799c6748d77ad22f1e2aa16e769cb702a9b32f33b',
      '0x18f189ca057c44b1060468ce32f23709ac4ce0fda642fbd367f4728db5d8c8ce',
    ],
  },
  {
    account: '0x091C8a414BA05B5112cC104F5309398417C09160',
    amount: '11358926842763281000000',
    proof: [
      '0xe2af7bf4f441333778d49f6aa552ee4616791075dfc886d3970ab7bfbb0787b0',
      '0x54698b017263487c46ea51e616f7f41d5f6a2f5ce40a5f9d5c231024ddd386ed',
      '0x6da6ded50b7da30ab4ff3059943c4458f05efb559b5ccc6e226483048d923715',
      '0x41ac51b52e89d393d234ac8e63411f8f321f8ebc6013c10c53c8709f00c2e7b8',
      '0x48fc590b59fa684956fc343dfcff15f567c475968a3de7705350e02c4f9cafa8',
      '0x9a5c86933bf605e5eb5d7caf9ff50f5d512deab1ccc2e211d6bc954a0abd229a',
      '0xa9adc0e41492a087f459b7bdf94e85bdff0cb1f4db8f62bacefbeeb65b3e4071',
      '0xf73e161d38febd916d5ff9a80457d0c71851733a866658e73517dad485cfa7fe',
      '0x73bf560e890bdb044e7c9e87164448fc7220ced628a8398c509d93300c60b59d',
      '0x470fe9d1ba280d8918c63a92e1c8211731a57a192136fbd51385fad3e703e3f1',
    ],
  },
]

function Migrate(): JSX.Element {
  const { account, chainId } = useWeb3React()
  const { appTheme } = useGeneral()
  const { migrated, migrate } = useMigrate()
  const { handleContractCallError, handleToast } = useTransactionExecution()
  const { keyContracts } = useContracts()
  const { migration } = keyContracts

  const [migratableAmount, setMigratableAmount] = useState<string>('0')
  const [data, setData] = useState<any>(undefined)
  const [failedDataQuery, setFailedDataQuery] = useState<boolean>(false)
  const [canMigrate, setCanMigrate] = useState<boolean>(true)
  const [pageLoading, setPageLoading] = useState<boolean>(false)
  const [successfulTx, setSuccessfulTx] = useState<boolean | undefined>(undefined)

  const eligiblePageStartState = useMemo(
    () => successfulTx == undefined && canMigrate && !pageLoading && migratableAmount != '0',
    [successfulTx, canMigrate, pageLoading, migratableAmount]
  )

  const ineligiblePageStartState = useMemo(
    () => successfulTx == undefined && (!canMigrate || migratableAmount == '0') && !pageLoading,
    [successfulTx, canMigrate, pageLoading, migratableAmount]
  )

  const failedPageStartState = useMemo(() => successfulTx == false && !pageLoading, [successfulTx, pageLoading])

  const successfulPageStartState = useMemo(() => successfulTx == true && !pageLoading, [successfulTx, pageLoading])

  // const eligiblePageStartState = true
  // const ineligiblePageStartState = false
  // const failedPageStartState = false
  // const successfulPageStartState = false

  const setupMigration = useCallback(async () => {
    if (!chainId || !account || !data) return
    const accountData = data.find((x: any) => x.account.toLowerCase() == account.toLowerCase())
    if (!accountData) {
      setCanMigrate(false)
      setMigratableAmount('0')
      return
    }
    const res = await migrated(account)
    setCanMigrate(!res)
    setMigratableAmount(accountData.amount)
  }, [chainId, account, data])

  const callMigrate = useCallback(async () => {
    if (!chainId || !account || !data) return
    const accountData = data.find((x: any) => x.account.toLowerCase() == account.toLowerCase())
    if (!accountData) return
    setPageLoading(true)
    await migrate(accountData.account, BigNumber.from(accountData.amount), accountData.proof)
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callMigrate', err, FunctionName.MIGRATE))
  }, [chainId, account])

  const _handleToast = async (tx: any, localTx: any) => {
    const res = await handleToast(tx, localTx)
    setPageLoading(false)
    if (res) {
      setSuccessfulTx(true)
    } else {
      setSuccessfulTx(false)
    }
  }

  const _handleContractCallError = (functionName: string, err: any, functionNameEnum: FunctionName) => {
    handleContractCallError(functionName, err, functionNameEnum)
    setPageLoading(false)
    setSuccessfulTx(false)
  }

  useEffect(() => {
    const getData = async () => {
      try {
        const { data } = await axios.get('https://solace-migrations.s3.us-west-2.amazonaws.com/migrations.json')
        setData(data)
        setFailedDataQuery(false)
      } catch (err) {
        console.log(err)
        setData([])
        setFailedDataQuery(true)
      }
    }
    getData()
  }, [])

  useEffect(() => {
    setupMigration()
  }, [setupMigration])

  return (
    <>
      {migration ? (
        <Content>
          <Flex justifyCenter>
            <Flex col gap={30}>
              {failedDataQuery && (
                <Box error pt={10} pb={10} pl={15} pr={15}>
                  <TextSpan light textAlignLeft>
                    <StyledInfo size={30} />
                  </TextSpan>
                  <Text light bold style={{ margin: '0 auto' }}>
                    Failed to fetch migrations data. Please try again later.
                  </Text>
                </Box>
              )}
              {eligiblePageStartState && (
                <Text textAlignCenter t3>
                  This account contains SOLACE-V1 tokens. You can migrate those tokens from SOLACE-V1 to SOLACE-V2.
                </Text>
              )}
              {ineligiblePageStartState && (
                <Text textAlignCenter t3>
                  This account is not eligible for migration{' '}
                  {!canMigrate
                    ? 'because you already migrated'
                    : migratableAmount == '0'
                    ? 'because you have no SOLACE-V1 tokens'
                    : ''}
                  .
                </Text>
              )}
              {account && (
                <TileCard>
                  <Text textAlignCenter semibold t5s>
                    {successfulPageStartState ? 'Successfully migrated' : 'Migratable SOLACE-V1 Amount'}
                  </Text>
                  <Text textAlignCenter bold t1>
                    {formatUnits(migratableAmount, SOLACE_TOKEN.constants.decimals)}
                  </Text>
                  <Flex col pt={10}>
                    {pageLoading ? (
                      <Loader />
                    ) : successfulPageStartState ? (
                      <>
                        <Text textAlignCenter t2 success bold>
                          Migration process completed
                        </Text>
                        <Text textAlignCenter t4>
                          Check your wallet for the migrated SOLACE-V2 tokens
                        </Text>
                      </>
                    ) : failedPageStartState ? (
                      <>
                        <Text textAlignCenter t2 warning bold>
                          Migration process failed
                        </Text>
                        <Text textAlignCenter t4>
                          Something went wrong, you may have already claimed the new tokens.
                        </Text>
                        <Text textAlignCenter t4>
                          Otherwise please try again later or contact the Solace team.
                        </Text>
                        <Button
                          mt={10}
                          techygradient={appTheme == 'light'}
                          warmgradient={appTheme == 'dark'}
                          secondary
                          py={16}
                          noborder
                          disabled={!canMigrate || migratableAmount == '0' || failedDataQuery}
                          onClick={callMigrate}
                        >
                          Try again
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          techygradient={appTheme == 'light'}
                          warmgradient={appTheme == 'dark'}
                          secondary
                          py={16}
                          noborder
                          disabled={ineligiblePageStartState || failedDataQuery}
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
