import { parseUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, GraySquareButton } from '../../../components/atoms/Button'
import { Flex, ShadowDiv } from '../../../components/atoms/Layout'
import { Modal } from '../../../components/molecules/Modal'
import { BalanceDropdownOptions, DropdownInputSection } from '../../../components/organisms/Dropdown'
import { FunctionName } from '../../../constants/enums'
import { ReadToken } from '../../../constants/types'
import { useBribeController, useBribeControllerHelper } from '../../../hooks/bribe/useBribeController'
import { useTransactionExecution } from '../../../hooks/internal/useInputAmount'
import { useVoteContext } from '../../vote/VoteContext'
import { Text } from '../../../components/atoms/Typography'
import { formatAmount } from '../../../utils/formatting'
import { useTokenAllowance, useTokenApprove } from '../../../hooks/contract/useToken'
import { ERC20_ABI } from '../../../constants/abi'
import { useProvider } from '../../../context/ProviderManager'
import { Contract } from 'ethers'
import { useContracts } from '../../../context/ContractsManager'
import { Loader } from '../../../components/atoms/Loader'
import { useBribeContext } from '../BribeContext'

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
  const { intrface, bribes } = useBribeContext()
  const { bribeTokens, gaugeBribeInfo } = bribes
  const { handleContractCallError, handleToast } = useTransactionExecution()

  const [coinsOpen, setCoinsOpen] = useState<number | undefined>(undefined)
  const [stagingBribes, setStagingBribes] = useState<(ReadToken & { enteredAmount: string; approved: boolean })[]>([])

  const callProvideBribes = useCallback(async () => {
    const foundGaugeId = currentGaugesData.find((gauge) => gauge.gaugeName === selectedGauge)?.gaugeId
    if (!foundGaugeId) return
    await provideBribes(
      stagingBribes.map((coin) => coin.address),
      stagingBribes.map((coin) => parseUnits(formatAmount(coin.enteredAmount), coin.decimals)),
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
        approved: false,
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

  const deleteBribe = useCallback(
    (index: number) => {
      setStagingBribes((prev) => {
        const newBribes = [...prev]
        newBribes.splice(index, 1)
        return newBribes
      })
    },
    [setStagingBribes]
  )

  const handleCoinsOpen = useCallback((value: number | undefined) => {
    setCoinsOpen(value)
  }, [])

  const handleBribeApproval = useCallback((index: number, approval: boolean) => {
    setStagingBribes((prev) => {
      const newBribes = [...prev]
      newBribes[index].approved = approval
      return newBribes
    })
  }, [])

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={selectedGauge}>
      <Flex col gap={16} width={350}>
        <Flex col gap={5}>
          {stagingBribes.map((stagingBribe, index) => (
            <Flex col key={index} gap={5}>
              <ProvidedBribe
                stagingBribe={stagingBribe}
                coinsOpen={coinsOpen}
                index={index}
                handleCoinsOpen={handleCoinsOpen}
                changeBribeAmount={changeBribeAmount}
                deleteBribe={deleteBribe}
                handleBribeApproval={handleBribeApproval}
              />
              <BalanceDropdownOptions
                searchedList={bribeTokens}
                isOpen={coinsOpen == index}
                onClick={(value: string) => {
                  changeBribeToken(index, value)
                  setCoinsOpen(undefined)
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
        <Button
          info
          onClick={callProvideBribes}
          disabled={
            stagingBribes.length == 0 || stagingBribes.some((bribe) => bribe.enteredAmount == '' || !bribe.approved)
          }
        >
          Provide Bribe
        </Button>
      </Flex>
    </Modal>
  )
}

export const ProvidedBribe = ({
  stagingBribe,
  coinsOpen,
  index,
  handleCoinsOpen,
  changeBribeAmount,
  deleteBribe,
  handleBribeApproval,
}: {
  stagingBribe: ReadToken & { enteredAmount: string }
  coinsOpen: number | undefined
  index: number
  handleCoinsOpen: (index: number | undefined) => void
  changeBribeAmount: (index: number, amount: string) => void
  deleteBribe: (index: number) => void
  handleBribeApproval: (index: number, approval: boolean) => void
}): JSX.Element => {
  const { keyContracts } = useContracts()
  const { bribeController } = keyContracts
  const { signer } = useProvider()
  const { approve } = useTokenApprove()
  const selectedCoinContract = useMemo(
    () => (stagingBribe ? new Contract(stagingBribe.address, ERC20_ABI, signer) : undefined),
    [stagingBribe, signer]
  )
  const approval = useTokenAllowance(
    selectedCoinContract ?? null,
    bribeController?.address ?? null,
    stagingBribe.enteredAmount && stagingBribe.enteredAmount != '.'
      ? parseUnits(stagingBribe.enteredAmount, stagingBribe?.decimals ?? 18).toString()
      : '0'
  )

  useEffect(() => {
    handleBribeApproval(index, approval)
  }, [approval, handleBribeApproval, index])

  return (
    <Flex col gap={2}>
      <Flex gap={5}>
        <DropdownInputSection
          hasArrow
          isOpen={coinsOpen == index}
          onClick={() => handleCoinsOpen(coinsOpen == undefined ? index : coinsOpen != index ? index : undefined)}
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
        <ShadowDiv>
          <GraySquareButton width={36} heightP={100} actuallyWhite noborder onClick={() => deleteBribe(index)}>
            X
          </GraySquareButton>
        </ShadowDiv>
      </Flex>
      {!approval && parseFloat(formatAmount(stagingBribe.enteredAmount)) > 0 && (
        <Button onClick={approve} info secondary>
          Approve Entered {stagingBribe.symbol}
        </Button>
      )}
    </Flex>
  )
}
