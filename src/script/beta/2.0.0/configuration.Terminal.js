const terminalConfiguration = {
    terminalCheckInterval:20,
    terminalSendInterval:30,
    baseReservedEnergy:30000,
    baseReservedMineral:10000,
    mineralDistributeMinAmount:2500,
    sellingEnergy:{
        "W22N25":30000,
        "W23N25":30000,
        "W21N24":30000,
        "W19N22":0,
        "W18N22":30000
    },
    sellingMineral:{
        "W22N25":10000,
        "W23N25":0,
        "W21N24":10000,
        "W19N22":30000,
        "W18N22":0
    },
    sellingGoods:{
        //[(resourceType),(reservedAmount),(minSellAmount)]
        "W22N25":[],
        "W23N25":[],
        "W21N24":[],
        "W19N22":[],
        "W18N22":[]
    },
    buyingGoods:{
        //[(resourceType),(beginBuyingAmount),(endBuyingAmount)]
        "W22N25":[],
        "W23N25":[],
        "W21N24":[],
        "W19N22":[],
        "W18N22":[]
    },
    mostDesiredGoods:{ // Buy as much as it can
        interval:100,
        [RESOURCE_POWER]:{
            maxPrice:4,  // Will buy these goods under this line
            minCredits:10000,
        }
    },
}
module.exports = terminalConfiguration