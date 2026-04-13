import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tareas, setTareas] = useState([])
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [token, setToken] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    fetch('http://127.0.0.1:8000/tareas')
      .then(res => res.json())
      .then(data => setTareas(data))
  }, [])

  function login() {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    fetch('http://127.0.0.1:8000/login', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => setToken(data.access_token))
  }

  function agregarTarea() {
    fetch('http://127.0.0.1:8000/tareas', {
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
    fetch(`http://127.0.0.1:8000/tareas/${id}`, {
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
  fetch(`http://127.0.0.1:8000/tareas/${id}/completar`, {
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
      <div>
        <h1>Login</h1>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={login}>Iniciar sesión</button>
      </div>
    )
  }

  return (
  <div className="app-container">
    <h1>Mis Tareas</h1>
    <div className="form-agregar">
      <input placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} />
      <input placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
      <button className="btn-agregar" onClick={agregarTarea}>Agregar</button>
    </div>
    <p className="total">Total de tareas: {tareas.length}</p>
    {tareas.map((tarea) => (
      <div key={tarea.id} className={`tarea-item ${tarea.completada ? 'tarea-completada' : ''}`}>
        <p className="tarea-titulo" style={{ textDecoration: tarea.completada ? 'line-through' : 'none' }}>
          {tarea.titulo} — {tarea.descripcion} {tarea.completada && '✅'}
        </p>
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