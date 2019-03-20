import { loginByUsername, getAccount } from '@/api/user'
import { getToken, setToken, removeToken, setTai, removeTai } from '@/utils/auth'

const user = {
  state: {
    token: getToken(),
    roles: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },

  actions: {
    // 用户名登录
    LoginByUsername ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        loginByUsername({ data: userInfo }).then(response => {
          const data = response.data
          commit('SET_TOKEN', data.token)
          setToken(data.token)
          setTai(data.tai)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetUserInfo ({ commit, state }) {
      return new Promise((resolve, reject) => {
        getAccount().then(response => {
          const data = response.data.data

          if (data.role) {
            commit('SET_ROLES', [data.role])
          } else {
            reject(new Error('getInfo: role must not be null !'))
          }

          resolve(state)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut ({ commit, state }) {
      return new Promise((resolve, reject) => {
        try {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          removeToken()
          removeTai()
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    },

    // 前端 登出
    FedLogOut ({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        removeTai()
        resolve()
      })
    }
  }
}

export default user
