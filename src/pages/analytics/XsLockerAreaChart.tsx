import { BigNumber, getProvider, Staker, XSLOCKER_ADDRESS } from '@solace-fi/sdk-nightly'
import React, { useEffect } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { Lock } from '../../constants/types'
import { useGeneral } from '../../context/GeneralManager'
import { rangeFrom1 } from '../../utils/numeric'
import vegaEmbed from 'vega-embed'
import { formatUnits } from 'ethers/lib/utils'
import { networks, useNetwork } from '../../context/NetworkManager'
import { JsonRpcProvider } from '@ethersproject/providers'

export const XsLockerAreaChart = ({
  chosenWidth,
  chosenHeight,
  chainId,
}: {
  chosenWidth: number
  chosenHeight: number
  chainId: number
}): JSX.Element => {
  const { appTheme } = useGeneral()

  const [lockData, setLockData] = React.useState<Lock[]>([])

  const fetchVega = (dataIn: Lock[], theme: 'light' | 'dark') => {
    vegaEmbed('#xslocker-area-chart', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: { text: 'Staking Area Chart', color: theme == 'light' ? 'black' : 'white' },
      config: {
        style: { cell: { stroke: 'transparent' } },
        axis: { labelColor: theme == 'light' ? 'black' : 'white' },
        font: 'Montserrat',
      },
      background: 'transparent',
      width: 'container',
      height: chosenHeight,
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
      const filteredLocks = existingLocks.filter((lock) => lock?.end.toNumber() > 0)
      setLockData(filteredLocks)
    }
    getLocks()
  }, [chainId])

  useEffect(() => {
    fetchVega(lockData, appTheme)
  }, [lockData, chosenHeight, chosenWidth, appTheme])

  return (
    <Flex>
      <Flex id="xslocker-area-chart" widthP={100} justifyCenter>
        <Text autoAlign>data not available</Text>
      </Flex>
    </Flex>
  )
}
