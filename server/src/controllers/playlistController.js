const groq = require('../config/groq');
const Track = require('../models/Track');
const Playlist = require('../models/Playlist');

// POST /api/playlists/generate
exports.generatePlaylist = async (req, res) => {
  try {
    const { mood } = req.body;
    if (!mood || typeof mood !== 'string') {
      return res.status(400).json({ message: 'Mood is required' });
    }

    const tracks = await Track.find().lean();
    if (!tracks.length) {
      return res.status(400).json({ message: 'No tracks available to generate a playlist' });
    }

    const minimalTracks = tracks.map(t => ({
      id: t._id.toString(),
      title: t.title,
      artist: t.artist
    }));

    const userPrompt = `
You are an expert DJ.

User mood: "${mood}"

Here is the list of available tracks as JSON:
${JSON.stringify(minimalTracks)}

Pick between 3 and 6 unique tracks that best match the mood.
Return ONLY a valid JSON object with this exact structure:

{
  "playlist": [
    { "trackId": "TRACK_ID_STRING", "order": 1, "weight": 0.9 }
  ]
}

Rules:
- "trackId" must be one of the ids from the provided tracks list.
- "order" must start at 1 and increase by 1.
- "weight" is between 0.1 and 1.0, higher means better fit.
- Do NOT include any explanation, only the JSON object.
`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an AI DJ that outputs strictly valid JSON.' },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 512
      // JSON mode is optional; for now we parse manually to avoid edge issues [web:33][web:36][web:37]
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ message: 'Groq did not return any content' });
    }

    let parsed;
    try {
      // In case model wraps JSON with backticks or text, grab the first JSON block
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (err) {
      console.error('Failed to parse Groq JSON:', err, 'Content:', content);
      return res.status(500).json({ message: 'Failed to parse playlist from AI' });
    }

    const playlistItems = Array.isArray(parsed.playlist) ? parsed.playlist : [];
    if (!playlistItems.length) {
      return res.status(500).json({ message: 'AI returned an empty playlist' });
    }

    // Validate and normalize items
    const validTrackIds = new Set(tracks.map(t => t._id.toString()));
    const normalized = playlistItems
      .filter(item => item && item.trackId && validTrackIds.has(item.trackId))
      .slice(0, 6)
      .map((item, index) => ({
        track: item.trackId,
        order: typeof item.order === 'number' ? item.order : index + 1,
        weight: typeof item.weight === 'number' ? item.weight : 1
      }));

    if (!normalized.length) {
      return res.status(500).json({ message: 'No valid tracks in AI playlist' });
    }

    const playlist = await Playlist.create({
      mood,
      tracks: normalized
    });

    // Increment usageCount for each selected track
    const bulkOps = normalized.map(n => ({
      updateOne: {
        filter: { _id: n.track },
        update: { $inc: { usageCount: 1 } }
      }
    }));
    await Track.bulkWrite(bulkOps);

    const populated = await Playlist.findById(playlist._id)
      .populate('tracks.track')
      .lean();

    res.status(201).json({ playlist: populated });
  } catch (err) {
    console.error('Generate playlist error:', err);
    res.status(500).json({ message: 'Failed to generate playlist' });
  }
};

// GET /api/playlists/:id
exports.getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('tracks.track')
      .lean();

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json({ playlist });
  } catch (err) {
    console.error('Get playlist error:', err);
    res.status(500).json({ message: 'Failed to fetch playlist' });
  }
};
