/**
Module: prototype.Room.structures v1.7
Author: SemperRabbit
Date:   20180309-13,0411
Usage:  require('prototype.Room.structures');

This module will provide structure caching and extends the Room
  class' prototype to provide `room.controller`-like properties
  for all structure types. It will cache the object IDs of a
  room.find() grouped by type as IDs in global. Once the property
  is requested, it will chech the cache (and refresh if required),
  then return the appropriate objects by maping the cache's IDs
  into game objects for that tick.

Changelog:
1.0: Initial publish
1.1: Changed multipleList empty results from `null` to `[]`
     Bugfix: changed singleList returns from arrays to single objects or undefined
1.2: Added intra-tick caching in addition to inter-tick caching
1.3: Multiple bugfixes
1.4: Moved STRUCTURE_POWER_BANK to `multipleList` due to proof of *possibility* of multiple
        in same room.
1.5: Added CPU Profiling information for Room.prototype._checkRoomCache() starting on line 47
1.6: Added tick check for per-tick caching, in preperation for the potential "persistent Game
        object" update. Edits on lines 73, 77-83, 95, 99-105
1.7; Added Factory support (line 46)
*/

var roomStructures           = {};
var roomStructuresExpiration = {};

var roomRepairs              = {};
var roomRepairsExpiration    = {};

var roomBuilds               = {};
var roomBuildsExpiration     = {};

const CACHE_TIMEOUT = 50;
const CACHE_OFFSET  = 4;

const repairConfig = require('configuration.Repair')

const multipleList = [
    STRUCTURE_SPAWN,        STRUCTURE_EXTENSION,    STRUCTURE_ROAD,         STRUCTURE_WALL,
    STRUCTURE_RAMPART,      STRUCTURE_KEEPER_LAIR,  STRUCTURE_PORTAL,       STRUCTURE_LINK,
    STRUCTURE_TOWER,        STRUCTURE_LAB,          STRUCTURE_CONTAINER,	STRUCTURE_POWER_BANK,
];

const singleList = [
    STRUCTURE_OBSERVER,     STRUCTURE_POWER_SPAWN,  STRUCTURE_EXTRACTOR,	STRUCTURE_NUKER,
    STRUCTURE_TERMINAL,     STRUCTURE_CONTROLLER,   STRUCTURE_STORAGE,
];

if(global.STRUCTURE_FACTORY !== undefined) singleList.push(STRUCTURE_FACTORY);

function getCacheExpiration(){
    return CACHE_TIMEOUT + Math.round((Math.random()*CACHE_OFFSET*2)-CACHE_OFFSET);
}

/********* CPU Profiling stats for Room.prototype._checkRoomCache ********** 
calls         time      avg        function
550106        5581.762  0.01015    Room._checkRoomCache

calls with cache reset: 4085
avg for cache reset:    0.137165
calls without reset:    270968
avg without reset:      0.003262
****************************************************************************/
Room.prototype._checkRoomCache = function _checkRoomCache(){
    // if cache is expired or doesn't exist
    if(!roomStructuresExpiration[this.name] || !roomStructures[this.name] || roomStructuresExpiration[this.name] < Game.time){
        roomStructuresExpiration[this.name] = Game.time + getCacheExpiration();
        roomStructures[this.name] = _.groupBy(this.find(FIND_STRUCTURES), s=>s.structureType);
        var i;
        for(i in roomStructures[this.name]){
            roomStructures[this.name][i] = _.map(roomStructures[this.name][i], s=>s.id);
        }
    }
}
Room.prototype._checkBuildCache = function _checkBuildCache(){
    if (!roomBuildsExpiration[this.name] || !roomBuilds[this.name] || roomBuildsExpiration[this.name] < Game.time){
        roomBuildsExpiration[this.name] = Game.time + getCacheExpiration();
        roomBuilds[this.name] = this.find(FIND_CONSTRUCTION_SITES);
        roomBuilds[this.name] = _.map(roomBuilds[this.name],s=>s.id);
    }
}

multipleList.forEach(function(type){
    Object.defineProperty(Room.prototype, type+'s', {
        get: function(){
            if(this['_'+type+'s'] && this['_'+type+'s_ts'] === Game.time){
                return this['_'+type+'s'];
            } else {
                this._checkRoomCache();
                if(roomStructures[this.name][type]) {
					this['_'+type+'s_ts'] = Game.time;
                    return this['_'+type+'s'] = roomStructures[this.name][type].map(Game.getObjectById);
				} else {
					this['_'+type+'s_ts'] = Game.time;
                    return this['_'+type+'s'] = [];
				}
            }
        },
        set: function(){},
        enumerable: false,
        configurable: true,
    });
});

singleList.forEach(function(type){
    Object.defineProperty(Room.prototype, type, {
        get: function(){
            if(this['_'+type] && this['_'+type+'_ts'] === Game.time){
                return this['_'+type];
            } else {
                this._checkRoomCache();
                if(roomStructures[this.name][type]) {
					this['_'+type+'_ts'] = Game.time;
                    return this['_'+type] = Game.getObjectById(roomStructures[this.name][type][0]);
				} else {
					this['_'+type+'_ts'] = Game.time;
                    return this['_'+type] = undefined;
				}
            }
        },
        set: function(){},
        enumerable: false,
        configurable: true,
    });
});

Object.defineProperty(Room.prototype,"buildTargets",{
    get:function(){
        if (this["_buildTargets"] && this["_buildTargets_ts"] === Game.time){
            return this["_buildTargets"];
        }else{
            this._checkBuildCache();
            roomBuilds[this.name] = _.filter(roomBuilds[this.name],s=>Game.getObjectById(s))
            if (roomBuilds[this.name].length > 0){
                this["_buildTargets_ts"] = Game.time;
                return this["_buildTargets"] = _.map(roomBuilds[this.name],Game.getObjectById);
            }else{
                this["_buildTargets_ts"] = Game.time;
                return this["_buildTargets"] = [];
            }
        }
    },
    set:function(){},
    enumerable:false,
    configurable:true
})

Room.prototype._checkRepairCache = function _checkRepairCache(){
    if (!roomRepairsExpiration[this.name] || !roomRepairs[this.name] || roomRepairsExpiration[this.name] < Game.time){
        roomRepairsExpiration[this.name] = Game.time + getCacheExpiration();
        var cores = [].concat(this.spawns,
                    this.powerSpawn,
                    this.extensions,
                    this.towers,
                    this.storage,
                    this.terminal,
                    this.factory,
                    this.labs,
                    this.extractor,
                    this.observer,
                    this.links)
        cores = _.filter(cores,(s)=>s)
        cores = _.filter(cores,(s)=>s.hits < s.hitsMax)
        var roads = _.filter(this.roads,(r)=>r.hits < r.hitsMax)
        var containers = _.filter(this.containers,(c)=>c.hits < c.hitsMax)
        var commons = [].concat(roads,containers)
        commons = _.filter(commons,(s)=>s)
        commons.sort((a,b)=>a.hits/a.hitsMax - b.hits/b.hitsMax)
        var repairTargets = [].concat(cores,commons)
        roomRepairs[this.name] = repairTargets.map(s => s.id)
    }
}

Object.defineProperty(Room.prototype, "repairTargets",{
    get: function(){
        if(this["_repairTargets"] && this["_repairTargets_ts"] === Game.time) return this["_repairTargets"]
        else{
            this._checkRepairCache();
            roomRepairs[this.name] = _.filter(roomRepairs[this.name],s=>Game.getObjectById(s))
            roomRepairs[this.name] = _.filter(roomRepairs[this.name],s=>Game.getObjectById(s).hits < Game.getObjectById(s).hitsMax)
            if (roomRepairs[this.name].length > 0){
                this["_repairTargets_ts"] = Game.time;
                return this["_repairTargets"] = _.map(roomRepairs[this.name],Game.getObjectById)
            }else{
                this["_repairTargets_ts"] = Game.time;
                return this["_repairTargets"] = [];
            }
        }
    },
    set:function(){},
    enumerable:false,
    configurable:true
})