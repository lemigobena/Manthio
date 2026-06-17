import React, { useState } from 'react';
import { COURSES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { 
  ChevronLeft, Menu, Sparkles, MessageSquare, 
  Play, Send, Check 
} from 'lucide-react';
import type { Lesson, ChatMessage } from '../../types';

interface ContentPlayerProps {
  onNavigate: (page: string) => void;
}

export const ContentPlayer: React.FC<ContentPlayerProps> = ({ onNavigate }) => {
  const { activeCourseId } = useAuth();
  const { addXp, addToast } = useXP();
  const course = COURSES.find(c => c.id === activeCourseId) || COURSES[0];
  
  // Find current active module and lesson
  const currentModule = course.modules.find(m => m.status === 'In progress') || course.modules[0];
  const [currentLesson, setCurrentLesson] = useState<Lesson>(
    currentModule.lessons.find(l => l.status === 'in_progress') || currentModule.lessons[0]
  );

  // Layout states
  const [curriculumOpen, setCurriculumOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'ai' | 'notes' | 'transcript' | 'resources'>('ai');

  // AI chat states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { 
      id: 'm1', 
      sender: 'tutor', 
      text: `Hallo Alex! Willkommen bei der Lektion **"${currentLesson.title}"**. Ich bin dein KI-Tutor. Stell mir gerne Fragen zum Inhalt dieser Lektion!`, 
      timestamp: '14:30', 
      source: 'Course docs' 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Notes state
  const [noteText, setNoteText] = useState(() => {
    return localStorage.getItem(`note-${currentLesson.id}`) || '';
  });

  const handleSaveNote = () => {
    localStorage.setItem(`note-${currentLesson.id}`, noteText);
    addToast('success', 'Notiz automatisch gespeichert.');
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    // Simulated streaming response from Local RAG vs Cloud fallback
    setTimeout(() => {
      setIsTyping(false);
      const replyText = chatInput.toLowerCase().includes('oop') || chatInput.toLowerCase().includes('klasse')
        ? 'In Python ist eine Klasse eine Vorlage zur Erstellung von Objekten. Objekte haben Eigenschaften (Attribute) und Verhalten (Methoden). Möchtest du ein Codebeispiel dazu?'
        : `Gute Frage zu "${currentLesson.title}"! Lass uns das Sokratisch betrachten. Was vermutest du, wie dieser Code abläuft?`;

      const tutorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'tutor',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'Course docs',
        documents: [
          { title: 'Modul 1 Skript - Grundlagen', location: 'Section 3.2', url: '#' }
        ]
      };
      setChatMessages(prev => [...prev, tutorMsg]);
      addXp(10, 'KI-Tutor Frage gestellt');
    }, 1500);
  };

  const markLessonComplete = () => {
    if (currentLesson.status !== 'completed') {
      currentLesson.status = 'completed';
      addXp(50, `Lektion "${currentLesson.title}" abgeschlossen`);
      addToast('success', '+50 XP — Lektion abgeschlossen!');
      
      // Calculate new overall progress
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      const completedLessons = course.modules.reduce(
        (sum, m) => sum + m.lessons.filter(l => l.status === 'completed').length, 0
      );
      course.progress = Math.round((completedLessons / totalLessons) * 100);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col -m-6 bg-bg overflow-hidden relative">
      {/* Player Top Navigation Bar */}
      <div className="bg-panel border-b border-line px-6 py-3 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onNavigate('learning-path')}
            className="p-1.5 rounded-lg bg-bg border border-line text-muted hover:text-text cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] text-muted font-semibold uppercase">{course.title}</span>
            <h1 className="text-sm font-bold text-text">{currentLesson.title}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setCurriculumOpen(!curriculumOpen)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${curriculumOpen ? 'bg-cyan/15 border-cyan text-cyan' : 'bg-panel border-line text-muted hover:text-text'}`}
          >
            <Menu className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setToolsOpen(!toolsOpen)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${toolsOpen ? 'bg-cyan/15 border-cyan text-cyan' : 'bg-panel border-line text-muted hover:text-text'}`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Workspace Areas */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Syllabus Navigator (Curriculum Pane) */}
        {curriculumOpen && (
          <div className="w-72 bg-panel border-r border-line flex flex-col overflow-y-auto shrink-0 transition-all">
            <div className="p-4 border-b border-line">
              <h3 className="font-bold text-xs uppercase text-muted tracking-wider">Lehrplan Übersicht</h3>
            </div>
            
            <div className="p-2 space-y-4">
              {course.modules.map(mod => (
                <div key={mod.id} className="space-y-1">
                  <div className="px-3 py-1.5 text-xs font-semibold text-text bg-bg/50 rounded-lg">
                    Modul {mod.number}: {mod.title}
                  </div>
                  <div className="space-y-0.5">
                    {mod.lessons.map(les => {
                      const isActive = les.id === currentLesson.id;
                      return (
                        <button
                          key={les.id}
                          onClick={() => {
                            if (les.status !== 'locked') {
                              setCurrentLesson(les);
                              setNoteText(localStorage.getItem(`note-${les.id}`) || '');
                            }
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isActive ? 'bg-cyan/10 text-cyan font-semibold border-l-2 border-cyan' :
                            les.status === 'locked' ? 'text-muted cursor-not-allowed opacity-50' : 'text-text hover:bg-bg/40'
                          }`}
                        >
                          <span className="truncate pr-2">{les.title}</span>
                          <span className="shrink-0 text-[10px] text-muted">
                            {les.status === 'completed' ? <Check className="w-3.5 h-3.5 text-green" /> : les.duration}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Center Panel: Content Media Viewer */}
        <div className="flex-1 bg-bg flex flex-col overflow-y-auto p-6 items-center justify-center">
          <div className="w-full max-w-3xl space-y-6">
            
            {/* Conditional view based on lesson type */}
            {currentLesson.type === 'Video' ? (
              <div className="aspect-video bg-black rounded-2xl border border-line relative overflow-hidden flex items-center justify-center">
                <Play className="w-16 h-16 text-cyan/70 hover:text-cyan cursor-pointer transition-colors" />
                <div className="absolute bottom-4 left-4 right-4 bg-bg/85 backdrop-blur border border-line p-3 rounded-xl flex items-center justify-between text-xs text-text">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan animate-pulse" />
                    <span>Video fortsetzen bei 04:23</span>
                  </div>
                  <span className="font-bold text-muted">12:30 Gesamt</span>
                </div>
              </div>
            ) : currentLesson.type === 'Code' ? (
              <div className="bg-panel border border-line rounded-2xl overflow-hidden flex flex-col h-[480px]">
                <div className="bg-bg border-b border-line px-4 py-2 flex items-center justify-between text-xs text-muted">
                  <span>Python Editor • code_exercise.py</span>
                  <span className="bg-cyan/15 text-cyan px-2 py-0.5 rounded font-bold uppercase">Worked Example</span>
                </div>
                <div className="flex-1 font-mono p-4 text-xs text-text bg-[#0a0d10] overflow-y-auto">
                  <p className="text-muted"># Write a function that returns the square of all even numbers</p>
                  <p className="text-purple mt-2">def <span className="text-cyan">get_even_squares</span>(numbers):</p>
                  <p className="text-text pl-4"># TODO: Complete list comprehension</p>
                  <p className="text-text pl-4">return [n**2 for n in numbers if n % 2 == 0]</p>
                </div>
                <div className="bg-bg border-t border-line px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-muted">Prüfung bestanden: 3/3 Testfälle</span>
                  <div className="flex space-x-2">
                    <button className="bg-bg hover:bg-line border border-line text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                      Ausführen
                    </button>
                    <button 
                      onClick={() => addXp(75, 'Code-Aufgabe eingereicht')}
                      className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Code einreichen (+75 XP)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-panel border border-line rounded-2xl p-6 md:p-8 space-y-6 prose prose-invert max-w-none">
                <h2 className="text-xl md:text-2xl font-bold">{currentLesson.title}</h2>
                <div className="text-xs text-muted flex items-center space-x-4">
                  <span>Lesezeit: {currentLesson.duration}</span>
                  <span>Schwierigkeit: {currentLesson.difficulty || 1}/3</span>
                </div>
                <p className="text-sm leading-relaxed text-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam elementum, urna et pretium dictum,
                  nunc tellus vehicula felis, nec mollis sapien dolor nec nisi. Vivamus accumsan hendrerit neque at accumsan.
                  In egestas sodales metus. Suspendisse pulvinar erat sit amet ex tempor egestas.
                </p>
                <div className="bg-bg border border-line p-4 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-cyan flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Key Takeaway</span>
                  </div>
                  <p className="text-muted">
                    Variables store references to values in Python, not the actual values. Modifying a list in-place affects all variables referencing it.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Complete Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-line">
              <button 
                onClick={() => onNavigate('learning-path')}
                className="bg-bg hover:bg-line border border-line text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
              >
                Zurück zur Übersicht
              </button>
              
              <button 
                onClick={markLessonComplete}
                className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
              >
                {currentLesson.status === 'completed' ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3px]" />
                    <span>ABGESCHLOSSEN</span>
                  </>
                ) : (
                  <span>ALS ERLEDIGT MARKIEREN (+50 XP)</span>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Right Side: Tutor, Notes, Transcript & Resources Drawer */}
        {toolsOpen && (
          <div className="w-80 bg-panel border-l border-line flex flex-col overflow-hidden shrink-0 transition-all">
            {/* Header Tabs */}
            <div className="flex border-b border-line bg-bg/40 p-1">
              <button 
                onClick={() => setActiveTab('ai')}
                className={`flex-1 text-center py-2 text-[10px] font-bold rounded uppercase ${activeTab === 'ai' ? 'bg-panel text-cyan border border-line' : 'text-muted hover:text-text'}`}
              >
                KI-Tutor
              </button>
              <button 
                onClick={() => setActiveTab('notes')}
                className={`flex-1 text-center py-2 text-[10px] font-bold rounded uppercase ${activeTab === 'notes' ? 'bg-panel text-cyan border border-line' : 'text-muted hover:text-text'}`}
              >
                Notizen
              </button>
              <button 
                onClick={() => setActiveTab('transcript')}
                className={`flex-1 text-center py-2 text-[10px] font-bold rounded uppercase ${activeTab === 'transcript' ? 'bg-panel text-cyan border border-line' : 'text-muted hover:text-text'}`}
              >
                Abschrift
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              
              {activeTab === 'ai' && (
                <div className="flex flex-col h-full justify-between">
                  <div className="space-y-4 overflow-y-auto pr-1 max-h-[calc(100vh-280px)]">
                    {chatMessages.map(msg => (
                      <div 
                        key={msg.id} 
                        className={`space-y-1 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
                      >
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-cyan text-bg font-semibold rounded-tr-none' : 'bg-bg border border-line rounded-tl-none text-text'}`}>
                          {msg.text}
                        </div>
                        <div className="flex items-center space-x-1.5 text-[9px] text-muted justify-between px-1">
                          <span>{msg.timestamp}</span>
                          {msg.source && (
                            <span className="bg-panel border border-line px-1 rounded-sm">
                              {msg.source}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="text-[10px] text-muted flex items-center space-x-1.5 italic px-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" />
                        <span>KI-Tutor antwortet...</span>
                      </div>
                    )}
                  </div>

                  {/* Input Chat Block */}
                  <div className="pt-4 border-t border-line mt-4 flex items-center space-x-2">
                    <input 
                      type="text" 
                      placeholder="Stell eine Frage..." 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-bg border border-line text-xs rounded-xl px-3 py-2 text-text focus:outline-none focus:border-cyan"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="bg-cyan hover:bg-cyan2 text-bg p-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4 flex flex-col h-full justify-between">
                  <div className="space-y-2 flex-1 flex flex-col">
                    <label className="text-[10px] text-muted font-bold uppercase">Deine persönlichen Notizen</label>
                    <textarea 
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Schreibe hier wichtige Notizen auf. Markdown wird unterstützt..."
                      className="flex-1 w-full p-3 bg-bg border border-line rounded-xl text-xs text-text focus:outline-none focus:border-cyan resize-none h-64 font-mono"
                    />
                  </div>
                  <button 
                    onClick={handleSaveNote}
                    className="w-full bg-cyan hover:bg-cyan2 text-bg text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Notiz speichern
                  </button>
                </div>
              )}

              {activeTab === 'transcript' && (
                <div className="space-y-3 text-xs leading-relaxed text-muted">
                  <p>
                    <span className="text-cyan font-bold block">00:15 - Einführung</span>
                    Willkommen zu dieser Lektion. Wir werden uns heute mit der Syntax und den ersten Skripten beschäftigen.
                  </p>
                  <p>
                    <span className="text-cyan font-bold block">04:23 - Variablen definieren</span>
                    In Python weisen wir Werte mit dem einfachen Gleichheitszeichen zu. Variablen haben keinen festen Typ.
                  </p>
                  <p>
                    <span className="text-cyan font-bold block">08:45 - Zusammenfassung</span>
                    Abschließend erstellen wir eine eigene virtuelle Umgebung mit dem venv Modul.
                  </p>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
