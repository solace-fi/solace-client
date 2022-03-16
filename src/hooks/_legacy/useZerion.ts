import io from 'socket.io-client'
import { useEffect, useState } from 'react'
import { useWallet } from '../../context/WalletManager'
import { ZerionPosition } from '../../constants/types'

export const useZerion = () => {
  const { account } = useWallet()
  const [zerionPositions, setZerionPositions] = useState<ZerionPosition[]>([])

  const getZerion = async (user: string): Promise<any> => {
    const BASE_URL = 'wss://api-v4.zerion.io/'

    function verify(request: any, response: any) {
      // each value in request payload must be found in response meta
      return Object.keys(request.payload).every((key) => {
        const requestValue = request.payload[key]
        const responseMetaValue = response.meta[key]
        if (typeof requestValue === 'object') {
          return JSON.stringify(requestValue) === JSON.stringify(responseMetaValue)
        }
        return responseMetaValue === requestValue
      })
    }

    const addressSocket = {
      namespace: 'address',
      socket: io(`${BASE_URL}address`, {
        transports: ['websocket'],
        timeout: 60000,
        query: {
          api_token: 'Demo.ukEVQp6L5vfgxcz4sBke7XvS873GMYHy',
        },
      }),
    }

    async function get(socketNamespace: any, requestBody: any) {
      return new Promise(() => {
        const { socket, namespace } = socketNamespace
        function handleReceive(data: any) {
          if (verify(requestBody, data)) {
            unsubscribe()
            const filteredPositions = data.payload.positions.positions.filter(
              (p: ZerionPosition) => p.value > 0 && p.is_displayable && p.type != 'asset'
            )
            setZerionPositions(filteredPositions)
          }
        }
        function unsubscribe() {
          socket.off(`received ${namespace} ${model}`, handleReceive)
          socket.emit('unsubscribe', requestBody)
        }
        const model = requestBody.scope[0]
        socket.emit('get', requestBody)
        socket.on(`received ${namespace} ${model}`, handleReceive)
      })
    }

    await get(addressSocket, {
      scope: ['positions'],
      payload: {
        address: '0xC04F63Ea1E2E2FFEACAde7839E0596E2B886f6A4'.toLowerCase(),
        currency: 'usd',
      },
    })
  }

  useEffect(() => {
    const getZerionStuff = async () => {
      if (!account) return
      await getZerion(account)
    }
    // getZerionStuff()
  }, [account])

  return zerionPositions
}
