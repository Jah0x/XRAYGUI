import React from 'react';
import { render } from '@testing-library/react';
import DashboardPage from '../DashboardPage';
import { describe, expect, it } from 'vitest';

describe('DashboardPage', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(<DashboardPage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
