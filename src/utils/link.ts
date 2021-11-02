import React from 'react'
import ReactGA from 'react-ga'

const EXPLORER_HOSTNAMES: { [hostname: string]: true } = {
  'etherscan.io': true,
  'ropsten.etherscan.io': true,
  'rinkeby.etherscan.io': true,
  'kovan.etherscan.io': true,
  'goerli.etherscan.io': true,
  'optimistic.etherscan.io': true,
  'kovan-optimistic.etherscan.io': true,
  'rinkeby-explorer.arbitrum.io': true,
  'arbiscan.io': true,
}

export function handleClickExternalLink(event: React.MouseEvent<HTMLAnchorElement>): void {
  const { target, href } = event.currentTarget

  const anonymizedHref = anonymizeLink(href)

  // don't prevent default, don't redirect if it's a new tab
  if (target === '_blank' || event.ctrlKey || event.metaKey) {
    ReactGA.outboundLink({ label: anonymizedHref }, () => {
      console.debug('Fired outbound link event', anonymizedHref)
    })
  } else {
    event.preventDefault()
    // send a ReactGA event and then trigger a location change
    ReactGA.outboundLink({ label: anonymizedHref }, () => {
      window.location.href = anonymizedHref
    })
  }
}

/**
 * Returns the anonymized version of the given href, i.e. one that does not leak user information
 * @param href the link to anonymize, i.e. remove any personal data from
 * @return string anonymized version of the given href
 */
export function anonymizeLink(href: string): string {
  try {
    const url = new URL(href)
    if (EXPLORER_HOSTNAMES[url.hostname]) {
      const pathPieces = url.pathname.split('/')

      const anonymizedPath = pathPieces.map((pc) => (/0x[a-fA-F0-9]+/.test(pc) ? '***' : pc)).join('/')

      return `${url.protocol}//${url.hostname}${anonymizedPath}`
    }
    return href
  } catch (error) {
    return href
  }
}
