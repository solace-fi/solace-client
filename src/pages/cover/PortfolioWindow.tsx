import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { BigNumber } from 'ethers'
import { Content, Flex } from '../../components/atoms/Layout'
import { useCoverageContext } from './CoverageContext'
import { LocalSolaceRiskProtocol, SolaceRiskScore } from '../../constants/types'
import { Button } from '../../components/atoms/Button'
import { formatAmount } from '../../utils/formatting'
import { useTierColors } from '../../hooks/internal/useTierColors'
import { Protocol } from './Protocol'
import usePrevious from '../../hooks/internal/usePrevious'
import { SolaceRiskBalance } from '@solace-fi/sdk-nightly'
import { TileCard } from '../../components/molecules/TileCard'
import { LoaderText } from '../../components/molecules/LoaderText'
import { CoverageLimitSelector } from '../soteria/CoverageLimitSelector'
import { Projections } from './Projections'
import { useWeb3React } from '@web3-react/core'
import { StyledAdd } from '../../components/atoms/Icon'
import styled from 'styled-components'
import { Z_NAV } from '../../constants'

export const PortfolioWindow = ({ show }: { show: boolean }): JSX.Element => {
  const { active } = useWeb3React()
  const { portfolioKit, styles, seriesKit, intrface } = useCoverageContext()
  const { series } = seriesKit
  const { portfolioLoading } = intrface
  const { portfolio: portfolioScore, riskScores } = portfolioKit
  const { bigButtonStyle, gradientStyle } = styles
  const [simulatedPortfolioScore, setSimulatedPortfolioScore] = useState<SolaceRiskScore | undefined>(undefined)
  const [canSimulate, setCanSimulate] = useState(false)
  const [simCoverageLimit, setSimCoverageLimit] = useState<BigNumber>(BigNumber.from(0))
  const [editingItem, setEditingItem] = useState<string | undefined>(undefined)
  const [simulating, setSimulating] = useState(false)
  const [compiling, setCompiling] = useState(false)

  const scoreToUse = useMemo(() => simulatedPortfolioScore ?? portfolioScore, [portfolioScore, simulatedPortfolioScore])

  const [editableProtocols, setEditableProtocols] = useState<LocalSolaceRiskProtocol[]>([])

  const editableProtocolLookup = useMemo(() => {
    const lookup: { [key: string]: LocalSolaceRiskProtocol } = {}
    editableProtocols.forEach((protocol) => {
      lookup[protocol.appId.toLowerCase()] = protocol
    })
    return lookup
  }, [editableProtocols])

  const editableProtocolAppIds = useMemo(() => editableProtocols.map((p) => p.appId.toLowerCase()), [editableProtocols])

  const portfolioPrev = usePrevious(scoreToUse)

  const tierColors = useTierColors(editableProtocols.map((p) => p.tier))

  const getColorByTier = (tier: number) => {
    const index = tier - 1
    if (index < 0) {
      return tierColors[tierColors.length - 1]
    } else {
      return tierColors[index]
    }
  }

  const addItem = (index?: number) => {
    // if adding with out index, or index is last, add to end
    const time = Date.now().toString()
    const data = {
      appId: `Empty ${time}`,
      balanceUSD: 0,
      category: 'Unknown',
      network: '',
      riskLoad: 0,
      rol: 0,
      rrol: 0,
      tier: 0,
      'rp-usd': 0,
      'risk-adj': 0,
    }
    if (index == undefined || index == editableProtocols.length - 1) {
      setEditableProtocols((prev) => [
        ...prev,
        {
          ...data,
          index: prev.length,
        },
      ])
    } else if (index == -1) {
      // if adding before the first item, add to start
      const temp = [{ ...data, index: 0 }, ...editableProtocols]
      temp.forEach((protocol, i) => {
        protocol.index = i
      })
      setEditableProtocols(temp)
    } else {
      // if adding with index in the middle, add insert into index, then reassign index numbers of all protocols
      const temp = [
        ...editableProtocols.slice(0, index + 1),
        {
          ...data,
          index: index + 1,
        },
        ...editableProtocols.slice(index + 1),
      ]
      const newTemp = [
        ...temp.slice(0, index + 1),
        ...temp.slice(index + 1).map((protocol, i) => ({ ...protocol, index: i + index + 1 })),
      ]
      setEditableProtocols(newTemp)
    }
  }

  const editCoverageLimit = useCallback(
    (newCoverageLimit: BigNumber) => {
      if (simCoverageLimit.eq(newCoverageLimit)) return
      setSimCoverageLimit(newCoverageLimit)
    },
    [simCoverageLimit]
  )

  const editId = useCallback(
    (targetAppId: string, newAppId: string) => {
      if (targetAppId === newAppId) return
      const matchingProtocol = series?.data.protocolMap.find((p) => p.appId.toLowerCase() === newAppId.toLowerCase())
      if (!matchingProtocol) return
      let editedSomething = false

      const targetProtocol = editableProtocolLookup[targetAppId.toLowerCase()]
      if (!targetProtocol) return
      setCompiling(true)
      setEditableProtocols(
        editableProtocols.map((p) => {
          if (p.appId === targetAppId) {
            editedSomething = true
            return {
              ...p,
              appId: newAppId,
              category: matchingProtocol.category,

              tier: matchingProtocol.tier,
            }
          } else {
            return p
          }
        })
      )
      if (editedSomething) setCanSimulate(true)
    },
    [editableProtocols, editableProtocolLookup, series]
  )

  const editAmount = useCallback(
    (targetAppId: string, newAmount: string) => {
      const numberifiedNewAmount = parseFloat(formatAmount(newAmount))
      let editedSomething = false

      const targetProtocol = editableProtocolLookup[targetAppId.toLowerCase()]
      if (!targetProtocol) return
      if (targetProtocol.balanceUSD.toString() === newAmount || !targetProtocol) return
      if (!targetAppId.includes('Empty')) setCompiling(true)
      setEditableProtocols(
        editableProtocols.map((p) => {
          if (p.appId === targetAppId) {
            editedSomething = true
            return {
              ...p,
              balanceUSD: numberifiedNewAmount,
            }
          } else {
            return p
          }
        })
      )
      if (editedSomething && !targetAppId.includes('Empty')) setCanSimulate(true)
    },
    [editableProtocols, editableProtocolLookup]
  )

  const deleteItem = useCallback(
    (targetAppId: string) => {
      const targetProtocol = editableProtocolLookup[targetAppId.toLowerCase()]
      if (!targetProtocol) return
      setEditableProtocols(
        editableProtocols
          .filter((p) => p.appId !== targetAppId)
          .map((p) => ({
            ...p,
            index: targetProtocol.index < p.index ? p.index - 1 : p.index,
          }))
      )
      if (!targetProtocol.appId.includes('Empty') && targetProtocol.balanceUSD >= 0) {
        setCanSimulate(true)
      }
    },
    [editableProtocols, editableProtocolLookup]
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
    if (riskBalances.length === 0) return
    const score: SolaceRiskScore | undefined = await riskScores(riskBalances)
    setSimulatedPortfolioScore(score)
    setCompiling(false)
    setCanSimulate(false)
    setSimulating(false)
  }, [editableProtocols, portfolioLoading, active, riskScores])

  const handleEditingItem = useCallback((appId: string | undefined) => {
    setEditingItem(appId)
  }, [])

  useEffect(() => {
    const handleSim = async () => {
      if (canSimulate) await runSimulation()
    }
    handleSim()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSimulate])

  useEffect(() => {
    if (portfolioPrev == undefined && portfolioScore != undefined) {
      setEditableProtocols([...portfolioScore.protocols].map((p, i) => ({ ...p, index: i })))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioScore, portfolioPrev])

  return (
    <Content style={{ transition: 'all 350ms ease 0s' }}>
      <Flex col gap={8}>
        {(portfolioLoading && active) || compiling || simulating ? (
          <LoaderText text={portfolioLoading && active ? 'Loading' : simulating ? 'Simulating' : 'Compiling'} t6 />
        ) : (
          <Projections portfolioScore={scoreToUse} coverageLimit={simCoverageLimit} />
        )}
        <TileCard>
          <CoverageLimitSelector portfolioScore={scoreToUse} setNewCoverageLimit={editCoverageLimit} />
        </TileCard>
        <Button
          {...gradientStyle}
          secondary
          {...bigButtonStyle}
          onClick={addItem}
          disabled={portfolioLoading && active}
          noborder
        >
          <StyledAdd size={16} /> Add Custom Position
        </Button>
        {editableProtocols.map((protocol: LocalSolaceRiskProtocol) => {
          const riskColor = getColorByTier(protocol.tier)
          return (
            <Protocol
              key={protocol.appId}
              protocol={protocol}
              editableProtocolAppIds={editableProtocolAppIds}
              riskColor={riskColor}
              editingItem={editingItem}
              addItem={addItem}
              deleteItem={deleteItem}
              editId={editId}
              editAmount={editAmount}
              handleEditingItem={handleEditingItem}
              simulating={simulating}
            />
          )
        })}
        {editableProtocols.length > 8 && (
          <Button
            {...gradientStyle}
            secondary
            {...bigButtonStyle}
            onClick={addItem}
            disabled={portfolioLoading && active}
            noborder
          >
            <StyledAdd size={16} /> Add Custom Position
          </Button>
        )}
      </Flex>
    </Content>
  )
}
