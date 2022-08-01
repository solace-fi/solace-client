import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Flex, Scrollable } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { LoaderText } from '../../components/molecules/LoaderText'
import { BKPT_NAVBAR } from '../../constants'
import { useGeneral } from '../../context/GeneralManager'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { TileCard } from '../../components/molecules/TileCard'
import InfoPair from '../lock/molecules/InfoPair'
import CardSectionValue from '../lock/components/CardSectionValue'
import { Button } from '../../components/atoms/Button'
import { CheckboxData } from '../../constants/types'
import { VoteLock } from '../../components/organisms/VoteLock'
import { boxIsChecked, updateBoxCheck } from '../../utils/checkbox'
import { BigNumber } from 'ethers'

function Vote(): JSX.Element {
  const [loading, setLoading] = useState(true)
  const [animate, setAnimate] = useState(true)
  const { appTheme } = useGeneral()
  const { width, isMobile } = useWindowDimensions()

  const [locksChecked, setLocksChecked] = useState<CheckboxData[]>([])

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

  const handleLockCheck = (lockId: BigNumber) => {
    const checkboxStatus = boxIsChecked(locksChecked, lockId.toString())
    const newArr = updateBoxCheck(locksChecked, lockId.toString(), !checkboxStatus)
    setLocksChecked(newArr)
  }

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
          <Flex style={{ flexWrap: 'wrap' }} gap={10} justifyCenter>
            <TileCard>
              <InfoPair importance="primary" label="Underwriting Pool Size">
                <CardSectionValue annotation="UWE">{333}</CardSectionValue>
              </InfoPair>
            </TileCard>
            <TileCard>
              <InfoPair importance="primary" label="Underwriting Pool Size">
                <CardSectionValue annotation="UWE">{333}</CardSectionValue>
              </InfoPair>
            </TileCard>
            <TileCard>
              <InfoPair importance="primary" label="Underwriting Pool Size">
                <CardSectionValue annotation="UWE">{333}</CardSectionValue>
              </InfoPair>
            </TileCard>
            <TileCard>
              <InfoPair importance="primary" label="Underwriting Pool Size">
                <CardSectionValue annotation="UWE">{333}</CardSectionValue>
              </InfoPair>
            </TileCard>
            <TileCard>
              <InfoPair importance="primary" label="Underwriting Pool Size">
                <CardSectionValue annotation="UWE">{333}</CardSectionValue>
              </InfoPair>
            </TileCard>
            <TileCard>
              <InfoPair importance="primary" label="Underwriting Pool Size">
                <CardSectionValue annotation="UWE">{333}</CardSectionValue>
              </InfoPair>
            </TileCard>
          </Flex>
        </Flex>
        <Flex col widthP={!isMobile ? 40 : undefined} p={10} pt={isMobile ? 40 : undefined} gap={20}>
          <Button secondary techygradient noborder>
            Set Gauge for all
          </Button>
          <Flex
            thinScrollbar
            col
            gap={12}
            pt={20}
            px={20}
            pb={10}
            style={
              !isMobile
                ? {
                    overflowY: 'auto',
                    height: '60vh',
                    minHeight: '561px',
                  }
                : {
                    overflowY: 'auto',
                    height: '400px',
                  }
            }
            bgLightGray
          >
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '1')}
              onCheck={() => handleLockCheck(BigNumber.from(1))}
              index={0}
            />
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '2')}
              onCheck={() => handleLockCheck(BigNumber.from(2))}
              index={1}
            />
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '3')}
              onCheck={() => handleLockCheck(BigNumber.from(3))}
              index={2}
            />
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '3')}
              onCheck={() => handleLockCheck(BigNumber.from(3))}
              index={2}
            />
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '3')}
              onCheck={() => handleLockCheck(BigNumber.from(3))}
              index={2}
            />
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '3')}
              onCheck={() => handleLockCheck(BigNumber.from(3))}
              index={2}
            />
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '3')}
              onCheck={() => handleLockCheck(BigNumber.from(3))}
              index={2}
            />
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '3')}
              onCheck={() => handleLockCheck(BigNumber.from(3))}
              index={2}
            />
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '3')}
              onCheck={() => handleLockCheck(BigNumber.from(3))}
              index={2}
            />
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '3')}
              onCheck={() => handleLockCheck(BigNumber.from(3))}
              index={2}
            />
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '3')}
              onCheck={() => handleLockCheck(BigNumber.from(3))}
              index={2}
            />
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '3')}
              onCheck={() => handleLockCheck(BigNumber.from(3))}
              index={2}
            />
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '3')}
              onCheck={() => handleLockCheck(BigNumber.from(3))}
              index={2}
            />
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '3')}
              onCheck={() => handleLockCheck(BigNumber.from(3))}
              index={2}
            />
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '3')}
              onCheck={() => handleLockCheck(BigNumber.from(3))}
              index={2}
            />{' '}
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '3')}
              onCheck={() => handleLockCheck(BigNumber.from(3))}
              index={2}
            />{' '}
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '3')}
              onCheck={() => handleLockCheck(BigNumber.from(3))}
              index={2}
            />{' '}
            <VoteLock
              isChecked={boxIsChecked(locksChecked, '3')}
              onCheck={() => handleLockCheck(BigNumber.from(3))}
              index={2}
            />
          </Flex>
          <Button secondary techygradient noborder>
            Multi-Vote
          </Button>
        </Flex>
      </Flex>
    </div>
  )
}

export default Vote
