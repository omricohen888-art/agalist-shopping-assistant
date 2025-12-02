/**
 * Comprehensive test suite for all input methods in ShoppingList component
 * Tests free typing, voice dictation, image OCR, and handwriting recognition
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingList } from '../components/ShoppingList';
import { toast } from 'sonner';

// Mock dependencies
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
      data: { text: 'Test OCR text', confidence: 90 }
    })),
    terminate: vi.fn(() => Promise.resolve()),
    setParameters: vi.fn(() => Promise.resolve()),
  })),
}));

// Mock navigator for voice recognition
Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
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
  })),
});

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: window.webkitSpeechRecognition,
});

// Mock navigator permissions
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

describe('Input Methods Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Free Typing Input', () => {
    it('should accept any user input without blocking or auto-formatting', async () => {
      render(<ShoppingList />);

      // Find notepad input area
      const bulkInputButton = screen.getByText(/Want to paste a long list/i);
      await userEvent.click(bulkInputButton);

      // Find notepad input
      const notepadInputs = screen.getAllByDisplayValue('');
      const firstInput = notepadInputs[0];

      // Test various input types
      const testInputs = [
        'Regular text',
        'Text with numbers 123',
        'Text with symbols @#$%^&*()',
        'Multilingual: English and עברית',
        'Very long text that should not be truncated automatically',
        'Text with    multiple    spaces',
        'Text-with-dashes',
        'Text.with.dots',
      ];

      for (const input of testInputs) {
        await userEvent.clear(firstInput);
        await userEvent.type(firstInput, input);

        // Wait for debounced update
        await waitFor(() => {
          expect(firstInput).toHaveValue(input);
        }, { timeout: 200 });
      }
    });

    it('should handle rapid typing without lag or blocking', async () => {
      render(<ShoppingList />);

      const bulkInputButton = screen.getByText(/Want to paste a long list/i);
      await userEvent.click(bulkInputButton);

      const notepadInputs = screen.getAllByDisplayValue('');
      const firstInput = notepadInputs[0];

      // Simulate rapid typing
      const rapidText = 'This is a rapid typing test that should work smoothly';
      await userEvent.type(firstInput, rapidText);

      // Should accept all input without issues
      await waitFor(() => {
        expect(firstInput).toHaveValue(rapidText);
      });
    });

    it('should enforce reasonable length limits to prevent memory issues', async () => {
      render(<ShoppingList />);

      const bulkInputButton = screen.getByText(/Want to paste a long list/i);
      await userEvent.click(bulkInputButton);

      const notepadInputs = screen.getAllByDisplayValue('');
      const firstInput = notepadInputs[0];

      // Create text longer than 200 characters
      const longText = 'a'.repeat(250);

      await userEvent.type(firstInput, longText);

      // Should be truncated to 200 characters
      await waitFor(() => {
        expect(firstInput).toHaveValue('a'.repeat(200));
      });
    });
  });

  describe('Voice Dictation', () => {
    beforeEach(() => {
      // Mock successful permission check
      (navigator.permissions.query as Mock).mockResolvedValue({ state: 'granted' });
      (navigator.mediaDevices.getUserMedia as Mock).mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      });
    });

    it('should request microphone permission on first use', async () => {
      render(<ShoppingList />);

      const voiceButton = screen.getByTitle(/Voice Dictation/i);
      await userEvent.click(voiceButton);

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    });

    it('should handle denied microphone permissions gracefully', async () => {
      (navigator.mediaDevices.getUserMedia as Mock).mockRejectedValue(new Error('Permission denied'));

      render(<ShoppingList />);

      const voiceButton = screen.getByTitle(/Voice Dictation/i);
      await userEvent.click(voiceButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('microphone')
        );
      });
    });

    it('should process voice transcript with proper punctuation handling', async () => {
      const mockRecognition = new (window.webkitSpeechRecognition as any)();

      render(<ShoppingList />);

      const voiceButton = screen.getByTitle(/Voice Dictation/i);
      await userEvent.click(voiceButton);

      // Simulate recognition result
      act(() => {
        mockRecognition.onstart?.();
        mockRecognition.onresult?.({
          resultIndex: 0,
          results: [{
            0: { transcript: 'milk bread eggs and cheese' },
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

    it('should handle speech recognition errors appropriately', async () => {
      render(<ShoppingList />);

      const voiceButton = screen.getByTitle(/Voice Dictation/i);
      await userEvent.click(voiceButton);

      // Simulate recognition error
      const mockRecognition = new (window.webkitSpeechRecognition as any)();
      act(() => {
        mockRecognition.onerror?.({ error: 'no-speech' });
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('No speech detected')
        );
      });
    });

    it('should timeout after 15 seconds of no activity', async () => {
      vi.useFakeTimers();

      render(<ShoppingList />);

      const voiceButton = screen.getByTitle(/Voice Dictation/i);
      await userEvent.click(voiceButton);

      // Fast-forward 15 seconds
      act(() => {
        vi.advanceTimersByTime(15000);
      });

      expect(toast.warning).toHaveBeenCalledWith(
        expect.stringContaining('stopped automatically')
      );

      vi.useRealTimers();
    });
  });

  describe('Image OCR Input', () => {
    it('should validate image file types and sizes', async () => {
      render(<ShoppingList />);

      const imageInput = screen.getByTestId('camera-input') as HTMLInputElement;

      // Create a mock invalid file
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(imageInput, 'files', {
        value: [invalidFile],
      });

      fireEvent.change(imageInput);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Unsupported file format')
        );
      });
    });

    it('should reject files that are too large', async () => {
      render(<ShoppingList />);

      const imageInput = screen.getByTestId('camera-input') as HTMLInputElement;

      // Create a mock large file (15MB)
      const largeFile = new File(['x'.repeat(15 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(imageInput, 'files', {
        value: [largeFile],
      });

      fireEvent.change(imageInput);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('File too large')
        );
      });
    });

    it('should process valid images and extract text', async () => {
      render(<ShoppingList />);

      const imageInput = screen.getByTestId('camera-input') as HTMLInputElement;

      // Create a mock valid image file
      const validFile = new File(['fake-image-data'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(imageInput, 'files', {
        value: [validFile],
      });

      fireEvent.change(imageInput);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Added')
        );
      });
    });

    it('should handle OCR processing errors gracefully', async () => {
      // Mock OCR failure
      const { createWorker } = await import('tesseract.js');
      (createWorker as Mock).mockResolvedValueOnce({
        loadLanguage: vi.fn(() => Promise.reject(new Error('Network error'))),
        terminate: vi.fn(() => Promise.resolve()),
      });

      render(<ShoppingList />);

      const imageInput = screen.getByTestId('camera-input') as HTMLInputElement;
      const validFile = new File(['fake-image-data'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(imageInput, 'files', {
        value: [validFile],
      });

      fireEvent.change(imageInput);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Network error')
        );
      });
    });
  });

  describe('Handwriting Input', () => {
    it('should validate drawing before submission', async () => {
      render(<ShoppingList />);

      // Open handwriting modal
      const handwritingButton = screen.getByTitle(/Handwriting/i);
      await userEvent.click(handwritingButton);

      // Find submit button and click without drawing
      const submitButton = screen.getByText(/Recognize/i);
      await userEvent.click(submitButton);

      expect(toast.warning).toHaveBeenCalledWith(
        expect.stringContaining('Draw or write something')
      );
    });

    it('should process valid handwriting input', async () => {
      render(<ShoppingList />);

      const handwritingButton = screen.getByTitle(/Handwriting/i);
      await userEvent.click(handwritingButton);

      // Mock canvas with drawing
      const canvas = screen.getByRole('img', { hidden: true }) as HTMLCanvasElement;
      const mockContext = {
        fillRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        closePath: vi.fn(),
        getImageData: vi.fn(() => ({
          data: new Uint8ClampedArray(100),
          width: 10,
          height: 10,
        })),
      };
      vi.spyOn(canvas, 'getContext').mockReturnValue(mockContext as any);
      vi.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/png;base64,test');

      // Simulate drawing by triggering touch events
      fireEvent.touchStart(canvas, { touches: [{ clientX: 50, clientY: 50 }] });
      fireEvent.touchMove(canvas, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchEnd(canvas);

      const submitButton = screen.getByText(/Recognize/i);
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Added')
        );
      });
    });

    it('should handle handwriting OCR failures with fallback suggestions', async () => {
      // Mock OCR failure for handwriting
      const { createWorker } = await import('tesseract.js');
      (createWorker as Mock).mockResolvedValueOnce({
        loadLanguage: vi.fn(() => Promise.resolve()),
        initialize: vi.fn(() => Promise.resolve()),
        recognize: vi.fn(() => Promise.resolve({
          data: { text: '', confidence: 10 }
        })),
        terminate: vi.fn(() => Promise.resolve()),
        setParameters: vi.fn(() => Promise.resolve()),
      });

      render(<ShoppingList />);

      const handwritingButton = screen.getByTitle(/Handwriting/i);
      await userEvent.click(handwritingButton);

      // Mock canvas
      const canvas = screen.getByRole('img', { hidden: true }) as HTMLCanvasElement;
      vi.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/png;base64,test');

      const submitButton = screen.getByText(/Recognize/i);
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.warning).toHaveBeenCalledWith(
          expect.stringContaining('Try voice or image upload')
        );
      });
    });
  });

  describe('Input Method Integration', () => {
    it('should prevent concurrent voice and image processing', async () => {
      render(<ShoppingList />);

      // Start voice recording
      const voiceButton = screen.getByTitle(/Voice Dictation/i);
      await userEvent.click(voiceButton);

      // Try to start image processing while voice is active
      const imageButton = screen.getByTitle(/Scan List/i);
      expect(imageButton).toBeDisabled();

      // Try to start handwriting while voice is active
      const handwritingButton = screen.getByTitle(/Handwriting/i);
      expect(handwritingButton).toBeDisabled();
    });

    it('should handle rapid switching between input methods', async () => {
      render(<ShoppingList />);

      // Open bulk input
      const bulkInputButton = screen.getByText(/Want to paste a long list/i);
      await userEvent.click(bulkInputButton);

      // Type in notepad
      const notepadInputs = screen.getAllByDisplayValue('');
      await userEvent.type(notepadInputs[0], 'Test item');

      // Switch to voice (should not interfere)
      const voiceButton = screen.getByTitle(/Voice Dictation/i);
      await userEvent.click(voiceButton);

      // Voice should start without issues
      expect(toast.info).toHaveBeenCalledWith(
        expect.stringContaining('Listening')
      );
    });

    it('should maintain input state across method switches', async () => {
      render(<ShoppingList />);

      // Add item via typing
      const bulkInputButton = screen.getByText(/Want to paste a long list/i);
      await userEvent.click(bulkInputButton);

      const notepadInputs = screen.getAllByDisplayValue('');
      await userEvent.type(notepadInputs[0], 'Typed item');

      // Switch to different input method and back
      const voiceButton = screen.getByTitle(/Voice Dictation/i);
      await userEvent.click(voiceButton);

      // Close voice modal
      const closeButton = screen.getByLabelText(/close/i);
      await userEvent.click(closeButton);

      // Typed content should still be there
      expect(notepadInputs[0]).toHaveValue('Typed item');
    });
  });
});

