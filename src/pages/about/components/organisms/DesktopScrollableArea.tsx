import VisibilitySensor from 'react-visibility-sensor'
import styled from 'styled-components'
import React, { useEffect } from 'react'
import { HomepageSections } from '../../utils/useHomepageSections'

const SnapScroll = styled.div`
  height: calc(100vh - 100px);
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  scroll-behavior: smooth;
  & > * {
    scroll-snap-align: start;
    height: calc(100vh - 100px);
  }
`

export default function DesktopScrollableArea({
  visibleSection,
  setVisibleSection,
  HomepageSections,
}: {
  visibleSection: number
  setVisibleSection: (section: number) => void
  HomepageSections: HomepageSections
}): JSX.Element {
  const visibilityRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visibilityRef.current) {
      visibilityRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [visibleSection])

  return (
    <SnapScroll>
      {HomepageSections.map((Section, index) => (
        <VisibilitySensor key={Section.key}>
          {({ isVisible }) => {
            if (isVisible) {
              setVisibleSection(index)
            }
            return (
              <React.Fragment key={Section.key}>
                <Section.Section ref={Section.ref} />
              </React.Fragment>
            )
          }}
        </VisibilitySensor>
      ))}
    </SnapScroll>
  )
}
