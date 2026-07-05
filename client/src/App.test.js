import { render, screen } from '@testing-library/react';
import App from './App';

test('renders sign in landing view', () => {
  render(<App />);
  const headingElement = screen.getByRole('heading', { name: 'Sign in' });
  expect(headingElement).toBeInTheDocument();
});
