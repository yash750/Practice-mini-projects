import pool from '../db/connectDatabase.js'

const queryService = async (req, res) => {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query must be a valid SQL string.' });
    }

    try {
        const [rows, fields] = await pool.execute(query);
        return res.status(200).json({status: 'success', rows });
    } catch (err) {
        console.error('Query failed:', err);
        return res.status(500).json({ error: 'Query failed', message: err.message });
    }
}

export default queryService