import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Box,
    Typography,
    Button,
    IconButton,
    Container,
    Drawer,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { name: "INQUIRIES", path: "/" },
        { name: "SLIDER", path: "/slider" },
        { name: "TESTIMONIAL", path: "/testimonial" },
        { name: "SERVICES", path: "/services" },
        { name: "PROJECTS", path: "/projects" },
    ];

    return (
        <Box>
            <AppBar position="static" elevation={0} sx={{ backgroundColor: "#0b1e4d", color: "#fff", padding: "10px 0" }}>
                <Container>
                    <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Box sx={{ width: 50, height: 50, backgroundColor: "#000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "12px" }}>REPAIR</Box>
                        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: 'center', justifyContent: 'center', gap: { sm: 3, md: 5 } }}>
                            {navItems.map((item, index) => (
                                <Typography key={index} onClick={() => navigate(item.path)} sx={{ fontSize: { xs: "12px", md: "14px" }, fontWeight: '600', cursor: "pointer", color: location.pathname === item.path ? "#ffcc00" : "#fff", transition: "color 0.3s ease-in-out", "&:hover": { color: "#ffcc00" } }}>{item.name}</Typography>
                            ))}
                        </Box>
                        <IconButton onClick={handleDrawerToggle} sx={{ display: { xs: "block", md: "none" } }}><MenuIcon /></IconButton>
                    </Toolbar>
                </Container>
            </AppBar>
            <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
                <List sx={{ width: 250 }}>
                    {navItems.map((item, index) => (
                        <ListItem button key={index} onClick={() => { handleDrawerToggle(); navigate(item.path); }}>
                            <ListItemText primary={item.name} sx={{ textAlign: "center", fontWeight: 500, "&:hover": { color: "#ffcc00" } }} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </Box>
    );
};

export default Navbar;
