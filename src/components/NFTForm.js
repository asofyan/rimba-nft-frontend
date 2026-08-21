import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import api, { getErrorMessage } from '../api';

// Form untuk membuat (create) dan mengedit (edit) NFT.
// Mode ditentukan oleh ada/tidaknya param :id di URL.
const NFTForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', description: '', bidPrice: '', attributes: '' });
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit); // edit mode: muat data dulu
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get('/api/nfts')
      .then((res) => {
        const nft = res.data.find((n) => n._id === id);
        if (!nft) {
          setError('NFT not found');
          setLoading(false);
          return;
        }
        setForm({
          name: nft.name || '',
          description: nft.description || '',
          bidPrice: nft.bidPrice ?? '',
          attributes:
            Array.isArray(nft.attributes) && nft.attributes.length > 0
              ? JSON.stringify(nft.attributes, null, 2)
              : '',
        });
        setCurrentImage(nft.image || '');
        setLoading(false);
      })
      .catch((err) => {
        setError(getErrorMessage(err, 'Failed to load NFT'));
        setLoading(false);
      });
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi attributes JSON sebelum kirim
    let parsedAttributes;
    if (form.attributes.trim()) {
      try {
        parsedAttributes = JSON.parse(form.attributes);
      } catch {
        setError('Attributes must be valid JSON, e.g. [{"trait_type":"Species","value":"Meranti"}]');
        return;
      }
    }

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/api/nfts/${id}`, {
          name: form.name,
          description: form.description,
          bidPrice: form.bidPrice === '' ? undefined : Number(form.bidPrice),
          ...(parsedAttributes !== undefined ? { attributes: JSON.stringify(parsedAttributes) } : {}),
        });
      } else {
        const data = new FormData();
        data.append('name', form.name);
        data.append('description', form.description);
        if (form.bidPrice !== '') data.append('bidPrice', form.bidPrice);
        if (parsedAttributes !== undefined) data.append('attributes', JSON.stringify(parsedAttributes));
        if (image) data.append('image', image);

        await api.post('/api/nfts', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/nfts');
    } catch (err) {
      setError(getErrorMessage(err, isEdit ? 'Update failed' : 'Upload failed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
      <Row>
        <Col md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
          <h2>{isEdit ? 'Edit NFT' : 'Upload NFT'}</h2>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Rimba Hijau"
                required
              />
            </Form.Group>

            <Form.Group controlId="formDescription" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={form.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBidPrice" className="mb-3">
              <Form.Label>Bid Price (ETH)</Form.Label>
              <Form.Control
                type="number"
                step="0.001"
                min="0"
                name="bidPrice"
                value={form.bidPrice}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formAttributes" className="mb-3">
              <Form.Label>Attributes (JSON, optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="attributes"
                value={form.attributes}
                onChange={handleChange}
                placeholder='[{"trait_type":"Species","value":"Meranti"}]'
              />
            </Form.Group>

            {!isEdit && (
              <Form.Group controlId="formImage" className="mb-3">
                <Form.Label>Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setImage(e.target.files[0])}
                  required
                />
                <Form.Text muted>JPEG / PNG / WebP, max 5 MB.</Form.Text>
              </Form.Group>
            )}

            {isEdit && currentImage && (
              <Form.Group className="mb-3">
                <Form.Label>Current image</Form.Label>
                <div>
                  <img src={currentImage} alt="current" style={{ maxHeight: 120 }} />
                </div>
                <Form.Text muted>Image cannot be changed after upload.</Form.Text>
              </Form.Group>
            )}

            <div className="d-flex gap-2 mb-5">
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Upload'}
              </Button>
              <Button as={Link} to="/nfts" variant="outline-secondary">
                Cancel
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default NFTForm;
