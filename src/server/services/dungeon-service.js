const TABLE_NAME = 'custom_dungeons';

const CREATE_DUNGEON_TABLE = `
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        creator BIGINT UNSIGNED NOT NULL,
        width SMALLINT UNSIGNED NOT NULL,
        height SMALLINT UNSIGNED NOT NULL,
        conditions VARCHAR(127) NOT NULL,
        data TEXT NOT NULL,
        PRIMARY KEY (id)
    )
`;

const SELECT_DUNGEONS = `SELECT * FROM ${TABLE_NAME} WHERE id > ? LIMIT ?`;

const SELECT_DUNGEON = `SELECT * FROM ${TABLE_NAME} WHERE id = ?`;

const CREATE_DUNGEON = `INSERT INTO ${TABLE_NAME} (creator, width, height, conditions, data) VALUES (?, ?, ?, ?, ?)`;

const mysql = require('mysql');

function normalizeDungeon(record) {
    if(record.data) {
        return Object.assign({}, record, {
            data: JSON.parse(record.data)
        })
    } else {
        return record;
    }
}

module.exports = function(connection) {
    connection.query(CREATE_DUNGEON_TABLE, function(error) {
        if(error) {
            console.error(error);
            process.exit(1);
        }
    });
    
    return {
        // TODO: Allow sorting by date
        // TODO: Allow specifying fields
        // TODO: Include author
        getDungeons: function({
            lastId=0,
            limit=10
        }, callback) {
            const query = mysql.format(SELECT_DUNGEONS, [lastId, limit]);
            connection.query(query, function(error, records, fields) {
                if(error) {
                    console.error(error);
                    console.error('QUERY:', query);
                }
                const dungeons = records && records.map(normalizeDungeon);
                callback(error, dungeons);
            });
        },

        getDungeon: function(id, callback) {
            const query = mysql.format(SELECT_DUNGEON, [id]);
            connection.query(query, function(error, records, fields) {
                if(error) {
                    console.error(error);
                    console.error('QUERY:', query);
                }
                const record = records && normalizeDungeon(records[0]);
                callback(error, record);
            });
        },

        addDungeon: function(data, userId, callback) {
            const {conditions, grid} = data;
            const width = grid.length;
            const height = grid[0].length;
            const query = mysql.format(CREATE_DUNGEON, [userId, width, height, conditions, JSON.stringify(data)]);
            connection.query(query, function(error, result) {
                if(error) {
                    console.error(error);
                    console.error('QUERY:', query);
                }
                const id = result && result.insertId;
                callback(error, id);
            });
        }
    }
};
