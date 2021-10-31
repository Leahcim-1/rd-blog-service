import mysql from 'mysql'
import Logger from '../util/logger.js'
import { promisify } from 'util'

export default class MySQL {
  static defaultConnInfo () {
    return {
      host: 'localhost',
      user: 'bender',
      password: 'secret',
      database: 'your_db'
    }
  }

  constructor (connInfo = MySQL.defaultConnInfo()) {
    if (connInfo.password === 'secret') throw Error('You must provide database connection info')
    this.connInfo = connInfo
  }

  createConn () {
    Logger.log('')
    Logger.log('MySQL is going to connect...')
    Logger.log(`Host:     ${this.connInfo.host}`)
    Logger.log(`User:     ${this.connInfo.user}`)
    return mysql.createConnection(this.connInfo)
  }

  async executeQuery (statement = '', args = []) {
    try {
      const conn = this.createConn()

      const connect = promisify(conn.connect).bind(conn)
      const query = promisify(conn.query).bind(conn)

      await connect()
      Logger.log('Connected!')

      Logger.log(`Excuting statement: ${statement}`)
      const res = await query({
        sql: statement,
        values: args
      })

      conn.end()
      return res
    } catch (err) {
      Logger.log(err)
      throw err
    } finally {
      Logger.log('Done')
    }
  }

  createWhereClause (kv = {}) {
    const condition = Object.keys(kv).map(key => '`' + key + '`' + ' = ?').join(' AND ')
    const value = Object.values(kv)
    return { condition, value }
  }

  createColumnValueCondition (column, value) {
    return `${column} like '${value}%'`
  }

  selectStatement (schema, table, fields = [], limit = 10, offset = 0) {
    const selectFields = fields.length === 0
      ? '*'
      : fields.join(', ')

    const selection = `
    SELECT ${selectFields} 
    FROM ${schema}.${table}
    `

    return async (condition = '1=1', value) => {
      const statement = `
      ${selection}
      WHERE ${condition} 
      LIMIT ${limit} 
      OFFSET ${offset}
      `

      return await this.executeQuery(statement, value)
    }
  }

  async insertStatement (schema, table, data = {}) {
    const col = Object.keys(data).join(', ')
    const val = Object.values(data).map(v => `'${v}'`).join(', ')
    const statement = `
      INSERT INTO ${schema}.${table} (${col})
      VALUES (${val});
    `
    return await this.executeQuery(statement)
  }

  async deleteStatement (schema, table, condition) {
    const statement = `
      DELETE FROM ${schema}.${table} 
      WHERE ${condition}
    `
    return await this.executeQuery(statement)
  }

  async updateStatement (schema, table, condition, data = {}) {
    const modification = Object.entries(data).map(([k, v]) => `${k} = '${v}'`).join(', ')
    const statement = `
      UPDATE ${schema}.${table} 
      SET ${modification}
      WHERE ${condition}
    `
    return await this.executeQuery(statement)
  }
}
