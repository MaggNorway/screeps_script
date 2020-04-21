const utils = require('utils')
module.exports = function() {
    _.assign(Spawn.prototype,spawnTaskExtension)
}
const spawnTaskExtension = {
    isIdle(){
        if (!this.memory.taskFingerPrint && !this.spawning) return true
        return false
    },
    getTask(){
        const roomName = this.room.name
        this.memory.taskFingerPrint = Game.rooms[roomName].getTask("spawn")
        if (this.memory.taskFingerPrint) return true
        return false
    },
    run(){
        if (this.spawning) return OK
        const roomName = this.room.name
        const taskInfo = Game.rooms[roomName].taskInfo(this.memory.taskFingerPrint)
        const name = taskInfo.data.memory.role + "_" + this.room.name + "_" + Game.time
        const availableEnergy = Game.rooms[roomName].energyAvailable
        const components = utils.getComponentsList(availableEnergy,taskInfo.data.components)
        var feedback = this.spawnCreep(components,name,{memory:taskInfo.data.memory})
        if (feedback === OK) {
            Game.rooms[this.room.name].finishTask(this.memory.taskFingerPrint)
            this.memory.taskFingerPrint = null
        }
    }
}