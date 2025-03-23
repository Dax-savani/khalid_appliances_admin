import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Container,
    TextField,
    Button,
    Card,
    CardContent,
    Typography,
    Grid,
    Modal,
    Box,
    CircularProgress, IconButton
} from "@mui/material";
import {Add, Remove} from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";

const API_URL = "https://f8mrd06dn9.execute-api.ap-south-1.amazonaws.com/api/service";

const initialValues = {
    title: "",
    subTitle: "",
    description: "",
    keyPoints: [""],
    faqs: [{ question: "", answer: "" }],
    images: []
}
const Services = () => {
    const [allServices, setAllServices] = useState([]);
    const [formData, setFormData] = useState(initialValues);
    const [selectedImages, setSelectedImages] = useState([]);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL);
            setAllServices(response.data.data);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Key Points Handling
    const handleKeyPointChange = (index, value) => {
        const updatedKeyPoints = [...formData.keyPoints];
        updatedKeyPoints[index] = value;
        setFormData({ ...formData, keyPoints: updatedKeyPoints });
    };

    const addKeyPoint = () => {
        setFormData({ ...formData, keyPoints: [...formData.keyPoints, ""] });
    };

    const removeKeyPoint = (index) => {
        const updatedKeyPoints = formData.keyPoints.filter((_, i) => i !== index);
        setFormData({ ...formData, keyPoints: updatedKeyPoints });
    };

    // FAQs Handling
    const handleFaqChange = (index, field, value) => {
        const updatedFaqs = [...formData.faqs];
        updatedFaqs[index][field] = value;
        setFormData({ ...formData, faqs: updatedFaqs });
    };

    const addFaq = () => {
        setFormData({ ...formData, faqs: [...formData.faqs, { question: "", answer: "" }] });
    };

    const removeFaq = (index) => {
        const updatedFaqs = formData.faqs.filter((_, i) => i !== index);
        setFormData({ ...formData, faqs: updatedFaqs });
    };
    const handleEdit = (service) => {
        setFormData({
            title: service.title,
            subTitle: service.subTitle,
            description: service.description,
            keyPoints: service.keyPoints || [""],
            faqs: service.faqs || [{ question: "", answer: "" }],
            images: service.images || []
        });
        setEditId(service._id);
        setSelectedImages(service.images);
        setOpenModal(true);
    };
    const handleRemoveImage = (index) => {
        const updatedImages = [...selectedImages];
        updatedImages.splice(index, 1);
        setSelectedImages(updatedImages);
    };
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map((file) => URL.createObjectURL(file));

        setSelectedImages([...selectedImages, ...imageUrls]);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;

        setLoading(true);
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchServices(); // Refresh the list after deletion
        } catch (error) {
            console.error("Error deleting service:", error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("subTitle", formData.subTitle);
        data.append("keyPoints", JSON.stringify(formData.keyPoints));
        data.append("faqs", JSON.stringify(formData.faqs));
        const imageFiles = await Promise.all(
            selectedImages.map(async (image, index) => {
                if (image.startsWith("blob:")) {
                    const response = await fetch(image);
                    const blob = await response.blob();
                    return new File([blob], `image-${index}.jpg`, { type: blob.type });
                }
                return image;
            })
        );
        imageFiles.forEach((image) => data.append("images", image));

        try {
            if (editId) {
                await axios.put(`${API_URL}/${editId}`, data);
            } else {
                await axios.post(API_URL, data);
            }
            setFormData({ title: "", subTitle: "", description: "", keyPoints: [""], faqs: [{ question: "", answer: "" }], images: [] });
            setSelectedImages([]);
            setEditId(null);
            fetchServices();
            setOpenModal(false);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="lg" sx={{ marginTop: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", letterSpacing: 1 }}>
                    Manage Services
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>
                    Add Service
                </Button>
            </Box>

            <Modal open={openModal} onClose={() => {
                setOpenModal(false)
                setFormData(initialValues)
                setSelectedImages([])
            }}>
                <Box sx={{display: 'flex',justifyContent: 'center',alignItems: 'center',height: '100%'}} onClick={() => {
                    setOpenModal(false)
                    setFormData(initialValues)
                    setSelectedImages([])
                }}>
                <Box sx={{ p: 4, backgroundColor: "white", width: {sm:"50%"},height: '80vh', overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField name="title" label="Title" fullWidth value={formData.title} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField name="subTitle" label="SubTitle" fullWidth value={formData.subTitle} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField name="description" label="Description" multiline rows={4} fullWidth value={formData.description} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1" fontWeight="bold">Upload Images:</Typography>
                                <Button variant="contained" component="label" sx={{ mt: 1 }}>
                                    Upload File
                                    <input type="file" hidden multiple onChange={handleImageUpload} />
                                </Button>
                            </Grid>
                            <Grid item xs={12} container spacing={2}>
                                {selectedImages.map((img, index) => (
                                    <Grid item xs={3} key={index} sx={{ position: "relative" }}>
                                        <img src={img} alt="service" width="100%" style={{ borderRadius: 8 }} />
                                        <IconButton onClick={() => handleRemoveImage(index)} sx={{ position: "absolute", backgroundColor: '#fff',top: {xs:10,sm:20}, right: {xs:5,sm:10} }}>
                                            <Remove />
                                        </IconButton>
                                    </Grid>
                                ))}
                            </Grid>


                            {/* Key Points Section */}
                            <Grid item xs={12}>
                                <Typography variant="h6">Key Points</Typography>
                                {formData.keyPoints.map((point, index) => (
                                    <Grid container spacing={1} key={index} alignItems="center">
                                        <Grid item xs={10}>
                                            <TextField fullWidth value={point} onChange={(e) => handleKeyPointChange(index, e.target.value)} />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <IconButton onClick={() => removeKeyPoint(index)} color="error">
                                                <Remove />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                ))}
                                <Button onClick={addKeyPoint} startIcon={<Add />} variant="contained" sx={{ mt: 1 }}>Add Key Point</Button>
                            </Grid>

                            {/* FAQs Section */}
                            <Grid item xs={12}>
                                <Typography variant="h6">FAQs</Typography>
                                {formData.faqs.map((faq, index) => (
                                    <Grid container spacing={1} key={index} alignItems="center">
                                        <Grid item xs={5}>
                                            <TextField fullWidth label="Question" value={faq.question} onChange={(e) => handleFaqChange(index, "question", e.target.value)} />
                                        </Grid>
                                        <Grid item xs={5}>
                                            <TextField fullWidth label="Answer" value={faq.answer} onChange={(e) => handleFaqChange(index, "answer", e.target.value)} />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <IconButton onClick={() => removeFaq(index)} color="error">
                                                <Remove />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                ))}
                                <Button onClick={addFaq} startIcon={<Add />} variant="contained" sx={{ mt: 1 }}>Add FAQ</Button>
                            </Grid>

                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                                    {loading ? <CircularProgress size={24} /> : editId ? "Update" : "Create"} Service
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
                </Box>
            </Modal>

            {loading ? <CircularProgress /> : (
                <Grid container spacing={2} marginTop={4}>
                    {allServices.map((service) => (
                        <Grid item xs={12} sm={6} md={4} key={service._id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{service.title}</Typography>
                                    <Typography>{service.subTitle}</Typography>
                                    <Typography variant="body2">{service.description}</Typography>

                                    <Typography variant="body2" fontWeight="bold">Key Points:</Typography>
                                    <ul>
                                        {service.keyPoints?.map((point, index) => (
                                            <li key={index}>{point}</li>
                                        ))}
                                    </ul>

                                    <Typography variant="body2" fontWeight="bold">FAQs:</Typography>
                                    {service.faqs?.map((faq, index) => (
                                        <Typography key={index} variant="body2">{faq.question}: {faq.answer}</Typography>
                                    ))}

                                    <Grid container spacing={1} mt={1}>
                                        {service.images?.map((img, index) => (
                                            <Grid item xs={4} key={index}>
                                                <img src={img} alt="service" width="100%" style={{ borderRadius: 8 }} />
                                            </Grid>
                                        ))}
                                    </Grid>

                                    <Button onClick={() => handleEdit(service)}>Edit</Button>
                                    <Button onClick={() => handleDelete(service._id)} color="secondary">Delete</Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default Services;
