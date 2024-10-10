import server from '../../backend/mock-server';
import React from 'react';
import AppFunctional from './AppFunctional';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

jest.setTimeout(1000);
const waitForOptions = { timeout: 100 };
const queryOptions = { exact: false };

let up, down, left, right, reset, submit;
let squares, coordinates, steps, message, email;

const updateSelectors = (document) => {
  up = document.querySelector('#up');
  down = document.querySelector('#down');
  left = document.querySelector('#left');
  right = document.querySelector('#right');
  reset = document.querySelector('#reset');
  submit = document.querySelector('#submit');
  squares = document.querySelectorAll('.square');
  coordinates = document.querySelector('#coordinates');
  steps = document.querySelector('#steps');
  message = document.querySelector('#message');
  email = document.querySelector('#email');
};

const testSquares = (activeIdx) => {
  squares.forEach((square, idx) => {
    expect(square.textContent).toBe(idx === activeIdx ? 'B' : '');
    expect(square.className).toContain(idx === activeIdx ? 'active' : '');
  });
};

test('AppFunctional is a functional component', () => {
  expect(AppFunctional.prototype && AppFunctional.prototype.isReactComponent).not.toBeTruthy();
});

describe('AppFunctional', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
  beforeEach(() => {
    render(<AppFunctional />);
    updateSelectors(document);
  });
  afterEach(() => {
    server.resetHandlers();
    document.body.innerHTML = '';
  });

  describe('Active Square', () => {
    test('Initial State Active Square is index 4', () => testSquares(4));
    test('Actions: up -> Active Square index 1', () => {
      fireEvent.click(up);
      testSquares(1);
    });
    test('Actions: up, left -> Active Square index 0', () => {
      fireEvent.click(up);
      fireEvent.click(left);
      testSquares(0);
    });
    test('Actions: right -> Active Square index 5', () => {
      fireEvent.click(right);
      testSquares(5);
    });
    test('Actions: down, left -> Active Square index 6', () => {
      fireEvent.click(down);
      fireEvent.click(left);
      testSquares(6);
    });
  });

  describe('Coordinates Readout', () => {
    test('Initial State Coordinates is (2,2)', () => {
      expect(coordinates.textContent).toMatch(/\(2.*2\)$/);
    });
    test('Actions: up -> Coordinates (2,1)', () => {
      fireEvent.click(up);
      expect(coordinates.textContent).toMatch(/\(2.*1\)$/);
    });
  });

  describe('Limit Reached Message', () => {
    test('Initial State message is empty', () => {
      expect(message.textContent).toBe('');
    });
    test('Actions: up, up -> Message "You can\'t go up"', () => {
      fireEvent.click(up);
      fireEvent.click(up);
      expect(message.textContent).toBe("You can't go up");
    });
  });

  describe('Steps Counter', () => {
    test('Steps counter works correctly', () => {
      fireEvent.click(up);
      fireEvent.click(left);
      expect(steps.textContent).toBe("You moved 2 times");
    });
  });

  describe('Reset Button', () => {
    test('Active Square resets to index 4', () => {
      fireEvent.click(up);
      fireEvent.click(reset);
      testSquares(4);
    });
  });

  describe('Submit Button', () => {
    test('Actions: up, submit email -> Success message is correct', async () => {
      fireEvent.click(up);
      fireEvent.change(email, { target: { value: 'lady@gaga.com' } });
      fireEvent.click(submit);
      await screen.findByText('lady win #31', queryOptions, waitForOptions);
    });
  });
});
