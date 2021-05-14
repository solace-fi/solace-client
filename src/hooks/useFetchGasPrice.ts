import { useState, useEffect, useRef } from 'react'
import { fetchGasPrice } from '../utils/fetchGasPrice'
import { useWallet } from '../context/Web3Manager'

export type GasFeeOption = {
  key: string
  name: string
  value: number
}

type GasFeeListState = {
  options: GasFeeOption[]
  loading: boolean
  selected?: GasFeeOption
}

export type GasFeeListProps = {
  option?: GasFeeOption
  onChange?: (value: GasFeeOption) => void
}

export const useFetchGasPrice = () => {
  const wallet = useWallet()

  const [state, setState] = useState<GasFeeListState>({
    options: [],
    loading: true,
    selected: undefined,
  })

  useEffect(() => {
    const fetchGasPrices = async () => {
      await fetchGasPrice()
        .then((result) => {
          const options = [
            {
              key: 'safeLow',
              name: 'Slow',
              value: result.safeLow,
            },
            {
              key: 'average',
              name: 'Standard',
              value: result.average,
            },
            {
              key: 'fast',
              name: 'Fast',
              value: result.fast,
            },
            {
              key: 'fastest',
              name: 'Very fast',
              value: result.veryFast,
            },
          ]
          setState({
            loading: false,
            options,
            selected: options[1],
          })
        })
        .catch(() => {
          setState({
            ...state,
            loading: false,
          })
        })
    }
    fetchGasPrices()
  }, [wallet])

  return state
}
