
interface MathSymbolPickerProps {
  onInsert: (latex: string) => void;
  onClose: () => void;
}

const mathCategories = [
  {
    name: 'Basic',
    symbols: [
      { label: '+', latex: '+' },
      { label: '−', latex: '-' },
      { label: '×', latex: '\\times' },
      { label: '÷', latex: '\\div' },
      { label: '=', latex: '=' },
      { label: '≠', latex: '\\neq' },
      { label: '±', latex: '\\pm' },
      { label: '∓', latex: '\\mp' },
    ],
  },
  {
    name: 'Fractions & Roots',
    symbols: [
      { label: 'a/b', latex: '\\frac{a}{b}' },
      { label: '√', latex: '\\sqrt{x}' },
      { label: '∛', latex: '\\sqrt[3]{x}' },
      { label: 'ⁿ√', latex: '\\sqrt[n]{x}' },
    ],
  },
  {
    name: 'Powers & Indices',
    symbols: [
      { label: 'x²', latex: 'x^{2}' },
      { label: 'xⁿ', latex: 'x^{n}' },
      { label: 'xₙ', latex: 'x_{n}' },
      { label: 'xₙᵐ', latex: 'x_{n}^{m}' },
    ],
  },
  {
    name: 'Comparison',
    symbols: [
      { label: '<', latex: '<' },
      { label: '>', latex: '>' },
      { label: '≤', latex: '\\leq' },
      { label: '≥', latex: '\\geq' },
      { label: '≈', latex: '\\approx' },
      { label: '∼', latex: '\\sim' },
    ],
  },
  {
    name: 'Greek Letters',
    symbols: [
      { label: 'α', latex: '\\alpha' },
      { label: 'β', latex: '\\beta' },
      { label: 'γ', latex: '\\gamma' },
      { label: 'δ', latex: '\\delta' },
      { label: 'θ', latex: '\\theta' },
      { label: 'λ', latex: '\\lambda' },
      { label: 'π', latex: '\\pi' },
      { label: 'σ', latex: '\\sigma' },
      { label: 'Σ', latex: '\\Sigma' },
      { label: 'Δ', latex: '\\Delta' },
      { label: 'Ω', latex: '\\Omega' },
      { label: 'φ', latex: '\\phi' },
    ],
  },
  {
    name: 'Calculus',
    symbols: [
      { label: '∫', latex: '\\int' },
      { label: '∫ₐᵇ', latex: '\\int_{a}^{b}' },
      { label: '∑', latex: '\\sum' },
      { label: '∑ₙ', latex: '\\sum_{n=1}^{\\infty}' },
      { label: '∏', latex: '\\prod' },
      { label: 'lim', latex: '\\lim_{x \\to \\infty}' },
      { label: '∂', latex: '\\partial' },
      { label: '∞', latex: '\\infty' },
    ],
  },
  {
    name: 'Trigonometry',
    symbols: [
      { label: 'sin', latex: '\\sin' },
      { label: 'cos', latex: '\\cos' },
      { label: 'tan', latex: '\\tan' },
      { label: 'sin⁻¹', latex: '\\arcsin' },
      { label: 'cos⁻¹', latex: '\\arccos' },
      { label: 'tan⁻¹', latex: '\\arctan' },
    ],
  },
  {
    name: 'Logarithms',
    symbols: [
      { label: 'log', latex: '\\log' },
      { label: 'ln', latex: '\\ln' },
      { label: 'logₐ', latex: '\\log_{a}' },
      { label: 'eˣ', latex: 'e^{x}' },
    ],
  },
  {
    name: 'Sets',
    symbols: [
      { label: '∈', latex: '\\in' },
      { label: '∉', latex: '\\notin' },
      { label: '⊂', latex: '\\subset' },
      { label: '⊃', latex: '\\supset' },
      { label: '∪', latex: '\\cup' },
      { label: '∩', latex: '\\cap' },
      { label: '∅', latex: '\\emptyset' },
      { label: 'ℝ', latex: '\\mathbb{R}' },
    ],
  },
  {
    name: 'Geometry',
    symbols: [
      { label: '°', latex: '^{\\circ}' },
      { label: '∠', latex: '\\angle' },
      { label: '⊥', latex: '\\perp' },
      { label: '∥', latex: '\\parallel' },
      { label: '△', latex: '\\triangle' },
      { label: '□', latex: '\\square' },
    ],
  },
];

const MathSymbolPicker = ({ onInsert, onClose }: MathSymbolPickerProps) => {
  return (
    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 w-[480px] max-h-[400px] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Insert Math Symbol</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
          aria-label="Close"
        >
          <i className="ri-close-line text-xl"></i>
        </button>
      </div>
      <div className="space-y-4">
        {mathCategories.map((category) => (
          <div key={category.name}>
            <p className="text-xs font-medium text-gray-500 mb-2">{category.name}</p>
            <div className="flex flex-wrap gap-1">
              {category.symbols.map((symbol) => (
                <button
                  key={symbol.latex}
                  onClick={() => {
                    try {
                      onInsert(symbol.latex);
                      onClose();
                    } catch (error) {
                      console.error('Error inserting symbol:', error);
                    }
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-lg font-medium text-gray-700 transition-all cursor-pointer"
                  title={symbol.latex}
                  aria-label={`Insert ${symbol.label} (${symbol.latex})`}
                >
                  {symbol.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MathSymbolPicker;
