import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders without errors', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Code to Blocks' }),
    ).toBeInTheDocument();
  });
});