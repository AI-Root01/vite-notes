import React, { useState, useEffect, useRef } from 'react';
import { Plus, Brain, CheckCircle2, Circle, Trash2, Calendar, Zap, Target, TrendingUp, Sparkles, Moon, Sun, Bell, Star, Award, Filter, Home, Briefcase, BookOpen, FileText, BarChart3, Clock, Users, Menu, X } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

// Simulador de IA para categorización y prioridad
const aiAnalyzeTask = (taskText) => {
  const urgentKeywords = ['urgente', 'asap', 'inmediato', 'ya', 'ahora', 'pronto'];
  const workKeywords = ['trabajo', 'reunión', 'proyecto', 'cliente', 'presentación', 'informe'];
  const personalKeywords = ['personal', 'casa', 'familia', 'comprar', 'cita', 'médico'];
  const studyKeywords = ['estudiar', 'examen', 'tarea', 'universidad', 'curso', 'aprender'];

  const text = taskText.toLowerCase();
  
  let category = 'general';
  if (workKeywords.some(keyword => text.includes(keyword))) category = 'trabajo';
  else if (personalKeywords.some(keyword => text.includes(keyword))) category = 'personal';
  else if (studyKeywords.some(keyword => text.includes(keyword))) category = 'estudio';

  let priority = 'media';
  if (urgentKeywords.some(keyword => text.includes(keyword))) priority = 'alta';
  else if (text.length > 50) priority = 'alta';
  else if (text.includes('mañana') || text.includes('próximo')) priority = 'baja';

  const suggestions = [];
  if (text.includes('reunión')) suggestions.push('Preparar agenda de reunión');
  if (text.includes('proyecto')) suggestions.push('Definir hitos del proyecto');
  if (text.includes('estudiar')) suggestions.push('Crear horario de estudio');
  if (text.includes('comprar')) suggestions.push('Hacer lista de compras');

  return { category, priority, suggestions };
};

// Configuraciones con colores web modernos
const categoryConfig = {
  trabajo: { 
    name: 'Trabajo',
    icon: Briefcase,
    color: '#3B82F6',
    bg: '#EFF6FF',
    border: '#DBEAFE'
  },
  personal: { 
    name: 'Personal',
    icon: Home,
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#D1FAE5'
  },
  estudio: { 
    name: 'Estudio',
    icon: BookOpen,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#E9E5FF'
  },
  general: { 
    name: 'General',
    icon: FileText,
    color: '#6B7280',
    bg: '#F9FAFB',
    border: '#E5E7EB'
  }
};

const priorityConfig = {
  alta: { 
    name: 'Alta Prioridad',
    color: '#EF4444',
    bg: '#FEF2F2',
    icon: '🔥'
  },
  media: { 
    name: 'Media Prioridad',
    color: '#F59E0B',
    bg: '#FFFBEB',
    icon: '⚡'
  },
  baja: { 
    name: 'Baja Prioridad',
    color: '#10B981',
    bg: '#ECFDF5',
    icon: '🌱'
  }
};

// Componente Toast
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const toastStyles = {
    success: { bg: '#10B981', color: '#FFFFFF' },
    error: { bg: '#EF4444', color: '#FFFFFF' },
    info: { bg: '#3B82F6', color: '#FFFFFF' }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 1000,
        backgroundColor: toastStyles[type].bg,
        color: toastStyles[type].color,
        padding: '12px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        fontSize: '14px',
        fontWeight: '500',
        animation: 'slideInFromTop 0.3s ease-out',
        maxWidth: '300px'
      }}
    >
      {message}
    </div>
  );
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputRef = useRef(null);

  // CSS Styles embebidos
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    @keyframes slideInFromTop {
      0% { transform: translateY(-20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideIn {
      0% { transform: translateX(-10px); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out;
    }
    
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
    
    .animate-pulse {
      animation: pulse 2s infinite;
    }
    
    .glass-effect {
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .hover-lift {
      transition: all 0.2s ease;
    }
    
    .hover-lift:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }
    
    .gradient-bg {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .task-item {
      transition: all 0.2s ease;
    }
    
    .task-item:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    
    .sidebar-item {
      transition: all 0.2s ease;
    }
    
    .sidebar-item:hover {
      background-color: rgba(59, 130, 246, 0.1);
      transform: translateX(2px);
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #3B82F6, #8B5CF6);
      border: none;
      color: white;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
    }
    
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .input-modern {
      width: 100%;
      padding: 16px;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      font-size: 16px;
      transition: all 0.2s ease;
      background: white;
    }
    
    .input-modern:focus {
      outline: none;
      border-color: #3B82F6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border: 1px solid #F3F4F6;
      transition: all 0.2s ease;
    }
    
    .card:hover {
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    }
    
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border: 1px solid #F3F4F6;
      transition: all 0.2s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
    
    .sidebar {
      background: white;
      border-right: 1px solid #E5E7EB;
      min-height: 100vh;
      width: 300px;
      padding: 24px;
    }
    
    .main-content {
      flex: 1;
      padding: 32px;
      background: #FAFBFC;
      min-height: 100vh;
    }
    
    .task-list {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border: 1px solid #F3F4F6;
    }
    
    .dark-mode {
      background: #1F2937;
      color: white;
    }
    
    .dark-mode .sidebar {
      background: #111827;
      border-right-color: #374151;
    }
    
    .dark-mode .main-content {
      background: #1F2937;
    }
    
    .dark-mode .card {
      background: #374151;
      border-color: #4B5563;
      color: white;
    }
    
    .dark-mode .stat-card {
      background: #374151;
      border-color: #4B5563;
      color: white;
    }
    
    .dark-mode .task-list {
      background: #374151;
      border-color: #4B5563;
    }
    
    .dark-mode .input-modern {
      background: #4B5563;
      border-color: #6B7280;
      color: white;
    }
    
    .dark-mode .input-modern::placeholder {
      color: #9CA3AF;
    }
    
    .mobile-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 300px;
      background: white;
      z-index: 1000;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      border-right: 1px solid #E5E7EB;
    }
    
    .mobile-sidebar.open {
      transform: translateX(0);
    }
    
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }
    
    @media (max-width: 768px) {
      .main-content {
        padding: 16px;
      }
      
      .sidebar {
        display: none;
      }
      
      .mobile-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        background: white;
        border-bottom: 1px solid #E5E7EB;
        margin: -32px -16px 24px -16px;
      }
    }
    
    @media (min-width: 769px) {
      .mobile-header {
        display: none;
      }
      
      .mobile-sidebar {
        display: none;
      }
    }
  `;

  // Cargar tareas del localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('ai-tasks');
    const savedDarkMode = localStorage.getItem('ai-dark-mode');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Guardar tareas en localStorage
  useEffect(() => {
    localStorage.setItem('ai-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Guardar modo oscuro
  useEffect(() => {
    localStorage.setItem('ai-dark-mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    setIsLoading(true);
    
    // Simular procesamiento de IA
    await new Promise(resolve => setTimeout(resolve, 1200));

    const aiAnalysis = aiAnalyzeTask(newTask);
    const task = {
      id: Date.now(),
      text: newTask,
      completed: false,
      createdAt: new Date(),
      category: aiAnalysis.category,
      priority: aiAnalysis.priority,
      aiSuggestions: aiAnalysis.suggestions
    };

    setTasks([task, ...tasks]);
    setNewTask('');
    setIsLoading(false);
    
    showToast(`✨ Tarea creada en ${categoryConfig[aiAnalysis.category].name}`, 'success');
    
    if (aiAnalysis.suggestions.length > 0) {
      setAiSuggestions(aiAnalysis.suggestions);
      setShowAISuggestions(true);
      showToast('🧠 IA generó sugerencias inteligentes', 'info');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const newCompleted = !task.completed;
        showToast(
          newCompleted ? '🎉 ¡Tarea completada!' : '↩️ Tarea reactivada', 
          newCompleted ? 'success' : 'info'
        );
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    showToast('🗑️ Tarea eliminada', 'error');
  };

  const addSuggestedTask = (suggestion) => {
    const aiAnalysis = aiAnalyzeTask(suggestion);
    const task = {
      id: Date.now(),
      text: suggestion,
      completed: false,
      createdAt: new Date(),
      category: aiAnalysis.category,
      priority: aiAnalysis.priority,
      aiSuggestions: []
    };
    
    setTasks([task, ...tasks]);
    setAiSuggestions(aiSuggestions.filter(s => s !== suggestion));
    showToast('✅ Sugerencia agregada', 'success');
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return task.category === filter;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    highPriority: tasks.filter(t => t.priority === 'alta' && !t.completed).length
  };

  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <>
      <style>{styles}</style>
      
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Mobile Header */}
        <div className="mobile-header">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <Menu size={24} color="#374151" />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
            AI Task Manager
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            {darkMode ? <Sun size={20} color="#F59E0B" /> : <Moon size={20} color="#6B7280" />}
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <div className={`mobile-sidebar ${sidebarOpen ? 'open' : ''} ${darkMode ? 'dark-mode' : ''}`}>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            {/* Contenido del sidebar móvil */}
          </div>
        </div>

        {/* Sidebar Desktop */}
        <div className="sidebar">
          {/* Header del sidebar */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                }}
                className="animate-pulse"
              >
                <Brain size={24} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  AI Task Manager
                </h1>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                  Productividad inteligente
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Progreso General
                </span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                  {completionPercentage}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: '#E5E7EB',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #10B981, #3B82F6)',
                    borderRadius: '4px',
                    width: `${completionPercentage}%`,
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
            {[
              { label: 'Total', value: stats.total, color: '#3B82F6', icon: Target },
              { label: 'Hechas', value: stats.completed, color: '#10B981', icon: CheckCircle2 },
              { label: 'Pendientes', value: stats.pending, color: '#F59E0B', icon: Clock },
              { label: 'Urgentes', value: stats.highPriority, color: '#EF4444', icon: Zap }
            ].map((stat, index) => (
              <div key={stat.label} className="stat-card hover-lift">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    background: stat.color,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px'
                  }}
                >
                  <stat.icon size={16} color="white" />
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
              📊 VISTAS
            </h3>
            
            {[
              { key: 'all', label: 'Todas las tareas', icon: Target, count: stats.total },
              { key: 'active', label: 'En progreso', icon: Circle, count: stats.pending },
              { key: 'completed', label: 'Completadas', icon: CheckCircle2, count: stats.completed }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className="sidebar-item"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: filter === item.key ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : 'transparent',
                  color: filter === item.key ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </div>
                <span
                  style={{
                    background: filter === item.key ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
                    color: filter === item.key ? 'white' : '#6B7280',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </div>

          {/* Categorías */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
              🏷️ CATEGORÍAS
            </h3>
            
            {Object.entries(categoryConfig).map(([key, category]) => {
              const Icon = category.icon;
              const count = tasks.filter(t => t.category === key).length;
              
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className="sidebar-item"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: filter === key ? category.bg : 'transparent',
                    color: filter === key ? category.color : '#374151',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        background: category.color,
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={12} color="white" />
                    </div>
                    <span>{category.name}</span>
                  </div>
                  {count > 0 && (
                    <span
                      style={{
                        background: filter === key ? 'rgba(255,255,255,0.8)' : '#F3F4F6',
                        color: filter === key ? category.color : '#6B7280',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Toggle modo oscuro */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="sidebar-item"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: darkMode ? '#374151' : '#F3F4F6',
              color: darkMode ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                background: darkMode ? '#F59E0B' : '#6B7280',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {darkMode ? <Sun size={12} color="white" /> : <Moon size={12} color="white" />}
            </div>
            <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
              {filter === 'all' ? '🎯 Todas las tareas' :
               filter === 'active' ? '⚡ Tareas pendientes' :
               filter === 'completed' ? '✅ Tareas completadas' :
               `${categoryConfig[filter]?.name || 'Tareas'}`}
            </h1>
            <p style={{ fontSize: '16px', color: '#6B7280' }}>
              {filteredTasks.length} tarea{filteredTasks.length !== 1 ? 's' : ''} 
              {stats.total > 0 && ` • ${completionPercentage}% completado`}
            </p>
          </div>

          {/* Add Task */}
          <div className="card hover-lift" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Plus size={20} color="white" />
              </div>
              
              <div style={{ flex: 1 }}>
                <textarea
                  ref={inputRef}
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!isLoading) addTask();
                    }
                  }}
                  placeholder="✨ Describe tu nueva tarea aquí..."
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    minHeight: newTask ? '80px' : '50px',
                    padding: '16px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '16px',
                    resize: 'none',
                    background: 'white',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                
                {newTask && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }} className="animate-fade-in">
                    <button
                      onClick={addTask}
                      disabled={isLoading || !newTask.trim()}
                      className="btn-primary"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              border: '2px solid white',
                              borderTop: '2px solid transparent',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }}
                          />
                          🧠 Procesando con IA...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Crear tarea
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setNewTask('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6B7280',
                        cursor: 'pointer',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          {showAISuggestions && aiSuggestions.length > 0 && (
            <div
              className="card hover-lift animate-fade-in"
              style={{
                marginBottom: '32px',
                background: 'linear-gradient(135deg, #F3E8FF, #E0E7FF)',
                border: '1px solid #C4B5FD'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Sparkles size={16} color="white" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#7C3AED', margin: 0 }}>
                  🧠 Sugerencias de IA
                </h3>
                <button
                  onClick={() => setShowAISuggestions(false)}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    color: '#7C3AED',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {aiSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="hover-lift"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid #E0E7FF'
                    }}
                  >
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                      {suggestion}
                    </span>
                    <button
                      onClick={() => addSuggestedTask(suggestion)}
                      style={{
                        background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      ✨ Agregar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks List */}
          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    background: '#F3F4F6',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px'
                  }}
                >
                  <Calendar size={32} color="#9CA3AF" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  No hay tareas aquí
                </h3>
                <p style={{ fontSize: '16px', color: '#6B7280' }}>
                  Agrega una nueva tarea para comenzar tu productividad
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {filteredTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="task-item"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      padding: '20px',
                      background: '#FAFBFC',
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                      opacity: task.completed ? 0.6 : 1
                    }}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        border: task.completed ? 'none' : '2px solid #D1D5DB',
                        background: task.completed ? '#10B981' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      {task.completed && <CheckCircle2 size={14} color="white" />}
                    </button>

                    {/* Task content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: '500',
                          color: '#111827',
                          marginBottom: '12px',
                          lineHeight: '1.5',
                          textDecoration: task.completed ? 'line-through' : 'none'
                        }}
                      >
                        {task.text}
                      </div>
                      
                      {/* Metadata */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            background: priorityConfig[task.priority].bg,
                            color: priorityConfig[task.priority].color,
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          <span>{priorityConfig[task.priority].icon}</span>
                          <span>{priorityConfig[task.priority].name}</span>
                        </div>
                        
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            background: categoryConfig[task.category].bg,
                            color: categoryConfig[task.category].color,
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          {React.createElement(categoryConfig[task.category].icon, {
                            size: 12
                          })}
                          <span>{categoryConfig[task.category].name}</span>
                        </div>
                        
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            background: '#F3F4F6',
                            color: '#6B7280',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          <Calendar size={12} />
                          <span>{format(new Date(task.createdAt), 'dd MMM')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease',
                        opacity: 0
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = '#FEE2E2';
                        e.target.style.color = '#EF4444';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'none';
                        e.target.style.color = '#9CA3AF';
                      }}
                      className="delete-btn"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <style>{`
        .task-item:hover .delete-btn {
          opacity: 1 !important;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default App;