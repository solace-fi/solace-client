/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import components
    import hooks

    CustomTooltipCss

    CustomTooltip

    CustomNavbarTooltip

    StyledNavTooltip

    StyledTooltip
      hooks

  *************************************************************************************/

/* import packages */
import React from 'react'
import ReactTooltip from 'react-tooltip'
import styled, { css } from 'styled-components'
import { useLocation } from 'react-router'

/* import constants */
import { BKPT_1, BKPT_3, Z_TOOLTIP } from '../../constants'

/* import components */
import { StyledInfo, StyledLinkExternal } from '../atoms/Icon'
import { Text } from '../atoms/Typography'

/* import hooks */
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { timingSafeEqual } from 'crypto'

type StyledTooltipProps = {
  id: string
  tip: string | string[]
  link?: string
}

const CustomTooltipCss = css`
  max-width: 350px;
  font-size: 14px !important;
  pointer-events: auto !important;
  cursor: pointer;
  z-index: ${Z_TOOLTIP};
  &:hover {
    visibility: visible !important;
    opacity: 1 !important;
  }
`

const CustomTooltip = styled(ReactTooltip)`
  background-color: ${({ theme }) => theme.tooltip.bg_color} !important;
  ${CustomTooltipCss}
`

const CustomNavbarTooltip = styled(ReactTooltip)`
  ${CustomTooltipCss}
`

export const StyledNavTooltip: React.FC<StyledTooltipProps> = ({ id, tip, children }) => {
  const { width } = useWindowDimensions()
  const location = useLocation()

  return (
    <>
      {width <= BKPT_3 ? (
        <>
          <div data-for={id} data-tip={tip} style={{ padding: '4px 0' }}>
            {children}
          </div>
          <CustomNavbarTooltip
            id={id}
            delayShow={100}
            delayHide={100}
            effect="solid"
            place="right"
            backgroundColor={location.pathname == '/' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(25, 29, 36, 1)'}
          >
            {Array.isArray(tip) ? (
              tip.map((_tip, i) => (
                <>
                  <Text t4 light key={i}>
                    {_tip}
                  </Text>
                  <br />
                </>
              ))
            ) : (
              <Text t4 light>
                {tip}
              </Text>
            )}
          </CustomNavbarTooltip>
        </>
      ) : (
        children
      )}
    </>
  )
}

export const StyledTooltip: React.FC<StyledTooltipProps & { alwaysShowChildren?: boolean }> = ({
  id,
  tip,
  children,
  alwaysShowChildren,
  link,
}) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/
  const { width } = useWindowDimensions()

  return (
    <>
      {width > BKPT_1 ? (
        <>
          <a data-for={id} data-tip={tip}>
            {children}
          </a>
          <CustomTooltip id={id} delayShow={200} delayHide={200} effect="solid">
            {link ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: '#fff' }}
              >
                {Array.isArray(tip) ? (
                  tip.map((_tip, i) => (
                    <div key={i}>
                      <Text t4 light>
                        {_tip}
                      </Text>
                      <br />
                    </div>
                  ))
                ) : (
                  <>
                    <Text t4 light>
                      {tip}
                    </Text>
                    <br />
                  </>
                )}
                <Text success textAlignRight style={{ marginTop: '1px' }}>
                  Learn more <StyledLinkExternal size={20} />
                </Text>
              </a>
            ) : (
              <>
                {Array.isArray(tip) ? (
                  tip.map((_tip, i) => (
                    <div key={i}>
                      <Text t4 light>
                        {_tip}
                      </Text>
                      {i + 1 < tip.length && <br />}
                    </div>
                  ))
                ) : (
                  <Text t4 light>
                    {tip}
                  </Text>
                )}
              </>
            )}
          </CustomTooltip>
        </>
      ) : alwaysShowChildren ? (
        children
      ) : null}
    </>
  )
}
