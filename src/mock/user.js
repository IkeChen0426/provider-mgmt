const userMap = {
  'vmicloud-rootuser': {
    token: '666',
    data: {
      role: 'ROOT'
    }
  }
}

export default {
  loginByUsername: config => {
    const { uniqueId } = JSON.parse(config.body)
    return userMap[uniqueId]
  }
}
