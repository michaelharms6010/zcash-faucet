// Update with your config settings.

module.exports = {

  development: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: './data/dev.sqlite3'
    },
    migrations: {
      directory: "./data/migrations",
      tableName: "dbmigrations",
    },
    seeds: {directory: "./data/seeds"},
  },
  // development: {
  //   client: 'pg',
  //   useNullAsDefault: true,
  //   connection: "postgres://app:password@18.220.69.80:5432/app",
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     directory: "./data/migrations",
  //     tableName: "dbmigrations",
  //   },
  //   seeds: {directory: "./data/seeds"},
  // },

  staging: {
    client: 'pg',
    useNullAsDefault: true,
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'pg',
    useNullAsDefault: true,
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: "./data/migrations",
      tableName: "dbmigrations",
    },
    seeds: {directory: "./data/seeds"},
  }

};
