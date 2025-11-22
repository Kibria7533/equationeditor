import { useState } from 'react';
import { QuestionEditor } from '../../components/feature/MathEditor';

// Declare MathLive custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'read-only'?: boolean;
        style?: React.CSSProperties;
        children?: React.ReactNode;
      };
    }
  }
}

// Sample questions with math content for demonstration
const sampleQuestions = [
  {
    id: '1',
    title: 'Quadratic Formula',
    content: 'What is the solution to the equation [[MATH]]x^2 + 5x + 6 = 0[[/MATH]] using the quadratic formula [[MATH]]x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}[[/MATH]]?',
  },
  {
    id: '2',
    title: 'Pythagorean Theorem',
    content: 'In a right triangle, if [[MATH]]a = 3[[/MATH]] and [[MATH]]b = 4[[/MATH]], find [[MATH]]c[[/MATH]] using [[MATH]]a^2 + b^2 = c^2[[/MATH]].',
  },
  {
    id: '3',
    title: 'Calculus Integration',
    content: 'Evaluate the integral [[MATH]]\\int_{0}^{\\pi} \\sin(x) \\, dx[[/MATH]].',
  },
];

const HomePage = () => {
  const [questionContent, setQuestionContent] = useState('');
  const [savedQuestions, setSavedQuestions] = useState(sampleQuestions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const handleSaveQuestion = () => {
    if (!questionContent.trim()) return;

    try {
      if (editingId) {
        // Keep the existing title when editing
        setSavedQuestions(prev => prev.map(q =>
          q.id === editingId
            ? { ...q, content: questionContent }
            : q
        ));
        setEditingId(null);
      } else {
        // Generate simple sequential title for new questions
        const questionNumber = savedQuestions.length + 1;
        const newQuestion = {
          id: Date.now().toString(),
          title: `Question ${questionNumber}`,
          content: questionContent,
        };
        setSavedQuestions(prev => [...prev, newQuestion]);
      }

      setQuestionContent('');
      setEditorKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleEditQuestion = (question: typeof sampleQuestions[0]) => {
    setEditingId(question.id);
    setQuestionContent(question.content);
    setEditorKey(prev => prev + 1);
  };

  const handleDeleteQuestion = (id: string) => {
    try {
      setSavedQuestions(prev => prev.filter(q => q.id !== id));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setQuestionContent('');
    setEditorKey(prev => prev + 1);
  };

  // Render stored content with math blocks
  const renderStoredContent = (content: string): JSX.Element => {
    const parts: JSX.Element[] = [];
    let remaining = content;
    let keyIndex = 0;

    while (remaining.length > 0) {
      const mathStart = remaining.indexOf('[[MATH]]');
      
      if (mathStart === -1) {
        parts.push(<span key={keyIndex++}>{remaining}</span>);
        break;
      }
      
      if (mathStart > 0) {
        parts.push(<span key={keyIndex++}>{remaining.substring(0, mathStart)}</span>);
      }
      
      const mathEnd = remaining.indexOf('[[/MATH]]', mathStart);
      if (mathEnd === -1) {
        parts.push(<span key={keyIndex++}>{remaining.substring(mathStart)}</span>);
        break;
      }
      
      const latex = remaining.substring(mathStart + 8, mathEnd);
      
      parts.push(
        <span
          key={keyIndex++}
          className="inline-block px-1 bg-blue-50 rounded text-blue-700"
          dangerouslySetInnerHTML={{
            __html: `<math-field read-only style="display: inline-block; padding: 2px 6px; background-color: #f0f9ff; border-radius: 4px; font-size: inherit; border: none; pointer-events: none;">${latex}</math-field>`
          }}
        />
      );
      
      remaining = remaining.substring(mathEnd + 9);
    }

    return <>{parts}</>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <i className="ri-calculator-line text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: '"Pacifico", serif' }}>logo</h1>
                <p className="text-xs text-gray-500">Math Question Creator</p>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer">Dashboard</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer">My Questions</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer">Templates</a>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-add-line mr-1"></i>
                New Quiz
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Question Creation Panel</h2>
          <p className="text-gray-600">Create math questions with beautiful inline equations. No LaTeX knowledge required!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <i className="ri-edit-2-line"></i>
                  {editingId ? 'Edit Question' : 'Create New Question'}
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Math Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Content
                  </label>
                  <QuestionEditor
                    key={editorKey}
                    initialValue={questionContent}
                    onChange={setQuestionContent}
                    placeholder="Type your question here and insert math equations..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleSaveQuestion}
                    disabled={!questionContent.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap font-medium"
                  >
                    <i className="ri-save-line mr-2"></i>
                    {editingId ? 'Update Question' : 'Save Question'}
                  </button>
                  {editingId && (
                    <button
                      onClick={handleCancelEdit}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className={`ri-${showPreview ? 'eye-off' : 'eye'}-line mr-2`}></i>
                    {showPreview ? 'Hide' : 'Preview'}
                  </button>
                </div>

                {/* Preview Section */}
                {showPreview && questionContent && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-2 mb-4">
                      <i className="ri-eye-line text-indigo-600"></i>
                      <span className="text-sm font-medium text-indigo-600">Live Preview</span>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-gray-700 leading-relaxed">
                        {renderStoredContent(questionContent)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Storage Format Info */}
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-3">
                    <i className="ri-information-line text-amber-600 text-xl mt-0.5"></i>
                    <div>
                      <p className="text-sm font-medium text-amber-800">How it works</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Math equations are automatically wrapped with special markers when saved. 
                        This allows the system to identify and re-render equations when loading questions for editing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Questions Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <i className="ri-file-list-3-line"></i>
                  Saved Questions ({savedQuestions.length})
                </h3>
              </div>
              
              <div className="p-4 max-h-[600px] overflow-y-auto">
                {savedQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-file-add-line text-3xl text-gray-400"></i>
                    </div>
                    <p className="text-gray-500">No questions yet</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first question above</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedQuestions.map((question) => (
                      <div
                        key={question.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          editingId === question.id 
                            ? 'border-indigo-400 bg-indigo-50' 
                            : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                            {question.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditQuestion(question)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <i className="ri-edit-line text-sm"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <i className="ri-delete-bin-line text-sm"></i>
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {renderStoredContent(question.content)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <i className="ri-magic-line text-2xl text-blue-600"></i>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">WYSIWYG Editing</h4>
            <p className="text-sm text-gray-600">
              See your equations rendered instantly as you type. No need to learn LaTeX syntax.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <i className="ri-database-2-line text-2xl text-purple-600"></i>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Smart Storage</h4>
            <p className="text-sm text-gray-600">
              Math blocks are saved with special markers, making it easy to parse and re-render when editing.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <i className="ri-function-line text-2xl text-emerald-600"></i>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Rich Symbol Library</h4>
            <p className="text-sm text-gray-600">
              Access hundreds of math symbols from fractions to calculus, organized by category.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: '"Pacifico", serif' }}>logo</h3>
              <p className="text-gray-400 text-sm">
                Create beautiful math questions with our intuitive WYSIWYG editor.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex items-center justify-between">
            <p className="text-sm text-gray-400">© 2024 Math Question Creator. All rights reserved.</p>
            <a href="https://readdy.ai/?origin=logo" className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
              Powered by Readdy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
