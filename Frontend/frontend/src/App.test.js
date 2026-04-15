import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Login/i);
  expect(titleElement).toBeInTheDocument();
});
