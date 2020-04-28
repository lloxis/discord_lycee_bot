const fs = require('fs')


module.exports.readDatas = () => {
    try {
        return JSON.parse(fs.readFileSync('./saved_datas.json'))
    } catch(error) {
        console.log(error)
        return 'error'
    }
}

module.exports.deleteAppel = (guildID, messageID, datas) => {
    datas.find(element => element.datas.appel)
}

module.exports.deleteAppel = (guildID, messageID, datas) => {
    datas.find(element => element.datas.appel)
}

module.exports.appel = (datas, id) => {
    let GuildFound = datas.find(function(element) {
        return element.guildID == member.guild.id
    })
}