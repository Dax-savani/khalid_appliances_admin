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
    InputLabel,
    CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const API_URL = "https://f8mrd06dn9.execute-api.ap-south-1.amazonaws.com/api/slider";

function Slider() {
    const [sliders, setSliders] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentSlider, setCurrentSlider] = useState({ title: "", description: "", image: null });
    const [previewImage, setPreviewImage] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false); // Loading state for add/update

    useEffect(() => {
        fetchSliders();
    }, []);

    const fetchSliders = () => {
        setLoading(true);
        axios
            .get(API_URL)
            .then((response) => setSliders(response.data.data))
            .catch((error) => console.error("Error fetching sliders:", error))
            .finally(() => setLoading(false));
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this slider?")) {
            axios
                .delete(`${API_URL}/${id}`)
                .then(() => {
                    setSliders((prev) => prev.filter((slider) => slider._id !== id));
                })
                .catch((error) => console.error("Error deleting slider:", error));
        }
    };

    const handleOpen = (slider = { title: "", description: "", image: null }) => {
        setCurrentSlider(slider);
        setPreviewImage(slider.image || null);
        setEditMode(!!slider._id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentSlider({ title: "", description: "", image: null });
        setPreviewImage(null);
        setSubmitLoading(false);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setCurrentSlider({ ...currentSlider, image: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = () => {
        setSubmitLoading(true); // Start loading
        const formData = new FormData();
        formData.append("title", currentSlider.title);
        formData.append("description", currentSlider.description);
        if (currentSlider.image instanceof File) {
            formData.append("image", currentSlider.image);
        }

        const request = editMode
            ? axios.put(`${API_URL}/${currentSlider._id}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
            : axios.post(API_URL, formData, { headers: { "Content-Type": "multipart/form-data" } });

        request
            .then(() => {
                fetchSliders();
                handleClose();
            })
            .catch((error) => console.error("Error adding/updating slider:", error))
            .finally(() => setSubmitLoading(false)); // Stop loading
    };

    return (
        <Container maxWidth="lg" sx={{ marginTop: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", letterSpacing: 1 }}>
                    Slider Management
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Add Slider
                </Button>
            </Box>

            {loading ? (
                <Typography>Loading sliders...</Typography>
            ) : (
                <Grid container spacing={2}>
                    {sliders.length > 0 ? (
                        sliders.map((slider) => (
                            <Grid item xs={12} sm={6} md={4} key={slider._id}>
                                <Card variant="outlined" sx={{ position: "relative", p: 2 }}>
                                    {/* Icons Positioned Absolutely in Top-Right Corner */}
                                    <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 1 }}>
                                        <IconButton onClick={() => handleOpen(slider)} sx={{ color: "blue" }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(slider._id)} sx={{ color: "red" }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>

                                    <CardContent>
                                        {/* Title and Description */}
                                        <Typography variant="h6" sx={{ mb: 1 }}>{slider.title}</Typography>
                                        <Typography color="text.secondary">{slider.description}</Typography>

                                        {/* Image with Fixed Height */}
                                        <Box sx={{ textAlign: "center", mt: 2 }}>
                                            <img
                                                src={slider.image}
                                                alt={slider.title}
                                                width="100%"
                                                height="200px"
                                                style={{ objectFit: "cover", borderRadius: 8 }}
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography variant="body1" color="text.secondary">
                            No sliders found.
                        </Typography>
                    )}
                </Grid>
            )}

            {/* Dialog for Add/Edit Slider */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{editMode ? "Edit Slider" : "Add New Slider"}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Title"
                        fullWidth
                        margin="dense"
                        value={currentSlider.title}
                        onChange={(e) => setCurrentSlider({ ...currentSlider, title: e.target.value })}
                    />
                    <TextField
                        label="Description"
                        fullWidth
                        margin="dense"
                        value={currentSlider.description}
                        onChange={(e) => setCurrentSlider({ ...currentSlider, description: e.target.value })}
                    />

                    <Box sx={{ mt: 2, textAlign: "center" }}>
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Preview"
                                style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: 8 }}
                            />
                        )}
                        <InputLabel htmlFor="image-upload" sx={{ mt: 2 }}>
                            Upload Image
                        </InputLabel>
                        <Button
                            variant="contained"
                            component="label"
                            sx={{ mt: 1 }}
                            startIcon={<CloudUploadIcon />}
                        >
                            Choose File
                            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary" disabled={submitLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={submitLoading}
                        startIcon={submitLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {submitLoading ? "Processing..." : editMode ? "Update" : "Add"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Slider;
