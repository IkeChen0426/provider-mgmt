import { getSpaces } from '@/api/space'
import { getSpaceTags } from '@/api/spaceTags'

const space = {
  state: {
    spaceId: null,
    list: []
  },

  mutations: {
    SET_GROUP_SPACE_ID: (state, spaceId) => {
      state.spaceId = spaceId
    },
    SET_GROUP_LIST: (state, list) => {
      state.list = list
    }
  },

  actions: {
    // 获取分组空间的spaceId
    GetGroupSpaceId ({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.spaceId) {
          resolve(state.spaceId)
        } else {
          getSpaces({ offset: 0, limit: 1, typeCode: 'welfare' }).then(res => {
            let spaceId = res.data.data[0].id

            commit('SET_GROUP_SPACE_ID', spaceId)
            resolve(spaceId)
          }).catch(err => {
            reject(err)
          })
        }
      })
    },

    // 获取分组列表
    GetGroupList ({ dispatch, commit, state }) {
      return new Promise(async (resolve, reject) => {
        dispatch('GetGroupSpaceId').then(spaceId => {
          return getSpaceTags({ spaceId })
        }).then(res => {
          let list = res.data

          commit('SET_GROUP_LIST', list)
          resolve(list)
        }).catch(err => {
          reject(err)
        })
      })
    }
  }
}

export default space
