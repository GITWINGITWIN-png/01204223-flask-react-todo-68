import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from '../App.jsx'

const mockResponse = (body, ok = true) =>
  Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
});

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders correctly', async () => {
    global.fetch.mockImplementationOnce(() =>
      mockResponse([
        { id: 1, title: 'First todo', done: false, comments: [] },
        { id: 2, title: 'Second todo', done: false, comments: [
          { id: 1, message: 'First comment' },
          { id: 2, message: 'Second comment' },
        ] },
      ]),
    );

    render(<App />);

    expect(await screen.findByText('First todo')).toBeInTheDocument();
    expect(await screen.findByText('Second todo')).toBeInTheDocument();
    expect(await screen.findByText('First comment')).toBeInTheDocument();
    expect(await screen.findByText('Second comment')).toBeInTheDocument();
  });
});
