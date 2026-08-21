import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import api, { getErrorMessage } from '../api';
import { getUser, isAdmin } from '../auth';

const Dashboard = () => {
  const user = getUser();
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/api/wallet/balance')
      .then((res) => setBalance(res.data))
      .catch((err) => setError(getErrorMessage(err, 'Failed to load wallet balance')));
  }, []);

  return (
    <Container className="mt-4">
      <h2>Welcome, {user?.username || 'user'}! 👋</h2>
      <p className="text-muted">
        Role: <strong>{user?.role}</strong>
      </p>

      {error && <Alert variant="warning">{error}</Alert>}

      <Row className="mt-3">
        <Col md={6} lg={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>💰 Wallet</Card.Title>
              {balance ? (
                <>
                  <Card.Text className="text-truncate mb-1" title={balance.address}>
                    <small className="text-muted">{balance.address}</small>
                  </Card.Text>
                  <Card.Text className="fs-4 mb-0">
                    {Number(balance.balance).toFixed(4)} ETH
                  </Card.Text>
                </>
              ) : (
                !error && (
                  <Spinner animation="border" size="sm" role="status">
                    <span className="visually-hidden">Loading…</span>
                  </Spinner>
                )
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>🖼️ NFT Collection</Card.Title>
              <Card.Text>Browse all uploaded Rimba NFTs and their mint status.</Card.Text>
              <Button as={Link} to="/nfts" variant="primary">
                Open Gallery
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {isAdmin() && (
          <Col md={6} lg={4}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>⚙️ Admin</Card.Title>
                <Card.Text>Add a new NFT asset and mint it on-chain.</Card.Text>
                <Button as={Link} to="/nfts/new" variant="success">
                  Upload NFT
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Dashboard;
