import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Box,
    IconButton,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    CircularProgress,
    Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const API_URL = "https://f8mrd06dn9.execute-api.ap-south-1.amazonaws.com/api/testimonial";

function Testimonial() {
    const [testimonials, setTestimonials] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState({
        name: "",
        designation: "",
        image: null,
        message: "",
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = () => {
        setLoading(true);
        axios
            .get(API_URL)
            .then((response) => setTestimonials(response.data.data))
            .catch((error) => console.error("Error fetching testimonials:", error))
            .finally(() => setLoading(false));
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this testimonial?")) {
            axios
                .delete(`${API_URL}/${id}`)
                .then(() => {
                    setTestimonials((prev) => prev.filter((testimonial) => testimonial._id !== id));
                })
                .catch((error) => console.error("Error deleting testimonial:", error));
        }
    };

    const handleOpen = (testimonial = { name: "", designation: "", image: null, message: "" }) => {
        setCurrentTestimonial(testimonial);
        setPreviewImage(testimonial.image || null);
        setEditMode(!!testimonial._id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentTestimonial({ name: "", designation: "", image: null, message: "" });
        setPreviewImage(null);
        setSubmitLoading(false);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setCurrentTestimonial({ ...currentTestimonial, image: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = () => {
        setSubmitLoading(true);
        const formData = new FormData();
        formData.append("name", currentTestimonial.name);
        formData.append("designation", currentTestimonial.designation);
        formData.append("message", currentTestimonial.message);
        if (currentTestimonial.image instanceof File) {
            formData.append("image", currentTestimonial.image);
        }

        const request = editMode
            ? axios.put(`${API_URL}/${currentTestimonial._id}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
            : axios.post(API_URL, formData, { headers: { "Content-Type": "multipart/form-data" } });

        request
            .then(() => {
                fetchTestimonials();
                handleClose();
            })
            .catch((error) => console.error("Error adding/updating testimonial:", error))
            .finally(() => setSubmitLoading(false));
    };

    return (
        <Container maxWidth="lg" sx={{ marginTop: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", letterSpacing: 1 }}>
                        Testimonial Management
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                        Add Testimonial
                    </Button>
                </Box>


            {loading ? (
                <CircularProgress sx={{ display: "block", mx: "auto" }} />
            ) : (
                <Grid container spacing={3}>
                    {testimonials.map((testimonial) => (
                        <Grid item xs={12} sm={6} key={testimonial._id}>
                            <Card variant="outlined" sx={{ padding: 2, borderRadius: 2, boxShadow: 3, textAlign: "center" }}>
                                <Avatar
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    sx={{ width: 70, height: 70, mx: "auto", mb: 1, border: "2px solid #ddd" }}
                                />
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>{testimonial.name}</Typography>
                                    <Typography color="text.secondary" sx={{ fontSize: 14 }}>{testimonial.designation}</Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>{testimonial.message}</Typography>
                                </CardContent>
                                <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                                    <IconButton onClick={() => handleOpen(testimonial)} sx={{ color: "blue" }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(testimonial._id)} sx={{ color: "red" }}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Dialog for Add/Edit Testimonial */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>{editMode ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
                <DialogContent>
                    <TextField label="Name" fullWidth margin="dense" value={currentTestimonial.name} onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, name: e.target.value })} />
                    <TextField label="Designation" fullWidth margin="dense" value={currentTestimonial.designation} onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, designation: e.target.value })} />
                    <TextField label="Message" fullWidth multiline rows={3} margin="dense" value={currentTestimonial.message} onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, message: e.target.value })} />
                    <Box sx={{ mt: 2, textAlign: "center" }}>
                        {previewImage && <Avatar src={previewImage} sx={{ width: 80, height: 80, mb: 2 }} />}
                        <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                            Choose File
                            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary" startIcon={submitLoading ? <CircularProgress size={20} color="inherit" /> : null}>{submitLoading ? "Processing..." : editMode ? "Update" : "Add"}</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Testimonial;
