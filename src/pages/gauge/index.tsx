import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Content } from '../../components/atoms/Layout'
import { LoaderText } from '../../components/molecules/LoaderText'

function Gauge(): JSX.Element {
  const [loading, setLoading] = useState(true)
  const [animate, setAnimate] = useState(true)

  const COLORS = useMemo(() => ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'], [])

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
          x={x}
          y={y}
          fill={COLORS[index % COLORS.length]}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {data[index].name} ({value})
        </text>
      )
    },
    [COLORS, data]
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

  return (
    <Content>
      <ResponsiveContainer width="100%" height={350}>
        {loading ? (
          <LoaderText />
        ) : (
          <PieChart height={250}>
            <Pie
              isAnimationActive={animate}
              onAnimationStart={onAnimationStart}
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
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
    </Content>
  )
}

export default Gauge
