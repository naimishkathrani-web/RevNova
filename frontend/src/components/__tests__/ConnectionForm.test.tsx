import { render, screen, fireEvent } from '@testing-library/react';
import { ConnectionForm } from '../ConnectionForm';

test('renders connection form', () => {
  render(<ConnectionForm />);
  expect(screen.getByPlaceholderText('Connection Name')).toBeInTheDocument();
});

test('validates required fields', async () => {
  render(<ConnectionForm />);
  fireEvent.click(screen.getByText('Test Connection'));
  expect(screen.getByText(/Please fill all required fields/)).toBeInTheDocument();
});
