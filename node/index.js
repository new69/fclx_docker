const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;
const config = {
    host: 'db',
    user: 'root',
    password: 'root',
    database: 'nodedb',
};
const connection = mysql.createConnection(config);
const tablename = 'people';
let rows = [];

function tableExists(callback) {
    const query = "SHOW TABLES LIKE ?";
    connection.query(query, [tablename], (error, results, fields) => {
        if (error) {
            console.error(error);
            return callback(error);
        } else {
            if (results.length > 0) {
                return callback(null, true);
            } else {
                return callback(null, false);
            }
        }
    });
}

function createTable(callback) {
    const query = `
      CREATE TABLE ${tablename} (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL
      )
    `;
    connection.query(query, (error, results, fields) => {
        if (error) {
            console.error(error);
            return callback(error);
        } else {
            console.log('Tabela criada com sucesso!');
            return callback(null, results);
        }
    });
}

function insertPeople(callback) {
    const namesList = ["Jimmy", "Bob", "Liza", "Sara"]
    const randomIndex = Math.floor(Math.random() * namesList.length);
    const randomElement = namesList[randomIndex];

    const sql = `INSERT INTO people(name) VALUES (?)`;
    connection.query(sql, [randomElement], (err, result) => {
        if (err) throw err;
        console.log('Nome inserido ' + randomElement);
    });

    
    connection.query('SELECT * FROM people', [], (err, results) => {
        if (err) throw err;
        return callback(null, results);
    });
}

function init() {
    tableExists((error, exists) => {
        if (error) {
            console.error(error);
            process.exit(1);
        } else {
            if (!exists) {
                createTable((error, results) => {
                    if (error) {
                        console.error(error);
                        process.exit(1);
                    } else {
                        console.log('Tabela criada com sucesso!');
                        insertPeople((error, results) => {
                            if (error) {
                                console.error(error);
                                process.exit(1);
                                return;
                            }

                            rows = results;
                        });
                    }
                });
                
            }
        }
    });
}

connection.connect((error) => {
    if (error) {
        console.error(error);
        process.exit(1);
    } else {
        init();
        app.get('/', (req, res) => {
            let lines = '';
            for (let i = 0; i < rows.length; i++) {
                lines += `<li>${rows[i].name}</li>`;
            }

            html = `<h1>Full Cycle</h1><ul>${lines}</ul>`;
            res.send(html);
            // res.send('<h1>Full Cycle</h1>');
        });
        app.listen(port, () => {
            console.log('Rodando na porta ' + port);
        });
    }
});
