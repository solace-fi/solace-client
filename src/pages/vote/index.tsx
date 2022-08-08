import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
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

function Vote(): JSX.Element {
  const [loading, setLoading] = useState(true)
  const [animate, setAnimate] = useState(true)
  const [openGaugeModal, setOpenGaugeModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | undefined>(undefined)

  const { appTheme } = useGeneral()
  const { width, isMobile } = useWindowDimensions()

  const COLORS = useMemo(() => ['rgb(212,120,216)', 'rgb(243,211,126)', 'rgb(95,93,249)', 'rgb(240,77,66)'], [])
  const DARK_COLORS = useMemo(() => ['rgb(166, 95, 168)', 'rgb(187, 136, 0)', '#4644b9', '#b83c33'], [])

  const data = useMemo(
    () => [
      { name: 'protocol 1', value: 2 },
      { name: 'protocol 3', value: 4 },
      { name: 'protocol 2', value: 6 },
      { name: 'protocol 4', value: 8 },
      { name: 'protocol 5', value: 12 },
      { name: 'protocol 6', value: 1 },
      { name: 'protocol 7', value: 3 },
      { name: 'protocol 8', value: 7 },
    ],
    []
  )

  const renderCustomizedLabel = useCallback(
    ({ cx, cy, midAngle, innerRadius, outerRadius, value, index }: any) => {
      const RADIAN = Math.PI / 180
      const radius = 25 + innerRadius + (outerRadius - innerRadius)
      const x = cx + radius * Math.cos(-midAngle * RADIAN)
      const y = cy + radius * Math.sin(-midAngle * RADIAN)

      return (
        <text
          fontSize={width > BKPT_NAVBAR ? '1rem' : '3vw'}
          x={x}
          y={y}
          fill={appTheme == 'dark' ? COLORS[index % COLORS.length] : DARK_COLORS[index % DARK_COLORS.length]}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {data[index].name} ({value})
        </text>
      )
    },
    [COLORS, DARK_COLORS, data, width, appTheme]
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

  const handleGaugeModal = useCallback(
    (index: number) => {
      const resultingToggle = !openGaugeModal
      if (resultingToggle) {
        setEditingIndex(index)
      } else {
        setEditingIndex(undefined)
      }
      setOpenGaugeModal(resultingToggle)
    },
    [openGaugeModal]
  )

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
        show={openGaugeModal}
        index={editingIndex ?? 0}
        votesData={votesData}
        handleCloseModal={() => handleGaugeModal(editingIndex ?? 0)}
        assign={assign}
      />
      <Flex col={isMobile} row={!isMobile}>
        <Flex col widthP={!isMobile ? 60 : undefined} p={10}>
          <ResponsiveContainer width="100%" height={350}>
            {loading ? (
              <LoaderText />
            ) : (
              <PieChart width={20}>
                <Pie
                  isAnimationActive={animate}
                  onAnimationStart={onAnimationStart}
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={width > BKPT_NAVBAR ? '60%' : '40%'}
                  fill="#8884d8"
                  dataKey="value"
                  label={renderCustomizedLabel}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            )}
          </ResponsiveContainer>
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
                handleGaugeModal={handleGaugeModal}
                onVoteInput={onVoteInput}
                deleteVote={deleteVote}
                votesData={votesData}
                index={i}
              />
            ))}
            <Button onClick={addVote}>+ Add Vote</Button>
            <Button techygradient secondary noborder widthP={100}>
              Send Votes
            </Button>
          </TileCard>
        </Flex>
      </Flex>
    </div>
  )
}

export default Vote
