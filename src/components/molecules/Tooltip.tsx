/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import components
    import hooks
    import styles

    StyledTooltip function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import packages */
import ReactTooltip from 'react-tooltip'

/* import constants */
import { MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

/* import components */
import { StyledInfo, StyledLinkExternal } from '../atoms/Icon'
import { Text } from '../atoms/Typography'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import styles */
import '../../styles/tooltip.css'

type StyledTooltipProps = {
  id: string
  tip: string
  link?: string
}

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
          <ReactTooltip id={id} className="custom-tooltip" delayShow={200} delayHide={200} effect="solid">
            {link ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: '#fff' }}
              >
                {tip}
                <br />
                <Text green textAlignRight style={{ marginTop: '1px' }}>
                  Learn more <StyledLinkExternal size={20} />
                </Text>
              </a>
            ) : (
              tip
            )}
          </ReactTooltip>
        </>
      ) : null}
    </>
  )
}
