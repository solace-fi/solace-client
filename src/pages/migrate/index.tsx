import { BigNumber, ZERO } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import axios from 'axios'
import { formatUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box } from '../../components/atoms/Box'
import { Button } from '../../components/atoms/Button'
import { StyledArrowRight, StyledInfo } from '../../components/atoms/Icon'
import { Content, Flex } from '../../components/atoms/Layout'
import { Loader } from '../../components/atoms/Loader'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { TileCard } from '../../components/molecules/TileCard'
import { WalletList } from '../../components/molecules/WalletList'
import { FunctionName } from '../../constants/enums'
import { SOLACE_TOKEN, SGT } from '../../constants/mappings/token'
import { useContracts } from '../../context/ContractsManager'
import { useGeneral } from '../../context/GeneralManager'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { useMigrate } from '../../hooks/migrate/useMigrate'
import { SGTMigrationNotification } from '../stake/organisms/NotificationBox'

function Migrate(): JSX.Element {
  const { account, chainId } = useWeb3React()
  const { appTheme } = useGeneral()
  const { migrated, migrate, verify } = useMigrate()
  const { handleContractCallError, handleToast } = useTransactionExecution()
  const { keyContracts } = useContracts()
  const { migration } = keyContracts

  const [migratableAmount, setMigratableAmount] = useState<string>('0')
  const [data, setData] = useState<any>(undefined)
  const [failedDataQuery, setFailedDataQuery] = useState<boolean>(false)
  const [canMigrate, setCanMigrate] = useState<boolean>(true)
  const [isVerified, setIsVerified] = useState<boolean>(true)
  const [pageLoading, setPageLoading] = useState<boolean>(false)
  const [successfulTx, setSuccessfulTx] = useState<boolean | undefined>(undefined)

  const eligiblePageStartState = useMemo(
    () => successfulTx == undefined && canMigrate && !pageLoading && migratableAmount != '0' && isVerified,
    [successfulTx, canMigrate, pageLoading, migratableAmount]
  )

  const ineligiblePageStartState = useMemo(
    () => successfulTx == undefined && (!canMigrate || migratableAmount == '0' || !isVerified) && !pageLoading,
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
    setSuccessfulTx(undefined)
    const accountData = data.find((x: any) => x.account.toLowerCase() == account.toLowerCase())
    if (!accountData) {
      setCanMigrate(false)
      setIsVerified(false)
      setMigratableAmount('0')
      return
    }
    const [hasMigrated, _isVerified] = await Promise.all([
      migrated(account),
      verify(accountData.account, BigNumber.from(accountData.amount), accountData.proof),
    ])
    setCanMigrate(!hasMigrated)
    setIsVerified(_isVerified)
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
    setSuccessfulTx(res)
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
        setData(undefined)
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
          <SGTMigrationNotification />
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
              {account && eligiblePageStartState && (
                <Text textAlignCenter t3>
                  This account contains SOLACE tokens. You can migrate those tokens from SOLACE to SGT.
                </Text>
              )}
              {account && ineligiblePageStartState && (
                <Text textAlignCenter t3>
                  {!canMigrate
                    ? 'The tokens for this account have already migrated.'
                    : migratableAmount == '0'
                    ? 'This account has no tokens to migrate.'
                    : !isVerified
                    ? 'This account is not verified for migration.'
                    : ''}
                </Text>
              )}
              {account && (
                <TileCard>
                  <Flex gap={10} p={10} rounded justifyCenter>
                    <img src={'https://assets.solace.fi/solace'} height={60} />
                    <StyledArrowRight size={60} />
                    <img src={`https://assets.solace.fi/${SGT.address[1].toUpperCase()}`} height={60} />
                  </Flex>
                  <Text textAlignCenter semibold t5s>
                    {successfulPageStartState
                      ? 'Successfully migrated'
                      : !canMigrate
                      ? 'Amount migrated'
                      : 'Migratable SOLACE Amount'}
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
                          Check your wallet for the migrated SGT tokens
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
                          disabled={!canMigrate || migratableAmount == '0' || failedDataQuery || !isVerified}
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
                    Please connect your wallet to see if you can migrate SOLACE tokens to SGT tokens.
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
