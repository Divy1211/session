const fetch = require(`node-fetch`);
const firebase = require(`./firebase.js`);
const database = firebase.firebase.database();

function iter(array) {
    var index = 0;

    const iterator = {
        next: () => array[index++],
    };
    return iterator;
}

async function getSessionInfo(command, steam_id = `76561198276345085`, session_timeout = false) {
    const data = await database.ref(`${steam_id}_session`).once(`value`);

    // time a session out
    const now = Math.floor(new Date().getTime() / 1000);
    var session_start_time = data.val();
    if (session_timeout && session_start_time) {
        if (now - session_start_time >= session_timeout) {
            database.ref(`${steam_id}_session`).set(null);
            session_start_time = null;
        }
    }

    // start/stop sessions
    if ([`start`, `begin`].includes(command)) {
        if (session_start_time)
            return `Cannot start a new session while one is already in play!`;

        database.ref(`${steam_id}_session`).set(now);
        return `A new session has been started successfully!`;
    }
    else if ([`stop`, `end`].includes(command)) {
        if (session_start_time) {
            database.ref(`${steam_id}_session`).set(null);
            return `The current session has been ended.`;
        }
        return `No session currently in play.`;
    }

    const six_hours = 21600;
    var last_time = Math.floor(new Date().getTime() / 1000);

    var time_condition = (x) => last_time - x.timestamp < six_hours;
    if (session_start_time)
        time_condition = (x) => x.timestamp > session_start_time;

    const leaderboard_ids = [0, 1, 2, 3, 4, 13, 14];
    const leaderboard_name = ['UR', 'DM', 'TDM', 'RM', 'TRM', 'EW', 'TEW'];
    var leaderboard_matches = [];
    for (const leaderboard of leaderboard_ids) {
        const url = `https://aoe2.net/api/player/ratinghistory?game=aoe2de&leaderboard_id=${leaderboard}&steam_id=76561198057200879&count=100`;
        leaderboard_matches.push(
            iter([...await (await fetch(url)).json(), { num_wins: 0, num_losses: 0, timestamp: 0, rating: 1000 }])
        );
    }

    var matches = leaderboard_matches.map((x) => x.next());

    const total_wins = matches.map((x) => x.num_wins);
    const total_losses = matches.map((x) => x.num_losses);
    const current_elo = matches.map((x) => x.rating);

    while (matches.some(time_condition)) {
        const max_i = matches.reduce(
            (pIndex, val, index, array) => (val.timestamp > array[pIndex].timestamp ? index : pIndex),
            0
        );
        last_time = matches[max_i].timestamp;
        matches[max_i] = leaderboard_matches[max_i].next();
    }
    return matches.reduce(
        (pVal, val, index) => {
            if (current_elo[index] - val.rating === 0)
                return pVal;

            var rating_change = `elo change: ${current_elo[index] - val.rating}, `
            if (index === 0)
                rating_change = ``;
                
            return pVal + `${leaderboard_name[index]} ${rating_change}` +
                          `wins: ${total_wins[index] - val.num_wins}, ` +
                          `losses: ${total_losses[index] - val.num_losses} || `;
        },
        ''
    ).slice(0, -4);
}

exports.getSessionInfo = getSessionInfo;
