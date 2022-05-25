import React from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Button } from '../../components/atoms/Button'
import { useFunctions } from '../../hooks/policy/useSolaceCoverProduct'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { FunctionName } from '../../constants/enums'
import { Text } from '../../components/atoms/Typography'
import { TileCard } from '../../components/molecules/TileCard'
import { useWeb3React } from '@web3-react/core'

export function CoverageActive({ policyStatus }: { policyStatus: boolean }) {
  const { deactivatePolicy } = useFunctions()
  const { account } = useWeb3React()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  const callDeactivatePolicy = async () => {
    if (!account) return
    await deactivatePolicy()
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callDeactivatePolicy', err, FunctionName.SOTERIA_DEACTIVATE))
  }

  return (
    <TileCard>
      <Flex between itemsCenter>
        <Flex col gap={6}>
          <Flex stretch gap={7}>
            <Text t2s bold>
              Coverage
            </Text>
            <Text t2s bold success={policyStatus} warning={!policyStatus}>
              {policyStatus ? 'Active' : 'Inactive'}
            </Text>
          </Flex>
        </Flex>
        <Flex between itemsCenter>
          {policyStatus && (
            <Button onClick={callDeactivatePolicy} error>
              Deactivate
            </Button>
          )}
        </Flex>
      </Flex>
    </TileCard>
  )
}
