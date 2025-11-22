import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Sidebar } from '../src/components/Sidebar';
import { List, Label, ViewType } from '../src/types';
import * as ClientServices from '../src/lib/client-services';

// Mock the client services
jest.mock('../src/lib/client-services');
const mockClientServices = ClientServices as jest.Mocked<typeof ClientServices>;

// Mock the form components
jest.mock('../src/components/ListForm', () => ({
  ListForm: ({ list, isOpen, onClose, onSubmit }: any) => (
    isOpen ? (
      <div data-testid="list-form">
        <div>{list ? 'Edit List' : 'Create List'}</div>
        <button onClick={() => onSubmit({ name: 'Test List', emoji: '📋', color: '#3b82f6' })}>
          Submit
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null
  ),
}));

jest.mock('../src/components/LabelForm', () => ({
  LabelForm: ({ label, isOpen, onClose, onSubmit }: any) => (
    isOpen ? (
      <div data-testid="label-form">
        <div>{label ? 'Edit Label' : 'Create Label'}</div>
        <button onClick={() => onSubmit({ name: 'Test Label', icon: '🏷️', color: '#ef4444' })}>
          Submit
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null
  ),
}));

// Mock other UI components
jest.mock('../src/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('../src/components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />,
}));

jest.mock('../src/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

describe('Sidebar List and Label Management', () => {
  const mockOnViewChange = jest.fn();
  const mockOnListSelect = jest.fn();

  const mockLists: List[] = [
    { id: 1, name: 'Work', emoji: '💼', color: '#3b82f6', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 2, name: 'Personal', emoji: '🏠', color: '#10b981', created_at: '2024-01-01', updated_at: '2024-01-01' },
  ];

  const mockLabels: Label[] = [
    { id: 1, name: 'Urgent', icon: '🔥', color: '#ef4444', created_at: '2024-01-01' },
    { id: 2, name: 'Important', icon: '⭐', color: '#f59e0b', created_at: '2024-01-01' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockClientServices.ClientListService.getLists.mockResolvedValue(mockLists);
    mockClientServices.ClientLabelService.getLabels.mockResolvedValue(mockLabels);
    mockClientServices.ClientTaskService.getTasks.mockResolvedValue([]);
    
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  describe('List Management', () => {
    it('displays lists correctly', async () => {
      render(
        <Sidebar
          currentView="all"
          onViewChange={mockOnViewChange}
          onListSelect={mockOnListSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Work')).toBeInTheDocument();
        expect(screen.getByText('Personal')).toBeInTheDocument();
        expect(screen.getByText('💼')).toBeInTheDocument();
        expect(screen.getByText('🏠')).toBeInTheDocument();
      });
    });

    it('shows create list form when plus button is clicked', async () => {
      render(
        <Sidebar
          currentView="all"
          onViewChange={mockOnViewChange}
          onListSelect={mockOnListSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Work')).toBeInTheDocument();
      });

      // Find and click the create list button (in the Lists section header)
      const plusButtons = screen.getAllByText('+');
      const listsPlusButton = plusButtons.find(button => 
        button.closest('div')?.querySelector('h2')?.textContent === 'Lists'
      );
      
      if (listsPlusButton) {
        fireEvent.click(listsPlusButton);

        expect(screen.getByTestId('list-form')).toBeInTheDocument();
        expect(screen.getByText('Create List')).toBeInTheDocument();
      }
    });

    it('shows edit list form when edit button is clicked', async () => {
      render(
        <Sidebar
          currentView="all"
          onViewChange={mockOnViewChange}
          onListSelect={mockOnListSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Work')).toBeInTheDocument();
      });

      // Hover over the first list to show edit buttons
      const workItem = screen.getByText('Work').closest('div');
      if (workItem) {
        fireEvent.mouseEnter(workItem);

        await waitFor(() => {
          const editButtons = screen.getAllByText('Edit');
          expect(editButtons.length).toBeGreaterThan(0);
        });

        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);

        expect(screen.getByTestId('list-form')).toBeInTheDocument();
        expect(screen.getByText('Edit List')).toBeInTheDocument();
      }
    });

    it('creates a new list when form is submitted', async () => {
      mockClientServices.ClientListService.createList.mockResolvedValue(mockLists[0]);

      render(
        <Sidebar
          currentView="all"
          onViewChange={mockOnViewChange}
          onListSelect={mockOnListSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Work')).toBeInTheDocument();
      });

      // Open create form
      const plusButtons = screen.getAllByText('+');
      const listsPlusButton = plusButtons.find(button => 
        button.closest('div')?.querySelector('h2')?.textContent === 'Lists'
      );
      
      if (listsPlusButton) {
        fireEvent.click(listsPlusButton);

        // Submit the form
        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockClientServices.ClientListService.createList).toHaveBeenCalledWith({
            name: 'Test List',
            emoji: '📋',
            color: '#3b82f6'
          });
        });
      }
    });

    it('updates a list when edit form is submitted', async () => {
      mockClientServices.ClientListService.updateList.mockResolvedValue(mockLists[0]);

      render(
        <Sidebar
          currentView="all"
          onViewChange={mockOnViewChange}
          onListSelect={mockOnListSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Work')).toBeInTheDocument();
      });

      // Open edit form
      const workItem = screen.getByText('Work').closest('div');
      if (workItem) {
        fireEvent.mouseEnter(workItem);

        await waitFor(() => {
          const editButtons = screen.getAllByText('Edit');
          expect(editButtons.length).toBeGreaterThan(0);
        });

        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);

        // Submit the form
        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockClientServices.ClientListService.updateList).toHaveBeenCalledWith(1, {
            name: 'Test List',
            emoji: '📋',
            color: '#3b82f6'
          });
        });
      }
    });

    it('deletes a list when delete button is clicked', async () => {
      mockClientServices.ClientListService.deleteList.mockResolvedValue(true);

      render(
        <Sidebar
          currentView="all"
          onViewChange={mockOnViewChange}
          onListSelect={mockOnListSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Work')).toBeInTheDocument();
      });

      // Hover over the first list to show delete buttons
      const workItem = screen.getByText('Work').closest('div');
      if (workItem) {
        fireEvent.mouseEnter(workItem);

        await waitFor(() => {
          const deleteButtons = screen.getAllByText('Delete');
          expect(deleteButtons.length).toBeGreaterThan(0);
        });

        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);

        expect(window.confirm).toHaveBeenCalledWith(
          'Are you sure you want to delete this list? Tasks in this list will not be deleted.'
        );

        await waitFor(() => {
          expect(mockClientServices.ClientListService.deleteList).toHaveBeenCalledWith(1);
        });
      }
    });

    it('reloads data after list operations', async () => {
      render(
        <Sidebar
          currentView="all"
          onViewChange={mockOnViewChange}
          onListSelect={mockOnListSelect}
        />
      );

      await waitFor(() => {
        expect(mockClientServices.ClientListService.getLists).toHaveBeenCalledTimes(1);
        expect(mockClientServices.ClientLabelService.getLabels).toHaveBeenCalledTimes(1);
      });

      // Create a list
      mockClientServices.ClientListService.createList.mockResolvedValue(mockLists[0]);
      
      const plusButtons = screen.getAllByText('+');
      const listsPlusButton = plusButtons.find(button => 
        button.closest('div')?.querySelector('h2')?.textContent === 'Lists'
      );
      
      if (listsPlusButton) {
        fireEvent.click(listsPlusButton);
        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockClientServices.ClientListService.getLists).toHaveBeenCalledTimes(2);
          expect(mockClientServices.ClientLabelService.getLabels).toHaveBeenCalledTimes(2);
        });
      }
    });
  });

  describe('Label Management', () => {
    it('displays labels correctly', async () => {
      render(
        <Sidebar
          currentView="all"
          onViewChange={mockOnViewChange}
          onListSelect={mockOnListSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Urgent')).toBeInTheDocument();
        expect(screen.getByText('Important')).toBeInTheDocument();
        expect(screen.getByText('🔥')).toBeInTheDocument();
        expect(screen.getByText('⭐')).toBeInTheDocument();
      });
    });

    it('shows create label form when plus button is clicked', async () => {
      render(
        <Sidebar
          currentView="all"
          onViewChange={mockOnViewChange}
          onListSelect={mockOnListSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Urgent')).toBeInTheDocument();
      });

      // Find and click the create label button (in the Labels section header)
      const plusButtons = screen.getAllByText('+');
      const labelsPlusButton = plusButtons.find(button => 
        button.closest('div')?.querySelector('h2')?.textContent === 'Labels'
      );
      
      if (labelsPlusButton) {
        fireEvent.click(labelsPlusButton);

        expect(screen.getByTestId('label-form')).toBeInTheDocument();
        expect(screen.getByText('Create Label')).toBeInTheDocument();
      }
    });

    it('creates a new label when form is submitted', async () => {
      mockClientServices.ClientLabelService.createLabel.mockResolvedValue(mockLabels[0]);

      render(
        <Sidebar
          currentView="all"
          onViewChange={mockOnViewChange}
          onListSelect={mockOnListSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Urgent')).toBeInTheDocument();
      });

      // Open create form
      const plusButtons = screen.getAllByText('+');
      const labelsPlusButton = plusButtons.find(button => 
        button.closest('div')?.querySelector('h2')?.textContent === 'Labels'
      );
      
      if (labelsPlusButton) {
        fireEvent.click(labelsPlusButton);

        // Submit the form
        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockClientServices.ClientLabelService.createLabel).toHaveBeenCalledWith({
            name: 'Test Label',
            icon: '🏷️',
            color: '#ef4444'
          });
        });
      }
    });

    it('deletes a label when delete button is clicked', async () => {
      mockClientServices.ClientLabelService.deleteLabel.mockResolvedValue(true);

      render(
        <Sidebar
          currentView="all"
          onViewChange={mockOnViewChange}
          onListSelect={mockOnListSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Urgent')).toBeInTheDocument();
      });

      // Hover over the first label to show delete buttons
      const urgentItem = screen.getByText('Urgent').closest('div');
      if (urgentItem) {
        fireEvent.mouseEnter(urgentItem);

        await waitFor(() => {
          const deleteButtons = screen.getAllByText('Delete');
          expect(deleteButtons.length).toBeGreaterThan(0);
        });

        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);

        expect(window.confirm).toHaveBeenCalledWith(
          'Are you sure you want to delete this label? It will be removed from all tasks.'
        );

        await waitFor(() => {
          expect(mockClientServices.ClientLabelService.deleteLabel).toHaveBeenCalledWith(1);
        });
      }
    });
  });

  describe('Section Toggle', () => {
    it('toggles lists section when chevron is clicked', async () => {
      render(
        <Sidebar
          currentView="all"
          onViewChange={mockOnViewChange}
          onListSelect={mockOnListSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Work')).toBeInTheDocument();
      });

      // Find the chevron button for lists section
      const listsSection = screen.getByText('Lists').closest('div');
      const chevronButton = listsSection?.querySelector('button:last-child');
      
      if (chevronButton) {
        fireEvent.click(chevronButton);

        // Lists should be hidden
        expect(screen.queryByText('Work')).not.toBeInTheDocument();
      }
    });

    it('toggles labels section when chevron is clicked', async () => {
      render(
        <Sidebar
          currentView="all"
          onViewChange={mockOnViewChange}
          onListSelect={mockOnListSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Urgent')).toBeInTheDocument();
      });

      // Find the chevron button for labels section
      const labelsSection = screen.getByText('Labels').closest('div');
      const chevronButton = labelsSection?.querySelector('button:last-child');
      
      if (chevronButton) {
        fireEvent.click(chevronButton);

        // Labels should be hidden
        expect(screen.queryByText('Urgent')).not.toBeInTheDocument();
      }
    });
  });

  describe('Error Handling', () => {
    it('handles list creation errors gracefully', async () => {
      mockClientServices.ClientListService.createList.mockRejectedValue(new Error('Creation failed'));

      render(
        <Sidebar
          currentView="all"
          onViewChange={mockOnViewChange}
          onListSelect={mockOnListSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Work')).toBeInTheDocument();
      });

      // Try to create a list
      const plusButtons = screen.getAllByText('+');
      const listsPlusButton = plusButtons.find(button => 
        button.closest('div')?.querySelector('h2')?.textContent === 'Lists'
      );
      
      if (listsPlusButton) {
        fireEvent.click(listsPlusButton);
        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        // Should not throw and should still try to reload data
        await waitFor(() => {
          expect(mockClientServices.ClientListService.getLists).toHaveBeenCalledTimes(2);
        });
      }
    });

    it('handles label deletion errors gracefully', async () => {
      mockClientServices.ClientLabelService.deleteLabel.mockRejectedValue(new Error('Deletion failed'));

      render(
        <Sidebar
          currentView="all"
          onViewChange={mockOnViewChange}
          onListSelect={mockOnListSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Urgent')).toBeInTheDocument();
      });

      // Try to delete a label
      const urgentItem = screen.getByText('Urgent').closest('div');
      if (urgentItem) {
        fireEvent.mouseEnter(urgentItem);

        await waitFor(() => {
          const deleteButtons = screen.getAllByText('Delete');
          expect(deleteButtons.length).toBeGreaterThan(0);
        });

        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);

        // Should not throw and should still try to reload data
        await waitFor(() => {
          expect(mockClientServices.ClientLabelService.getLabels).toHaveBeenCalledTimes(2);
        });
      }
    });
  });
});
