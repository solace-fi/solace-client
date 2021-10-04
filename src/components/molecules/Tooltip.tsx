/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import components
    import hooks

    StyledTooltip function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import packages */
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

/* import constants */
import { MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

/* import components */
import { StyledInfo, StyledLinkExternal } from '../atoms/Icon'
import { Text } from '../atoms/Typography'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

type StyledTooltipProps = {
  id: string
  tip: string
  link?: string
}

const CustomTooltip = styled(ReactTooltip)`
  max-width: 350px;
  font-size: 14px !important;
  pointer-events: auto !important;
  background-color: ${({ theme }) => theme.tooltip.bg_color} !important;
  cursor: pointer;
  &:hover {
    visibility: visible !important;
    opacity: 1 !important;
  }
`

export const StyledTooltip: React.FC<StyledTooltipProps> = ({ id, tip, link }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { width } = useWindowDimensions()
  /*************************************************************************************

  render

  *************************************************************************************/
  return (
    <>
      {width > MAX_MOBILE_SCREEN_WIDTH ? (
        <>
          <a data-for={id} data-tip={tip}>
            <StyledInfo size={20} />
          </a>
          <CustomTooltip id={id} delayShow={200} delayHide={200} effect="solid">
            {link ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: '#fff' }}
              >
                <Text high_em h4>
                  {tip}
                </Text>
                <br />
                <Text success textAlignRight style={{ marginTop: '1px' }}>
                  Learn more <StyledLinkExternal size={20} />
                </Text>
              </a>
            ) : (
              <Text high_em h4>
                {tip}
              </Text>
            )}
          </CustomTooltip>
        </>
      ) : null}
    </>
  )
}
