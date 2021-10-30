/* eslint no-useless-catch: off */

import MySQL from './MySQL-Service.js'

const defaultConnInfo = {
  host: 'localhost',
  user: 'bender',
  password: 'bender123',
  database: 'user'
}
const sql = new MySQL(defaultConnInfo);

(async () => {
  const res1 = await sql.getByQueryPair('user', 'user_table', 'id', 1)
  console.log(res1)

  const res2 = await sql.getByWhereObject('user', 'user_table', {
    first_name: 'bender',
    address_id: 123
  })
  console.log(res2)

  try {
    await sql.insert('user', 'user_table', {
      id: 2,
      first_name: 'John',
      last_name: 'Zoidberg',
      email: 'zoidberg@planet-express.com',
      address_id: 123
    })
  } catch (e) {
    throw e
  }
})()
