import 'twin.macro'
import styledComponent, { CSSProp, css as cssProperty } from 'styled-components'

// For the css and styled imports
declare module 'twin.macro' {
  const css: typeof cssProperty
  const styled: typeof styledComponent
}

// For the css prop
declare module 'react' {
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    css?: CSSProp
  }
}

// For styling on svg elements
interface SVGProps<T> extends SVGAttributes<T> {
  css?: CSSProp
}
