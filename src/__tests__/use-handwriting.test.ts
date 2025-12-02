/**
 * Unit tests for the useHandwriting hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHandwriting } from '../hooks/use-handwriting';

describe('useHandwriting Hook', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    // Mock canvas and context
    mockContext = {
      scale: vi.fn(),
      fillStyle: '',
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      closePath: vi.fn(),
      strokeStyle: '#1a1a1a',
      lineWidth: 3,
      lineCap: 'round',
      lineJoin: 'round',
      globalCompositeOperation: 'source-over',
    } as any;

    mockCanvas = {
      width: 400,
      height: 300,
      getContext: vi.fn(() => mockContext),
      getBoundingClientRect: vi.fn(() => ({
        width: 400,
        height: 300,
        left: 0,
        top: 0,
      })),
      toDataURL: vi.fn(() => 'data:image/png;base64,test'),
    } as any;

    // Mock getBoundingClientRect on HTMLElement prototype
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      writable: true,
      value: vi.fn(() => ({
        width: 400,
        height: 300,
        left: 0,
        top: 0,
      })),
    });

    // Mock window.devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      value: 2,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize canvas with correct dimensions', () => {
    const { result } = renderHook(() => useHandwriting());

    // Mock the ref
    act(() => {
      (result.current.canvasRef as any).current = mockCanvas;
      result.current.initializeCanvas();
    });

    expect(mockCanvas.width).toBe(800); // 400 * 2 (devicePixelRatio)
    expect(mockCanvas.height).toBe(600); // 300 * 2 (devicePixelRatio)
    expect(mockContext.scale).toHaveBeenCalledWith(2, 2);
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 400, 300);
  });

  it('should handle drawing start correctly', () => {
    const { result } = renderHook(() => useHandwriting());

    act(() => {
      (result.current.canvasRef as any).current = mockCanvas;
    });

    const mockEvent = {
      preventDefault: vi.fn(),
      touches: [{ clientX: 50, clientY: 100 }],
    };

    act(() => {
      result.current.startDrawing(mockEvent as any);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.moveTo).toHaveBeenCalledWith(50, 100);
  });

  it('should handle drawing moves correctly', () => {
    const { result } = renderHook(() => useHandwriting());

    act(() => {
      (result.current.canvasRef as any).current = mockCanvas;
      // Start drawing first
      result.current.startDrawing({
        preventDefault: vi.fn(),
        touches: [{ clientX: 50, clientY: 100 }],
      } as any);
    });

    const mockEvent = {
      preventDefault: vi.fn(),
      touches: [{ clientX: 150, clientY: 200 }],
    };

    act(() => {
      result.current.draw(mockEvent as any);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockContext.lineTo).toHaveBeenCalledWith(150, 200);
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('should stop drawing correctly', () => {
    const { result } = renderHook(() => useHandwriting());

    act(() => {
      result.current.stopDrawing();
    });

    expect(mockContext.closePath).toHaveBeenCalled();
  });

  it('should clear canvas correctly', () => {
    const { result } = renderHook(() => useHandwriting());

    act(() => {
      (result.current.canvasRef as any).current = mockCanvas;
      result.current.clearCanvas();
    });

    expect(mockContext.fillStyle).toBe('#ffffff');
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 400, 300);
  });

  it('should generate canvas image data URL', () => {
    const { result } = renderHook(() => useHandwriting());

    act(() => {
      (result.current.canvasRef as any).current = mockCanvas;
    });

    const imageData = result.current.getCanvasImage();
    expect(imageData).toBe('data:image/png;base64,test');
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
  });

  it('should handle mouse events correctly', () => {
    const { result } = renderHook(() => useHandwriting());

    act(() => {
      (result.current.canvasRef as any).current = mockCanvas;
    });

    const mouseEvent = {
      preventDefault: vi.fn(),
      clientX: 75,
      clientY: 125,
    };

    act(() => {
      result.current.startDrawing(mouseEvent as any);
    });

    expect(mockContext.moveTo).toHaveBeenCalledWith(75, 125);
  });

  it('should handle touch events correctly', () => {
    const { result } = renderHook(() => useHandwriting());

    act(() => {
      (result.current.canvasRef as any).current = mockCanvas;
    });

    const touchEvent = {
      preventDefault: vi.fn(),
      touches: [{ clientX: 100, clientY: 150 }],
    };

    act(() => {
      result.current.startDrawing(touchEvent as any);
    });

    expect(mockContext.moveTo).toHaveBeenCalledWith(100, 150);
  });

  it('should not draw when not in drawing state', () => {
    const { result } = renderHook(() => useHandwriting());

    act(() => {
      (result.current.canvasRef as any).current = mockCanvas;
    });

    const mockEvent = {
      preventDefault: vi.fn(),
      touches: [{ clientX: 200, clientY: 250 }],
    };

    // Try to draw without starting
    act(() => {
      result.current.draw(mockEvent as any);
    });

    expect(mockContext.lineTo).not.toHaveBeenCalled();
  });

  it('should handle missing canvas gracefully', () => {
    const { result } = renderHook(() => useHandwriting());

    // Don't set canvas ref
    expect(() => {
      act(() => {
        result.current.initializeCanvas();
        result.current.startDrawing({} as any);
        result.current.draw({} as any);
        result.current.clearCanvas();
        result.current.getCanvasImage();
      });
    }).not.toThrow();
  });
});

