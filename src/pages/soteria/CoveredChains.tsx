import React, { useMemo } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { QuestionCircle } from '@styled-icons/bootstrap/QuestionCircle'
import { Button } from '../../components/atoms/Button'
import { Checkbox } from '../../components/atoms/Input'
import { StyledTooltip } from '../../components/molecules/Tooltip'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useFunctions } from '../../hooks/policy/useSolaceCoverProduct'
import { BigNumber } from 'ethers'
import { NetworkConfig, CheckboxData } from '../../constants/types'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { FunctionName } from '../../constants/enums'
import { useNetwork } from '../../context/NetworkManager'
import { Text } from '../../components/atoms/Typography'
import { updateBoxCheck, boxIsChecked } from '../../utils/checkbox'
import { Loader } from '../../components/atoms/Loader'
import { FixedHeightGrayBox } from '../../components/molecules/GrayBox'
import { useWeb3React } from '@web3-react/core'
import { useGeneral } from '../../context/GeneralManager'

export function CoveredChains({
  coverageActivity: { status, mounting },
  chainActivity: { coverableNetworks, policyChainsChecked, chainsChecked, setChainsChecked, chainsLoading },
  isEditing,
  setIsEditing,
}: {
  coverageActivity: {
    status: boolean
    mounting: boolean
  }
  chainActivity: {
    coverableNetworks: NetworkConfig[]
    policyChainsChecked: CheckboxData[]
    chainsChecked: CheckboxData[]
    setChainsChecked: (checkboxData: CheckboxData[]) => void
    chainsLoading: boolean
  }
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
}): JSX.Element {
  const { ifDesktop } = useWindowDimensions()
  const { appTheme } = useGeneral()
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { updatePolicyChainInfo } = useFunctions()
  const policyChains = useMemo(() => policyChainsChecked.filter((c) => c.checked).map((c) => parseInt(c.id)), [
    policyChainsChecked,
  ])

  const startEditing = () => setIsEditing(true)
  const stopEditing = () => {
    setIsEditing(false)
    setChainsChecked(policyChainsChecked)
  }

  const noChainsSelected = useMemo(
    () =>
      activeNetwork.config.keyContracts.solaceCoverProduct.additionalInfo == 'v2' &&
      chainsChecked.filter((c) => c.checked).length == 0,
    [activeNetwork.config.keyContracts.solaceCoverProduct.additionalInfo, chainsChecked]
  )

  const checkedChainsMatchPolicyChains = useMemo(() => {
    const selectedChains = chainsChecked.filter((c) => c.checked).map((c) => parseInt(c.id))
    return (
      selectedChains.every((item) => policyChains.includes(item)) &&
      policyChains.every((item) => selectedChains.includes(item))
    )
  }, [chainsChecked, policyChains])

  const callUpdatePolicyChainInfo = async () => {
    if (!account) return
    const selectedChains = chainsChecked.filter((c) => c.checked).map((c) => BigNumber.from(c.id))
    await updatePolicyChainInfo(selectedChains)
      .then((res) => handleToast(res.tx, res.localTx))
      .then(() => stopEditing())
      .catch((err) => handleContractCallError('callActivatePolicy', err, FunctionName.SOTERIA_UPDATE_CHAINS))
  }

  const handleChainCheck = (id: BigNumber) => {
    const checkboxStatus = boxIsChecked(chainsChecked, id.toString())
    const newArr = updateBoxCheck(chainsChecked, id.toString(), !checkboxStatus)
    setChainsChecked(newArr)
  }

  return (
    <Flex
      col
      stretch
      gap={40}
      style={{
        flex: '1',
      }}
    >
      <Flex between itemsCenter>
        <Text t2 bold techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
          Covered Chains
        </Text>
        <StyledTooltip
          id={'covered-chains'}
          tip={['You can choose the chains to cover with your policy here, even if your policy is made on one chain.']}
        >
          <QuestionCircle height={20} width={20} color={'#aaa'} />
        </StyledTooltip>
      </Flex>
      <Flex
        col
        between
        stretch
        gap={30}
        pl={ifDesktop(2)}
        pr={ifDesktop(2)}
        style={{
          height: '100%',
        }}
      >
        {chainsLoading || mounting ? (
          <Loader />
        ) : (
          <>
            {!isEditing ? (
              <Flex col gap={30}>
                <FixedHeightGrayBox h={66}>
                  <Flex
                    style={{
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      display: 'grid',
                      gridTemplateColumns: `repeat(${Math.min(3, policyChains.length)}, 1fr)`,
                      gridTemplateRows: `repeat(${Math.floor(policyChains.length / 3) + 1}, 1fr)`,
                      gridColumnGap: '10px',
                      gridRowGap: '10px',
                    }}
                  >
                    {coverableNetworks
                      .filter((n) => policyChains.includes(n.chainId))
                      .map((policyNetwork) => (
                        <Flex key={policyNetwork.chainId} justifyCenter col>
                          <Flex justifyCenter>
                            <img src={policyNetwork.logo} width={40} height={40} />
                          </Flex>
                          <Flex justifyCenter>
                            <Text t5s>{policyNetwork.name}</Text>
                          </Flex>
                        </Flex>
                      ))}
                  </Flex>
                </FixedHeightGrayBox>
              </Flex>
            ) : (
              <Flex col justifyCenter between={isEditing} gap={10} pt={10} pb={10}>
                {coverableNetworks.map((n) => (
                  <Flex key={n.chainId}>
                    <Checkbox
                      type="checkbox"
                      checked={boxIsChecked(chainsChecked, n.chainId.toString())}
                      onChange={() => handleChainCheck(BigNumber.from(n.chainId))}
                    />
                    <Flex ml={10}>
                      <Text t4s>{n.name}</Text>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            )}
            <Flex justifyCenter={!isEditing} between={isEditing} gap={isEditing ? 20 : undefined} pt={10} pb={10}>
              {!isEditing ? (
                <Button
                  info
                  secondary
                  pl={46.75}
                  pr={46.75}
                  pt={8}
                  pb={8}
                  style={{
                    fontWeight: 600,
                  }}
                  onClick={startEditing}
                >
                  Edit Chains
                </Button>
              ) : (
                <>
                  {status && (
                    <>
                      <Button
                        info
                        pt={8}
                        pb={8}
                        style={{ fontWeight: 600, flex: 1, transition: '0s' }}
                        onClick={stopEditing}
                      >
                        Discard
                      </Button>
                      <Button
                        info
                        secondary
                        pt={8}
                        pb={8}
                        style={{ fontWeight: 600, flex: 1, transition: '0s' }}
                        onClick={callUpdatePolicyChainInfo}
                        disabled={noChainsSelected || checkedChainsMatchPolicyChains}
                      >
                        Save
                      </Button>
                    </>
                  )}
                </>
              )}
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  )
}
