import { useState, useEffect } from 'react'
import { 
  FaUsers, FaGraduationCap, FaChartBar, FaUserPlus, 
  FaEdit, FaTrash, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaCalendarAlt, FaBook, FaIdCard, FaChartPie, FaChartLine,
  FaBirthdayCake, FaPercentage, FaHome, FaList, FaCheckCircle,
  FaTimesCircle, FaInfoCircle, FaExclamationTriangle
} from 'react-icons/fa'
import './App.css'

// Déterminer l'URL de l'API au runtime
const getApiUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080/api/students';
  }
  
  // Utiliser une URL relative - nginx fera le proxy vers backend-service:8080
  // Le navigateur enverra la requête au même serveur (nginx), qui la redirigera vers le backend
  return '/api/students';
};

const STATS_URL = getApiUrl().replace('/students', '/students/statistics');

// Composant de notification
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <FaCheckCircle />,
    error: <FaTimesCircle />,
    info: <FaInfoCircle />,
    warning: <FaExclamationTriangle />
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-icon">{icons[type]}</div>
      <div className="notification-message">{message}</div>
      <button className="notification-close" onClick={onClose}>×</button>
    </div>
  );
};

function App() {
  const [students, setStudents] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [activeTab, setActiveTab] = useState('home') // 'home', 'dashboard', 'list'
  const [showModal, setShowModal] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    field: '',
    year: '',
    phoneNumber: '',
    address: ''
  })

  // Charger tous les étudiants
  const fetchStudents = async () => {
    setLoading(true)
    try {
      const response = await fetch(getApiUrl())
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error)
      showNotification('Erreur lors du chargement des étudiants', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Charger les statistiques
  const fetchStatistics = async () => {
    try {
      const response = await fetch(STATS_URL)
      if (response.ok) {
        const data = await response.json()
        setStatistics(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchStatistics()
  }, [])

  // Afficher une notification
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  // Fermer une notification
  const closeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Ouvrir modal pour créer
  const handleOpenCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  // Ouvrir modal pour modifier
  const handleOpenEditModal = (student) => {
    setEditingStudent(student)
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      dateOfBirth: student.dateOfBirth,
      field: student.field,
      year: student.year.toString(),
      phoneNumber: student.phoneNumber || '',
      address: student.address || ''
    })
    setShowModal(true)
  }

  // Fermer modal
  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  // Créer un nouvel étudiant
  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year),
          dateOfBirth: formData.dateOfBirth
        })
      })
      if (response.ok) {
        fetchStudents()
        fetchStatistics()
        handleCloseModal()
        showNotification('Étudiant créé avec succès!', 'success')
      } else {
        showNotification('Erreur lors de la création de l\'étudiant', 'error')
      }
    } catch (error) {
      console.error('Erreur:', error)
      showNotification('Erreur lors de la création de l\'étudiant', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Mettre à jour un étudiant
  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${getApiUrl()}/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year),
          dateOfBirth: formData.dateOfBirth
        })
      })
      if (response.ok) {
        fetchStudents()
        fetchStatistics()
        handleCloseModal()
        showNotification('Étudiant mis à jour avec succès!', 'success')
      } else {
        showNotification('Erreur lors de la mise à jour de l\'étudiant', 'error')
      }
    } catch (error) {
      console.error('Erreur:', error)
      showNotification('Erreur lors de la mise à jour de l\'étudiant', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Supprimer un étudiant
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant?')) {
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`${getApiUrl()}/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchStudents()
        fetchStatistics()
        showNotification('Étudiant supprimé avec succès!', 'success')
      } else {
        showNotification('Erreur lors de la suppression de l\'étudiant', 'error')
      }
    } catch (error) {
      console.error('Erreur:', error)
      showNotification('Erreur lors de la suppression de l\'étudiant', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      field: '',
      year: '',
      phoneNumber: '',
      address: ''
    })
    setEditingStudent(null)
  }

  // Calculer l'âge
  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Générer des données pour le graphique en ligne (répartition par filière)
  const generateFieldLineChartData = () => {
    if (!statistics?.byField || Object.keys(statistics.byField).length === 0) return [];
    
    const fields = Object.keys(statistics.byField);
    const data = fields.map((field, index) => ({
      field: field,
      value: statistics.byField[field],
      x: index
    }));
    
    return data;
  };

  const fieldLineChartData = generateFieldLineChartData();

  return (
    <div className="app-container">
      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => closeNotification(notification.id)}
          />
        ))}
      </div>

      <header className="app-header">
        <div className="header-content">
          <FaGraduationCap className="header-icon" />
          <h1>Gestion des Étudiants</h1>
          <div className="header-animated-icons">
            <FaUsers className="animated-icon icon-1" />
            <FaBook className="animated-icon icon-2" />
            <FaChartBar className="animated-icon icon-3" />
            <FaIdCard className="animated-icon icon-4" />
          </div>
        </div>
        <nav className="nav-tabs">
          <button 
            className={activeTab === 'home' ? 'active' : ''}
            onClick={() => setActiveTab('home')}
          >
            <FaHome /> Accueil
          </button>
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaChartBar /> Statistiques
          </button>
          <button 
            className={activeTab === 'list' ? 'active' : ''}
            onClick={() => setActiveTab('list')}
          >
            <FaList /> Liste
          </button>
        </nav>
      </header>

      {/* Page d'Accueil */}
      {activeTab === 'home' && (
        <div className="home-container">
          <section className="hero-section">
            <div className="hero-content">
              <FaGraduationCap className="hero-icon" />
              <h1 className="hero-title">Gestion des Étudiants</h1>
              <p className="hero-subtitle">
                Une application moderne et intuitive pour gérer efficacement vos étudiants, 
                suivre leurs parcours académiques et analyser les statistiques en temps réel.
              </p>
            </div>
          </section>

          <section className="features-section">
            <h2 className="section-title">Fonctionnalités</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <FaUsers />
                </div>
                <h3>Gestion Complète</h3>
                <p>Créez, modifiez et supprimez facilement les informations de vos étudiants avec une interface intuitive.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <FaBook />
                </div>
                <h3>Organisation par Filière</h3>
                <p>Organisez et suivez vos étudiants par filière d'étude pour une meilleure gestion académique.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <FaIdCard />
                </div>
                <h3>Suivi par Année</h3>
                <p>Suivez les étudiants par niveau académique et gérez leur progression année par année.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <FaChartBar />
                </div>
                <h3>Statistiques Avancées</h3>
                <p>Visualisez les données avec des graphiques interactifs et des analyses détaillées.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <FaBirthdayCake />
                </div>
                <h3>Analyse des Âges</h3>
                <p>Analysez la répartition par tranche d'âge pour mieux comprendre votre population étudiante.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <FaEnvelope />
                </div>
                <h3>Gestion des Contacts</h3>
                <p>Gérez les coordonnées et informations de contact de tous vos étudiants en un seul endroit.</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Page Statistiques */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-container">
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <h3>Total Étudiants</h3>
                <p className="stat-value">{statistics?.total || 0}</p>
              </div>
            </div>

            <div className="stat-card fields">
              <div className="stat-icon">
                <FaBook />
              </div>
              <div className="stat-content">
                <h3>Filières</h3>
                <p className="stat-value">{statistics?.byField ? Object.keys(statistics.byField).length : 0}</p>
              </div>
            </div>

            <div className="stat-card years">
              <div className="stat-icon">
                <FaIdCard />
              </div>
              <div className="stat-content">
                <h3>Années</h3>
                <p className="stat-value">{statistics?.byYear ? Object.keys(statistics.byYear).length : 0}</p>
              </div>
            </div>

            <div className="stat-card age">
              <div className="stat-icon">
                <FaBirthdayCake />
              </div>
              <div className="stat-content">
                <h3>Âge Moyen</h3>
                <p className="stat-value">{statistics?.averageAge || 0} ans</p>
              </div>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-card">
              <h3><FaChartBar /> Répartition par Filière</h3>
              <div className="chart-content">
                {statistics?.byField && Object.keys(statistics.byField).length > 0 ? (
                  <div className="bar-chart">
                    {Object.entries(statistics.byField).map(([field, count]) => (
                      <div key={field} className="bar-item">
                        <div className="bar-label">{field}</div>
                        <div className="bar-wrapper">
                          <div 
                            className="bar" 
                            style={{ width: `${(count / statistics.total) * 100}%` }}
                          >
                            <span className="bar-value">{count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">Aucune donnée disponible</p>
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3><FaChartBar /> Répartition par Année</h3>
              <div className="chart-content">
                {statistics?.byYear && Object.keys(statistics.byYear).length > 0 ? (
                  <div className="bar-chart">
                    {Object.entries(statistics.byYear).map(([year, count]) => (
                      <div key={year} className="bar-item">
                        <div className="bar-label">{year}</div>
                        <div className="bar-wrapper">
                          <div 
                            className="bar" 
                            style={{ width: `${(count / statistics.total) * 100}%` }}
                          >
                            <span className="bar-value">{count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">Aucune donnée disponible</p>
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3><FaChartPie /> Répartition par Âge</h3>
              <div className="chart-content">
                {statistics?.byAge && Object.keys(statistics.byAge).length > 0 ? (
                  <div className="pie-chart">
                    {Object.entries(statistics.byAge).map(([ageRange, count], index) => {
                      const total = Object.values(statistics.byAge).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                      const colors = ['#8b5cf6', '#ec4899', '#3b82f6'];
                      return (
                        <div key={ageRange} className="pie-item">
                          <div className="pie-segment" style={{
                            background: `conic-gradient(${colors[index % colors.length]} 0% ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}% 100%)`,
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}>
                            <div className="pie-center">
                              <span className="pie-percentage">{percentage}%</span>
                            </div>
                          </div>
                          <div className="pie-info">
                            <div className="pie-label">{ageRange}</div>
                            <div className="pie-count">{count} étudiants</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="no-data">Aucune donnée disponible</p>
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3><FaChartLine /> Répartition par Filière</h3>
              <div className="chart-content">
                {fieldLineChartData.length > 0 ? (
                  <div className="line-chart">
                    <svg viewBox="0 0 800 300" className="line-chart-svg">
                      <defs>
                        <linearGradient id="lineGradientFieldDashboard" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <g className="chart-grid">
                        {[0, 1, 2, 3, 4, 5].map(i => (
                          <line key={i} x1="50" y1={50 + i * 50} x2="750" y2={50 + i * 50} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                        ))}
                      </g>
                      {fieldLineChartData.length > 1 && (
                        <>
                          <polyline
                            fill="url(#lineGradientFieldDashboard)"
                            stroke="#ec4899"
                            strokeWidth="3"
                            points={fieldLineChartData.map((d, i) => {
                              const maxValue = Math.max(...fieldLineChartData.map(d => d.value));
                              const x = 50 + (i * (700 / Math.max(1, fieldLineChartData.length - 1)));
                              const y = 250 - (d.value / maxValue * 200);
                              return `${x},${y}`;
                            }).join(' ')}
                          />
                          <polyline
                            fill="none"
                            stroke="#ec4899"
                            strokeWidth="3"
                            points={fieldLineChartData.map((d, i) => {
                              const maxValue = Math.max(...fieldLineChartData.map(d => d.value));
                              const x = 50 + (i * (700 / Math.max(1, fieldLineChartData.length - 1)));
                              const y = 250 - (d.value / maxValue * 200);
                              return `${x},${y}`;
                            }).join(' ')}
                          />
                        </>
                      )}
                      {fieldLineChartData.map((d, i) => {
                        const maxValue = Math.max(...fieldLineChartData.map(d => d.value));
                        const x = 50 + (i * (700 / Math.max(1, fieldLineChartData.length - 1)));
                        const y = 250 - (d.value / maxValue * 200);
                        const fieldName = d.field.length > 8 ? d.field.substring(0, 8) + '...' : d.field;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="5" fill="#ec4899" />
                            <text x={x} y={280} textAnchor="middle" fontSize="11" fill="#d1d5db">{fieldName}</text>
                            <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fill="#ec4899" fontWeight="bold">{d.value}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                ) : (
                  <p className="no-data">Aucune donnée disponible</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Liste */}
      {activeTab === 'list' && (
        <div className="students-container">
          <div className="list-header">
            <h2><FaUsers /> Liste des Étudiants ({students.length})</h2>
            <button className="btn-primary" onClick={handleOpenCreateModal}>
              <FaUserPlus /> Ajouter un Étudiant
            </button>
          </div>
          
          {loading && students.length === 0 ? (
            <p>Chargement...</p>
          ) : students.length === 0 ? (
            <p className="no-data">Aucun étudiant trouvé. Ajoutez votre premier étudiant!</p>
          ) : (
            <div className="students-grid">
              {students.map((student) => (
                <div key={student.id} className="student-card">
                  <div className="student-header">
                    <div className="student-avatar">
                      <FaGraduationCap />
                    </div>
                    <div className="student-name">
                      <h3>{student.firstName} {student.lastName}</h3>
                      <p className="student-email"><FaEnvelope /> {student.email}</p>
                    </div>
                  </div>
                  <div className="student-details">
                    <p><FaBook /> <strong>Filière:</strong> {student.field}</p>
                    <p><FaIdCard /> <strong>Année:</strong> {student.year}</p>
                    <p><FaCalendarAlt /> <strong>Âge:</strong> {calculateAge(student.dateOfBirth)} ans</p>
                    {student.phoneNumber && (
                      <p><FaPhone /> {student.phoneNumber}</p>
                    )}
                    {student.address && (
                      <p><FaMapMarkerAlt /> {student.address}</p>
                    )}
                  </div>
                  <div className="student-actions">
                    <button onClick={() => handleOpenEditModal(student)} className="btn-edit">
                      <FaEdit /> Modifier
                    </button>
                    <button onClick={() => handleDelete(student.id)} className="btn-delete">
                      <FaTrash /> Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Page Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-container">
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <h3>Total Étudiants</h3>
                <p className="stat-value">{statistics?.total || 0}</p>
              </div>
            </div>

            <div className="stat-card fields">
              <div className="stat-icon">
                <FaBook />
              </div>
              <div className="stat-content">
                <h3>Filières</h3>
                <p className="stat-value">{statistics?.byField ? Object.keys(statistics.byField).length : 0}</p>
              </div>
            </div>

            <div className="stat-card years">
              <div className="stat-icon">
                <FaIdCard />
              </div>
              <div className="stat-content">
                <h3>Années</h3>
                <p className="stat-value">{statistics?.byYear ? Object.keys(statistics.byYear).length : 0}</p>
              </div>
            </div>

            <div className="stat-card age">
              <div className="stat-icon">
                <FaBirthdayCake />
              </div>
              <div className="stat-content">
                <h3>Âge Moyen</h3>
                <p className="stat-value">{statistics?.averageAge || 0} ans</p>
              </div>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-card">
              <h3><FaChartBar /> Répartition par Filière</h3>
              <div className="chart-content">
                {statistics?.byField && Object.keys(statistics.byField).length > 0 ? (
                  <div className="bar-chart">
                    {Object.entries(statistics.byField).map(([field, count]) => (
                      <div key={field} className="bar-item">
                        <div className="bar-label">{field}</div>
                        <div className="bar-wrapper">
                          <div 
                            className="bar" 
                            style={{ width: `${(count / statistics.total) * 100}%` }}
                          >
                            <span className="bar-value">{count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">Aucune donnée disponible</p>
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3><FaChartBar /> Répartition par Année</h3>
              <div className="chart-content">
                {statistics?.byYear && Object.keys(statistics.byYear).length > 0 ? (
                  <div className="bar-chart">
                    {Object.entries(statistics.byYear).map(([year, count]) => (
                      <div key={year} className="bar-item">
                        <div className="bar-label">{year}</div>
                        <div className="bar-wrapper">
                          <div 
                            className="bar" 
                            style={{ width: `${(count / statistics.total) * 100}%` }}
                          >
                            <span className="bar-value">{count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">Aucune donnée disponible</p>
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3><FaChartPie /> Répartition par Âge</h3>
              <div className="chart-content">
                {statistics?.byAge && Object.keys(statistics.byAge).length > 0 ? (
                  <div className="pie-chart">
                    {Object.entries(statistics.byAge).map(([ageRange, count], index) => {
                      const total = Object.values(statistics.byAge).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                      const colors = ['#667eea', '#f093fb', '#4facfe'];
                      return (
                        <div key={ageRange} className="pie-item">
                          <div className="pie-segment" style={{
                            background: `conic-gradient(${colors[index % colors.length]} 0% ${percentage}%, #e0e0e0 ${percentage}% 100%)`,
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}>
                            <div className="pie-center">
                              <span className="pie-percentage">{percentage}%</span>
                            </div>
                          </div>
                          <div className="pie-info">
                            <div className="pie-label">{ageRange}</div>
                            <div className="pie-count">{count} étudiants</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="no-data">Aucune donnée disponible</p>
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3><FaChartLine /> Répartition par Filière</h3>
              <div className="chart-content">
                {fieldLineChartData.length > 0 ? (
                  <div className="line-chart">
                    <svg viewBox="0 0 800 300" className="line-chart-svg">
                      <defs>
                        <linearGradient id="lineGradientFieldDashboard" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f093fb" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#f093fb" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <g className="chart-grid">
                        {[0, 1, 2, 3, 4, 5].map(i => (
                          <line key={i} x1="50" y1={50 + i * 50} x2="750" y2={50 + i * 50} stroke="#e0e0e0" strokeWidth="1" />
                        ))}
                      </g>
                      {fieldLineChartData.length > 1 && (
                        <>
                          <polyline
                            fill="url(#lineGradientFieldDashboard)"
                            stroke="#f093fb"
                            strokeWidth="3"
                            points={fieldLineChartData.map((d, i) => {
                              const maxValue = Math.max(...fieldLineChartData.map(d => d.value));
                              const x = 50 + (i * (700 / Math.max(1, fieldLineChartData.length - 1)));
                              const y = 250 - (d.value / maxValue * 200);
                              return `${x},${y}`;
                            }).join(' ')}
                          />
                          <polyline
                            fill="none"
                            stroke="#f093fb"
                            strokeWidth="3"
                            points={fieldLineChartData.map((d, i) => {
                              const maxValue = Math.max(...fieldLineChartData.map(d => d.value));
                              const x = 50 + (i * (700 / Math.max(1, fieldLineChartData.length - 1)));
                              const y = 250 - (d.value / maxValue * 200);
                              return `${x},${y}`;
                            }).join(' ')}
                          />
                        </>
                      )}
                      {fieldLineChartData.map((d, i) => {
                        const maxValue = Math.max(...fieldLineChartData.map(d => d.value));
                        const x = 50 + (i * (700 / Math.max(1, fieldLineChartData.length - 1)));
                        const y = 250 - (d.value / maxValue * 200);
                        const fieldName = d.field.length > 8 ? d.field.substring(0, 8) + '...' : d.field;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="5" fill="#f093fb" />
                            <text x={x} y={280} textAnchor="middle" fontSize="11" fill="#666">{fieldName}</text>
                            <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fill="#f093fb" fontWeight="bold">{d.value}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                ) : (
                  <p className="no-data">Aucune donnée disponible</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour Ajouter/Modifier */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingStudent ? <><FaEdit /> Modifier l'étudiant</> : <><FaUserPlus /> Ajouter un étudiant</>}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={editingStudent ? handleUpdate : handleCreate} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Prénom"
                  />
                </div>
                
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="email@example.com"
                  />
                </div>
                
                <div className="form-group">
                  <label>Date de naissance *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Filière *</label>
                  <select
                    name="field"
                    value={formData.field}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Sélectionner une filière</option>
                    <option value="Informatique">Informatique</option>
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Physique">Physique</option>
                    <option value="Chimie">Chimie</option>
                    <option value="Biologie">Biologie</option>
                    <option value="Économie">Économie</option>
                    <option value="Droit">Droit</option>
                    <option value="Lettres">Lettres</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Année d'étude *</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Sélectionner une année</option>
                    <option value="1">1ère année</option>
                    <option value="2">2ème année</option>
                    <option value="3">3ème année</option>
                    <option value="4">4ème année</option>
                    <option value="5">5ème année</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                
                <div className="form-group">
                  <label>Adresse</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Adresse complète"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Chargement...' : (editingStudent ? 'Mettre à jour' : 'Créer')}
                </button>
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
