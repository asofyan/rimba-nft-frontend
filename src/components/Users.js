import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import api, { getErrorMessage } from '../api';
import { getUser } from '../auth';

// Halaman status semua user — hanya untuk SuperAdmin.
const Users = () => {
  const me = getUser();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadUsers = () => {
    api
      .get('/api/users/status')
      .then((res) => setUsers(res.data))
      .catch((err) => setError(getErrorMessage(err, 'Failed to load users')));
  };

  useEffect(loadUsers, []);

  const toggleActive = async (user) => {
    setError('');
    setNotice('');
    setBusyId(user.id);
    try {
      if (user.isActive) {
        await api.delete(`/api/users/${user.id}`);
        setNotice(`${user.username} deactivated.`);
      } else {
        await api.put(`/api/users/${user.id}/reactivate`);
        setNotice(`${user.username} reactivated.`);
      }
      loadUsers();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update user'));
    } finally {
      setBusyId(null);
    }
  };

  const formatEth = (balance) => (balance === null ? '—' : `${Number(balance).toFixed(4)} ETH`);
  const formatDate = (value) => (value ? new Date(value).toLocaleString() : '—');

  if (error && !users) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!users) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading…</span>
        </Spinner>
      </Container>
    );
  }

  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <Container className="mt-4">
      <h2>Users</h2>
      <p className="text-muted">
        {users.length} user · {activeCount} active. Balances and NFT counts are read
        from the local chain.
      </p>

      {error && <Alert variant="danger">{error}</Alert>}
      {notice && <Alert variant="success">{notice}</Alert>}

      <Table striped bordered hover responsive size="sm" className="align-middle">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Status</th>
            <th>ETH address</th>
            <th className="text-end">Balance</th>
            <th className="text-end">NFTs</th>
            <th>Last login</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = String(user.id) === String(me?.id);
            return (
              <tr key={user.id}>
                <td>
                  {user.username} {isSelf && <Badge bg="secondary">you</Badge>}
                </td>
                <td>
                  <Badge bg={user.role === 'SuperAdmin' ? 'dark' : user.role === 'Subscriber' ? 'primary' : 'light'} text={user.role === 'Client' ? 'dark' : undefined}>
                    {user.role}
                  </Badge>
                </td>
                <td>
                  <Badge bg={user.isActive ? 'success' : 'secondary'}>
                    {user.isActive ? 'active' : 'inactive'}
                  </Badge>
                </td>
                <td>
                  <small className="text-monospace">{user.ethAddress}</small>
                </td>
                <td className="text-end">{formatEth(user.balance)}</td>
                <td className="text-end">{user.nftCount === null ? '—' : user.nftCount}</td>
                <td>{formatDate(user.lastLoginAt)}</td>
                <td>
                  <Button
                    size="sm"
                    variant={user.isActive ? 'outline-danger' : 'outline-success'}
                    disabled={isSelf || busyId === user.id}
                    title={isSelf ? 'You cannot deactivate your own account' : undefined}
                    onClick={() => toggleActive(user)}
                  >
                    {busyId === user.id ? '…' : user.isActive ? 'Deactivate' : 'Reactivate'}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};

export default Users;
