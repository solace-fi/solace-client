import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { useCoverageContext } from './CoverageContext'
import { LocalSolaceRiskProtocol } from '../../constants/types'
import { Button } from '../../components/atoms/Button'
import { formatAmount } from '../../utils/formatting'
import { useTierColors } from '../../hooks/internal/useTierColors'
import { Protocol } from './Protocol'
import { ProtocolMap, SolaceRiskBalance, SolaceRiskScore } from '@solace-fi/sdk-nightly'
import { LoaderText } from '../../components/molecules/LoaderText'
import { Projections } from './Projections'
import { useWeb3React } from '@web3-react/core'
import { Text } from '../../components/atoms/Typography'
import { ModalCloseButton } from '../../components/molecules/Modal'
import { useGeneral } from '../../context/GeneralManager'
import AddProtocolForm from './AddProtocolForm'
import { mapEditableProtocols, mapUniqueRiskProtocols } from '../../utils/mapProtocols'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

export const PortfolioSimulator = (): JSX.Element => {
  const { appTheme } = useGeneral()

  const { active, account } = useWeb3React()
  const { portfolioKit, simulator, input, styles, seriesKit, intrface } = useCoverageContext()
  const { series } = seriesKit
  const { simCoverLimit } = input
  const { portfolioLoading, handleShowSimulatorModal } = intrface
  const { curPortfolio: portfolioScore, riskScores } = portfolioKit
  const { handleSimPortfolio, handleSimCounter, simPortfolio, clearCounter } = simulator
  const { bigButtonStyle, gradientStyle } = styles
  const [canSimulate, setCanSimulate] = useState(false)
  const [editingItem, setEditingItem] = useState<string | undefined>(undefined)
  const [simulating, setSimulating] = useState(false)
  const [compiling, setCompiling] = useState(false)
  const [addingProtocol, setAddingProtocol] = useState(false)

  const startup = useRef(true)

  const [editableProtocols, setEditableProtocols] = useState<LocalSolaceRiskProtocol[]>([])
  const editableProtocolAppIds = useMemo(() => editableProtocols.map((p) => p.appId.toLowerCase()), [editableProtocols])

  const protocolsByName = useMemo(() => {
    if (!portfolioScore) return {}
    return mapUniqueRiskProtocols(portfolioScore.protocols)
  }, [portfolioScore])

  const _mapEditableProtocols = useMemo(() => {
    return mapEditableProtocols(editableProtocols)
  }, [editableProtocols])

  const tierColors = useTierColors()

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
      networks: [],
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
    const riskBalances: SolaceRiskBalance[] = editableProtocols.map((p) => ({
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

  const reorderEditableProtocols = useCallback(
    (startIndex: number, endIndex: number) => {
      const result = Array.from(editableProtocols)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)

      return result
    },
    [editableProtocols]
  )

  const onDragStart = useCallback((initial: any) => {
    if (!initial.source) return
  }, [])

  const onDragEnd = useCallback(
    (result: any) => {
      // dropped outside the list
      if (!result.destination) return

      const items = reorderEditableProtocols(result.source.index, result.destination.index)
      setEditableProtocols(items)
    },
    [reorderEditableProtocols]
  )

  const getItemStyle = useCallback(
    (isDragging: any, draggableStyle: any) => ({
      // some basic styles to make the items look a bit nicer
      userSelect: 'none',
      padding: 6,
      margin: `0 0 ${3}px 0`,

      // change background colour if dragging
      background: isDragging ? 'lightgreen' : 'transparent',
      borderRadius: '10px',

      // styles we need to apply on draggables
      ...draggableStyle,
    }),
    []
  )

  const getListStyle = useCallback(
    (isDraggingOver: boolean) => ({
      background: isDraggingOver ? 'grey' : 'transparent',
      padding: 4,
    }),
    []
  )

  const handleEditingItem = useCallback((appId?: string) => {
    setEditingItem(appId)
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
      setEditableProtocols(Object.values(protocolsByName))
      handleSimPortfolio(portfolioScore)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simPortfolio, protocolsByName, handleSimPortfolio])

  // on clear changes, copy cur portfolio into sim portfolio
  useEffect(() => {
    if (clearCounter > 0 && portfolioScore) {
      setEditableProtocols(Object.values(protocolsByName))
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
      </Flex>
      <Flex
        itemsCenter
        justifyCenter
        style={{
          boxSizing: 'border-box',
          width: '100%',
        }}
        p={20}
        bgSecondary
        shadow
      >
        {!addingProtocol ? (
          <Button
            secondary
            raised
            {...bigButtonStyle}
            onClick={() => setAddingProtocol(true)}
            disabled={portfolioLoading && active}
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
      <Flex
        thinScrollbar
        col
        gap={12}
        pt={20}
        px={14}
        pb={10}
        style={{
          overflowY: 'auto',
          height: '100%',
        }}
        bgLightGray
      >
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                {editableProtocols.map((protocol: LocalSolaceRiskProtocol, i) => {
                  const riskColor = getColorByTier(protocol.tier)
                  return (
                    <Draggable
                      key={protocol.appId.concat(protocol.network)}
                      draggableId={protocol.appId.concat(protocol.network)}
                      index={i}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                        >
                          <Protocol
                            protocol={protocol}
                            editableProtocolAppIds={editableProtocolAppIds}
                            riskColor={riskColor}
                            editingItem={editingItem}
                            saveEditedItem={saveEditedItem}
                            deleteItem={deleteItem}
                            handleEditingItem={handleEditingItem}
                            simulating={simulating}
                          />
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Flex>
      {editableProtocols.length > 8 && (
        <Button
          {...gradientStyle}
          secondary
          {...bigButtonStyle}
          onClick={() => setAddingProtocol(true)}
          disabled={portfolioLoading && active}
          noborder
        >
          + Add Position
        </Button>
      )}
    </Flex>
  )
}
