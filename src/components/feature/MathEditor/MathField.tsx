
import { useEffect, useRef } from 'react';
import type { MathfieldElement } from 'mathlive';
import 'mathlive';

interface MathFieldProps {
  value: string;
  onChange: (latex: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}

const MathField = ({ value, onChange, onBlur, placeholder, className }: MathFieldProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mathfieldRef = useRef<MathfieldElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || mathfieldRef.current) return;

    // Create the math-field element
    const mf = document.createElement('math-field') as MathfieldElement;
    mf.mathVirtualKeyboardPolicy = 'manual';
    
    // Copy initial value and styles
    mf.value = value;
    Object.assign(mf.style, {
      display: 'inline-block',
      minWidth: '60px',
      padding: '4px 8px',
      borderRadius: '6px',
      backgroundColor: '#f0f9ff',
      border: '2px solid #3b82f6',
      fontSize: '18px',
      outline: 'none',
    });

    if (className) {
      mf.className = className;
    }
    if (placeholder) {
      mf.placeholder = placeholder;
    }

    // Add event listeners
    mf.addEventListener('input', () => {
      onChange(mf.value);
    });
    if (onBlur) {
      mf.addEventListener('blur', onBlur);
    }

    // Append to container
    containerRef.current.appendChild(mf);
    mathfieldRef.current = mf;

    // Cleanup
    return () => {
      if (mathfieldRef.current && mathfieldRef.current.parentNode) {
        mathfieldRef.current.parentNode.removeChild(mathfieldRef.current);
        mathfieldRef.current = null;
      }
    };
  }, []); // Only run on mount/unmount

  // Update value when prop changes
  useEffect(() => {
    const mf = mathfieldRef.current;
    if (mf && mf.value !== value) {
      mf.value = value;
    }
  }, [value]);

  // Update event listeners when they change
  useEffect(() => {
    const mf = mathfieldRef.current;
    if (!mf) return;

    // Remove old listeners
    mf.removeEventListener('input', () => {});
    if (onBlur) {
      mf.removeEventListener('blur', () => {});
    }

    // Add new listeners
    mf.addEventListener('input', () => {
      onChange(mf.value);
    });
    if (onBlur) {
      mf.addEventListener('blur', onBlur);
    }
  }, [onChange, onBlur]);

  return (
    <div 
      ref={containerRef}
      style={{ display: 'inline-block' }}
    />
  );
};

export default MathField;
