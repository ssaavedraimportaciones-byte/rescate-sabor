import { useNavigate } from 'react-router-dom'
import FormularioReceta from '../components/FormularioReceta'

export default function NuevaReceta({ agregarReceta }) {
  const navigate = useNavigate()

  const manejarGuardar = (datos) => {
    const receta = agregarReceta(datos)
    navigate(`/receta/${receta.id}`)
  }

  return (
    <div className="pagina-nueva">
      <FormularioReceta onGuardar={manejarGuardar} onCancelar={() => navigate('/')} />
    </div>
  )
}
