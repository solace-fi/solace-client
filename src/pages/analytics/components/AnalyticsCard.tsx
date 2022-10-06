import React, { useState } from 'react'
import { Accordion } from '../../../components/atoms/Accordion'
import { GraySquareButton } from '../../../components/atoms/Button'
import { Card } from '../../../components/atoms/Card'
import { StyledHelpCircle } from '../../../components/atoms/Icon'
import { Flex, ShadowDiv } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { PortfolioAreaChartVega } from '../PortfolioAreaChartVega'
import { TokenPortfolioAreaChart } from '../TokenPortfolioAreaChart'
import { TokenWeights } from '../TokenWeights'

export default function AnalyticsCard({
  title,
  clarification,
  children,
  width,
  height,
}: {
  title: string
  clarification?: string
  children: React.ReactNode
  width?: number
  height?: number
}): JSX.Element {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <Card shadow width={width} height={height}>
      <Flex gap={8} col>
        <Flex between gap={8} className="dragHandle">
          <Text t3s semibold style={{ whiteSpace: 'nowrap' }}>
            {title}
          </Text>
          {clarification && (
            <Flex gap={4} itemsCenter>
              <GraySquareButton
                actuallyWhite
                noborder
                shadow
                width={28}
                height={28}
                radius={8}
                onClick={() => setOpen(!open)}
              >
                <StyledHelpCircle size={16} />
              </GraySquareButton>
            </Flex>
          )}
        </Flex>
        <Accordion isOpen={open} p={open ? 5 : 0} noScroll>
          <Flex p={8}>
            <Text t3s>{clarification}</Text>
          </Flex>
        </Accordion>
        {children}
      </Flex>
    </Card>
  )
}
