const creepConfiguration = {
    components:{
        "harvester":{move:3,work:5,carry:1},
        "transferer":{move:10,carry:10},
        "upgrader":{move:6,work:10,carry:2},
        "worker":{work:5,carry:15,move:10},
        "repairer":{work:5,carry:3,move:4},
        "defender":{move:23,"ranged_attack":5,attack:15,heal:5},
        "attacker":{move:25,attack:25},
        "healer":{move:16,heal:16},
        "claimer":{move:2,claim:2},
        "traveler":{move:1}
    },
    boosts:{
        "transferer":{
            "remoteTransfer":["KH","KH2O","XKH2O"],
            "remotePickUper":["KH"],
            "pureTransfer":["KH","KH2O","XKH2O"],
            "remoteHarvest":["KH"],
        },
        "repairer":{
            "pureRepairer":["LH","LH2O","XLH2O"],
        },
        "attacker":{
            "Attack":["UH","UH2O","XH2O"],
        },
        "healer":{
            "Attack":["LO","LHO2","XLHO2"],
        },
        "upgrader":{
            "pureUpgrader":["GH","GH2O","XGH2O"],
        },
        "worker":{
            "pureWorker":["KH"]
        }
    },
    groupAcceptedTask:{
        // PRIMARY KEY PRINCIPLE
        "remoteHarvest":{"harvester":["harvest-remote"],"transferer":["-transfer-remote"]},
        "powerHarvest":{"attacker":["attack-harvest"],"healer":["-attack-heal"],"transferer":["-transfer-remote"]},
        "localHarvest":{"harvester":["harvest-local"]},
        "pureTransfer":{"transferer":["transfer-core","transfer-defense","pickup-local","transfer-advanced|limit"]},
        "pureWorker":{"worker":["build-local","build-remote","*transfer-core","*repair-local","*upgrade"]},
        "pureRepairer":{"repairer":["repair-local","*transfer-core","*upgrade"]},
        "remoteRepairer":{"repairer":["repair-remote","build-remote"]},
        "remoteTransfer":{"transfer":["transfer-aid"]},
        "remotePickUper":{"transfer":["pickup-remote","transfer-remote"]},
        "pureUpgrader":{"upgrader":["upgrade"]},
        "Defend":{"defender":["defend-local|reserved|central"]},
        "Attack":{"attacker":["attack-attack"],"healer":["-attack-heal"]},
        "Claim":{"claimer":["attack-claim"]},
        "Travel":{"traveler":["travel"]}
    },
    groupSpawnConfig:{
        "powerHarvest":{"healer":2,"transferer":0}
    }
}
module.exports = creepConfiguration