import MySQL from '../db/MySQL-Service.js'
import Logger from '../util/logger.js'
import ERRNO from './err-code.js'

export default class BlogService {
  constructor (connInfo) {
    this.sql = new MySQL(connInfo)
    this.schema = 'blog'
    this.table = 'blog_table'
  }

  createRes (errno, res = []) {
    return {
      errno,
      res
    }
  }

  async executeWithTry (fn = () => {}, isReturning = true) {
    try {
      const res = await fn()
      return this.createRes(ERRNO.OK, isReturning ? res : {})
    } catch (e) {
      Logger.log(e)
      return this.createRes(ERRNO.DBERR, e)
    }
  }

  async checkExistedId (id) {
    // * Check existed ID
    const condition = this.sql.createColumnValueCondition('id', id)
    const record = await this.getBlogByCondition(condition)
    return record &&
        record.errno === ERRNO.OK &&
        record.res.length !== 0
  }

  async checkNonExistedId (id) {
    // * Check non-existed ID
    const condition = this.sql.createColumnValueCondition('id', id)
    const record = await this.getBlogByCondition(condition)
    return record &&
        record.errno === ERRNO.OK &&
        record.res.length === 0
  }

  async getAllBlogs (fields = [], limit = 10, offset = 0) {
    const fn = this.sql.selectStatement(this.schema, this.table, fields, limit, offset)
    return await this.executeWithTry(fn, true)
  }

  async getBlogByCondition (condition, fields = [], limit = 10, offset = 0) {
    const fn = async () => await this.sql.selectStatement(
      this.schema,
      this.table,
      fields,
      limit,
      offset
    )(condition)
    return await this.executeWithTry(fn, true)
  }

  async getBlogById (id, fields = []) {
    const condition = this.sql.createColumnValueCondition('id', id)
    return await this.getBlogByCondition(condition, fields)
  }

  async postBlog (id, data) {
    // * Check Blog Existed
    const existed = await this.checkExistedId(id)
    if (existed) return this.createRes(ERRNO.DUPID)

    const fn = async () => await this.sql.insertStatement(this.schema, this.table, data)
    return await this.executeWithTry(fn, false)
  }

  async updateBlog (id, data = {}) {
    // * Check Blog Existed
    const nonExisted = await this.checkNonExistedId(id)
    if (nonExisted) return this.createRes(ERRNO.NOEXIST)

    // execute PUT
    const condition = this.sql.createColumnValueCondition('id', id)
    const fn = async () => await this.sql.updateStatement(
      this.schema,
      this.table,
      condition,
      data
    )
    return await this.executeWithTry(fn, false)
  }

  async delete (id) {
    // * Check Blog Non-existed
    const nonExisted = await this.checkNonExistedId(id)
    if (nonExisted) return this.createRes(ERRNO.NOEXIST)

    const condition = this.sql.createColumnValueCondition('id', id)
    const fn = async () => await this.sql.deleteStatement(
      this.schema,
      this.table,
      condition
    )
    return await this.executeWithTry(fn, false)
  }
}
