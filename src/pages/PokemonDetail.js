import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Card, Spinner, Badge, Container, Row, Col } from 'react-bootstrap';

const PokemonDetail = () => {
  const { name } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [typeWeaknesses, setTypeWeaknesses] = useState([]);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const data = response.data;
        setPokemon(data);

        // Type weaknesses logic
        const typeUrls = data.types.map(t => t.type.url);
        const weaknesses = new Set();

        for (const url of typeUrls) {
          const typeRes = await axios.get(url);
          typeRes.data.damage_relations.double_damage_from.forEach(d => weaknesses.add(d.name));
        }

        setTypeWeaknesses([...weaknesses]);

        // Region logic
        const speciesRes = await axios.get(data.species.url);
        const generation = speciesRes.data.generation.name;

        const regionMap = {
          'generation-i': 'Kanto',
          'generation-ii': 'Johto',
          'generation-iii': 'Hoenn',
          'generation-iv': 'Sinnoh',
          'generation-v': 'Unova',
          'generation-vi': 'Kalos',
          'generation-vii': 'Alola',
          'generation-viii': 'Galar',
          'generation-ix': 'Paldea'
        };

        setRegion(regionMap[generation] || 'Unknown');
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [name]);

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }

  if (!pokemon) {
    return <div className="text-center mt-5">Pokémon not found.</div>;
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-lg border-0 rounded-4 text-center p-4 bg-light">
            <Card.Img 
              variant="top" 
              src={pokemon.sprites.other['official-artwork'].front_default} 
              alt={pokemon.name} 
              style={{ maxHeight: '300px', objectFit: 'contain' }} 
            />
            <Card.Body>
              <Card.Title className="fs-3 text-capitalize">{pokemon.name}</Card.Title>

              <h5>Type</h5>
              {pokemon.types.map((typeObj, idx) => (
                <Badge bg="primary" key={idx} className="me-2 text-capitalize">
                  {typeObj.type.name}
                </Badge>
              ))}

              <hr />

              <h5>Weaknesses</h5>
              {typeWeaknesses.map((type, idx) => (
                <Badge bg="danger" key={idx} className="me-2 text-capitalize">
                  {type}
                </Badge>
              ))}

              <hr />

              <h5>Region</h5>
              <p>{region}</p>

              <h5>Height</h5>
              <p>{pokemon.height / 10} m</p>

              <h5>Weight</h5>
              <p>{pokemon.weight / 10} kg</p>

              <div className="mt-3">
                <h5>Base Stats</h5>
                <ul className="list-group">
                  {pokemon.stats.map((s, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      {s.stat.name}
                      <span className="badge bg-warning text-dark">{s.base_stat}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PokemonDetail;
