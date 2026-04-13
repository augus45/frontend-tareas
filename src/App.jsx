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
  const [nombreRegistro, setNombreRegistro] = useState('')
  const [emailRegistro, setEmailRegistro] = useState('')
  const [passwordRegistro, setPasswordRegistro] = useState('')

  useEffect(() => {
  if(token) {
    fetch('https://api-tareas-production-f194.up.railway.app/tareas', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTareas(data))
  }
}, [token])

  function registrar() {
    fetch('https://api-tareas-production-f194.up.railway.app/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: emailRegistro,
        password: passwordRegistro
      })
    })
    .then(res => res.json())
    .then(data => {
      if(data.mensaje) alert('Registro exitoso, ahora inicia sesión')
      setModoRegistro(false)
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
      .then(data => setToken(data.access_token))
  }

  function agregarTarea() {
    fetch('https://api-tareas-production-f194.up.railway.app/tareas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ titulo, descripcion })
    })
      .then(res => res.json())
      .then(tarea => setTareas([...tareas, tarea]))
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
        // Actualizar el estado local
        setTareas(tareas.map(tarea => 
          tarea.id === id ? { ...tarea, completada: true } : tarea
        ))
      } else {
        console.error('Error al completar la tarea')
      }
    })
    .catch(err => console.error('Error:', err))
}

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>{modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
          
          {modoRegistro ? (
            // Formulario de registro
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
            // Formulario de login
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
    <div className="app-container">
      <div className="header">
        <h1>Mis Tareas</h1>
        <button className="btn-cerrar" onClick={cerrarSesion}>
          🚪 Cerrar sesión
        </button>
      </div>
      
      <div className="form-agregar">
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
      
      {tareas.map((tarea) => (
        <div key={tarea.id} className={`tarea-item ${tarea.completada ? 'tarea-completada' : ''}`}>
          <p className="tarea-titulo" style={{ textDecoration: tarea.completada ? 'line-through' : 'none' }}>
            {tarea.titulo} — {tarea.descripcion} {tarea.completada && '✅'}
          </p>
          <div className="tarea-acciones">
            <button className="btn-eliminar" onClick={() => eliminarTarea(tarea.id)}>
              Eliminar
            </button>
            {!tarea.completada && (
              <button className="btn-completar" onClick={() => completarTarea(tarea.id)}>
                ✓
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
 )
}

export default App