import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AppFunctional from './AppFunctional';
import axios from 'axios';
jest.mock('axios');

describe('AppFunctional', () => {
  beforeEach(() => {
    render(<AppFunctional />);
  });

  test('renders initial UI correctly', () => {
    expect(screen.getByText(/Coordinates \(2, 2\)/)).toBeInTheDocument();
    expect(screen.getByText(/You moved 0 times/)).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument(); // Initial 'B' at index 4
    expect(screen.getAllByRole('button').length).toBe(5); // Direction buttons + reset button
  });

  test('moves left correctly', () => {
    fireEvent.click(screen.getByText('LEFT'));
    expect(screen.getByText(/Coordinates \(1, 2\)/)).toBeInTheDocument(); // Move from 2,2 to 1,2
    expect(screen.getByText(/You moved 1 times/)).toBeInTheDocument();
  });

  test('moves right correctly', () => {
    fireEvent.click(screen.getByText('RIGHT'));
    expect(screen.getByText(/Coordinates \(3, 2\)/)).toBeInTheDocument(); // Move from 2,2 to 3,2
    expect(screen.getByText(/You moved 1 times/)).toBeInTheDocument();
  });

  test('moves up correctly', () => {
    fireEvent.click(screen.getByText('UP'));
    expect(screen.getByText(/Coordinates \(2, 1\)/)).toBeInTheDocument(); // Move from 2,2 to 2,1
    expect(screen.getByText(/You moved 1 times/)).toBeInTheDocument();
  });

  test('moves down correctly', () => {
    fireEvent.click(screen.getByText('DOWN'));
    expect(screen.getByText(/Coordinates \(2, 3\)/)).toBeInTheDocument(); // Move from 2,2 to 2,3
    expect(screen.getByText(/You moved 1 times/)).toBeInTheDocument();
  });

  test('cannot move left past the grid edge', () => {
    fireEvent.click(screen.getByText('LEFT')); // Move to 1,2
    fireEvent.click(screen.getByText('LEFT')); // Try moving left again
    expect(screen.getByText(/You can't go left/)).toBeInTheDocument();
    expect(screen.getByText(/Coordinates \(1, 2\)/)).toBeInTheDocument();
    expect(screen.getByText(/You moved 1 times/)).toBeInTheDocument(); // Only one move should count
  });

  test('cannot move right past the grid edge', () => {
    fireEvent.click(screen.getByText('RIGHT')); // Move to 3,2
    fireEvent.click(screen.getByText('RIGHT')); // Try moving right again
    expect(screen.getByText(/You can't go right/)).toBeInTheDocument();
    expect(screen.getByText(/Coordinates \(3, 2\)/)).toBeInTheDocument();
    expect(screen.getByText(/You moved 1 times/)).toBeInTheDocument();
  });

  test('cannot move up past the grid edge', () => {
    fireEvent.click(screen.getByText('UP')); // Move to 2,1
    fireEvent.click(screen.getByText('UP')); // Try moving up again
    expect(screen.getByText(/You can't go up/)).toBeInTheDocument();
    expect(screen.getByText(/Coordinates \(2, 1\)/)).toBeInTheDocument();
    expect(screen.getByText(/You moved 1 times/)).toBeInTheDocument();
  });

  test('cannot move down past the grid edge', () => {
    fireEvent.click(screen.getByText('DOWN')); // Move to 2,3
    fireEvent.click(screen.getByText('DOWN')); // Try moving down again
    expect(screen.getByText(/You can't go down/)).toBeInTheDocument();
    expect(screen.getByText(/Coordinates \(2, 3\)/)).toBeInTheDocument();
    expect(screen.getByText(/You moved 1 times/)).toBeInTheDocument();
  });

  test('reset button works correctly', () => {
    fireEvent.click(screen.getByText('RIGHT')); // Move to 3,2
    fireEvent.click(screen.getByText('reset')); // Click reset
    expect(screen.getByText(/Coordinates \(2, 2\)/)).toBeInTheDocument(); // Back to 2,2
    expect(screen.getByText(/You moved 0 times/)).toBeInTheDocument();
  });

  test('email input works correctly', () => {
    const input = screen.getByPlaceholderText('type email');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(input.value).toBe('test@example.com');
  });

  test('submitting the form posts data and sets the correct message', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Success!' } });

    fireEvent.click(screen.getByText('RIGHT')); // Move once
    fireEvent.change(screen.getByPlaceholderText('type email'), { target: { value: 'test@example.com' } });
    
    fireEvent.submit(screen.getByRole('form')); // Submit the form
    expect(axios.post).toHaveBeenCalledWith('http://localhost:9000/api/result', {
      x: 3, y: 2, steps: 1, email: 'test@example.com'
    });
    await screen.findByText('Success!');
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  test('handles submission error and sets the error message', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: 'Error occurred!' } } });

    fireEvent.click(screen.getByText('RIGHT')); // Move once
    fireEvent.change(screen.getByPlaceholderText('type email'), { target: { value: 'test@example.com' } });
    
    fireEvent.submit(screen.getByRole('form')); // Submit the form
    await screen.findByText('Error occurred!');
    expect(screen.getByText('Error occurred!')).toBeInTheDocument();
  });
});
