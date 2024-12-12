const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static("public")); // Serve static files like your frontend
app.use(express.json());

// Endpoint to fetch and filter anime
app.get("/api/upcoming-anime", async (req, res) => {
    try {
        const response = await axios.get("https://api.jikan.moe/v4/top/anime");
        const currentYear = new Date().getFullYear();

        const filteredAnime = response.data.data.filter(anime => {
            const releaseDateRaw = anime.aired.from;
            const releaseYear = releaseDateRaw ? new Date(releaseDateRaw).getFullYear() : null;

            return releaseYear === currentYear || anime.status === "Not yet aired";
        });

        res.json({
            success: true,
            data: filteredAnime.map(anime => ({
                title: anime.title,
                score: anime.score || "N/A",
                synopsis: anime.synopsis || "Synopsis not available.",
                releaseDate: anime.aired.from || "Unknown Release Date",
                image: anime.images.jpg.image_url,
                url: anime.url,
            })),
        });
    } catch (error) {
        console.error("Failed to fetch anime data:", error.message);
        res.status(500).json({ success: false, error: "Failed to fetch data from Jikan API" });
    }
});

// Default route to serve frontend
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// Allow specific origins or all origins (not recommended for production)
app.use(cors({
    origin: '*', // Allow all domains
}));
