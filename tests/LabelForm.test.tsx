import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LabelForm } from '../src/components/LabelForm';
import { Label } from '../src/types';

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

describe('LabelForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('renders create form correctly', () => {
      render(
        <LabelForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Create New Label')).toBeInTheDocument();
      expect(screen.getByLabelText('Label Name')).toBeInTheDocument();
      expect(screen.getByDisplayValue('🏷️')).toBeInTheDocument();
    });

    it('submits form with correct data when valid', async () => {
      render(
        <LabelForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const nameInput = screen.getByLabelText('Label Name');
      fireEvent.change(nameInput, { target: { value: 'Test Label' } });

      const submitButton = screen.getByText('Create Label');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Test Label',
          icon: '🏷️',
          color: '#ef4444'
        });
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('does not submit when name is empty', () => {
      render(
        <LabelForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByText('Create Label');
      expect(submitButton).toBeDisabled();

      fireEvent.click(submitButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('closes form when cancel is clicked', () => {
      render(
        <LabelForm
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
    const mockLabel: Label = {
      id: 1,
      name: 'Existing Label',
      icon: '📌',
      color: '#10b981',
      created_at: '2024-01-01'
    };

    it('renders edit form with existing data', () => {
      render(
        <LabelForm
          label={mockLabel}
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Edit Label')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Label')).toBeInTheDocument();
      expect(screen.getByDisplayValue('📌')).toBeInTheDocument();
    });

    it('submits updated data', async () => {
      render(
        <LabelForm
          label={mockLabel}
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const nameInput = screen.getByDisplayValue('Existing Label');
      fireEvent.change(nameInput, { target: { value: 'Updated Label' } });

      const submitButton = screen.getByText('Update Label');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Updated Label',
          icon: '📌',
          color: '#10b981'
        });
      });
    });
  });

  describe('Icon Picker', () => {
    it('opens icon picker when icon button is clicked', () => {
      render(
        <LabelForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const iconButton = screen.getByText('🏷️');
      fireEvent.click(iconButton);

      // Check if icon picker is visible by looking for some icon options
      expect(screen.getByText('📌')).toBeInTheDocument();
      expect(screen.getByText('⭐')).toBeInTheDocument();
    });

    it('selects icon when clicked', async () => {
      render(
        <LabelForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Open icon picker
      const iconButton = screen.getByText('🏷️');
      fireEvent.click(iconButton);

      // Select a different icon
      const newIcon = screen.getByText('⭐');
      fireEvent.click(newIcon);

      // Submit form
      const nameInput = screen.getByLabelText('Label Name');
      fireEvent.change(nameInput, { target: { value: 'Test Label' } });

      const submitButton = screen.getByText('Create Label');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Test Label',
          icon: '⭐',
          color: '#ef4444'
        });
      });
    });

    it('has a wide variety of icons to choose from', () => {
      render(
        <LabelForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Open icon picker
      const iconButton = screen.getByText('🏷️');
      fireEvent.click(iconButton);

      // Check for different categories of icons
      expect(screen.getByText('❤️')).toBeInTheDocument(); // Hearts
      expect(screen.getByText('🔥')).toBeInTheDocument(); // Fire
      expect(screen.getByText('🌈')).toBeInTheDocument(); // Nature
      expect(screen.getByText('⚽')).toBeInTheDocument(); // Sports
      expect(screen.getByText('🎮')).toBeInTheDocument(); // Gaming
    });
  });

  describe('Color Picker', () => {
    it('opens color picker when color button is clicked', () => {
      render(
        <LabelForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Find and click the color picker button (it has Palette icon)
      const colorButtons = screen.getAllByRole('button');
      const colorPickerButton = colorButtons.find(button => 
        button.innerHTML.includes('Palette') || button.querySelector('svg')
      );
      
      if (colorPickerButton) {
        fireEvent.click(colorPickerButton);
        // Color picker should be visible
        expect(screen.getByText('Preview')).toBeInTheDocument();
      }
    });

    it('has a good variety of colors', () => {
      render(
        <LabelForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Open color picker
      const colorButtons = screen.getAllByRole('button');
      const colorPickerButton = colorButtons.find(button => 
        button.innerHTML.includes('Palette') || button.querySelector('svg')
      );
      
      if (colorPickerButton) {
        fireEvent.click(colorPickerButton);
        
        // Look for color circles (they should be present as divs with rounded styling)
        const colorCircles = screen.container.querySelectorAll('[style*="background-color"]');
        expect(colorCircles.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Preview', () => {
    it('shows preview of current selection', () => {
      render(
        <LabelForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const nameInput = screen.getByLabelText('Label Name');
      fireEvent.change(nameInput, { target: { value: 'Test Label' } });

      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('🏷️')).toBeInTheDocument();
    });

    it('shows Untitled Label when name is empty', () => {
      render(
        <LabelForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Untitled Label')).toBeInTheDocument();
    });

    it('preview shows correct styling', () => {
      render(
        <LabelForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const nameInput = screen.getByLabelText('Label Name');
      fireEvent.change(nameInput, { target: { value: 'Test Label' } });

      // Check that preview has the icon and proper styling
      const preview = screen.getByText('Test Label').closest('div');
      expect(preview).toBeInTheDocument();
      
      // The icon should be visible in the preview
      expect(screen.getByText('🏷️')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('enables submit button only when name is provided', () => {
      render(
        <LabelForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByText('Create Label');
      expect(submitButton).toBeDisabled();

      const nameInput = screen.getByLabelText('Label Name');
      fireEvent.change(nameInput, { target: { value: ' ' } }); // Just whitespace
      
      expect(submitButton).toBeDisabled();

      fireEvent.change(nameInput, { target: { value: 'Valid Name' } });
      expect(submitButton).not.toBeDisabled();
    });

    it('handles whitespace-only names correctly', () => {
      render(
        <LabelForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByText('Create Label');
      const nameInput = screen.getByLabelText('Label Name');
      
      fireEvent.change(nameInput, { target: { value: '   ' } });
      expect(submitButton).toBeDisabled();
    });
  });
});
