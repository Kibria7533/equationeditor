
import { useState, useRef, useCallback, useEffect } from 'react';
import MathField from './MathField';
import MathSymbolPicker from './MathSymbolPicker';
import 'mathlive';

// Content block types
interface TextBlock {
  type: 'text';
  id: string;
  content: string;
}

interface MathBlock {
  type: 'math';
  id: string;
  latex: string;
}

type ContentBlock = TextBlock | MathBlock;

// Storage format with markers
const MATH_START_MARKER = '[[MATH]]';
const MATH_END_MARKER = '[[/MATH]]';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Parse stored string back to blocks
const parseStoredContent = (stored: string): ContentBlock[] => {
  if (!stored) return [{ type: 'text', id: generateId(), content: '' }];

  const blocks: ContentBlock[] = [];
  let remaining = stored;

  while (remaining.length > 0) {
    const mathStart = remaining.indexOf(MATH_START_MARKER);

    if (mathStart === -1) {
      // No more math blocks, rest is text
      if (remaining.length > 0) {
        blocks.push({ type: 'text', id: generateId(), content: remaining });
      }
      break;
    }

    // Add text before math block (even if empty to allow editing at start)
    blocks.push({ type: 'text', id: generateId(), content: remaining.substring(0, mathStart) });

    // Find end of math block
    const mathEnd = remaining.indexOf(MATH_END_MARKER, mathStart);
    if (mathEnd === -1) {
      // Malformed, treat rest as text
      blocks.push({ type: 'text', id: generateId(), content: remaining.substring(mathStart) });
      break;
    }

    // Extract latex content
    const latex = remaining.substring(mathStart + MATH_START_MARKER.length, mathEnd);
    blocks.push({ type: 'math', id: generateId(), latex });

    remaining = remaining.substring(mathEnd + MATH_END_MARKER.length);
  }

  // Ensure there's always a text block at the end
  if (blocks.length === 0 || blocks[blocks.length - 1].type === 'math') {
    blocks.push({ type: 'text', id: generateId(), content: '' });
  }

  return blocks;
};

// Convert blocks to storage string
const blocksToStorageString = (blocks: ContentBlock[]): string => {
  // Filter out empty text blocks at the beginning and end, but keep them in the middle
  let filteredBlocks = [...blocks];

  // Remove leading empty text blocks
  while (filteredBlocks.length > 0 &&
         filteredBlocks[0].type === 'text' &&
         filteredBlocks[0].content === '') {
    filteredBlocks.shift();
  }

  // Remove trailing empty text blocks
  while (filteredBlocks.length > 0 &&
         filteredBlocks[filteredBlocks.length - 1].type === 'text' &&
         filteredBlocks[filteredBlocks.length - 1].content === '') {
    filteredBlocks.pop();
  }

  return filteredBlocks.map(block => {
    if (block.type === 'text') {
      return block.content;
    } else {
      return `${MATH_START_MARKER}${block.latex}${MATH_END_MARKER}`;
    }
  }).join('');
};

interface QuestionEditorProps {
  initialValue?: string;
  onChange?: (storedValue: string) => void;
  placeholder?: string;
}

const QuestionEditor = ({ initialValue = '', onChange, placeholder = 'Type your question here...' }: QuestionEditorProps) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => parseStoredContent(initialValue));
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const textInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange(blocksToStorageString(blocks));
    }
  }, [blocks, onChange]);

  const updateTextBlock = useCallback((id: string, content: string) => {
    setBlocks(prev => prev.map(block => 
      block.id === id && block.type === 'text' 
        ? { ...block, content } 
        : block
    ));
  }, []);

  const updateMathBlock = useCallback((id: string, latex: string) => {
    setBlocks(prev => prev.map(block => 
      block.id === id && block.type === 'math' 
        ? { ...block, latex } 
        : block
    ));
  }, []);

  const insertMathBlock = useCallback((initialLatex?: string) => {
    const newMathBlock: MathBlock = { type: 'math', id: generateId(), latex: initialLatex || '' };
    const newTextBlock: TextBlock = { type: 'text', id: generateId(), content: '' };

    if (!activeBlockId) {
      // Insert at end
      setBlocks(prev => {
        const lastBlock = prev[prev.length - 1];
        if (lastBlock?.type === 'text' && lastBlock.content === '') {
          return [...prev.slice(0, -1), newMathBlock, newTextBlock];
        }
        return [...prev, newMathBlock, newTextBlock];
      });
    } else {
      // Insert at saved cursor position in active text block
      setBlocks(prev => {
        const blockIndex = prev.findIndex(b => b.id === activeBlockId);
        if (blockIndex === -1) return prev;

        const block = prev[blockIndex];
        if (block.type !== 'text') return prev;

        // Use the saved cursor position
        const cursorPos = cursorPosition;

        const beforeText = block.content.substring(0, cursorPos);
        const afterText = block.content.substring(cursorPos);

        const newBlocks: ContentBlock[] = [
          ...prev.slice(0, blockIndex),
          { type: 'text', id: block.id, content: beforeText },
          newMathBlock,
          { type: 'text', id: generateId(), content: afterText },
          ...prev.slice(blockIndex + 1),
        ];

        return newBlocks.filter(b => !(b.type === 'text' && b.content === '' && newBlocks.indexOf(b) !== newBlocks.length - 1));
      });
    }

    // Set the newly created math block as active
    setActiveBlockId(newMathBlock.id);
    setShowSymbolPicker(false);

    return newMathBlock.id;
  }, [activeBlockId, cursorPosition]);

  const insertSymbolIntoMath = useCallback((latex: string) => {
    if (activeBlockId) {
      const block = blocks.find(b => b.id === activeBlockId);
      if (block?.type === 'math') {
        updateMathBlock(activeBlockId, block.latex + latex);
      }
    }
  }, [activeBlockId, blocks, updateMathBlock]);

  const deleteMathBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const blockIndex = prev.findIndex(b => b.id === id);
      if (blockIndex === -1) return prev;
      
      // Merge adjacent text blocks
      const newBlocks = [...prev];
      newBlocks.splice(blockIndex, 1);
      
      // Merge text blocks if needed
      const result: ContentBlock[] = [];
      for (const block of newBlocks) {
        const lastBlock = result[result.length - 1];
        if (lastBlock?.type === 'text' && block.type === 'text') {
          lastBlock.content += block.content;
        } else {
          result.push(block);
        }
      }
      
      if (result.length === 0) {
        result.push({ type: 'text', id: generateId(), content: '' });
      }
      
      return result;
    });
  }, []);

  const handleTextInput = useCallback((id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const content = e.target.value;
    updateTextBlock(id, content);
  }, [updateTextBlock]);

  const handleTextFocus = useCallback((id: string) => {
    setActiveBlockId(id);
    const inputEl = textInputRefs.current.get(id);
    if (inputEl) {
      setCursorPosition(inputEl.selectionStart || 0);
    }
  }, []);

  const handleTextClick = useCallback((id: string, e: React.MouseEvent<HTMLInputElement>) => {
    const inputEl = e.target as HTMLInputElement;
    setCursorPosition(inputEl.selectionStart || 0);
  }, []);

  const handleTextKeyUp = useCallback((id: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    const inputEl = e.target as HTMLInputElement;
    setCursorPosition(inputEl.selectionStart || 0);
  }, []);

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
        <div className="relative">
          <button
            onClick={() => setShowSymbolPicker(!showSymbolPicker)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-function-line"></i>
            <span>Insert Math</span>
          </button>
          {showSymbolPicker && (
            <MathSymbolPicker
              onInsert={(latex) => {
                const activeBlock = blocks.find(b => b.id === activeBlockId);
                if (activeBlock?.type === 'math') {
                  // Insert symbol into existing active math block
                  insertSymbolIntoMath(latex);
                } else {
                  // Create new math block with the symbol already in it
                  insertMathBlock(latex);
                }
                setShowSymbolPicker(false);
              }}
              onClose={() => setShowSymbolPicker(false)}
            />
          )}
        </div>
        
        <button
          onClick={() => insertMathBlock()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line"></i>
          <span>Empty Math Field</span>
        </button>

        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        
        <span className="text-sm text-gray-500">
          Click inside the editor and use the buttons to insert equations
        </span>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        className="min-h-[120px] p-4 bg-white border-2 border-gray-200 rounded-xl focus-within:border-blue-400 transition-colors"
        onClick={(e) => {
          // Focus last text block if clicking empty area
          if (e.target === editorRef.current) {
            const lastTextBlock = [...blocks].reverse().find(b => b.type === 'text');
            if (lastTextBlock) {
              const el = textInputRefs.current.get(lastTextBlock.id);
              if (el) {
                el.focus();
              }
            }
          }
        }}
      >
        <div className="flex flex-wrap items-center text-lg leading-relaxed">
          {blocks.map((block, index) => {
            if (block.type === 'text') {
              return (
                <input
                  key={block.id}
                  ref={(el) => {
                    if (el) textInputRefs.current.set(block.id, el);
                  }}
                  type="text"
                  value={block.content}
                  className="outline-none border-none bg-transparent min-w-[20px]"
                  onChange={(e) => handleTextInput(block.id, e)}
                  onFocus={() => handleTextFocus(block.id)}
                  onClick={(e) => handleTextClick(block.id, e)}
                  onKeyUp={(e) => handleTextKeyUp(block.id, e)}
                  placeholder={index === 0 && blocks.length === 1 && block.content === '' ? placeholder : ''}
                  style={{
                    width: block.content ? `${Math.max(block.content.length * 10, 20)}px` : '20px',
                    flexShrink: 0,
                  }}
                />
              );
            } else {
              return (
                <div key={block.id} className="inline-flex items-center group" style={{ flexShrink: 0 }}>
                  <MathField
                    value={block.latex}
                    onChange={(latex) => updateMathBlock(block.id, latex)}
                    onFocus={() => setActiveBlockId(block.id)}
                    onBlur={() => {
                      if (block.latex === '') {
                        // Keep empty math fields for now, user can delete manually
                      }
                    }}
                  />
                  <button
                    onClick={() => deleteMathBlock(block.id)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-200 ml-1"
                    title="Remove equation"
                  >
                    <i className="ri-close-line text-sm"></i>
                  </button>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
