import React, {useState, useEffect} from "react";
import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    IconButton, CircularProgress, Grid, Typography, Box, Container,
} from "@mui/material";
import {Add, Delete, Edit, Remove} from "@mui/icons-material";
import axios from "axios";
import AddIcon from "@mui/icons-material/Add";

const API_URL = "https://f8mrd06dn9.execute-api.ap-south-1.amazonaws.com/api/project";

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loading2, setLoading2] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        problem: "",
        solution: {description: "", keyPoints: []},
        results: {description: "", keyPoints: []},
        images: []
    });

    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await axios.get(API_URL);
            setProjects(response.data.data);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const {name, value} = e.target;

        setFormData((prev) => {
            const keys = name.split(".");
            let updatedData = {...prev};

            let current = updatedData;
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = {...current[keys[i]]};
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;

            return updatedData;
        });
    };


    const handleArrayChange = (field, index, value) => {
        setFormData((prev) => {

            const keys = field.split(".");
            let updatedData = {...prev};

            let current = updatedData;
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = current[keys[i]] || {};
                current = current[keys[i]];
            }

            const arrayField = keys[keys.length - 1];
            current[arrayField] = Array.isArray(current[arrayField]) ? [...current[arrayField]] : [];
            current[arrayField][index] = value;

            return updatedData;
        });
    };


    const handleAddArrayItem = (field) => {
        setFormData((prev) => {
            const keys = field.split(".");
            let updatedData = {...prev};

            let current = updatedData;
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = {...current[keys[i]]};
                current = current[keys[i]];
            }

            const arrayField = keys[keys.length - 1];
            current[arrayField] = [...(current[arrayField] || []), ""];

            return updatedData;
        });
    };


    const handleDeleteArrayItem = (field, index) => {
        setFormData((prev) => {
            const keys = field.split(".");
            let updatedData = {...prev};

            let current = updatedData;
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = {...current[keys[i]]};
                current = current[keys[i]];
            }

            const arrayField = keys[keys.length - 1];
            current[arrayField] = current[arrayField].filter((_, i) => i !== index);

            return updatedData;
        });
    };


    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 4) {
            alert("Maximum 4 images allowed");
            return;
        }

        const imageUrls = files.map((file) => URL.createObjectURL(file));
        setFormData((prev) => ({...prev, images: [...prev.images, ...imageUrls]}));
    };

    const handleRemoveImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading2(true)
            const formDataPayload = new FormData();


            formDataPayload.append("title", formData.title);
            formDataPayload.append("problem", formData.problem);
            const solution = {description:formData.solution.description,keyPoints:formData.solution.keyPoints}
            const result = {description:formData.results.description,keyPoints:formData.results.keyPoints}
            formDataPayload.append("solution", JSON.stringify(solution));
            formDataPayload.append("results", JSON.stringify(result));

            const filePromises = formData.images.map(async (image, index) => {
                if (image.startsWith("blob:")) {
                    const response = await fetch(image);
                    const blob = await response.blob();
                    const file = new File([blob], `image_${index}.png`, {type: blob.type});
                    formDataPayload.append("images", file);
                } else {

                    formDataPayload.append("images", image);
                }
            });

            await Promise.all(filePromises);


            if (editId) {
                await axios.put(`${API_URL}/${editId}`, formDataPayload, {
                    headers: {"Content-Type": "multipart/form-data"}
                });
            } else {
                await axios.post(API_URL, formDataPayload, {
                    headers: {"Content-Type": "multipart/form-data"}
                });
            }

            fetchProjects();
            handleClose();
        } catch (error) {
            console.error("Error saving project:", error);
        } finally {
            setLoading2(false)
        }
    };


    const handleEdit = (project) => {
        console.log(project);
        setFormData({
            title: project.title || "",
            problem: project.problem || "",
            solution: {
                description: project.solution?.description || "",
                keyPoints: project.solution?.keyPoints || [],
            },
            results: {
                description: project.results?.description || "",
                keyPoints: project.results?.keyPoints || [],
            },
            images: project.images || [],
        });
        setEditId(project._id);
        setOpen(true);
    };


    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchProjects();
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    const handleOpen = () => {
        setEditId(null);
        setFormData({
            title: "",
            problem: "",
            solution: {description: "", keyPoints: []},
            results: {description: "", keyPoints: []},
            images: [],
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    return (
        <Container maxWidth="lg" sx={{marginTop: 4}}>
            <div>
                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
                    <Typography variant="h4" component="h1" sx={{fontWeight: "bold", letterSpacing: 1}}>
                        Manage Projects
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon/>} onClick={handleOpen}>
                        Add Project
                    </Button>
                </Box>
                {loading ? <CircularProgress/> : (
                    <List>
                        {projects.length > 0 && projects.map((project) => (
                            <ListItem key={project._id}>
                                <ListItemText primary={project.title} secondary={project.problem}/>
                                <IconButton onClick={() => handleEdit(project)}>
                                    <Edit color="primary"/>
                                </IconButton>
                                <IconButton onClick={() => handleDelete(project._id)}>
                                    <Delete color="secondary"/>
                                </IconButton>
                            </ListItem>
                        ))}
                    </List>
                )}
                <Dialog open={open} onClose={handleClose} fullWidth>
                    <DialogTitle>{editId ? "Edit Project" : "Add Project"}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    margin="dense"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Problem"
                                    name="problem"
                                    value={formData.problem}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                    margin="dense"
                                />
                            </Grid>

                            {/* Solution Section */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Solution Description"
                                    name="solution.description"
                                    value={formData.solution.description}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                    margin="dense"
                                />
                            </Grid>

                            {formData.solution.keyPoints.map((point, index) => (
                                <Grid item xs={12} key={index}>
                                    <TextField
                                        fullWidth
                                        label={`Solution KeyPoint ${index + 1}`}
                                        value={point}
                                        onChange={(e) => handleArrayChange("solution.keyPoints", index, e.target.value)}
                                        margin="dense"
                                    />
                                    <Button
                                        onClick={() => handleDeleteArrayItem("solution.keyPoints", index)}>Remove</Button>
                                </Grid>
                            ))}

                            <Grid item xs={12}>
                                <Button onClick={() => handleAddArrayItem("solution.keyPoints")}>Add KeyPoint</Button>
                            </Grid>

                            {/* Results Section */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Results Description"
                                    name="results.description"
                                    value={formData.results.description}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                    margin="dense"
                                />
                            </Grid>

                            {formData.results.keyPoints.map((point, index) => (
                                <Grid item xs={12} key={index}>
                                    <TextField
                                        fullWidth
                                        label={`Results KeyPoint ${index + 1}`}
                                        value={point}
                                        onChange={(e) => handleArrayChange("results.keyPoints", index, e.target.value)}
                                        margin="dense"
                                    />
                                    <Button
                                        onClick={() => handleDeleteArrayItem("results.keyPoints", index)}>Remove</Button>
                                </Grid>
                            ))}

                            <Grid item xs={12}>
                                <Button onClick={() => handleAddArrayItem("results.keyPoints")}>Add KeyPoint</Button>
                            </Grid>

                            {/* Images Upload */}
                            <Grid item xs={12}>
                                <Typography variant="body1" fontWeight="bold">Upload Icon Image:</Typography>
                                <Button variant="contained" component="label" sx={{mt: 1}}>
                                    Upload Images
                                    <input type="file" accept="image/*" hidden multiple onChange={handleImageChange}/>
                                </Button>
                            </Grid>
                            <Grid item xs={12} container spacing={2}>
                                {formData.images.map((img, index) => (
                                    <Grid item xs={3} key={index} sx={{position: "relative"}}>
                                        <img src={img} alt="Preview" width="100%" style={{borderRadius: 8}}/>
                                        <IconButton
                                            onClick={() => handleRemoveImage(index)}
                                            sx={{
                                                position: "absolute",
                                                backgroundColor: '#fff',
                                                top: {xs: 10, sm: 20},
                                                right: {xs: 5, sm: 10}
                                            }}
                                        >
                                            <Remove/>
                                        </IconButton>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </DialogContent>


                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleSubmit} color="primary"> {loading2 ? <CircularProgress size={24} color="inherit" /> : "Save"}</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </Container>
    );
};

export default Projects;
