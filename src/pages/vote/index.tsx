import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

import { Flex, ShadowDiv, VerticalSeparator } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { LoaderText } from '../../components/molecules/LoaderText'
import { BKPT_NAVBAR } from '../../constants'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { TileCard } from '../../components/molecules/TileCard'
import { Button } from '../../components/atoms/Button'
import { VoteGauge } from '../../components/organisms/VoteGauge'
import { formatAmount } from '../../utils/formatting'
import { GaugeSelectionModal } from '../../components/organisms/GaugeSelectionModal'
import { CustomPieChartTooltip, GaugeWeightsModal } from '../../components/organisms/GaugeWeightsModal'
import { Accordion } from '../../components/atoms/Accordion'
import { useGaugeController, useGaugeControllerHelper } from '../../hooks/gauge/useGaugeController'
import { useUwpLockVoting, useUwpLockVotingHelper } from '../../hooks/lock/useUwpLockVoting'
import { useWeb3React } from '@web3-react/core'
import { useNetwork } from '../../context/NetworkManager'
import { BigNumber } from 'ethers'
import { ModalCell } from '../../components/atoms/Modal'
import { SmallerInputSection } from '../../components/molecules/InputSection'
import useDebounce from '@rooks/use-debounce'
import { isAddress } from '../../utils'
import { useCachedData } from '../../context/CachedDataManager'
import { VotesData } from '../../constants/types'

function Vote(): JSX.Element {
  const [loading, setLoading] = useState(true)
  const [canVote, setCanVote] = useState(true)
  const [ownerTab, setOwnerTab] = useState(true)
  const [delegatorAddr, setDelegatorAddr] = useState('')

  const [animate, setAnimate] = useState(true)
  const [openGaugeWeightsModal, setOpenGaugeWeightsModal] = useState(false)
  const [openGaugeSelectionModal, setOpenGaugeSelectionModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | undefined>(undefined)

  const { width, isMobile } = useWindowDimensions()
  const { loading: gaugesLoading, gaugesData } = useGaugeControllerHelper()
  const { getGaugeName, isGaugeActive } = useGaugeController()
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { version } = useCachedData()
  const {
    isVotingOpen,
    vote,
    voteMultiple,
    removeVote,
    removeVoteMultiple,
    getVotePower,
    getVotes,
  } = useUwpLockVoting()

  const { getVoteInformation } = useUwpLockVotingHelper()

  const COLORS = useMemo(() => ['rgb(212,120,216)', 'rgb(243,211,126)', 'rgb(95,93,249)', 'rgb(240,77,66)'], [])
  const DARK_COLORS = useMemo(() => ['rgb(166, 95, 168)', 'rgb(187, 136, 0)', '#4644b9', '#b83c33'], [])

  const TOP_GAUGES = 4

  const data = useMemo(
    () => [
      { name: 'stake-dao', value: 18, gaugeId: BigNumber.from(1), isActive: true },
      { name: 'aave', value: 16, gaugeId: BigNumber.from(2), isActive: true },
      { name: 'compound', value: 15, gaugeId: BigNumber.from(3), isActive: true },
      { name: 'solace', value: 13, gaugeId: BigNumber.from(4), isActive: true },
      { name: 'sushiswap', value: 12, gaugeId: BigNumber.from(5), isActive: true },
      { name: 'fox-bank', value: 10, gaugeId: BigNumber.from(6), isActive: true },
      { name: 'monkey-barrel', value: 9, gaugeId: BigNumber.from(7), isActive: true },
      { name: 'nexus-farm', value: 4, gaugeId: BigNumber.from(8), isActive: true },
      { name: 'quickswap', value: 2, gaugeId: BigNumber.from(9), isActive: true },
      { name: 'lemonade-stake', value: 1, gaugeId: BigNumber.from(10), isActive: true },
    ],
    []
  )

  // const data = useMemo(() => {
  //   return gaugesData.map((g) => {
  //     return { name: g.gaugeName, value: parseFloat(formatUnits(g.gaugeWeight, 14).split('.')[0]) / 100, id: g.gaugeId, isActive: g.isActive }
  //   })
  // }, [])

  const summarizedData = useMemo(
    () => [
      ...data.slice(0, TOP_GAUGES),
      { name: 'Other Protocols', value: data.slice(TOP_GAUGES).reduce((acc, pv) => pv.value + acc, 0) },
    ],
    [data]
  )

  const [votesData, setVotesData] = useState<VotesData>({
    votePower: BigNumber.from(0),
    usedVotePower: BigNumber.from(0),
    voteAllocation: [],
  })

  const [delegatorVotesData, setDelegatorVotesData] = useState<VotesData>({
    votePower: BigNumber.from(0),
    usedVotePower: BigNumber.from(0),
    voteAllocation: [],
  })

  const onVoteInput = useCallback(
    (input: string, index: number) => {
      const formatted: string = formatAmount(input)
      if (formatted === votesData.voteAllocation[index].votes) return
      setVotesData((prevState) => {
        return {
          ...prevState,
          voteAllocation: [
            ...prevState.voteAllocation.slice(0, index),
            {
              ...prevState.voteAllocation[index],
              votes: input,
              changed: true,
            },
            ...prevState.voteAllocation.slice(index + 1),
          ],
        }
      })
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
      const newVoteAllocation = votesData.voteAllocation.filter((voteData, i) => i !== index)
      setVotesData((prevState) => {
        return { ...prevState, voteAllocation: newVoteAllocation }
      })
    },
    [votesData]
  )

  const addVote = useCallback(() => {
    const newVotesData = {
      ...votesData,
      voteAllocation: [...votesData.voteAllocation, { gauge: '', votes: '0', added: true, changed: false }],
    }
    setVotesData(newVotesData)
  }, [votesData])

  const assign = useCallback(
    (protocol: string, index: number) => {
      setVotesData((prevState) => {
        return {
          ...prevState,
          voteAllocation: votesData.voteAllocation.map((vote, i) => {
            if (i == index) {
              return {
                ...votesData.voteAllocation[i],
                gauge: protocol,
                changed: true,
              }
            }
            return vote
          }),
        }
      })
    },
    [votesData]
  )

  // useEffect(() => {
  //   const callIsVotingOpen = async () => {
  //     const isOpen = await isVotingOpen()
  //     setCanVote(isOpen)
  //   }
  //   callIsVotingOpen()
  // }, [])

  const queryDelegator = useDebounce(async () => {
    if (!isAddress(delegatorAddr) || !account) {
      setDelegatorVotesData({
        votePower: BigNumber.from(0),
        usedVotePower: BigNumber.from(0),
        voteAllocation: [],
      })
      return
    }
    const delegatorVoteInfo = await getVoteInformation(delegatorAddr)
    if (delegatorVoteInfo.delegate.toLowerCase() != account.toLowerCase()) {
      setDelegatorVotesData({
        votePower: BigNumber.from(0),
        usedVotePower: BigNumber.from(0),
        voteAllocation: [],
      })
      return
    }
    const formattedDelegatorVotesData = delegatorVoteInfo.votes.map((item) => {
      const name = gaugesData.find((g) => g.gaugeId === item.gaugeID)?.gaugeName ?? ''
      return {
        gauge: name,
        votes: item.votePowerBPS.mul(delegatorVoteInfo.votePower).div(BigNumber.from('10000')).toString(),
        added: false,
        changed: false,
      }
    })

    setDelegatorVotesData({
      votePower: delegatorVoteInfo.votePower,
      usedVotePower: delegatorVoteInfo.usedVotePower,
      voteAllocation: formattedDelegatorVotesData,
    })
  }, 300)

  useEffect(() => {
    const getUserVotesData = async () => {
      if (!account) return
      const userVoteInfo = await getVoteInformation(account)
      const formattedUserVotesData = userVoteInfo.votes.map((item) => {
        const name = gaugesData.find((g) => g.gaugeId === item.gaugeID)?.gaugeName ?? ''
        return {
          gauge: name,
          votes: item.votePowerBPS.mul(userVoteInfo.votePower).div(BigNumber.from('10000')).toString(),
          added: false,
          changed: false,
        }
      })
      setVotesData({
        votePower: userVoteInfo.votePower,
        usedVotePower: userVoteInfo.usedVotePower,
        voteAllocation: formattedUserVotesData,
      })
    }
    getUserVotesData()
  }, [account, gaugesData, activeNetwork, version])

  useEffect(() => {
    queryDelegator()
  }, [delegatorAddr, queryDelegator])

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

  return (
    <div style={{ margin: 'auto' }}>
      <GaugeSelectionModal
        show={openGaugeSelectionModal}
        index={editingIndex ?? 0}
        votesData={votesData.voteAllocation}
        handleCloseModal={() => handleGaugeSelectionModal(editingIndex ?? 0)}
        assign={assign}
      />
      <GaugeWeightsModal
        isOpen={openGaugeWeightsModal}
        handleClose={handleGaugeWeightsModal}
        data={data}
        colors={COLORS}
        darkColors={DARK_COLORS}
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
          <TileCard gap={15}>
            <div style={{ gridTemplateColumns: '1fr 0fr 1fr', display: 'grid', position: 'relative' }}>
              <ModalCell
                pt={5}
                pb={10}
                pl={0}
                pr={0}
                onClick={() => setOwnerTab(true)}
                jc={'center'}
                style={{ cursor: 'pointer', backgroundColor: ownerTab ? 'rgba(0, 0, 0, .05)' : 'inherit' }}
              >
                <Text t1 bold info={ownerTab}>
                  Vote for Myself
                </Text>
              </ModalCell>
              <VerticalSeparator />
              <ModalCell
                pt={5}
                pb={10}
                pl={0}
                pr={0}
                onClick={() => setOwnerTab(false)}
                jc={'center'}
                style={{ cursor: 'pointer', backgroundColor: !ownerTab ? 'rgba(0, 0, 0, .05)' : 'inherit' }}
              >
                <Text t1 bold info={!ownerTab}>
                  Vote for Others
                </Text>
              </ModalCell>
            </div>
            {ownerTab ? (
              <>
                <Flex>
                  <Text semibold t2>
                    My Gauge Votes
                  </Text>
                </Flex>
                <Flex col itemsCenter gap={15}>
                  <ShadowDiv>
                    <Flex gap={12} p={10}>
                      <Flex col itemsCenter width={126}>
                        <Text techygradient t6s>
                          My Total Points
                        </Text>
                        <Text techygradient big3>
                          239
                        </Text>
                      </Flex>
                      <VerticalSeparator />
                      <Flex col itemsCenter width={126}>
                        <Text t6s>My Used Points</Text>
                        <Text big3>239</Text>
                      </Flex>
                    </Flex>
                  </ShadowDiv>
                  <Accordion isOpen={votesData.voteAllocation.length > 0} thinScrollbar>
                    <Flex col gap={10} p={10}>
                      {votesData.voteAllocation.map((voteData, i) => (
                        <VoteGauge
                          key={i}
                          handleGaugeSelectionModal={handleGaugeSelectionModal}
                          onVoteInput={onVoteInput}
                          deleteVote={deleteVote}
                          votesData={votesData.voteAllocation}
                          index={i}
                        />
                      ))}
                    </Flex>
                  </Accordion>
                  {canVote ? (
                    <>
                      <Button onClick={addVote}>+ Add Gauge Vote</Button>
                      <Button techygradient secondary noborder widthP={100}>
                        Set Votes
                      </Button>
                    </>
                  ) : (
                    <Text>Voting is closed</Text>
                  )}
                </Flex>
              </>
            ) : (
              <>
                <Flex>
                  <SmallerInputSection
                    placeholder={'Query Delegator Address'}
                    value={delegatorAddr}
                    onChange={(e) => setDelegatorAddr(e.target.value)}
                  />
                </Flex>
                <Flex col itemsCenter gap={15}>
                  <ShadowDiv>
                    <Flex gap={12} p={10}>
                      <Flex col itemsCenter width={126}>
                        <Text techygradient t6s>
                          Delegator&apos;s Total Points
                        </Text>
                        <Text techygradient big3>
                          239
                        </Text>
                      </Flex>
                      <VerticalSeparator />
                      <Flex col itemsCenter width={126}>
                        <Text t6s>Delegator&apos;s Used Points</Text>
                        <Text big3>239</Text>
                      </Flex>
                    </Flex>
                  </ShadowDiv>
                  <Accordion isOpen={delegatorVotesData.voteAllocation.length > 0} thinScrollbar>
                    <Flex col gap={10} p={10}>
                      {delegatorVotesData.voteAllocation.map((voteData, i) => (
                        <VoteGauge
                          key={i}
                          handleGaugeSelectionModal={handleGaugeSelectionModal}
                          onVoteInput={onVoteInput}
                          deleteVote={deleteVote}
                          votesData={delegatorVotesData.voteAllocation}
                          index={i}
                        />
                      ))}
                    </Flex>
                  </Accordion>
                  {canVote ? (
                    <>
                      <Button onClick={addVote}>+ Add Gauge Vote</Button>
                      <Button techygradient secondary noborder widthP={100}>
                        Set Votes
                      </Button>
                    </>
                  ) : (
                    <Text>Voting is closed</Text>
                  )}
                </Flex>
              </>
            )}
          </TileCard>
        </Flex>
      </Flex>
    </div>
  )
}

export default Vote
