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
  const [tareaEditando, setTareaEditando] = useState(null)
  const [tituloEdit, setTituloEdit] = useState('')
  const [descripcionEdit, setDescripcionEdit] = useState('')
  const [temaOscuro, setTemaOscuro] = useState(false)

  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token')
    if (tokenGuardado) {
      setToken(tokenGuardado)
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetch('http://localhost:8000/tareas', {
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
    fetch('http://localhost:8000/register', {
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

    fetch('http://localhost:8000/login', {
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
    fetch('http://localhost:8000/tareas', {
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
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            cerrarSesion();
            alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
          }
          throw new Error('Error al agregar la tarea');
        }
        return res.json();
      })
      .then(tarea => {
        setTareas([...tareas, tarea])
        setTitulo('')
        setDescripcion('')
        setPrioridad('media')
      })
      .catch(err => console.error(err))
  }

  function eliminarTarea(id) {
    fetch(`http://localhost:8000/tareas/${id}`, {
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
    fetch(`http://localhost:8000/tareas/${id}/completar`, {
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
  function guardarEdicion(id) {
  fetch(`http://localhost:8000/tareas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      titulo: tituloEdit,
      descripcion: descripcionEdit,
      prioridad: prioridad
    })
  })
    .then(res => {
      if (res.ok) {
        setTareas(tareas.map(tarea =>
          tarea.id === id ? {
            ...tarea,
            titulo: tituloEdit,
            descripcion: descripcionEdit,
            prioridad: prioridad
          } : tarea
        ))
        setTareaEditando(null)
        setTituloEdit('')
        setDescripcionEdit('')
        setPrioridad('media') 
      } else {
        console.error('Error al actualizar la tarea')
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

  return (
    <div className={`app-container ${temaOscuro ? 'dark-mode' : ''}`}>
      <div className="header">
        <h1>Mis Tareas</h1>
        <div className="header-buttons">
          <button className="btn-tema"
            onClick={() => setTemaOscuro(!temaOscuro)}
          >
            {temaOscuro ? '☀️' : '🌙'}
          </button>
        </div>
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

      <p className="total">Mostrando {tareasFiltradas.length} de {tareas.length} tareas</p>

      <div className="filtros">
  <button onClick={() => setFiltro('todas')} className={filtro === 'todas' ? 'filtro-activo' : ''}>Todas</button>
  <button onClick={() => setFiltro('pendientes')} className={filtro === 'pendientes' ? 'filtro-activo' : ''}>Pendientes</button>
  <button onClick={() => setFiltro('completadas')} className={filtro === 'completadas' ? 'filtro-activo' : ''}>Completadas</button>
</div>

     {tareasFiltradas.map((tarea) => (
  <div key={tarea.id} className={`tarea-item ${tarea.completada ? 'tarea-completada' : ''}`}>
    <div>
      <span className={`badge-prioridad prioridad-${tarea.prioridad}`}>{tarea.prioridad}</span>
      {tareaEditando === tarea.id ? (
        <>
          <input value={tituloEdit} onChange={e => setTituloEdit(e.target.value)} />
          <input value={descripcionEdit} onChange={e => setDescripcionEdit(e.target.value)} />
        </>
      ) : (
        <p className="tarea-titulo" style={{ textDecoration: tarea.completada ? 'line-through' : 'none' }}>
          {tarea.titulo} — {tarea.descripcion} {tarea.completada && '✅'}
        </p>
      )}
    </div>
    <div className="tarea-acciones">
      <button className="btn-eliminar" onClick={() => eliminarTarea(tarea.id)}>Eliminar</button>
      {!tarea.completada && (
        <>
          {tareaEditando === tarea.id ? (
            <button className="btn-agregar" onClick={() => guardarEdicion(tarea.id)}>💾</button>
          ) : (
            <button className="btn-agregar" onClick={() => {
              setTareaEditando(tarea.id)
              setTituloEdit(tarea.titulo)
              setDescripcionEdit(tarea.descripcion)
            }}>✏️</button>
          )}
          <button className="btn-completar" onClick={() => completarTarea(tarea.id)}>✓</button>
        </>
      )}
    </div>
  </div>
))}
    </div>
  )
}

export default App