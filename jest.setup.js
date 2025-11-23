require('@testing-library/jest-dom')

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
    ...cssProperties,
  }),
})

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
})

// Mock window.alert
Object.defineProperty(window, 'alert', {
  value: jest.fn(),
})

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  value: jest.fn(() => true),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock canvas
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Array(4) })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
}))

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: jest.fn(() => 'mocked-url'),
})

Object.defineProperty(URL, 'revokeObjectURL', {
  value: jest.fn(),
})

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0))
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id))

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid'),
    getRandomValues: jest.fn(() => new Uint32Array(1)),
  },
})

// Mock CSS properties
const cssProperties = {
  appearance: '',
  background: '',
  backgroundAttachment: '',
  backgroundClip: '',
  backgroundColor: '',
  backgroundImage: '',
  backgroundOrigin: '',
  backgroundPosition: '',
  backgroundPositionX: '',
  backgroundPositionY: '',
  backgroundRepeat: '',
  backgroundRepeatX: '',
  backgroundRepeatY: '',
  backgroundSize: '',
  border: '',
  borderBottom: '',
  borderLeft: '',
  borderRight: '',
  borderTop: '',
  borderCollapse: '',
  borderColor: '',
  borderSpacing: '',
  borderStyle: '',
  borderTopStyle: '',
  borderRightStyle: '',
  borderBottomStyle: '',
  borderLeftStyle: '',
  borderWidth: '',
  borderTopWidth: '',
  borderRightWidth: '',
  borderBottomWidth: '',
  borderLeftWidth: '',
  bottom: '',
  boxShadow: '',
  boxSizing: '',
  captionSide: '',
  clear: '',
  clip: '',
  color: '',
  content: '',
  counterIncrement: '',
  counterReset: '',
  cssFloat: '',
  cssText: '',
  cursor: '',
  direction: '',
  display: '',
  emptyCells: '',
  font: '',
  fontFamily: '',
  fontSize: '',
  fontSizeAdjust: '',
  fontStretch: '',
  fontStyle: '',
  fontVariant: '',
  fontWeight: '',
  height: '',
  left: '',
  letterSpacing: '',
  lineHeight: '',
  listStyle: '',
  listStyleImage: '',
  listStylePosition: '',
  listStyleType: '',
  margin: '',
  marginBottom: '',
  marginLeft: '',
  marginRight: '',
  marginTop: '',
  maxHeight: '',
  maxWidth: '',
  minHeight: '',
  minWidth: '',
  opacity: '',
  outline: '',
  outlineColor: '',
  outlineStyle: '',
  outlineWidth: '',
  overflow: '',
  overflowX: '',
  overflowY: '',
  padding: '',
  paddingBottom: '',
  paddingLeft: '',
  paddingRight: '',
  paddingTop: '',
  pageBreakAfter: '',
  pageBreakBefore: '',
  pageBreakInside: '',
  position: '',
  right: '',
  tableLayout: '',
  textAlign: '',
  textDecoration: '',
  textIndent: '',
  textTransform: '',
  top: '',
  verticalAlign: '',
  visibility: '',
  whiteSpace: '',
  width: '',
  wordSpacing: '',
  zIndex: '',
}
