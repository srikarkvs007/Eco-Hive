// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

window.scrollTo = jest.fn();

window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};

class IntersectionObserverMock {
    constructor(callback, options) {
        this.callback = callback;
        this.options = options;
    }
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
}
global.IntersectionObserver = IntersectionObserverMock;
window.IntersectionObserver = IntersectionObserverMock;


jest.mock('react-leaflet', () => {
  const React = require('react');
  return {
    MapContainer: ({ children }) => React.createElement('div', { 'data-testid': 'mock-map-container' }, children),
    TileLayer: () => React.createElement('div', { 'data-testid': 'mock-tile-layer' }),
    Marker: ({ children }) => React.createElement('div', { 'data-testid': 'mock-marker' }, children),
    Popup: ({ children }) => React.createElement('div', { 'data-testid': 'mock-popup' }, children),
    Polyline: () => React.createElement('div', { 'data-testid': 'mock-polyline' }),
    useMap: () => ({
      setView: jest.fn(),
      flyTo: jest.fn(),
      fitBounds: jest.fn(),
    }),
  };
});

jest.mock('leaflet', () => {
  return {
    icon: jest.fn(() => ({})),
    divIcon: jest.fn(() => ({})),
    Icon: {
      Default: {
        prototype: {
          _getIconUrl: jest.fn(),
        },
      },
    },
  };
});

jest.mock('react-router', () => {
  const React = require('react');
  return {
    BrowserRouter: ({ children }) => React.createElement('div', { 'data-testid': 'mock-browser-router' }, children),
    Routes: ({ children }) => React.createElement('div', { 'data-testid': 'mock-routes' }, children),
    Route: ({ element }) => element,
    Navigate: () => null,
    Link: React.forwardRef(({ to, children, ...props }, ref) => React.createElement('a', { href: to, ref, ...props }, children)),
    NavLink: React.forwardRef(({ to, children, ...props }, ref) => React.createElement('a', { href: to, ref, ...props }, children)),
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/', search: '' }),
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams(), jest.fn()],
  };
});



