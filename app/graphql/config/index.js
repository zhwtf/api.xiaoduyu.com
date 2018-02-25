
import posts from './posts'
// import topic from './topic'
// import user from './user'
// import comment from './comment'
// import userNotification from './user-notification'
// import notification from './notification'
import account from './account'
// import analysis from './analysis'

let list = {
  posts,
  // topic, user, comment,
  // 'user-notification': userNotification,
  // notification,
  account
}

let s = {

  /**
   * 获取查询参数
   * @param  {Object} object
   * @param  {Object} object.args - 查询参数
   * @param  {String} object.model - 要查询model名称
   * @param  {String} object.role - 查询角色
   * @return {Array} err 错误, query 结果对象
   */
  getQuery: ({ args = {}, model, role = '' }) => {

    let { filters, options } = list[model].query;

    let query = {}, err;

    for (let i in args) {

      if (!filters[i] && !options[i]) {
        err = i + ' is invalid';
        break;
      } else if (!filters[i]) {
        continue;
      }

      let result = filters[i](args[i]);

      if (result.role && role != result.role) {
        err = i + ' be rejected';
        break;
      }

      if (!result.name) continue;

      if (typeof result.value == 'object') {
        if (!query[result.name]) query[result.name] = {};
        for (let n in result.value) query[result.name][n] = result.value[n];
      } else {
        query[result.name] = result.value;
      }

    }

    return [ err, query ]

  },

  /**
   * 获取查询参数
   * @param  {Object} object
   * @param  {Object} object.args - 查询参数
   * @param  {String} object.model - 要查询model名称
   * @param  {String} object.role - 查询角色
   * @return {Array} err 错误, query 结果对象
   */
  getOption: ({ args = {}, model, role = '' }) => {

    let { options, filters } = list[model].query;
    let _options = {}, err;

    for (let i in args) {

      if (!filters[i] && !options[i]) {
        err = i + ' is invalid';
        break;
      } else if (!options[i]) {
        continue;
      }

      let result = options[i](args[i]);
      if (result.role && role != result.role) continue;
      if (result.name) _options[result.name] = result.value;
    }

    // limit默认值
    if (!_options.limit) _options.limit = 30;
    // limit 最大值
    else if (_options.limit > 300) _options.limit = 300;

    _options.skip = !_options.skip ? 0 : _options.skip * _options.limit;

    return [ err, _options ]

  },

  /**
   * 获取查询参数
   * @param  {Object} object
   * @param  {Object} object.args - 查询参数
   * @param  {String} object.model - 要查询model名称
   * @param  {String} object.role - 查询角色
   * @return {Array} err 错误, query 结果对象
   */
  getUpdateQuery: ({ args = {}, model, role = '' }) => {

    let { filters, content } = list[model].update;

    let query = {}, err;

    for (let i in args) {

      if (!filters[i] && !content[i]) {
        err = i + ' is invalid';
        break;
      } else if (!filters[i]) {
        continue;
      }

      let result = filters[i](args[i]);

      if (result.role && role != result.role) {
        err = i + ' be rejected';
        break;
      }

      if (!result.name) continue;

      if (typeof result.value == 'object') {
        if (!query[result.name]) query[result.name] = {};
        for (let n in result.value) query[result.name][n] = result.value[n];
      } else {
        query[result.name] = result.value;
      }

    }

    return [ err, query ]

  },

  /**
   * 获取查询参数
   * @param  {Object} object
   * @param  {Object} object.args - 查询参数
   * @param  {String} object.model - 要查询model名称
   * @param  {String} object.role - 查询角色
   * @return {Array} err 错误, query 结果对象
   */
  getUpdateContent: ({ args = {}, model, role = '' }) => {

    let { filters, content } = list[model].update;

    let _content = {}, err;

    for (let i in args) {

      if (!content[i] && !filters[i]) {
        err = i + ' is invalid';
        break;
      } else if (!content[i]) {
        continue;
      }

      let result = content[i](args[i]);

      if (!result.name) continue;

      if (result.role && role != result.role) {
        err = i + ' be rejected';
        break;
      }

      _content[result.name] = result.value;

    }

    return [ err, _content ]

  },

  /**
   * 获取查询参数
   * @param  {String} model 要查询的model名称
   * @return {String}
   */
  getQuerySchema: (model) => {

    let { filters, options } = list[model].query;

    let schema = ``;

    for (let i in filters) {
      schema += `
        #${filters[i]().desc}${filters[i]().role == 'admin' ? ' (管理员)' : ''}
        ${i}:${filters[i]().type}
      `
    }

    for (let i in options) {
      schema += `
        #${options[i]().desc}${options[i]().role == 'admin' ? ' (管理员)' : ''}
        ${i}:${options[i]().type}
      `
    }

    return schema;

  },

  /**
   * 获取查询参数
   * @param  {String} model 要查询的model名称
   * @return {String}
   */
  getUpdateSchema: (model) => {

    let { filters, content } = list[model].update;

    let schema = ``;

    for (let i in filters) {
      schema += `
        #${filters[i]().desc}${filters[i]().role == 'admin' ? ' (管理员)' : ''}
        ${i}:${filters[i]().type}
      `
    }

    for (let i in content) {
      schema += `
        #${content[i]().desc}${content[i]().role == 'admin' ? ' (管理员)' : ''}
        ${i}:${content[i]().type}
      `
    }

    return schema;

  },

}

module.exports = s;
