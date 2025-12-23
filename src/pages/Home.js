// Home.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {
  const [pokemonList, setPokemonList] = useState([]);
  const [nextUrl, setNextUrl] = useState('https://pokeapi.co/api/v2/pokemon?limit=12');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPokemon();
  }, []);

  const fetchPokemon = async () => {
    if (loading || !nextUrl) return;
    setLoading(true);

    const response = await fetch(nextUrl);
    const data = await response.json();
    setNextUrl(data.next);

    const pokemonData = await Promise.all(
      data.results.map(async (pokemon) => {
        const res = await fetch(pokemon.url);
        const details = await res.json();
        return {
          id: details.id,
          name: details.name,
          image: details.sprites.other['official-artwork'].front_default,
          types: details.types
        };
      })
    );

    setPokemonList((prevList) => {
      const existingIds = new Set(prevList.map((p) => p.id));
      const newList = pokemonData.filter((p) => !existingIds.has(p.id));
      return [...prevList, ...newList];
    });

    setLoading(false);
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-danger mb-4 shadow">
        <div className="container">
          <span className="navbar-brand mb-0 h1 mx-auto fs-3">🔥 Pokédex</span>
        </div>
      </nav>

      <div className="container">
        <div className="row">
          {pokemonList.map((pokemon) => (
            <div className="col-md-4 col-sm-6 mb-4" key={pokemon.id}>
              <Link to={`/pokemon/${pokemon.name}`} className="text-decoration-none text-dark">

                <div className="card shadow-sm rounded-4 border-0">
                  <img
                    src={pokemon.image}
                    className="card-img-top p-3"
                    alt={pokemon.name}
                    style={{ height: '200px', objectFit: 'contain' }}
                  />
                  <div className="card-body text-center">
                    <h5 className="card-title text-capitalize">{pokemon.name}</h5>
                    <p className="text-muted">ID: #{pokemon.id}</p>
                    <div>
                      {pokemon.types.map((typeInfo, i) => (
                        <span key={i} className="badge bg-primary me-1">
                          {typeInfo.type.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {nextUrl && (
          <div className="text-center my-4">
            <button className="btn btn-primary px-4 py-2" onClick={fetchPokemon} disabled={loading}>
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
