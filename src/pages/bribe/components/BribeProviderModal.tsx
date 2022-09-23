import { parseUnits } from 'ethers/lib/utils'
import React, { useCallback, useState } from 'react'
import { Button } from '../../../components/atoms/Button'
import { Flex } from '../../../components/atoms/Layout'
import { Modal } from '../../../components/molecules/Modal'
import { BalanceDropdownOptions, DropdownInputSection } from '../../../components/organisms/Dropdown'
import { FunctionName } from '../../../constants/enums'
import { ReadToken } from '../../../constants/types'
import { useBribeController, useBribeControllerHelper } from '../../../hooks/bribe/useBribeController'
import { useTransactionExecution } from '../../../hooks/internal/useInputAmount'
import { useVoteContext } from '../../vote/VoteContext'
import { Text } from '../../../components/atoms/Typography'

export const BribeProviderModal = ({
  isOpen,
  handleClose,
  selectedGauge,
}: {
  isOpen: boolean
  handleClose: () => void
  selectedGauge: string
}): JSX.Element => {
  const { gauges } = useVoteContext()
  const { currentGaugesData } = gauges
  const { provideBribes } = useBribeController()
  const { bribeTokens, gaugeBribeInfo } = useBribeControllerHelper()
  const { handleContractCallError, handleToast } = useTransactionExecution()

  const [coinsOpen, setCoinsOpen] = useState<boolean>(false)
  const [stagingBribes, setStagingBribes] = useState<(ReadToken & { enteredAmount: string })[]>([])

  const callProvideBribes = useCallback(async () => {
    const foundGaugeId = currentGaugesData.find((gauge) => gauge.gaugeName === selectedGauge)?.gaugeId
    if (!foundGaugeId) return
    await provideBribes(
      stagingBribes.map((coin) => coin.address),
      stagingBribes.map((coin) => parseUnits(coin.enteredAmount, coin.decimals)),
      foundGaugeId
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callClaim', err, FunctionName.BRIBE_CLAIM))
  }, [provideBribes, stagingBribes, selectedGauge, currentGaugesData])

  const addNewBribe = useCallback(() => {
    const initialBribe = bribeTokens.filter(
      (bribe) => !stagingBribes.map((bribe) => bribe.address).includes(bribe.address)
    )[0]
    setStagingBribes((prev) => [
      ...prev,
      {
        name: initialBribe.name,
        address: initialBribe.address,
        enteredAmount: '',
        decimals: initialBribe.decimals,
        symbol: initialBribe.symbol,
      },
    ])
  }, [bribeTokens, stagingBribes])

  const changeBribeAmount = useCallback(
    (index: number, amount: string) => {
      setStagingBribes((prev) => {
        const newBribes = [...prev]
        newBribes[index].enteredAmount = amount
        return newBribes
      })
    },
    [setStagingBribes]
  )

  const changeBribeToken = useCallback(
    (index: number, tokenAddress: string) => {
      const foundToken = bribeTokens.find((bribe) => bribe.address === tokenAddress)
      if (!foundToken) return
      setStagingBribes((prev) => {
        const newBribes = [...prev]
        newBribes[index].name = foundToken.name
        newBribes[index].address = foundToken.address
        newBribes[index].decimals = foundToken.decimals
        newBribes[index].symbol = foundToken.symbol
        return newBribes
      })
    },
    [setStagingBribes, bribeTokens]
  )

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={selectedGauge}>
      <Flex col gap={16}>
        <Flex col gap={5}>
          {stagingBribes.map((stagingBribe, index) => (
            <Flex col key={index}>
              <DropdownInputSection
                hasArrow
                isOpen={coinsOpen}
                onClick={() => setCoinsOpen(!coinsOpen)}
                value={stagingBribe.enteredAmount}
                icon={
                  stagingBribe.name ? (
                    <img src={`https://assets.solace.fi/${stagingBribe.name.toLowerCase()}`} height={20} />
                  ) : undefined
                }
                text={stagingBribe.symbol}
                onChange={(e) => changeBribeAmount(index, e.target.value)}
                placeholder={'Amount'}
              />
              <BalanceDropdownOptions
                searchedList={bribeTokens}
                isOpen={true}
                onClick={(value: string) => {
                  changeBribeToken(index, value)
                  handleClose()
                }}
              />
            </Flex>
          ))}
        </Flex>
        <Button onClick={addNewBribe} noborder disabled={bribeTokens.length == 0}>
          <Text
            underline
            semibold
            style={{
              // underline width is 2 pixels
              textDecorationWidth: '3px',
              // separated by 3 pixels from the text
              textUnderlineOffset: '5px',
            }}
          >
            + Add Bribe
          </Text>
        </Button>
        <Button info onClick={callProvideBribes}>
          Provide Bribe
        </Button>
      </Flex>
    </Modal>
  )
}
