import { BigNumber, Staker, XSLOCKER_ADDRESS, ZERO } from '@solace-fi/sdk-nightly'
import React, { useEffect, useState } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { Lock } from '../../constants/types'
import { useGeneral } from '../../context/GeneralManager'
import { rangeFrom1 } from '../../utils/numeric'
import vegaEmbed from 'vega-embed'
import { formatUnits } from 'ethers/lib/utils'
import { networks } from '../../context/NetworkManager'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Loader } from '../../components/atoms/Loader'

export const XsLockerAreaChart = ({
  chosenWidth,
  chosenHeightPx,
  chainId,
}: {
  chosenWidth: number
  chosenHeightPx: number
  chainId: number
}): JSX.Element => {
  const { appTheme } = useGeneral()

  const [lockBurndownData, setLockBurndownData] = useState<Lock[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const fetchVega = (dataIn: Lock[], theme: 'light' | 'dark') => {
    vegaEmbed('#xslocker-area-chart' + chainId, {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: { text: '(Including Last 30 Days)', color: theme == 'light' ? 'black' : 'white' },
      config: {
        style: { cell: { stroke: 'transparent' } },
        axis: { labelColor: theme == 'light' ? 'black' : 'white' },
        font: 'Montserrat',
      },
      background: 'transparent',
      width: 'container',
      height: chosenHeightPx,
      autosize: {
        type: 'fit',
        contains: 'padding',
        resize: true,
      },
      data: {
        values: dataIn.map((dataPiece) => {
          return {
            amount: parseFloat(formatUnits(dataPiece.amount, 18)),
            end: dataPiece.end.toNumber() * 1000,
          }
        }),
      },
      mark: { type: 'area', tooltip: true },
      encoding: {
        x: {
          timeUnit: 'yearmonthdatehoursminutes',
          field: 'end',
          title: 'End Date',
          axis: {
            format: '%Y-%m-%d',
            title: 'Unlock Dates',
            grid: false,
            tickCount: 6,
            labelAngle: 0,
            titleColor: theme == 'light' ? 'black' : 'white',
          },
        },
        y: {
          aggregate: 'sum',
          field: 'amount',
          axis: {
            format: '$,.0f',
            title: 'Deposits (USD)',
            titleColor: theme == 'light' ? 'black' : 'white',
            grid: false,
          },
        },
      },
    })
  }

  useEffect(() => {
    const getLocks = async () => {
      const foundNetwork = networks.find((network) => network.chainId == chainId)
      if (!XSLOCKER_ADDRESS[chainId] || !foundNetwork) return
      setLoading(true)
      const _provider = new JsonRpcProvider(foundNetwork.rpc.httpsUrl)
      const staker = new Staker(chainId, _provider)
      const stakeContract = staker.xsLocker
      const totalSupply: BigNumber = await stakeContract.totalSupply()
      const range = rangeFrom1(totalSupply.toNumber())
      const existArray: boolean[] = await Promise.all(range.map((id) => stakeContract.exists(BigNumber.from(id))))
      const locks: (Lock | null)[] = await Promise.all(
        existArray.map((exist, i) => (exist ? stakeContract.locks(BigNumber.from(i + 1)) : null))
      )
      const existingLocks = locks.filter((lock) => lock !== null) as Lock[]

      const today = Date.now()
      const filteredLocks = existingLocks.filter((lock) => lock?.end.toNumber() * 1000 > today - 2592000000) // last 30 days
      let summedAmount = filteredLocks.reduce((acc, lock) => acc.add(lock.amount), ZERO)
      const sortedEnds = filteredLocks.sort((a, b) => a.end.toNumber() - b.end.toNumber())
      const burndownData = sortedEnds.map((lock) => {
        summedAmount = summedAmount.sub(lock.amount)
        return {
          amount: summedAmount,
          end: lock.end,
        }
      })
      setLockBurndownData(burndownData)
      setLoading(false)
    }
    getLocks()
  }, [chainId])

  useEffect(() => {
    if (lockBurndownData.length == 0) return
    fetchVega(lockBurndownData, appTheme)
  }, [lockBurndownData, chosenHeightPx, chosenWidth, appTheme])

  return (
    <Flex>
      <Flex id={'xslocker-area-chart' + chainId} widthP={100} justifyCenter>
        <Text autoAlign>{loading ? <Loader /> : 'Data not available'}</Text>
      </Flex>
    </Flex>
  )
}
