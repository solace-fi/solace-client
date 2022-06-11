import React, { useCallback, useEffect, useMemo, useState } from 'react'
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

export const PortfolioSimulator = ({ show }: { show: boolean }): JSX.Element => {
  const { appTheme } = useGeneral()

  const { active } = useWeb3React()
  const { portfolioKit, styles, seriesKit, intrface } = useCoverageContext()
  const { series } = seriesKit
  const { portfolioLoading, handleShowSimulatorModal } = intrface
  const { curPortfolio: portfolioScore, simPortfolio, riskScores, handleSimPortfolio } = portfolioKit
  const { bigButtonStyle, gradientStyle } = styles
  const [canSimulate, setCanSimulate] = useState(false)
  const [simCoverageLimit, setSimCoverageLimit] = useState<BigNumber>(BigNumber.from(0))
  const [editingItem, setEditingItem] = useState<string | undefined>(undefined)
  const [simulating, setSimulating] = useState(false)
  const [compiling, setCompiling] = useState(false)

  const scoreToUse = useMemo(() => simPortfolio ?? portfolioScore, [portfolioScore, simPortfolio])

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

  // const editableProtocolLookup = useMemo(() => {
  //   const lookup: { [key: string]: LocalSolaceRiskProtocol } = {}
  //   editableProtocols.forEach((protocol) => {
  //     lookup[protocol.appId.toLowerCase()] = protocol
  //   })
  //   return lookup
  // }, [editableProtocols])

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

  // const addItem = (index?: number) => {
  //   // if adding with out index, or index is last, add to end
  //   const time = Date.now().toString()
  //   const data = {
  //     appId: `Empty ${time}`,
  //     balanceUSD: 0,
  //     category: 'Unknown',
  //     network: '',
  //     riskLoad: 0,
  //     rol: 0,
  //     rrol: 0,
  //     tier: 0,
  //     'rp-usd': 0,
  //     'risk-adj': 0,
  //   }
  //   if (index == undefined || index == editableProtocols.length - 1) {
  //     setEditableProtocols((prev) => [
  //       ...prev,
  //       {
  //         ...data,
  //         index: prev.length,
  //       },
  //     ])
  //   } else if (index == -1) {
  //     // if adding before the first item, add to start
  //     const temp = [{ ...data, index: 0 }, ...editableProtocols]
  //     temp.forEach((protocol, i) => {
  //       protocol.index = i
  //     })
  //     setEditableProtocols(temp)
  //   } else {
  //     // if adding with index in the middle, add insert into index, then reassign index numbers of all protocols
  //     const temp = [
  //       ...editableProtocols.slice(0, index + 1),
  //       {
  //         ...data,
  //         index: index + 1,
  //       },
  //       ...editableProtocols.slice(index + 1),
  //     ]
  //     const newTemp = [
  //       ...temp.slice(0, index + 1),
  //       ...temp.slice(index + 1).map((protocol, i) => ({ ...protocol, index: i + index + 1 })),
  //     ]
  //     setEditableProtocols(newTemp)
  //   }
  // }

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

  // const editCoverageLimit = useCallback(
  //   (newCoverageLimit: BigNumber) => {
  //     if (simCoverageLimit.eq(newCoverageLimit)) return
  //     setSimCoverageLimit(newCoverageLimit)
  //   },
  //   [simCoverageLimit]
  // )

  // const saveId = useCallback(
  //   (targetAppId: string, newAppId: string) => {
  //     if (targetAppId === newAppId) return
  //     const matchingProtocol = series?.data.protocolMap.find((p) => p.appId.toLowerCase() === newAppId.toLowerCase())
  //     if (!matchingProtocol) return
  //     let editedSomething = false

  //     const targetProtocol = _mapEditableProtocols[targetAppId.toLowerCase()]
  //     if (!targetProtocol) return
  //     setCompiling(true)
  //     setEditableProtocols(
  //       editableProtocols.map((p) => {
  //         if (p.appId === targetAppId) {
  //           editedSomething = true
  //           return {
  //             ...p,
  //             appId: newAppId,
  //             category: matchingProtocol.category,

  //             tier: matchingProtocol.tier,
  //           }
  //         } else {
  //           return p
  //         }
  //       })
  //     )
  //     if (editedSomething) setCanSimulate(true)
  //   },
  //   [editableProtocols, _mapEditableProtocols, series]
  // )

  // const saveAmount = useCallback(
  //   (targetAppId: string, newAmount: string) => {
  //     const numberifiedNewAmount = parseFloat(formatAmount(newAmount))
  //     let editedSomething = false

  //     const targetProtocol = _mapEditableProtocols[targetAppId.toLowerCase()]
  //     if (!targetProtocol) return
  //     if (targetProtocol.balanceUSD.toString() === newAmount || !targetProtocol) return
  //     if (!targetAppId.includes('Empty')) setCompiling(true)
  //     setEditableProtocols(
  //       editableProtocols.map((p) => {
  //         if (p.appId === targetAppId) {
  //           editedSomething = true
  //           return {
  //             ...p,
  //             balanceUSD: numberifiedNewAmount,
  //           }
  //         } else {
  //           return p
  //         }
  //       })
  //     )
  //     if (editedSomething && !targetAppId.includes('Empty')) setCanSimulate(true)
  //   },
  //   [editableProtocols, _mapEditableProtocols]
  // )

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
      if (!targetProtocol.appId.includes('Empty') && targetProtocol.balanceUSD >= 0) {
        setCanSimulate(true)
      }
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
    if (riskBalances.length === 0) return
    const score: SolaceRiskScore | undefined = await riskScores(riskBalances)
    handleSimPortfolio(score)
    setCompiling(false)
    setCanSimulate(false)
    setSimulating(false)
  }, [editableProtocols, portfolioLoading, active, riskScores, handleSimPortfolio])

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
    <Flex col style={{ height: 'calc(100vh - 170px)', position: 'relative', overflow: 'hidden' }}>
      <Flex py={18} itemsCenter between px={20} zIndex={3} bgSecondary>
        <Text t1s mont semibold>
          Portfolio Simulator
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
          <Projections portfolioScore={scoreToUse} coverageLimit={simCoverageLimit} />
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
              // addItem={addItem}
              saveEditedItem={saveEditedItem}
              deleteItem={deleteItem}
              // saveId={saveId}
              // saveAmount={saveAmount}
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
