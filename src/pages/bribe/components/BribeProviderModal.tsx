import { parseUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, GraySquareButton } from '../../../components/atoms/Button'
import { Flex, ShadowDiv } from '../../../components/atoms/Layout'
import { Modal } from '../../../components/molecules/Modal'
import { BalanceDropdownOptions, DropdownInputSection } from '../../../components/organisms/Dropdown'
import { FunctionName } from '../../../constants/enums'
import { ReadToken } from '../../../constants/types'
import { useBribeController } from '../../../hooks/bribe/useBribeController'
import { useTransactionExecution } from '../../../hooks/internal/useInputAmount'
import { useVoteContext } from '../../vote/VoteContext'
import { Text } from '../../../components/atoms/Typography'
import { filterAmount, fixed, formatAmount } from '../../../utils/formatting'
import { useTokenAllowance, useTokenApprove } from '../../../hooks/contract/useToken'
import { ERC20_ABI } from '../../../constants/abi'
import { useProvider } from '../../../context/ProviderManager'
import { BigNumber, Contract } from 'ethers'
import { useContracts } from '../../../context/ContractsManager'
import { useBribeContext } from '../BribeContext'

export const BribeProviderModal = ({
  isOpen,
  handleClose,
  selectedGaugeId,
}: {
  isOpen: boolean
  handleClose: () => void
  selectedGaugeId: BigNumber
}): JSX.Element => {
  const { gauges } = useVoteContext()
  const { currentGaugesData } = gauges
  const { provideBribes } = useBribeController()
  const { bribes } = useBribeContext()
  const { bribeTokens } = bribes
  const { handleContractCallError, handleToast } = useTransactionExecution()

  const foundName = useMemo(
    () => currentGaugesData.find((gauge) => gauge.gaugeId.eq(selectedGaugeId))?.gaugeName ?? 'Unknown Gauge',
    [currentGaugesData, selectedGaugeId]
  )

  const [coinsOpen, setCoinsOpen] = useState<number | undefined>(undefined)
  const [stagingBribes, setStagingBribes] = useState<(ReadToken & { enteredAmount: string; approved: boolean })[]>([])

  const callProvideBribes = useCallback(async () => {
    await provideBribes(
      stagingBribes.map((coin) => coin.address),
      stagingBribes.map((coin) => parseUnits(formatAmount(coin.enteredAmount), coin.decimals)),
      selectedGaugeId
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callClaim', err, FunctionName.BRIBE_CLAIM))
  }, [provideBribes, stagingBribes, selectedGaugeId, currentGaugesData])

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
    (stagingBribe: ReadToken & { enteredAmount: string }, index: number, amount: string) => {
      const filtered = filterAmount(amount, formatAmount(stagingBribe.enteredAmount))
      if (filtered.includes('.') && filtered.split('.')[1]?.length > (stagingBribe?.decimals ?? 18)) return
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
        if (parseFloat(formatAmount(newBribes[index].enteredAmount)) > 0) {
          newBribes[index].enteredAmount = fixed(
            formatAmount(newBribes[index].enteredAmount),
            foundToken.decimals
          ).toString()
        }
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

  const _handleClose = useCallback(() => {
    setStagingBribes([])
    handleClose()
  }, [handleClose])

  return (
    <Modal isOpen={isOpen} handleClose={_handleClose} modalTitle={foundName}>
      <Flex col gap={16} style={{ minWidth: '350px' }}>
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
                ignorePrice
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
  changeBribeAmount: (stagingBribe: ReadToken & { enteredAmount: string }, index: number, amount: string) => void
  deleteBribe: (index: number) => void
  handleBribeApproval: (index: number, approval: boolean) => void
}): JSX.Element => {
  const { keyContracts } = useContracts()
  const { bribeController } = keyContracts
  const { signer } = useProvider()
  const { approve } = useTokenApprove()

  const selectedCoinContract = useMemo(() => new Contract(stagingBribe.address, ERC20_ABI, signer), [
    stagingBribe.address,
    signer,
  ])

  const approval = useTokenAllowance(
    selectedCoinContract,
    bribeController?.address ?? null,
    stagingBribe.enteredAmount && stagingBribe.enteredAmount != '.'
      ? parseUnits(stagingBribe.enteredAmount, stagingBribe?.decimals ?? 18).toString()
      : '0'
  )

  const callApprove = useCallback(async () => {
    await approve(
      stagingBribe.address,
      ERC20_ABI,
      bribeController?.address ?? '',
      parseUnits(stagingBribe.enteredAmount, stagingBribe.decimals)
    )
  }, [approve, stagingBribe, bribeController])

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
          onChange={(e) => changeBribeAmount(stagingBribe, index, e.target.value)}
          placeholder={'Amount'}
        />
        <ShadowDiv>
          <GraySquareButton width={36} heightP={100} actuallyWhite noborder onClick={() => deleteBribe(index)}>
            X
          </GraySquareButton>
        </ShadowDiv>
      </Flex>
      {!approval && parseFloat(formatAmount(stagingBribe.enteredAmount)) > 0 && (
        <Button onClick={callApprove} info secondary>
          Approve Entered {stagingBribe.symbol}
        </Button>
      )}
    </Flex>
  )
}
