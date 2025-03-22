import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Grid, Box, IconButton, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

function Inquiry() {
    const [inquiries, setInquiries] = useState([]);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = () => {
        axios.get('https://f8mrd06dn9.execute-api.ap-south-1.amazonaws.com/api/contact')
            .then(response => {
                setInquiries(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching inquiries:', error);
            });
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this inquiry?")) {
            axios.delete(`https://f8mrd06dn9.execute-api.ap-south-1.amazonaws.com/api/contact/${id}`)
                .then(() => {
                    setInquiries(prevInquiries => prevInquiries.filter(inquiry => inquiry._id !== id));
                })
                .catch(error => {
                    console.error('Error deleting inquiry:', error);
                });
        }
    };

    return (
        <Container maxWidth="md" sx={{ marginTop: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                    Inquiry List
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={fetchInquiries}
                >
                    Refresh
                </Button>
            </Box>
            <Grid container spacing={2}>
                {inquiries.length > 0 ? (
                    inquiries.map((inquiry) => (
                        <Grid item xs={12} key={inquiry._id}>
                            <Card variant="outlined" sx={{ position: 'relative' }}>
                                <IconButton
                                    onClick={() => handleDelete(inquiry._id)}
                                    sx={{ position: 'absolute', top: 8, right: 8, color: 'red' }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                                <CardContent>
                                    <Typography variant="h6" component="div">
                                        {inquiry.fullname}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Contact: {inquiry.contact}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Email: {inquiry.email}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Service Type: {inquiry.serviceType}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Message: {inquiry.message}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                                        Inquiry At: {new Date(inquiry.createdAt).toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        No inquiries found.
                    </Typography>
                )}
            </Grid>
        </Container>
    );
}

export default Inquiry;
