const CACHE_TIMEOUT = 50;
const CACHE_OFFSET  = 4;
const SHA1 = require('fingerprint.Algorithm.sha1')
const MD5 = require('fingerprint.Algorithm.md5')
const utilsCollection = {
    dis:function(_object_1_id,_object_2_id){
        const _object_1 = Game.getObjectById(_object_1_id)
        const _object_2 = Game.getObjectById(_object_2_id)
        let x_diff = Math.abs(_object_1.pos.x - _object_2.pos.x)
        let y_diff = Math.abs(_object_1.pos.y - _object_2.pos.y)
        return [x_diff,y_diff]
    },
    disPos:function(pos1,pos2){
        let x_diff = Math.abs(pos1.x - pos2.x)
        let y_diff = Math.abs(pos1.y - pos2.y)
        return [x_diff,y_diff]
    },
    distancePos:function(pos1,pos2){
        var _ = this.disPos(pos1,pos2)
        return _[0] + _[1]
    },
    adjacentPos:function(pos1,pos2, distance = 1){
        const dist = this.disPos(pos1,pos2)
        return dist[0] <= distance && dist[1] <= distance && pos1.roomName === pos2.roomName
    },
    adjacent:function(_object_1_id,_object_2_id, distance = 1){
        const dist = this.dis(_object_1_id,_object_2_id)
        return dist[0] <= distance && dist[1] <= distance
    },
    AdjacentPos:function(pos1,posArr,distance = 1){
        for (var pos2 of posArr){
            if (this.adjacentPos(pos1,pos2,distance)) return true
        }
        return false
    },
    Adjacent:function(_object_1_id,_arr_id,distance = 1){
        for (var _object_2_id of _arr_id){
            if (this.adjacent(_object_1_id,_object_2_id,distance)) return _object_2_id
        }
        return false
    },
    getCacheExpiration:function(cache_timeout = CACHE_TIMEOUT,cache_offset = CACHE_OFFSET){
        return cache_timeout + Math.round((Math.random()*cache_offset*2)-cache_offset);
    },
    getTaskFingerprint:function(args){
        var str = ""
        for (var key in args) {
            var arg = args[key]
            if (typeof arg === "object"){
                if (arg['amount']){
                    arg = JSON.parse(JSON.stringify(arg))
                    delete arg["amount"]
                }
                if (arg['memory'] && arg['memory']['group']['name']){
                    arg = JSON.parse(JSON.stringify(arg))
                    delete arg["memory"]["group"]["name"]
                }
                str = str + JSON.stringify(arg)
            }else str = str + arg.toString()
        }
        var hash = MD5(str)
        return hash
    },
    _getComponentRatio:function(componentsObj){
        var totalCost = 0
        for (var component in componentsObj){
            totalCost += componentsObj[component] * BODYPART_COST[component]
        }
        var result = {}
        for (var component in componentsObj){
            result[component] = componentsObj[component] * BODYPART_COST[component] / totalCost
        }
        return result
    },
    getComponentsList:function(availableEnergy,componentsObj){
        const energyDisCom = this._getComponentRatio(componentsObj)
        var result = []
        for (var component in componentsObj){
            var times = Math.min(Math.max(Math.floor(availableEnergy * energyDisCom[component] / BODYPART_COST[component]),1),componentsObj[component])
            for (var i = 0; i < times; i++) result.push(component)
        }
        return result
    },
    getClosetSuitableRoom:function(roomName,controllerLevel){
        var homes = _.filter(global.rooms.my,(r)=>Game.rooms[r].controller.level >= controllerLevel)
        homes.sort((roomName1,roomName2)=>Game.map.getRoomLinearDistance(roomName1,roomName) - Game.map.getRoomLinearDistance(roomName2,roomName))
        return homes[0]
    },
    analyseCreep:function(creepID,analysis = false){
        const creep = Game.getObjectById(creepID)
        var bodyAnalysis = {}
        var hits = 0
        const bodyNum = creep.body.length
        for (var body of creep.body){
            if (!bodyAnalysis[body.type]) bodyAnalysis[body.type] = [0,0,false,0,[]]
            bodyAnalysis[body.type][0]++;
            bodyAnalysis[body.type][3] += body.hits
            hits += body.hits
            if(body.boost) bodyAnalysis[body.type][4].push(body.boost)
        }
        for (var body in bodyAnalysis){
            bodyAnalysis[body][1] = Math.floor(bodyAnalysis[body][3] / 100)
            if (bodyAnalysis[body][1] < bodyAnalysis[body][0]) bodyAnalysis[body][2] = true
        }
        if (!analysis) return  bodyAnalysis
        
        var damageSituatioin = ""
        var role = ""
        var hitsRatio = hits / (bodyNum * 100)
        if (hitsRatio >= 0.9) damageSituatioin = "health"
        else if (hitsRatio >= 0.8) damageSituatioin = "normal"
        else if (hitsRatio >= 0.6) damageSituatioin = "damaged"
        else if (hitsRatio >= 0.3) damageSituatioin = "weak"
        else damageSituatioin = "severe"
        if (bodyAnalysis["attack"] || bodyAnalysis["ranged_attack"]) role = "attacker"
        else if (bodyAnalysis["heal"]) role = "healer"
        else{
            var attackNum = 0, rangedAttackNum = 0,healNum = 0;
            if (bodyAnalysis["attack"]) attackNum = bodyAnalysis["attack"][0]
            if (bodyAnalysis["ranged_attack"]) attackNum = bodyAnalysis["ranged_attack"][0]
            if (bodyAnalysis["heal"]) attackNum = bodyAnalysis["heal"][0]
            if (attackNum + rangedAttackNum - healNum >= 0.2 * bodyNum){
                if (attackNum - rangedAttackNum >= 0.1 * bodyNum) role = "advancedAttacker"
                else if (rangedAttackNum - attackNum >= 0.1 * bodyNum) role = "advancedArcher"
                else role = "King"
            }else role = "advancedHealer"
        }
        return [role,damageSituatioin]
    },
    roomNameToXY:function(name) {
        let xx = parseInt(name.substr(1), 10);
        let verticalPos = 2;
        if (xx >= 100) {
            verticalPos = 4;
        } else if (xx >= 10) {
            verticalPos = 3;
        }
        let yy = parseInt(name.substr(verticalPos + 1), 10);
        let horizontalDir = name.charAt(0);
        let verticalDir = name.charAt(verticalPos);
        if (horizontalDir === 'W' || horizontalDir === 'w') {
            xx = -xx - 1;
        }
        if (verticalDir === 'N' || verticalDir === 'n') {
            yy = -yy - 1;
        }
        return [xx, yy];
    },
    calcRoomsDistance : function(room1, room2, continuous) {
        var [x1,y1] = this.roomNameToXY(room1);
        var [x2,y2] = this.roomNameToXY(room2);
        var dx = Math.abs(x2-x1);
        var dy = Math.abs(y2-y1);
        if(continuous) {
            var worldSize = Game.map.getWorldSize();
            dx = Math.min(worldSize - dx, dx);
            dy = Math.min(worldSize - dy, dy);
        }
        return dx + dy;
    },
    canGetObjectById:function(targetID,targetPos,currentPos){
        if (currentPos.roomName !== targetPos.roomName && !Game.rooms[targetPos.roomName]) return "unsure"
        if (Game.getObjectById(targetID)) return true
        else return false
    },
    analyseTaskList:function(taskList, _default = undefined){
        var _taskList = taskList.split('-')
        if (_taskList[1]) _taskList[1] = _taskList[1].split('|')
        else _taskList[1] = _default
        return _taskList
    }
}
module.exports = utilsCollection