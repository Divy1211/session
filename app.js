const express = require(`express`);
const app = express();
const port = process.env.PORT || 3000;

app.get(`/session`, async function(req, res) {
    const session = require(`./session.js`);
    const result = await session.getSessionInfo(req.query.command, req.query.steam_id, req.query.session_timeout);
    res.send(result);
});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});