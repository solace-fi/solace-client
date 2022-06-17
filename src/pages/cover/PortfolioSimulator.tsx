import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BigNumber } from 'ethers'
import { Flex } from '../../components/atoms/Layout'
import { useCoverageContext } from './CoverageContext'
import { LocalSolaceRiskProtocol } from '../../constants/types'
import { Button } from '../../components/atoms/Button'
import { formatAmount } from '../../utils/formatting'
import { useTierColors } from '../../hooks/internal/useTierColors'
import { Protocol } from './Protocol'
import usePrevious from '../../hooks/internal/usePrevious'
import { ProtocolMap, SolaceRiskBalance, SolaceRiskScore } from '@solace-fi/sdk-nightly'
import { LoaderText } from '../../components/molecules/LoaderText'
import { Projections } from './Projections'
import { useWeb3React } from '@web3-react/core'
import { StyledAdd } from '../../components/atoms/Icon'
import { Text } from '../../components/atoms/Typography'
import { ModalCloseButton } from '../../components/molecules/Modal'
import { useGeneral } from '../../context/GeneralManager'
import AddProtocolForm from './AddProtocolForm'
import mapEditableProtocols from '../../utils/mapEditableProtocols'
import { useNetwork } from '../../context/NetworkManager'

export const PortfolioSimulator = (): JSX.Element => {
  const { appTheme } = useGeneral()

  const { active, account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { portfolioKit, simulator, input, styles, seriesKit, intrface } = useCoverageContext()
  const { series } = seriesKit
  const { simCoverLimit } = input
  const { portfolioLoading, handleShowSimulatorModal } = intrface
  const { curPortfolio: portfolioScore, riskScores } = portfolioKit
  const { handleSimPortfolio, handleSimCounter, simPortfolio, clearCounter } = simulator
  const { bigButtonStyle, gradientStyle } = styles
  const [canSimulate, setCanSimulate] = useState(false)
  const [editingItem, setEditingItem] = useState<{
    appId?: string
    network?: string
  }>({})
  const [simulating, setSimulating] = useState(false)
  const [compiling, setCompiling] = useState(false)

  const startup = useRef(true)

  const [editableProtocols, setEditableProtocols] = useState<LocalSolaceRiskProtocol[]>([])

  const [bottomButtonHeight, setBottomButtonHeight] = useState(91)
  const [addingProtocol, setAddingProtocol] = useState(false)
  useEffect(() => {
    // initial button height is 91, but when it opens, it's a bit taller
    if (addingProtocol) {
      setBottomButtonHeight(91 + 50)
    } else {
      setBottomButtonHeight(91)
    }
  }, [addingProtocol])

  const _mapEditableProtocols = useMemo(() => {
    return mapEditableProtocols(editableProtocols)
  }, [editableProtocols])

  const editableProtocolAppIds = useMemo(() => editableProtocols.map((p) => p.appId.toLowerCase()), [editableProtocols])

  const tierColors = useTierColors(editableProtocols.map((p) => p.tier))

  const getColorByTier = (tier: number) => {
    const index = tier - 1
    if (index < 0) {
      return tierColors[tierColors.length - 1]
    } else {
      return tierColors[index]
    }
  }

  function onAddProtocol(protocolMap: ProtocolMap, balance: string) {
    const data: LocalSolaceRiskProtocol = {
      index: 0,
      appId: protocolMap.appId,
      balanceUSD: parseFloat(balance),
      category: protocolMap.category,
      tier: protocolMap.tier,
      network: '',
      riskLoad: 0,
      rol: 0,
      rrol: 0,
      'rp-usd': 0,
      'risk-adj': 0,
    }
    const reIndexedProtocols = editableProtocols.map((protocol, i) => ({ ...protocol, index: i + 1 }))
    const tmp = [data, ...reIndexedProtocols]
    setEditableProtocols(tmp)
    setCanSimulate(true)
  }

  const saveEditedItem = useCallback(
    (targetAppId: string, newAppId: string, newAmount: string): boolean => {
      let editedSomething = false
      const newProtocol = series?.data.protocolMap.find((p) => p.appId.toLowerCase() === newAppId.toLowerCase())
      if (!newProtocol) return false
      const targetProtocol = _mapEditableProtocols[targetAppId.toLowerCase()]
      if (!targetProtocol) return false
      if (targetProtocol.balanceUSD.toString() === newAmount && targetAppId.toLowerCase() === newAppId.toLowerCase())
        return false
      const numberifiedNewAmount = parseFloat(formatAmount(newAmount))
      setCompiling(true)
      setEditableProtocols(
        editableProtocols.map((p) => {
          if (p.appId === targetAppId) {
            editedSomething = true
            return {
              ...p,
              appId: newAppId,
              category: newProtocol.category,
              tier: newProtocol.tier,
              balanceUSD: numberifiedNewAmount,
            }
          } else {
            return p
          }
        })
      )
      if (editedSomething) setCanSimulate(true)
      return true
    },
    [editableProtocols, _mapEditableProtocols, series]
  )

  const deleteItem = useCallback(
    (targetAppId: string) => {
      const targetProtocol = _mapEditableProtocols[targetAppId.toLowerCase()]
      if (!targetProtocol) return
      setEditableProtocols(
        editableProtocols
          .filter((p) => p.appId !== targetAppId)
          .map((p) => ({
            ...p,
            index: targetProtocol.index < p.index ? p.index - 1 : p.index,
          }))
      )
      if (!targetProtocol.appId.includes('Empty') && targetProtocol.balanceUSD >= 0) setCanSimulate(true)
    },
    [editableProtocols, _mapEditableProtocols]
  )

  // do not run this if the user has not touched anything here
  const runSimulation = useCallback(async () => {
    if (portfolioLoading && active) return
    setSimulating(true)
    const riskBalances: SolaceRiskBalance[] = editableProtocols
      .filter((p) => !p.appId.includes('Empty'))
      .map((p) => ({
        appId: p.appId,
        network: p.network,
        balanceUSD: p.balanceUSD,
      }))
    const score: SolaceRiskScore | undefined = await riskScores(riskBalances)
    handleSimPortfolio(score)
    setCompiling(false)
    setCanSimulate(false)
    setSimulating(false)
    handleSimCounter()
  }, [editableProtocols, portfolioLoading, active, riskScores, handleSimPortfolio, handleSimCounter])

  const handleEditingItem = useCallback((appId?: string, network?: string) => {
    setEditingItem({ appId, network })
  }, [])

  useEffect(() => {
    const handleSim = async () => {
      if (canSimulate) await runSimulation()
    }
    handleSim()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSimulate])

  // startup flag reset on account change
  useEffect(() => {
    if (startup.current == false) startup.current = true
  }, [account])

  // on startup, copy cur portfolio into sim portfolio
  useEffect(() => {
    if (portfolioScore && startup.current) {
      startup.current = false
      setEditableProtocols([...portfolioScore.protocols].map((p, i) => ({ ...p, index: i })))
      handleSimPortfolio(portfolioScore)
    }
  }, [portfolioScore, simPortfolio, handleSimPortfolio])

  // on clear changes, copy cur portfolio into sim portfolio
  useEffect(() => {
    if (clearCounter > 0 && portfolioScore) {
      setEditableProtocols([...portfolioScore.protocols].map((p, i) => ({ ...p, index: i })))
      handleSimPortfolio(portfolioScore)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearCounter])

  return (
    <Flex col style={{ height: 'calc(100vh - 60px)', position: 'relative', overflow: 'hidden' }}>
      <Flex py={18} itemsCenter between px={20} zIndex={3} bgSecondary>
        <Text t1s mont semibold>
          Quote Simulator
        </Text>
        <Flex onClick={() => handleShowSimulatorModal(false)}>
          <ModalCloseButton lightColor={appTheme == 'dark'} />
        </Flex>
      </Flex>
      {/* <Flex
        itemsCenter
        justifyCenter
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '50px',
          width: '50px',
        }}
      >
      </Flex> */}
      {/* <Content style={{ transition: 'all 350ms ease 0s' }}> */}
      <Flex
        shadow
        col
        gap={12}
        px={20}
        pb={18}
        style={{
          zIndex: 2,
        }}
      >
        {(portfolioLoading && active) || compiling || simulating ? (
          <LoaderText text={portfolioLoading && active ? 'Loading' : simulating ? 'Simulating' : 'Compiling'} t6 />
        ) : (
          <Projections portfolioScore={simPortfolio} coverageLimit={simCoverLimit} />
        )}
        {/* <TileCard>
          <CoverageLimitSelector2 portfolioScore={scoreToUse} setNewCoverageLimit={editCoverageLimit} />
        </TileCard> */}
      </Flex>
      <Flex
        thinScrollbar
        col
        gap={12}
        pt={20}
        px={20}
        pb={10}
        style={{
          overflowY: 'auto',
          height: '100%',
          // why this height specifically? i have no clue, but it works pixel-perfectly and it's responive (??)
          // height: `calc(100% - ${376}px)`,
        }}
        bgLightGray
      >
        {editableProtocols.map((protocol: LocalSolaceRiskProtocol) => {
          const riskColor = getColorByTier(protocol.tier)
          return (
            <Protocol
              key={protocol.appId}
              protocol={protocol}
              editableProtocolAppIds={editableProtocolAppIds}
              riskColor={riskColor}
              editingItem={editingItem}
              saveEditedItem={saveEditedItem}
              deleteItem={deleteItem}
              handleEditingItem={handleEditingItem}
              simulating={simulating}
            />
          )
        })}
      </Flex>
      {editableProtocols.length > 8 && (
        <Button
          {...gradientStyle}
          secondary
          {...bigButtonStyle}
          // onClick={addItem}
          onClick={() => setAddingProtocol(true)}
          disabled={portfolioLoading && active}
          noborder
        >
          <StyledAdd size={16} /> Add Custom Position
        </Button>
      )}
      {/* BOTTOM BUTTONS */}
      <Flex
        itemsCenter
        justifyCenter
        style={{
          // position: 'absolute',
          // bottom: '0',
          // left: '0',
          boxSizing: 'border-box',
          width: '100%',
        }}
        p={20}
        bgSecondary
        shadow
      >
        {!addingProtocol ? (
          <Button
            // {...gradientStyle}
            secondary
            raised
            {...bigButtonStyle}
            // onClick={addItem}
            onClick={() => setAddingProtocol(true)}
            disabled={portfolioLoading && active}
            // noborder
            height={51}
          >
            <Text techygradient t4s>
              + Add Position
            </Text>
          </Button>
        ) : (
          <>
            <Flex p={16} col bgRaised rounded style={{ width: '100%' }}>
              <AddProtocolForm
                editableProtocols={editableProtocols}
                setIsAddingProtocol={setAddingProtocol}
                onAddProtocol={onAddProtocol}
              />
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  )
}
