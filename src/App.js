import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Logout from './components/Logout';
import Register from './components/Register';
import Gallery from './components/Gallery';
import NFTForm from './components/NFTForm';
import PrivateRoute from './components/PrivateRoute';
import Users from './components/Users';
import { getUser, canSell, isSuperAdmin, logout, ROLES } from './auth';

const Navigation = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="sm">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">
          🌳 Rimba NFT
        </Navbar.Brand>
        <Nav className="me-auto">
          {user && (
            <>
              <Nav.Link as={Link} to="/nfts">
                Gallery
              </Nav.Link>
              {canSell() && (
                <Nav.Link as={Link} to="/nfts/new">
                  Upload
                </Nav.Link>
              )}
              {isSuperAdmin() && (
                <Nav.Link as={Link} to="/users">
                  Users
                </Nav.Link>
              )}
            </>
          )}
        </Nav>
        {user ? (
          <Button variant="outline-light" size="sm" onClick={handleLogout}>
            Logout ({user.username})
          </Button>
        ) : (
          <Nav>
            <Nav.Link as={Link} to="/login">
              Login
            </Nav.Link>
          </Nav>
        )}
      </Container>
    </Navbar>
  );
};

const App = () => (
  <Router>
    <Navigation />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/logout" element={<Logout />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/nfts"
        element={
          <PrivateRoute>
            <Gallery />
          </PrivateRoute>
        }
      />
      <Route
        path="/nfts/new"
        element={
          <PrivateRoute roles={[ROLES.SUPERADMIN, ROLES.SUBSCRIBER]}>
            <NFTForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/nfts/:id/edit"
        element={
          <PrivateRoute roles={[ROLES.SUPERADMIN, ROLES.SUBSCRIBER]}>
            <NFTForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute roles={[ROLES.SUPERADMIN]}>
            <Users />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Login />} /> {/* Default route to login */}
    </Routes>
  </Router>
);

export default App;
