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
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
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

  const [visibleSection, setVisibleSection] = useState(0)
  useEffect(() => {
    // when visible section changes, use setSection make the ScrollDot switch to the current one
    setSection(visibleSection)
  }, [visibleSection])

  const { HomepageSections } = useHomepageSections()

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
        <DesktopScrollableArea
          visibleSection={visibleSection}
          setVisibleSection={setVisibleSection}
          HomepageSections={HomepageSections}
        />
        {/* {!isMobile ? (
          <DesktopScrollableArea visibleSection={visibleSection} setVisibleSection={setVisibleSection} isMobile={isMobile} />
        // ) : (
        //   <Flex col gap={81}>
        //     {homepageSections.map((Section, index) => (
        //       <React.Fragment key={'section' + index}>{Section.section}</React.Fragment>
        //     ))}
        //   </Flex>
        // )*/}
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
            {HomepageSections.map((_section, index) => (
              <ScrollDot
                hoverable
                key={_section.key + 'dot'}
                active={index === section}
                onClick={() => setSection(index)}
              />
            ))}
          </Flex>
        )}
      </Flex>
    </>
  )
}
export default About
