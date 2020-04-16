const utils = require('utils')
module.exports = function() {
    if (!global.task.harvest) global.task.harvest = {}
    for (var roomName of global.rooms.my) {
        if (!global.task.harvest[roomName]) global.task.harvest[roomName] = {
            energy:{

            },
            mineral:false
        }
        for (var energy of Game.rooms[roomName]["energys"]) {
            if (global.task.harvest[roomName].energy[energy.id]) continue
            for (var container of global.containers[roomName].resources){
                if (utils.adjacent(energy.id,container.id)){
                    Game.rooms[roomName].AddHarvestTask("local",energy.id,energy.pos,true,container.pos,1)
                    global.task.harvest[roomName].energy[energy.id] = true
                    break
                }
            }
        }
        if (!global.task.harvest[roomName].mineral){
            if (Game.rooms[roomName].extractor && Game.rooms[roomName].mineral.mineralAmount > 0 && global.containers[roomName].mineral){
                Game.rooms[roomName].AddHarvestTask("local",Game.rooms[roomName].mineral.id,Game.rooms[roomName].mineral.pos,false,global.containers[roomName].mineral.pos,1)
            }
        }
    }
    for (var roomName of global.rooms.observed) {
        const deposits = ["mists","biomasss","metals","silicons"]
        for (var depositType of deposits){
            var home = utils.getClosetSuitableRoom(roomName,4)
            for (var deposit of Game.rooms[roomName][depositType]){
                Game.rooms[home].AddHarvestTask("remote",deposit.id,deposit.pos)
                Game.rooms[home].AddTransferTask("remote","creep",Game.rooms[home].storage.id,depositType.substring(0,depositType.length-1),Infinity,1,false)
            }
        }
        for (var powerBank of Game.rooms[roomName]["powerBanks"]){
            var home = utils.getClosetSuitableRoom(roomName,6)
            Game.rooms[home].AddAttackTask("harvest",roomName,powerBank.id,1)
            Game.rooms[home].AddAttackTask("heal",roomName,"creep",1)
            Game.rooms[home].AddTransferTask("remote","creep",Game.rooms[home].storage.id,RESOURCE_POWER,powerBank.power,5,false)
        }
    }
}