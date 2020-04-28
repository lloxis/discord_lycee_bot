module.exports.run = (message, args) => {
    if (args.length != 1) {
        message.channel.send("Cette fonction prend 1 arguments ! (le nombre de messages à supprimer)")
            .then(msg => { 
                msg.delete({ timeout: 3500 })
            })
            .catch(error => console.log(error))
        message.delete()
        return
    }
    if (parseInt(args[0]) > 10) {
        message.channel.send("Vous ne pouvez supprimer que 10 messages à la fois !")
            .then(msg => { 
                msg.delete({ timeout: 3500 })
            })
            .catch(error => console.log(error))
        message.delete()
        return
    }
    message.delete()
        .then(msgs => {
            message.channel.messages.fetch({before: message.channel.lastMessageID, limit: parseInt(args[0])}, true)
                .then(msgs => msgs.forEach(msg => msg.delete()) )
                .catch(error => console.log(error))
         })
         .catch(error => { if (error.message == 'Missing Permissions') message.channel.send('Je n\'ai pas la permission de faire ça !') ; else console.log(error) })
}

module.exports.infos = {
    name: "delete",
    RolesNamesWhiteList: ["Professeurs", "admin"],
    help: {
        description: 'Supprime les derniers messages d\'un salon',
        args: [['nombre des messages à suprimer', 'le nombre de messages qui seront supprimés au dessus de celui de la commande']]
    }
}