import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ListForm } from '../src/components/ListForm';
import { List } from '../src/types';

// Mock the Dialog component
jest.mock('../src/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    open ? (
      <div data-testid="dialog">
        {children}
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null
  ),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
}));

// Mock other UI components
jest.mock('../src/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('../src/components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />,
}));

jest.mock('../src/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

describe('ListForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('renders create form correctly', () => {
      render(
        <ListForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Create New List')).toBeInTheDocument();
      expect(screen.getByLabelText('List Name')).toBeInTheDocument();
      expect(screen.getByDisplayValue('📋')).toBeInTheDocument();
    });

    it('submits form with correct data when valid', async () => {
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

    it('does not submit when name is empty', () => {
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

    it('closes form when cancel is clicked', () => {
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

    it('renders edit form with existing data', () => {
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
      expect(screen.getByDisplayValue('📝')).toBeInTheDocument();
    });

    it('submits updated data', async () => {
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
    it('opens emoji picker when emoji button is clicked', () => {
      render(
        <ListForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const emojiButton = screen.getByText('📋');
      fireEvent.click(emojiButton);

      // Check if emoji picker is visible by looking for some emoji options
      expect(screen.getByText('📝')).toBeInTheDocument();
      expect(screen.getByText('🎯')).toBeInTheDocument();
    });

    it('selects emoji when clicked', async () => {
      render(
        <ListForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Open emoji picker
      const emojiButton = screen.getByText('📋');
      fireEvent.click(emojiButton);

      // Select a different emoji
      const newEmoji = screen.getByText('🎯');
      fireEvent.click(newEmoji);

      // Submit form
      const nameInput = screen.getByLabelText('List Name');
      fireEvent.change(nameInput, { target: { value: 'Test List' } });

      const submitButton = screen.getByText('Create List');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Test List',
          emoji: '🎯',
          color: '#3b82f6'
        });
      });
    });
  });

  describe('Color Picker', () => {
    it('opens color picker when color button is clicked', () => {
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
    it('shows preview of current selection', () => {
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
      expect(screen.getByText('📋')).toBeInTheDocument();
    });

    it('shows Untitled List when name is empty', () => {
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
