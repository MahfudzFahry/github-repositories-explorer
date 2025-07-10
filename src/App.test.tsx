import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import axios from 'axios';
import { vi } from 'vitest';

vi.mock('axios');
const mockedAxios = axios as unknown as { get: vi.Mock };

describe('App', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  it('renders search input and button', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Enter username/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  it('fetches and displays users', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        items: [
          { login: 'user1', id: 1 },
          { login: 'user2', id: 2 }
        ]
      }
    });

    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/Enter username/i), {
      target: { value: 'test' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });
  });

  it('fetches and displays repositories when user clicked', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: { items: [{ login: 'user1', id: 1 }] }
      })
      .mockResolvedValueOnce({
        data: [
          { id: 1, name: 'repo1', description: 'desc1', stargazers_count: 5 }
        ]
      });

    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/Enter username/i), {
      target: { value: 'test' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('user1'));

    await waitFor(() => {
      expect(screen.getByText('repo1')).toBeInTheDocument();
      expect(screen.getByText('desc1')).toBeInTheDocument();
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });
  });
});
