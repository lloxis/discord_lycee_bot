module.exports.run = (message, args) => {
    if (message.channel.name != "appel") {
        message.channel.send("Vous devez être sur le salon appel !")
            .then(msg => { msg.delete({ timeout: 3500 }) })
            .catch(error => console.log(error))
        message.delete()
        return
    }
    if (args.length != 1) {
        console.log(message.id)
        message.channel.send("Cette fonction prend 1 arguments ! (le nom du rôle des élèves pour l'appel)")
            .then(msg => { msg.delete({ timeout: 3500 }) })
            .catch(error => console.log(error))
        message.delete()
        return
    }
    let roleAppel = message.guild.roles.cache.find(role => role.name == args[0])
    if (roleAppel == null) {
        message.channel.send("Ce rôle n'existe pas !")
            .then(msg => { msg.delete({ timeout: 3500 }) })
            .catch(error => console.log(error))
        message.delete()
        return
    }

    let channel_vocal = message.member.voice.channel
    if (channel_vocal == null) {
        message.channel.send("Vous n'êtes connecté à aucun salon vocal !")
            .then(msg => { msg.delete({ timeout: 3500 }) })
            .catch(error => console.log(error))
        message.delete()
        return
    }


    let listEleves = message.guild.members.cache.array().filter(member => {
        return member.roles.cache.find(role => role.id == roleAppel.id) && !member.roles.cache.find(role => role.name == "Professeurs") && !member.deleted && !member.user.bot
    })

    let listElevesAbsents = listEleves.filter(member => {
        return member.voice.channel == null || member.voice.channel.id != channel_vocal.id
    })
    
    message.channel.send("Eleves présents pour " + args[0] + " :  " + (listEleves.length-listElevesAbsents.length) + " / " + listEleves.length + "\nEleves absents : " + listElevesAbsents.join(" , ") + "\n ")
}

module.exports.voiceStateUpdate = (oldState, newstate, UsersDatas) => {
    return
    if (!oldState.channel) {
        console.log('connection')
        guildIndex = UsersDatas.findIndex(guildDatas => { guildDatas.guildID == newstate.guild.id && guildDatas.datas.appel.appelChannelID == newstate.channel.id && newstate.member.roles.cache.find(role => role.name == guildDatas.datas.appel.elevesRoleName) })
        if (guildIndex >= 0) {
            appelChannel = newstate.guild.channels.cache.find(channel => channel.type == "text" && channel.name == "appel")
            if (appelChannel) {
                appelChannel.messages.fetch(UsersDatas[guildIndex].datas.appel.appelMessageID)
                    .then(message => console.log(message.content))
                    .catch(console.error);
            }
        }
        else {
            console.log('non')
        }
        return
    }
    if (!newstate.channel) {
        console.log('deconnection')
        return
    }
    if (oldState.channel.id != newstate.channel.id) {
        console.log('moved')
        return
    }
    console.log('mute')
    return
    
        
        
        

        // appelChannel = newstate.guild.channels.cache.array().find(channel => channel.name == "appel")
        // if (appelChannel && appelChannel.type == "text") {
        //     appelChannel.messages.fetch({before: appelChannel.lastMessageID, limit: 5}, true)
        //         .then(msgs => msgs.forEach(msg => console.log(msg.content)) )
        //         .catch(error => console.log(error))
            //console.log(appelChannel.messages.cache.array().filter(message => message.author.id == bot.user.id && message.content.startsWith("Eleves présents")))
}

module.exports.infos = {
    name: "appel", //nom pour executer la commande
    RolesNamesWhiteList: ["Professeurs", "admin"], //roles autorisés à utiliser la commande, LAISSER UNE LISTE VIDE SI PAS DE WHITELIST
    help: {
        description: 'Liste les élèves dans votre salon vocal', //description globale de la commande qu'on voit dans le !help
        args: [['rôle ciblé', 'le nom du rôle des élèves qui seront pris en compte pour l\'appel']], //noms et descrition de chaque arguments
        add: ['Vous devez vous trouver dans un salon vocal pour faire cette commande', 'Les élèves non présents dans se même salon ayant le rôle ciblé seront comptés absents', 'La commande doit être faite dans un salon textuel nommé "appel"']
        //liste d'informations complémentaires, enlever le add si aucune inforamtion complémentaire
    }
}