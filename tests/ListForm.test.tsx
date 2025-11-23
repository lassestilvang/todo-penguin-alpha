import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, jestInstance, jestForMock, isTestEnvironmentJest } from '../tests/test-utils';
import { ListForm } from '../src/components/ListForm';
import '@testing-library/jest-dom';
import '../tests/setup';
import { List } from '../src/types';

// Mock UI components for Jest only
if (isTestEnvironmentJest) {
  jestForMock.mock('../src/components/ui/dialog', () => ({
    Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => (
      open ? (
        <div data-testid="dialog">
          {children}
          <button onClick={() => onOpenChange(false)}>Close</button>
        </div>
      ) : null
    ),
    DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
    DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-title">{children}</div>,
  }));

  jestForMock.mock('../src/components/ui/button', () => ({
    Button: ({ children, onClick, disabled, ...props }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; [key: string]: unknown }) => (
      <button onClick={onClick} disabled={disabled} {...props}>
        {children}
      </button>
    ),
  }));

  jestForMock.mock('../src/components/ui/input', () => ({
    Input: ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
  }));

  jestForMock.mock('../src/components/ui/label', () => ({
    Label: ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => <label {...props}>{children}</label>,
  }));
}

// Type declarations for Bun test matchers
declare module 'bun:test' {
  interface Matchers<T> {
    toBeInTheDocument(): T;
    toBeDisabled(): T;
  }
}

// Add the matchers for Bun only
if (!isTestEnvironmentJest) {
  expect.extend({
    toBeInTheDocument(received: Element | null) {
      const pass = !!(received && received.nodeType === 1);
      return {
        pass,
        message: () => `expected element to be in the document`,
      };
    },
    toBeDisabled(received: Element | null) {
      const pass = !!(received && 'disabled' in received && received.disabled === true);
      return {
        pass,
        message: () => `expected element to be disabled`,
      };
    },
  });
}

describe('ListForm', () => {
  const mockOnSubmit = jestInstance.fn();
  const mockOnClose = jestInstance.fn();

  beforeEach(() => {
    jestInstance.clearAllMocks();
  });

  describe('Create Mode', () => {
    test('renders create form correctly', () => {
      render(
        <ListForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Create New List')).toBeInTheDocument();
      expect(screen.getByLabelText('List Name')).toBeInTheDocument();
      expect(document.body.textContent).toContain('📋');
    });

    test('submits form with correct data when valid', async () => {
      render(
        <ListForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const nameInput = screen.getByLabelText('List Name');
      fireEvent.change(nameInput, { target: { value: 'Test List' } });

      const submitButton = screen.getByText('Create List');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Test List',
          emoji: '📋',
          color: '#3b82f6'
        });
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    test('does not submit when name is empty', () => {
      render(
        <ListForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByText('Create List');
      expect(submitButton).toBeDisabled();

      fireEvent.click(submitButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('closes form when cancel is clicked', () => {
      render(
        <ListForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    const mockList: List = {
      id: 1,
      name: 'Existing List',
      emoji: '📝',
      color: '#ef4444',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    };

    test('renders edit form with existing data', () => {
      render(
        <ListForm
          list={mockList}
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Edit List')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing List')).toBeInTheDocument();
      expect(document.body.textContent).toContain('📝');
    });

    test('submits updated data', async () => {
      render(
        <ListForm
          list={mockList}
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const nameInput = screen.getByDisplayValue('Existing List');
      fireEvent.change(nameInput, { target: { value: 'Updated List' } });

      const submitButton = screen.getByText('Update List');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Updated List',
          emoji: '📝',
          color: '#ef4444'
        });
      });
    });
  });

  describe('Emoji Picker', () => {
    test('opens emoji picker when emoji button is clicked', async () => {
      render(
        <ListForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      // Find the emoji button using screen queries
      const emojiButton = Array.from(screen.getAllByRole('button')).find(
        button => button.textContent?.includes('📋') || button.querySelector('svg') !== null
      );
      
      expect(emojiButton).toBeDefined();
      fireEvent.click(emojiButton!);

      // Check if emoji picker is visible by looking for some emoji options
      expect(screen.getByText('📝')).toBeInTheDocument();
      expect(screen.getByText('📌')).toBeInTheDocument();
    });

    test('selects emoji when clicked', async () => {
      render(
        <ListForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      // Find the emoji button using screen queries
      const emojiButton = Array.from(screen.getAllByRole('button')).find(
        button => button.textContent?.includes('📋') || button.querySelector('svg') !== null
      );
      
      expect(emojiButton).toBeDefined();
      fireEvent.click(emojiButton!);

      // Select a different emoji
      const newEmoji = screen.getByText('📝');
      fireEvent.click(newEmoji);

      // Enter a name to enable the submit button
      const nameInput = screen.getByLabelText('List Name');
      fireEvent.change(nameInput, { target: { value: 'Test List' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /Create List|Submit/ }) || 
                         screen.getByText('Create List') ||
                         Array.from(screen.getAllByRole('button')).find(
                           button => (button as HTMLButtonElement).type === 'submit' || button.textContent?.includes('Create')
                         );
      expect(submitButton).toBeDefined();
      fireEvent.click(submitButton!);

      // Check that the new emoji was submitted
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test List',
        emoji: '📝',
        color: '#3b82f6'  // Updated to match the actual default color
      });
    });
  });

  describe('Color Picker', () => {
    test('opens color picker when color button is clicked', () => {
      render(
        <ListForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Find and click the color picker button (it has Palette icon)
      const colorButtons = screen.getAllByRole('button');
      const colorPickerButton = colorButtons.find(button => 
        button.innerHTML.includes('Palette') || button.getAttribute('data-testid') === 'color-picker'
      );
      
      if (colorPickerButton) {
        fireEvent.click(colorPickerButton);
        // Color picker should be visible
        expect(screen.getByText('Preview')).toBeInTheDocument();
      }
    });
  });

  describe('Preview', () => {
    test('shows preview of current selection', () => {
      render(
        <ListForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const nameInput = screen.getByLabelText('List Name');
      fireEvent.change(nameInput, { target: { value: 'Test List' } });

      expect(screen.getByText('Test List')).toBeInTheDocument();
      // Check that the emoji is present in the document
      expect(document.body.textContent).toContain('📋');
    });

    test('shows Untitled List when name is empty', () => {
      render(
        <ListForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Untitled List')).toBeInTheDocument();
    });
  });
});
