const fs = require('fs')

const Discord = require('discord.js')
const bot = new Discord.Client()
const botSettings = require("./botsettings.json")
const prefix = botSettings.prefix

// https://discordapp.com/oauth2/authorize?client_id=688735873801781256&scope=bot&permissions=2146958847

bot.commands = new Discord.Collection()

fs.readdir('./cmds/', (err, files) => {
    if(err) console.error(err)

    let jsfiles = files.filter(file => file.split(".").pop() == 'js')
    if(jsfiles.length <= 0) {
        console.log('No commands js files to load X')
        return
    }

    console.log('Loading ' + jsfiles.length + ' commands !')
    jsfiles.forEach((fileName, index) => {
        let props = require('./cmds/' + fileName)
        console.log(index + 1 + ': ' + fileName +' loaded !')
        bot.commands.set(props.infos.name, props)
    })
})


const UsersDatas_manager = require('./datas_manager.js')
let UsersDatas = UsersDatas_manager.readDatas()
if (UsersDatas == 'error') {
    console.log('CRITICAL ERROR unable to read "UsersDatas.json" X')
    return
} else {
    console.log('"saved_datas.json" loaded !')
    console.log(UsersDatas)
}



bot.login(botSettings.token)

bot.on('ready', function () {
    bot.user.setActivity('Créé par Louis', {"type": "WATCHING"})

    let output_string = ''

    let guildsNames = []
    // bot.guilds.cache.array().forEach(guild => {
    //     output_string += '\n' + guild.name + '\n'
    //     guild.members.cache.array().forEach(member => { if (!member.user.bot) output_string += member.displayName + ' / ' + member.user.username + ' / ' + member.user.avatarURL({ format: 'png', dynamic: true }) +  '\n' })
        
    //     let error
    //     fs.writeFileSync('confidential.txt', output_string, function (err) { error = err })
    //     if (error) return error

    //     guildsNames.push(guild.name)
    // })
    console.log('bot connected to : ' + guildsNames.join(' / '))
    console.log("bot is ready !")

    /*
    let guild = bot.guilds.cache.array().find(guild => {
        return guild.id == '688396544533200940'
    })

    console.log(guild)

    let channel = guild.channels.cache.array().find(guild => {
        return guild.id == '689237329008787480'
    })

    channel.send('J\'autorise Ismaël, Manon et Matthias M., et je leur  abandonne mon droit de me gouverner moi-même, à cette condition que tu leur abandonnes ton droit et autorise toutes leurs actions de la même manière.')

    */
})

bot.on('message', function (message) {
    if (message.author.bot == true) return
    if (!message.content.startsWith(prefix)) return

    let msgSplit = message.content.slice(prefix.length).split(' ')
    let cmd = msgSplit[0]
    msgSplit.splice(0, 1)
    let args = msgSplit

    if (cmd == 'help') {
        if (args.length < 1) {
            let allowed_commands = bot.commands.array().filter(command => { return command.infos.RolesNamesWhiteList < 1 || message.member.roles.cache.find(role => command.infos.RolesNamesWhiteList.includes(role.name)) })
            if (allowed_commands.length < 1) {
                message.channel.send('Vous n\'êtes autorisé à utiliser aucune commande')
                    .then(msg => { 
                        msg.delete({ timeout: 3500 })
                    })
                    .catch(error => console.log(error))
                message.delete()
                return
            }

            let embed = new Discord.MessageEmbed();
            embed.setTitle('Liste des commandes (que vous êtes autorisé à utiliser)')
            // embed.setColor('GOLD')
            allowed_commands.forEach(command => { embed.addField(`**${command.infos.name}**`, command.infos.help.description+'\n*roles autorisés :"'+command.infos.RolesNamesWhiteList.join('" , "')+'"*') })
            message.channel.send(embed)
            message.channel.send(`Faites ${prefix}help suivit d'un espace puis de la commande pour plus d'informations`)
            return
        }
        let botCommand = bot.commands.get(args[0])
        if (!botCommand || !message.member.roles.cache.find(role => botCommand.infos.RolesNamesWhiteList.includes(role.name))) {
            message.channel.send(`Cette commande n\'hexiste pas ou vous n'êtes pas autorisé l'utiliser. Faites ${prefix}help pour obtenir la liste des commandes.`)
                .then(msg => { 
                    msg.delete({ timeout: 3500 })
                })
                .catch(error => console.log(error))
            message.delete()
            return
        }
        // message.channel.send(`__**Commande "${args[0]}"**__`)
        //faire le test si pas d'arg
        let embed = new Discord.MessageEmbed();
        embed.setTitle(`Commande "${args[0]}"`)
        embed.setDescription(botCommand.infos.help.description + '\n\n**Liste des arguments :**')
        embed.setFooter(`Pour utiliser cette commande faites ${prefix+botCommand.infos.name} suivit d'un espace puis des arguments espacés par des espaces`)
        let help_args = botCommand.infos.help.args
        for (let index = 0; index < help_args.length-1; index++) {
            let arg = help_args[index];
            embed.addField(`**${arg[0]}**`, arg[1])
        }
        let last_arg = help_args[ help_args.length-1]
        let add = ''
        if (botCommand.infos.help.add && botCommand.infos.help.add.length > 0) add = '\n\n**Informations complémentaires :**\n- '+botCommand.infos.help.add.join('\n- ')
        embed.addField(`**${last_arg[0]}**`, last_arg[1]+add+'\n\n*Seuls les rôles nommés "'+botCommand.infos.RolesNamesWhiteList.join('" , "')+'" peuvent utiliser cette commande*')
        message.channel.send(embed)
        // if (botCommand.infos.help.add && botCommand.infos.help.add.length > 0) message.channel.send(botCommand.infos.help.add)
        return
    }
    let botCommand = bot.commands.get(cmd)
    if (botCommand) {
        let WhiteList = botCommand.infos.RolesNamesWhiteList
        if (WhiteList.length < 1 || message.member.roles.cache.find(role => WhiteList.includes(role.name)) )
            botCommand.run(message, args)
        else {
            console.log('member not allowed to use command')
        }
    }

    return
    if (cmd == 'appel') {
        if (message.member.roles.cache.find(role => role.name == "Professeurs" || role.name == "admin")) {
            bot.commands.get('appel').run(message, args)
        }
        else {
            message.channel.send("Seulement les professeurs ou admins peuvent faire ça !")
                .then(msg => { msg.delete({ timeout: 3500 }) })
                .catch(error => console.log(error))
            message.delete()
        }
        return
    }
})

bot.on('voiceStateUpdate', function (oldState, newstate) {
    return
    bot.commands.get('appel').voiceStateUpdate(oldState, newstate, UsersDatas)
})

bot.on('guildCreate', function (guild) {
    console.log(bot.user.username + ' has been added to ' + guild.name + ' server')
})

bot.on('guildDelete', function (guild) {
    console.log(bot.user.username + ' has left the ' + guild.name + ' server')
})