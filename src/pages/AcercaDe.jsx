export default function AcercaDe() {
  return (
    <div className="pagina-acerca">
      <h1>Acerca de Rescate Sabor</h1>

      <section className="acerca-seccion">
        <h2>🍽️ Nuestra Mision</h2>
        <p>
          Rescate Sabor nace de la necesidad de preservar y difundir las recetas tradicionales
          de Latinoamerica. Cada plato cuenta una historia, cada ingrediente conecta con
          nuestras raices y cada preparacion es un acto de amor y memoria.
        </p>
      </section>

      <section className="acerca-seccion">
        <h2>🌎 Por que importa</h2>
        <p>
          La globalizacion y la comida rapida amenazan con hacer desaparecer preparaciones
          que llevan siglos transmitiendose de generacion en generacion. Rescatar estos
          sabores es rescatar nuestra identidad cultural.
        </p>
      </section>

      <section className="acerca-seccion">
        <h2>📖 Como funciona</h2>
        <ul className="acerca-lista">
          <li><strong>Explora</strong> — Navega por recetas de diferentes paises y categorias</li>
          <li><strong>Guarda</strong> — Marca tus recetas favoritas para encontrarlas facilmente</li>
          <li><strong>Contribuye</strong> — Agrega las recetas de tu familia y tu region</li>
          <li><strong>Comparte</strong> — Ayuda a difundir nuestra herencia culinaria</li>
        </ul>
      </section>

      <section className="acerca-seccion">
        <h2>🫶 Nuestros Valores</h2>
        <div className="valores-grid">
          <div className="valor-card">
            <span>🏛️</span>
            <h3>Tradicion</h3>
            <p>Respetamos las recetas originales y sus metodos ancestrales de preparacion.</p>
          </div>
          <div className="valor-card">
            <span>🤝</span>
            <h3>Comunidad</h3>
            <p>Creemos que la cocina une a las personas y fortalece los lazos culturales.</p>
          </div>
          <div className="valor-card">
            <span>🌱</span>
            <h3>Sostenibilidad</h3>
            <p>Promovemos el uso de ingredientes locales y tecnicas sostenibles.</p>
          </div>
          <div className="valor-card">
            <span>📚</span>
            <h3>Educacion</h3>
            <p>Cada receta incluye su contexto historico y cultural.</p>
          </div>
        </div>
      </section>

      <footer className="acerca-footer">
        <p>Rescate Sabor &copy; 2026 — Preservando nuestra herencia culinaria</p>
      </footer>
    </div>
  )
}
