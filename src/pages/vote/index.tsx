import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, TooltipProps } from 'recharts'

import { Flex, VerticalSeparator } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { LoaderText } from '../../components/molecules/LoaderText'
import { BKPT_NAVBAR } from '../../constants'
import { useGeneral } from '../../context/GeneralManager'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { TileCard } from '../../components/molecules/TileCard'
import { Button } from '../../components/atoms/Button'
import { VoteLock } from '../../components/organisms/VoteLock'
import { RaisedBox } from '../../components/atoms/Box'
import { formatAmount } from '../../utils/formatting'
import { GaugeSelectionModal } from '../../components/organisms/GaugeSelectionModal'
import { Modal } from '../../components/molecules/Modal'
import { CustomPieChartTooltip, GaugeWeightsModal } from '../../components/organisms/GaugeWeightsModal'

function Vote(): JSX.Element {
  const [loading, setLoading] = useState(true)
  const [animate, setAnimate] = useState(true)
  const [openGaugeWeightsModal, setOpenGaugeWeightsModal] = useState(false)
  const [openGaugeSelectionModal, setOpenGaugeSelectionModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | undefined>(undefined)

  const { width, isMobile } = useWindowDimensions()

  const COLORS = useMemo(() => ['rgb(212,120,216)', 'rgb(243,211,126)', 'rgb(95,93,249)', 'rgb(240,77,66)'], [])

  const data = useMemo(
    () => [
      { name: 'stake-dao', value: 17 },
      { name: 'aave', value: 16 },
      { name: 'compound', value: 15 },
      { name: 'solace', value: 13 },
      { name: 'sushiswap', value: 12 },
      { name: 'fox-bank', value: 10 },
      { name: 'monkey-barrel', value: 9 },
      { name: 'nexus-farm', value: 7 },
      { name: 'quickswap', value: 3 },
      { name: 'lemonade-stake', value: 1 },
    ],
    []
  )

  const summarizedData = useMemo(
    () => [
      ...data.slice(0, 4),
      { name: 'Other Protocols', value: data.slice(3).reduce((acc, pv) => pv.value + acc, 0) },
    ],
    [data]
  )

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }, [])

  const onAnimationStart = useCallback(() => {
    setTimeout(() => {
      setAnimate(false)
    }, 2000)
  }, [])

  const [votesData, setVotesData] = useState<
    {
      gauge: string
      votes: string
    }[]
  >([])

  const onVoteInput = useCallback(
    (input: string, index: number) => {
      const formatted = formatAmount(input)
      if (formatted === votesData[index].votes) return
      setVotesData(
        votesData.map((voteData, i) => {
          if (i == index) {
            return {
              ...voteData,
              votes: input,
            }
          }
          return voteData
        })
      )
    },
    [votesData]
  )

  const handleGaugeSelectionModal = useCallback(
    (index: number) => {
      const resultingToggle = !openGaugeSelectionModal
      if (resultingToggle) {
        setEditingIndex(index)
      } else {
        setEditingIndex(undefined)
      }
      setOpenGaugeSelectionModal(resultingToggle)
    },
    [openGaugeSelectionModal]
  )

  const handleGaugeWeightsModal = useCallback(() => {
    setOpenGaugeWeightsModal(!openGaugeWeightsModal)
  }, [openGaugeWeightsModal])

  const deleteVote = useCallback(
    (index: number) => {
      const newVotesData = votesData.filter((voteData, i) => i == index)
      setVotesData(newVotesData)
    },
    [votesData]
  )

  const addVote = useCallback(() => {
    const newVotesData = [...votesData, { gauge: '', votes: '0' }]
    setVotesData(newVotesData)
  }, [votesData])

  const assign = useCallback(
    (protocol: string, index: number) => {
      setVotesData(
        votesData.map((voteData, i) => {
          if (i == index) {
            return {
              ...voteData,
              gauge: protocol,
            }
          }
          return voteData
        })
      )
    },
    [votesData]
  )

  return (
    <div style={{ margin: 'auto' }}>
      <GaugeSelectionModal
        show={openGaugeSelectionModal}
        index={editingIndex ?? 0}
        votesData={votesData}
        handleCloseModal={() => handleGaugeSelectionModal(editingIndex ?? 0)}
        assign={assign}
      />
      <GaugeWeightsModal
        isOpen={openGaugeWeightsModal}
        handleClose={handleGaugeWeightsModal}
        data={data}
        colors={COLORS}
      />
      <Flex col={isMobile} row={!isMobile}>
        <Flex col widthP={!isMobile ? 60 : undefined} p={10} gap={20}>
          <TileCard gap={20}>
            <Flex between>
              <Text semibold t2>
                Current Gauge Weights
              </Text>
              <Button secondary techygradient noborder onClick={handleGaugeWeightsModal} disabled={loading}>
                See More
              </Button>
            </Flex>
            <Flex justifyCenter>
              {loading ? (
                <LoaderText />
              ) : (
                <>
                  <ResponsiveContainer width="60%" height={200}>
                    <PieChart width={25}>
                      <Pie
                        isAnimationActive={animate}
                        onAnimationStart={onAnimationStart}
                        data={summarizedData}
                        cx="50%"
                        cy="50%"
                        outerRadius={width > BKPT_NAVBAR ? '100%' : '80%'}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {summarizedData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index == summarizedData.length - 1 ? '#DCDCDC' : COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Flex col gap={18} widthP={50}>
                    {summarizedData.map((entry, index) => (
                      <Flex key={`${entry.name}-${index}`} between>
                        <Text
                          bold
                          textAlignLeft
                          style={{ color: index < COLORS.length ? COLORS[index] : 'inherit' }}
                        >{`${entry.name}`}</Text>
                        <Text bold textAlignRight>{`${entry.value}%`}</Text>
                      </Flex>
                    ))}
                  </Flex>
                </>
              )}
            </Flex>
          </TileCard>
          <TileCard gap={10}>
            <Flex between>
              <Text>Underwriting Pool Size</Text>
              <Text>$100</Text>
            </Flex>
            <Flex between>
              <Text>Underwriting Pool Size</Text>
              <Text>$100</Text>
            </Flex>
            <Flex between>
              <Text>Underwriting Pool Size</Text>
              <Text>$100</Text>
            </Flex>
            <Flex between>
              <Text>Underwriting Pool Size</Text>
              <Text>$100</Text>
            </Flex>
            <Flex between>
              <Text>Underwriting Pool Size</Text>
              <Text>$100</Text>
            </Flex>
            <Flex between>
              <Text>Underwriting Pool Size</Text>
              <Text>$100</Text>
            </Flex>
          </TileCard>
        </Flex>
        <Flex col widthP={!isMobile ? 40 : undefined} p={10}>
          <TileCard style={{ alignItems: 'center' }} gap={15}>
            <RaisedBox>
              <Flex gap={12}>
                <Flex col itemsCenter width={126}>
                  <Text techygradient t6s>
                    My Total Votes
                  </Text>
                  <Text techygradient big3>
                    239
                  </Text>
                </Flex>
                <VerticalSeparator />
                <Flex col itemsCenter width={126}>
                  <Text t6s>My Used Votes</Text>
                  <Text big3>239</Text>
                </Flex>
              </Flex>
            </RaisedBox>
            {votesData.map((voteData, i) => (
              <VoteLock
                key={i}
                handleGaugeSelectionModal={handleGaugeSelectionModal}
                onVoteInput={onVoteInput}
                deleteVote={deleteVote}
                votesData={votesData}
                index={i}
              />
            ))}
            <Button onClick={addVote}>+ Add Vote</Button>
            <Button techygradient secondary noborder widthP={100}>
              Set Votes
            </Button>
          </TileCard>
        </Flex>
      </Flex>
    </div>
  )
}

export default Vote
