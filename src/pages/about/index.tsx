/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import components
    import resources
    import hooks

    About
      hooks

  *************************************************************************************/

/* import packages */
import React, { useEffect, useState } from 'react'

/* import constants */

/* import components */
import { Flex } from '../../components/atoms/Layout'

/* import resources */

/* import hooks */
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { ScrollDot } from '../../components/atoms/Icon/ScrollDot'
import { useHomepageSections } from './utils/useHomepageSections'
import DesktopScrollableArea from './components/organisms/DesktopScrollableArea'

function About(): JSX.Element {
  /* hooks */
  const { isMobile, height } = useWindowDimensions()
  const [section, setSection] = useState<number>(0)

  useEffect(() => {
    // desktop cannot scroll normally
    if (!isMobile) {
      window.document.body.style.overflowY = 'hidden'
    }
    if (isMobile) {
      window.document.body.style.overflowY = 'scroll'
    }
    return () => {
      window.document.body.style.overflowY = 'auto'
    }
  }, [isMobile])

  const { HomepageSections } = useHomepageSections()

  function changeVisibleSection(index: number) {
    setSection(index)
    console.log('changeVisibleSection', index, section)
  }

  return (
    <>
      <Flex
        itemsCenter
        justifyCenter
        col
        style={{
          height: !isMobile ? height - 100 + 'px' : '100%',
          // border: '5px solid black',
          position: 'relative',
        }}
      >
        {!isMobile ? (
          <DesktopScrollableArea
            visibleSection={section}
            setVisibleSection={setSection}
            HomepageSections={HomepageSections}
          />
        ) : (
          <Flex col gap={81}>
            {HomepageSections.map((Section, index) => (
              <React.Fragment key={'section' + index}>
                <Section.Section />
              </React.Fragment>
            ))}
          </Flex>
        )}
        {!isMobile && (
          <Flex
            col
            gap={20}
            justifyCenter
            w={8}
            style={{
              position: 'absolute',
              right: '30px',
              height: '100%',
            }}
          >
            {HomepageSections.map((Section, index) => (
              <ScrollDot
                hoverable
                key={Section.key + 'dot'}
                active={index === section}
                onClick={() => changeVisibleSection(index)}
              />
            ))}
          </Flex>
        )}
      </Flex>
    </>
  )
}
export default About
