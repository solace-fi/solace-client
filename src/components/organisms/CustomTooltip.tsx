import React, { useState, useEffect } from 'react'
import { tooltipFormatterNumber, rightPad, leftPad, formatTimestamp } from '../../utils/formatting'
import { Card } from '../atoms/Card'
import { Flex } from '../atoms/Layout'
import { Text } from '../atoms/Typography'

export function UwpCustomTooltip(props: any) {
  const { active, payload, label, valuePrefix, valueDecimals, chartType, colors } = props
  const [payload2, setPayload2] = useState<any[] | undefined>(undefined)

  useEffect(() => {
    if (!active || !payload || !payload.length) {
      setPayload2(undefined)
      return
    }
    const _payload2 = JSON.parse(JSON.stringify(payload))
    if (chartType && chartType == 'stackedLine') _payload2.reverse()
    let maxLengthName = 0
    let maxLengthValue = 0
    const formatter = tooltipFormatterNumber({ decimals: valueDecimals, prefix: valuePrefix })
    for (let i = 0; i < _payload2.length; ++i) {
      _payload2[i].nameText = _payload2[i].name
      if (_payload2[i].nameText.length > maxLengthName) maxLengthName = _payload2[i].nameText.length
      _payload2[i].valueText = formatter(_payload2[i].value)
      if (_payload2[i].valueText.length > maxLengthValue) maxLengthValue = _payload2[i].valueText.length
    }
    for (let i = 0; i < _payload2.length; ++i) {
      _payload2[i].rowText = `${rightPad(_payload2[i].nameText, maxLengthName)}  ${leftPad(
        '$'.concat(_payload2[i].valueText),
        maxLengthValue
      )}`
    }
    setPayload2(_payload2)
  }, [payload, active, chartType, valueDecimals, valuePrefix])

  return (
    <>
      {payload2 ? (
        <Card>
          <Flex col gap={5}>
            <Text semibold>{formatTimestamp(label)}</Text>
            <Flex col gap={2}>
              {payload2.map((item: any, key: any) => {
                return (
                  <Text t5s key={key} style={{ color: colors[payload2.length - key - 1] }}>
                    {item.rowText}
                  </Text>
                )
              })}
            </Flex>
          </Flex>
        </Card>
      ) : null}
    </>
  )
}

export function PremiumsCustomTooltip(props: any) {
  const { active, payload, label, valuePrefix, valueDecimals, chartType, color } = props
  const [payload2, setPayload2] = useState<any[] | undefined>(undefined)

  useEffect(() => {
    if (!active || !payload || !payload.length) {
      setPayload2(undefined)
      return
    }
    const _payload2 = JSON.parse(JSON.stringify(payload))
    if (chartType && chartType == 'stackedLine') _payload2.reverse()
    let maxLengthValue = 0
    const formatter = tooltipFormatterNumber({ decimals: valueDecimals, prefix: valuePrefix })
    for (let i = 0; i < _payload2.length; ++i) {
      _payload2[i].valueText = formatter(_payload2[i].value)
      if (_payload2[i].valueText.length > maxLengthValue) maxLengthValue = _payload2[i].valueText.length
    }
    for (let i = 0; i < _payload2.length; ++i) {
      _payload2[i].rowText = '$'.concat(_payload2[i].valueText)
    }
    setPayload2(_payload2)
  }, [payload, active, chartType, valueDecimals, valuePrefix])

  return (
    <>
      {payload2 ? (
        <Card>
          <Flex col gap={5}>
            <Text semibold>{formatTimestamp(label)}</Text>
            <Flex col gap={2}>
              <Text t3s>{payload2[0].rowText}</Text>
            </Flex>
          </Flex>
        </Card>
      ) : null}
    </>
  )
}
