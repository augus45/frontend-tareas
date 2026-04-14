import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tareas, setTareas] = useState([])
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [token, setToken] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [modoRegistro, setModoRegistro] = useState(false)
  const [emailRegistro, setEmailRegistro] = useState('')
  const [passwordRegistro, setPasswordRegistro] = useState('')
  const [filtro, setFiltro] = useState('todas')
  const [prioridad, setPrioridad] = useState('media')

  // Cargar token guardado al iniciar
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token')
    if (tokenGuardado) {
      setToken(tokenGuardado)
    }
  }, [])

  // Cargar tareas SOLO cuando hay token
  useEffect(() => {
    if (token) {
      fetch('https://api-tareas-production-f194.up.railway.app/tareas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => setTareas(data))
        .catch(err => console.error('Error al cargar tareas:', err))
    }
  }, [token])

  function registrar() {
    fetch('https://api-tareas-production-f194.up.railway.app/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailRegistro,
        password: passwordRegistro
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.mensaje) {
          alert('Registro exitoso, ahora inicia sesión')
          setModoRegistro(false)
        }
      })
  }

  function login() {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    fetch('https://api-tareas-production-f194.up.railway.app/login', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        setToken(data.access_token)
        localStorage.setItem('token', data.access_token)
      })
  }

  function agregarTarea() {
    fetch('https://api-tareas-production-f194.up.railway.app/tareas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        titulo, 
        descripcion,
        prioridad })
    })
      .then(res => res.json())
      .then(tarea => {
        setTareas([...tareas, tarea])
        setTitulo('')
        setDescripcion('')
        setPrioridad('media')
      })
  }

  function eliminarTarea(id) {
    fetch(`https://api-tareas-production-f194.up.railway.app/tareas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.ok) {
          setTareas(tareas.filter(tarea => tarea.id !== id))
        }
      })
  }

  function completarTarea(id) {
    fetch(`https://api-tareas-production-f194.up.railway.app/tareas/${id}/completar`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.ok) {
          setTareas(tareas.map(tarea =>
            tarea.id === id ? { ...tarea, completada: true } : tarea
          ))
        } else {
          console.error('Error al completar la tarea')
        }
      })
      .catch(err => console.error('Error:', err))
  }

  function cerrarSesion() {
    setToken(null)
    localStorage.removeItem('token')
    setTareas([])
  }
  const tareasFiltradas = tareas.filter(tarea => {
    if (filtro === 'completadas') return tarea.completada === true
    if (filtro === 'pendientes') return tarea.completada === false
    return true
  })

  // Pantalla de login/registro
  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>{modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</h1>

          {modoRegistro ? (
            <>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={emailRegistro}
                onChange={e => setEmailRegistro(e.target.value)}
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={passwordRegistro}
                onChange={e => setPasswordRegistro(e.target.value)}
              />
              <button className="btn-primario" onClick={registrar}>
                Registrarse
              </button>
              <button className="btn-secundario" onClick={() => setModoRegistro(false)}>
                ← Volver al inicio de sesión
              </button>
            </>
          ) : (
            <>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button className="btn-primario" onClick={login}>
                Iniciar sesión
              </button>
              <button className="btn-secundario" onClick={() => setModoRegistro(true)}>
                ¿No tienes cuenta? Regístrate
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Pantalla principal de tareas
  return (
    <div className="app-container">
      <div className="header">
        <h1>Mis Tareas</h1>
        <button className="btn-cerrar" onClick={cerrarSesion}>
          🚪 Cerrar sesión
        </button>
      </div>

      <div className="form-agregar">
        <select value={prioridad} onChange={e => setPrioridad(e.target.value)}>
  <option value="baja">🟢 Baja</option>
  <option value="media">🟡 Media</option>
  <option value="alta">🔴 Alta</option>
</select>
        <input
          placeholder="Título"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
        />
        <input
          placeholder="Descripción"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
        />
        <button className="btn-agregar" onClick={agregarTarea}>
          Agregar
        </button>
      </div>

      <p className="total">Total de tareas: {tareas.length}</p>

      <div className="filtros">
  <button onClick={() => setFiltro('todas')} className={filtro === 'todas' ? 'filtro-activo' : ''}>Todas</button>
  <button onClick={() => setFiltro('pendientes')} className={filtro === 'pendientes' ? 'filtro-activo' : ''}>Pendientes</button>
  <button onClick={() => setFiltro('completadas')} className={filtro === 'completadas' ? 'filtro-activo' : ''}>Completadas</button>
</div>

      {tareasFiltradas.map((tarea) => (
  <div key={tarea.id} className={`tarea-item ${tarea.completada ? 'tarea-completada' : ''}`}>
    <div>
      <span className={`badge-prioridad prioridad-${tarea.prioridad}`}>
        {tarea.prioridad}
      </span>
      <p className="tarea-titulo" style={{ textDecoration: tarea.completada ? 'line-through' : 'none' }}>
        {tarea.titulo} — {tarea.descripcion} {tarea.completada && '✅'}
      </p>
    </div>
    <div className="tarea-acciones">
      <button className="btn-eliminar" onClick={() => eliminarTarea(tarea.id)}>Eliminar</button>
      {!tarea.completada && (
        <button className="btn-completar" onClick={() => completarTarea(tarea.id)}>✓</button>
      )}
    </div>
  </div>
))}
    </div>
  )
}

export default App