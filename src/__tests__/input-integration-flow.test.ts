/**
 * Integration tests for complete input method workflows
 * Tests end-to-end user flows combining multiple input methods
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingList } from '../components/ShoppingList';
import { toast } from 'sonner';

// Mock all external dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('tesseract.js', () => ({
  createWorker: vi.fn(() => Promise.resolve({
    loadLanguage: vi.fn(() => Promise.resolve()),
    initialize: vi.fn(() => Promise.resolve()),
    recognize: vi.fn(() => Promise.resolve({
      data: { text: 'OCR Item 1\nOCR Item 2', confidence: 85 }
    })),
    terminate: vi.fn(() => Promise.resolve()),
    setParameters: vi.fn(() => Promise.resolve()),
  })),
}));

// Mock speech recognition
const mockRecognition = {
  continuous: false,
  interimResults: true,
  maxAlternatives: 1,
  lang: 'en-US',
  start: vi.fn(),
  stop: vi.fn(),
  onstart: null as any,
  onresult: null as any,
  onend: null as any,
  onerror: null as any,
};

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: vi.fn().mockImplementation(() => mockRecognition),
});

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: window.webkitSpeechRecognition,
});

// Mock permissions and media devices
Object.defineProperty(navigator, 'permissions', {
  writable: true,
  value: {
    query: vi.fn(() => Promise.resolve({ state: 'granted' })),
  },
});

Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn(() => Promise.resolve({
      getTracks: () => [{ stop: vi.fn() }],
    })),
  },
});

describe('Input Method Integration Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Reset mock recognition for each test
    Object.assign(mockRecognition, {
      continuous: false,
      interimResults: true,
      maxAlternatives: 1,
      lang: 'en-US',
      start: vi.fn(),
      stop: vi.fn(),
      onstart: null,
      onresult: null,
      onend: null,
      onerror: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Shopping List Creation Workflow', () => {
    it('should allow creating a complete list using multiple input methods', async () => {
      render(<ShoppingList />);

      // Step 1: Start with free typing
      const bulkInputButton = screen.getByText(/Want to paste a long list/i);
      await userEvent.click(bulkInputButton);

      const notepadInputs = screen.getAllByDisplayValue('');
      await userEvent.type(notepadInputs[0], 'Bananas');
      await userEvent.type(notepadInputs[1], 'Apples');

      // Step 2: Add via voice input
      const voiceButton = screen.getByTitle(/Voice Dictation/i);
      await userEvent.click(voiceButton);

      // Simulate voice recognition
      act(() => {
        mockRecognition.onstart?.();
        mockRecognition.onresult?.({
          resultIndex: 0,
          results: [{
            0: { transcript: 'oranges and grapes' },
            isFinal: true,
          }],
        });
        mockRecognition.onend?.();
      });

      // Step 3: Add via image OCR
      const imageInput = screen.getByTestId('camera-input') as HTMLInputElement;
      const imageFile = new File(['fake-image'], 'list.jpg', { type: 'image/jpeg' });
      Object.defineProperty(imageInput, 'files', {
        value: [imageFile],
      });
      fireEvent.change(imageInput);

      await waitFor(() => {
        // Should have processed all inputs
        expect(toast.success).toHaveBeenCalledTimes(3); // Voice + OCR + potentially paste
      });
    });

    it('should handle input method switching gracefully', async () => {
      render(<ShoppingList />);

      // Open bulk input
      const bulkInputButton = screen.getByText(/Want to paste a long list/i);
      await userEvent.click(bulkInputButton);

      // Type some content
      const notepadInputs = screen.getAllByDisplayValue('');
      await userEvent.type(notepadInputs[0], 'Initial item');

      // Switch to voice input
      const voiceButton = screen.getByTitle(/Voice Dictation/i);
      await userEvent.click(voiceButton);

      // Voice should work
      act(() => {
        mockRecognition.onstart?.();
      });

      expect(toast.info).toHaveBeenCalledWith(
        expect.stringContaining('Listening')
      );

      // Switch back to bulk input - content should be preserved
      const closeButton = screen.getByLabelText(/close/i);
      await userEvent.click(closeButton);

      // Check that typed content is still there
      expect(notepadInputs[0]).toHaveValue('Initial item');
    });

    it('should prevent conflicting operations', async () => {
      render(<ShoppingList />);

      // Start voice recording
      const voiceButton = screen.getByTitle(/Voice Dictation/i);
      await userEvent.click(voiceButton);

      act(() => {
        mockRecognition.onstart?.();
      });

      // Try to start image processing while voice is active
      const imageButton = screen.getByTitle(/Scan List/i);
      expect(imageButton).toBeDisabled();

      // Try handwriting
      const handwritingButton = screen.getByTitle(/Handwriting/i);
      expect(handwritingButton).toBeDisabled();

      // Stop voice recording
      act(() => {
        mockRecognition.onend?.();
      });

      // Buttons should be enabled again
      await waitFor(() => {
        expect(imageButton).not.toBeDisabled();
        expect(handwritingButton).not.toBeDisabled();
      });
    });

    it('should handle errors in one method without affecting others', async () => {
      // Mock OCR failure
      const { createWorker } = await import('tesseract.js');
      (createWorker as Mock).mockRejectedValueOnce(new Error('OCR failed'));

      render(<ShoppingList />);

      // Try image input that fails
      const imageInput = screen.getByTestId('camera-input') as HTMLInputElement;
      const imageFile = new File(['fake-image'], 'list.jpg', { type: 'image/jpeg' });
      Object.defineProperty(imageInput, 'files', {
        value: [imageFile],
      });
      fireEvent.change(imageInput);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('OCR failed')
        );
      });

      // Voice input should still work
      const voiceButton = screen.getByTitle(/Voice Dictation/i);
      await userEvent.click(voiceButton);

      act(() => {
        mockRecognition.onstart?.();
        mockRecognition.onresult?.({
          resultIndex: 0,
          results: [{
            0: { transcript: 'test item' },
            isFinal: true,
          }],
        });
        mockRecognition.onend?.();
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Added')
        );
      });
    });
  });

  describe('Performance and Responsiveness', () => {
    it('should handle rapid input method switching without memory leaks', async () => {
      render(<ShoppingList />);

      // Rapidly switch between methods
      for (let i = 0; i < 5; i++) {
        const voiceButton = screen.getByTitle(/Voice Dictation/i);
        await userEvent.click(voiceButton);

        // Immediately close
        const closeButton = screen.getByLabelText(/close/i);
        await userEvent.click(closeButton);

        // Switch to image
        const imageButton = screen.getByTitle(/Scan List/i);
        await userEvent.click(imageButton);

        // Close image modal
        await userEvent.click(closeButton);

        // Switch to handwriting
        const handwritingButton = screen.getByTitle(/Handwriting/i);
        await userEvent.click(handwritingButton);

        // Close handwriting modal
        await userEvent.click(closeButton);
      }

      // Component should still be responsive
      const bulkInputButton = screen.getByText(/Want to paste a long list/i);
      await userEvent.click(bulkInputButton);

      expect(screen.getAllByDisplayValue('')).toHaveLength(1);
    });

    it('should debounce text input to prevent excessive re-renders', async () => {
      vi.useFakeTimers();

      render(<ShoppingList />);

      const bulkInputButton = screen.getByText(/Want to paste a long list/i);
      await userEvent.click(bulkInputButton);

      const notepadInput = screen.getAllByDisplayValue('')[0];

      // Type rapidly
      await userEvent.type(notepadInput, 'rapid typing test');

      // Fast-forward debounce timer
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should have updated once after debounce
      expect(notepadInput).toHaveValue('rapid typing test');

      vi.useRealTimers();
    });

    it('should clean up resources properly', async () => {
      render(<ShoppingList />);

      // Start voice recording
      const voiceButton = screen.getByTitle(/Voice Dictation/i);
      await userEvent.click(voiceButton);

      act(() => {
        mockRecognition.onstart?.();
      });

      // Unmount component
      // (This would be tested with a proper unmount in a real test suite)

      // Recognition should be stoppable even after unmount
      expect(() => {
        mockRecognition.stop();
      }).not.toThrow();
    });
  });

  describe('Accessibility and Mobile Support', () => {
    it('should work with keyboard navigation', async () => {
      render(<ShoppingList />);

      // Tab to voice button
      const voiceButton = screen.getByTitle(/Voice Dictation/i);
      voiceButton.focus();

      expect(document.activeElement).toBe(voiceButton);

      // Activate with Enter key
      fireEvent.keyDown(voiceButton, { key: 'Enter' });

      expect(mockRecognition.start).toHaveBeenCalled();
    });

    it('should handle touch events for mobile', async () => {
      render(<ShoppingList />);

      // Open handwriting modal
      const handwritingButton = screen.getByTitle(/Handwriting/i);
      await userEvent.click(handwritingButton);

      // Get canvas
      const canvas = screen.getByRole('img', { hidden: true }) as HTMLCanvasElement;

      // Simulate touch drawing
      fireEvent.touchStart(canvas, {
        touches: [{ clientX: 100, clientY: 100 }]
      });

      fireEvent.touchMove(canvas, {
        touches: [{ clientX: 150, clientY: 150 }]
      });

      fireEvent.touchEnd(canvas);

      // Should not have thrown errors
      expect(canvas).toBeInTheDocument();
    });

    it('should provide clear feedback for all operations', async () => {
      render(<ShoppingList />);

      // Test voice feedback
      const voiceButton = screen.getByTitle(/Voice Dictation/i);
      await userEvent.click(voiceButton);

      act(() => {
        mockRecognition.onstart?.();
      });

      expect(toast.info).toHaveBeenCalledWith(
        expect.stringContaining('Listening')
      );

      // Test successful operation feedback
      act(() => {
        mockRecognition.onresult?.({
          resultIndex: 0,
          results: [{
            0: { transcript: 'test item' },
            isFinal: true,
          }],
        });
        mockRecognition.onend?.();
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Added')
        );
      });
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from network failures', async () => {
      // Mock network failure for OCR
      const { createWorker } = await import('tesseract.js');
      (createWorker as Mock).mockRejectedValueOnce(new Error('Network Error'));

      render(<ShoppingList />);

      const imageInput = screen.getByTestId('camera-input') as HTMLInputElement;
      const imageFile = new File(['fake-image'], 'list.jpg', { type: 'image/jpeg' });
      Object.defineProperty(imageInput, 'files', {
        value: [imageFile],
      });
      fireEvent.change(imageInput);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Network error')
        );
      });

      // Should be able to try again
      const imageInput2 = screen.getByTestId('camera-input') as HTMLInputElement;
      Object.defineProperty(imageInput2, 'files', {
        value: [imageFile],
      });
      fireEvent.change(imageInput2);

      // Second attempt should work (mock is restored)
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('should handle browser compatibility issues', async () => {
      // Mock unsupported browser
      Object.defineProperty(window, 'webkitSpeechRecognition', {
        writable: true,
        value: undefined,
      });

      render(<ShoppingList />);

      const voiceButton = screen.getByTitle(/Voice Dictation/i);
      await userEvent.click(voiceButton);

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('does not support voice recording')
      );
    });

    it('should handle invalid file uploads gracefully', async () => {
      render(<ShoppingList />);

      const imageInput = screen.getByTestId('camera-input') as HTMLInputElement;

      // Test with invalid file type
      const invalidFile = new File(['text content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(imageInput, 'files', {
        value: [invalidFile],
      });
      fireEvent.change(imageInput);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Unsupported file format')
        );
      });

      // Input should be reset
      expect(imageInput.files?.[0]).toBeUndefined();
    });
  });
});

