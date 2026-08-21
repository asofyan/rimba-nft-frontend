import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import api, { getErrorMessage } from '../api';
import { isAdmin } from '../auth';

const Gallery = () => {
  const [nfts, setNfts] = useState(null);
  const [error, setError] = useState('');
  const [mintingId, setMintingId] = useState(null);
  const [mintResult, setMintResult] = useState(null);
  const admin = isAdmin();

  const loadNfts = () => {
    api
      .get('/api/nfts')
      .then((res) => setNfts(res.data))
      .catch((err) => setError(getErrorMessage(err, 'Failed to load NFTs')));
  };

  useEffect(loadNfts, []);

  const handleMint = async (nft) => {
    setMintingId(nft._id);
    setMintResult(null);
    try {
      const res = await api.post('/api/nfts/mint', { metadataURI: nft.metadataURL });
      setMintResult({
        type: 'success',
        text: `NFT minted! Tx: ${String(res.data.receipt.transactionHash).slice(0, 18)}…`,
      });
      loadNfts();
    } catch (err) {
      setMintResult({ type: 'danger', text: getErrorMessage(err, 'Minting failed') });
    } finally {
      setMintingId(null);
    }
  };

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!nfts) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading…</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>NFT Gallery</h2>
        {admin && (
          <Button as={Link} to="/nfts/new" variant="success">
            + Upload NFT
          </Button>
        )}
      </div>

      {mintResult && (
        <Alert variant={mintResult.type} dismissible onClose={() => setMintResult(null)}>
          {mintResult.text}
        </Alert>
      )}

      {nfts.length === 0 ? (
        <Alert variant="info">
          No NFTs yet.{admin && ' Upload your first asset to get started!'}
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {nfts.map((nft) => (
            <Col key={nft._id}>
              <Card className="h-100">
                {nft.image && (
                  <Card.Img
                    variant="top"
                    src={nft.image}
                    alt={nft.name}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start">
                    <Card.Title>{nft.name}</Card.Title>
                    <Badge bg={nft.minted ? 'success' : 'secondary'}>
                      {nft.minted ? 'Minted' : 'Not minted'}
                    </Badge>
                  </div>
                  <Card.Text className="text-muted flex-grow-1">{nft.description}</Card.Text>

                  {nft.bidPrice != null && (
                    <Card.Text className="mb-2">
                      <strong>Bid price:</strong> {nft.bidPrice} ETH
                    </Card.Text>
                  )}

                  {Array.isArray(nft.attributes) && nft.attributes.length > 0 && (
                    <div className="mb-3">
                      {nft.attributes.map((attr, i) => (
                        <Badge bg="light" text="dark" className="me-1 mb-1 border" key={i}>
                          {attr.trait_type}: {attr.value}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {admin && (
                    <div className="d-flex gap-2 mt-auto">
                      {!nft.minted && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleMint(nft)}
                          disabled={mintingId === nft._id}
                        >
                          {mintingId === nft._id ? 'Minting…' : 'Mint'}
                        </Button>
                      )}
                      <Button as={Link} to={`/nfts/${nft._id}/edit`} variant="outline-secondary" size="sm">
                        Edit
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Gallery;
