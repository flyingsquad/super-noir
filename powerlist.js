// Power List.

const powerList = {
    'absorption': {
        baseCost: 2,
        fields: [
            {
                type: 'checkbox',
                label: 'Growth',
                id: 'growth',
                cost: 3,
                flag: 'growth'
            },
            {
                type: 'checkbox',
                label: 'Reflection',
                id: 'reflection',
                cost: 2,
                flag: 'reflection'
            },
            {
                type: 'checkbox',
                label: 'Mastery',
                id: 'matery',
                cost: 1,
                flag: 'matery'
            },
            {
                type: 'checkbox',
                label: 'Transference',
                id: 'transference',
                cost: 2,
                flag: 'transference'
            },
            {
                type: 'checkbox',
                label: 'Transmute',
                id: 'transmute',
                cost: 3,
                flag: 'transmute'
            },
            {
                type: 'checkbox',
                label: 'Achilles Heel',
                id: 'achillesheel',
                cost: -1,
                flag: 'achillesheel'
            },
            {
                type: 'select',
                label: 'Additional Power Types',
                id: 'addpowertypes',
                flag: 'addpowertypes',
                costexp: "level",
                options: [
                    {name: '--', value: 0},
                    {name: 'One (+1)', value: 1},
                    {name: 'Three (+2)', value: 2},
                    {name: 'All in Same Category (+4)', value: 4},
                    {name: 'All Types (+8)', value: 8}
                ]
            }

        ]
    },
	
    "additional-actions": {
        "fields": [
            {
                "type": "select",
                "label": "Speed",
                "id": "speed",
                "flag": "speed",
                "costexp": "level",
                "options": [
                    {"name": "Additional Actions: 1  (5)", "value": 5},
                    {"name": "Additional Actions: 2  (10)", "value": 10},
                    {"name": "Additional Actions: 3  (15)", "value": 15}
                ]
            },
            {
                "label": "Concentration",
                "type": "checkbox",
                "flag": "concentration",
                "id": "concentration",
                "cost": 1
            },
            {
                "label": "Fast Action",
                "type": "checkbox",
                "flag": "fastaction",
                "id": "fastaction",
                "cost": 2
            },
            {
                "label": "Mental Only",
                "type": "checkbox",
                "flag": "mentalonly",
                "id": "mentalonly",
                "cost": -1
            },
            {
                "label": "Physical Only",
                "type": "checkbox",
                "flag": "physicalonly",
                "id": "physicalonly",
                "cost": -1
            }
		]
	},
	
    'ageless': {
        baseCost: 1,
        fields: [
            {
                type: 'checkbox',
                label: 'Very Old',
                id: 'veryold',
                cost: 2,
                flag: 'veryold'
            }
        ],
        effects: [
            {
                name: "Ageless",
                applyEffect: "veryold"
            }
        ]
    },
    'altered-form': {
        baseCost: 2,
        fields: [
            {
                type: 'checkbox',
                label: 'Grappler',
                id: 'grappler',
                cost: 1,
                flag: 'grappler'
            },
            {
                type: 'checkbox',
                label: 'Fall Proof',
                id: 'fallProof',
                cost: 1,
                flag: 'fallProof'
            },
            {
                type: 'level',
                label: 'Reach (1/level)',
                initLevel: 0,
                id: 'reach',
                costexp: 'level',
                checkexp: "level>=0",
                checkmsg: "Reach must be 0 or greater.",
                flag: 'reach'
            },
            {
                type: 'checkbox',
                label: 'Requires Activation',
                id: 'requiresActivation',
                cost: -1,
                flag: 'requiresActivation'
            },
            {
                type: 'checkbox',
                label: 'Sticky',
                id: 'sticky',
                cost: 2,
                flag: 'sticky'
            },
            {
                type: 'checkbox',
                label: 'Viscous',
                id: 'viscous',
                cost: 2,
                flag: 'viscous'
            },
            {
                type: 'checkbox',
                label: 'Yield',
                id: 'yield',
                cost: 1,
                flag: 'yield'
            }
        ],
        effects: [
            {
                name: "Ageless",
                applyEffect: "veryold"
            }
        ]
    },
	

{
    "fields": [
        {
            "label": "Level",
            "type": "level",
            "flag": "level",
            "id": "level",
            "costexp": "level",
            "checkexp": "level > 0",
            "checkmsg": "Level must be greater than zero.",
            "grantupdate": {
                "uuid": "grantuuid",
                "update": "system.armor: @F[level]*2"
            }
        },
        {
            "type": "checkbox",
            "label": "Heavy Armor",
            "id": "heavyArmor",
            "cost": 4,
            "flag": "heavyArmor",
            "grantupdate": {
                "uuid": "grantuuid",
                "update": "system.isHeavyArmor: @F[heavyArmor]"
            }
        },
        {
            "type": "select",
            "label": "Partial Protection",
            "id": "partialProtection",
            "flag": "partialProtection",
            "costexp": "level",
            "options": [
                {
                    "name": "--",
                    "value": 0
                },
                {
                    "name": "Penalty: -4 (-1)",
                    "value": -1
                },
                {
                    "name": "Penalty: -2 (-2)",
                    "value": -2
                }
            ]
        },
        {
            "type": "checkbox",
            "label": "Requires Activation",
            "id": "requiresActivation",
            "cost": -1,
            "flag": "requiresActivation"
        },
        {
            "type": "checkbox",
            "label": "Sealed",
            "id": "sealed",
            "cost": 2,
            "flag": "sealed"
        }
    ],
    "effects": [
        {
            "name": "Armor",
            "value": "@F[level]*2"
        },
        {
            "name": "Heavy Armor",
            "applyEffect": "heavyArmor"
        }
    ],
    "requirements": [
        {
            "expression": "toughArmorTotal(actor)<=game.settings.get(moduleId, 'powerlimit')",
            "message": "`Toughness and Armor (${toughArmorTotal(actor)}) exceed the Power Limit (${game.settings.get(moduleId, 'powerlimit')}).`"
        }
    ],
    "createActions": [
        {
            "type": "additem",
            "addUuid": "grantuuid",
            "uuid": "Compendium.super-noir.items.Item.sWyH2JBBNYtGiYjq"
        }
    ],
    "deleteActions": [
        {
            "deleteUuid": "grantuuid"
        }
    ]
}
	
    'armor': {
        fields: [
            {
                label: 'Level',
                type: 'level',
                flag: 'level',
                id: 'level',
                costexp: "level",
                checkexp: "level > 0",
                checkmsg: "Level must be greater than zero.",
				"grantupdate": {"uuid": "grantuuid", "update": "system.armor: @F[level]*2"}
            },
            {
                "type": "checkbox",
                "label": "Heavy Armor",
                "id": "heavyArmor",
                "cost": 4,
                "flag": "heavyArmor",
				"grantupdate": {"uuid": "grantuuid", "update": "system.isHeavyArmor: @F[heavyArmor]"}
            },
            {
                "type": "select",
                "label": "Partial Protection",
                "id": "partialProtection",
                "flag": "partialProtection",
                "costexp": "level",
                "options": [
                    {"name": "--", "value": 0},
                    {"name": "Penalty: -4 (-1)", "value": -1},
                    {"name": "Penalty: -2 (-2)", "value": -2}
                ]
            },
            {
                "type": "checkbox",
                "label": "Requires Activation",
                "id": "requiresActivation",
                "cost": -1,
                "flag": "requiresActivation"
            },
            {
                "type": "checkbox",
                "label": "Sealed",
                "id": "sealed",
                "cost": 2,
                "flag": "sealed"
            }
			
        ]
		
		"createActions": [
			{
				"type": "additem",
				"addUuid": "grantuuid",
				"uuid": "Compendium.super-noir.items.Item.6KnmlQ3sfDtlJ1rm"
			}
		],
        "deleteActions": [
            {
                "deleteUuid": "grantuuid"
            }
        ]
		
    },
    'awareness': {
        fields: [
            {
                label: 'Level',
                type: 'level',
                flag: 'level',
                id: 'level',
                costexp: "level",
                checkexp: "level > 0",
                checkmsg: "Level must be greater than zero."
            },
            {
                type: 'checkbox',
                label: 'Requires Activation',
                id: 'requiresActivation',
                cost: -1,
                flag: 'requiresActivation'
            }
        ]
    },
	'chameleon': {
        "baseCost": 3,
        "fields": [
            {
                "type": "checkbox",
                "label": "Inanimate Object",
                "id": "inanimateObject",
                "cost": 2,
                "flag": "inanimateObject"
            },
            {
                "type": "checkbox",
                "label": "Biometrics",
                "id": "biometrics",
                "cost": 2,
                "flag": "biometrics"
            },
            {
                "type": "checkbox",
                "label": "Requires Touch",
                "id": "requiresTouch",
                "cost": -2,
                "flag": "requiresTouch"
            }
        ]
    },
    'copycat': {
        "baseCost": 1,
        "fields": [
            {
                "label": "Level",
                "type": "level",
                "flag": "level",
                "id": "level",
				"initLevel": 1,
                "costexp": "level",
                "checkexp": "level > 0",
                "checkmsg": "Level must be greater than zero."
            },
            {
                "type": "checkbox",
                "label": "Arcane",
                "id": "arcane",
                "cost": 2,
                "flag": "arcane"
            },
            {
                "type": "checkbox",
                "label": "Devices",
                "id": "devices",
                "cost": 2,
                "flag": "devices"
            },
            {
                "type": "checkbox",
                "label": "Duration",
                "id": "duration",
                "cost": 2,
                "flag": "duration"
            },
            {
                "type": "checkbox",
                "label": "Overly Accurate",
                "id": "overalyAccurate",
                "cost": -2,
                "flag": "overalyAccurate"
            },
            {
                "type": "checkbox",
                "label": "Partial Power",
                "id": "partialPower",
                "cost": 2,
                "flag": "partialPower"
            },
            {
                "type": "checkbox",
                "label": "Requires Touch",
                "id": "requiresTouch",
                "cost": -2,
                "flag": "requiresTouch"
            }
            
        ]
    },
	"damage-field": {
        "baseCost": 3,
        "fields": [
            {
                "type": "select",
                "label": "Damage",
                "id": "damage",
                "flag": "damage",
                "costexp": "level",
                "options": [
                    {"name": "2d6 (3)", "value": 0, "update": "system.damage:'2d6'"},
                    {"name": "3d6 (5)", "value": 5, "update": "system.damage:'3d6'"},
                    {"name": "4d6 (10)", "value": 10, "update": "system.damage:'4d6'"}
                ]
            },
            {
                "type": "select",
                "label": "Area Effect",
                "id": "areaeffect",
                "flag": "areaeffect",
                "costexp": "level",
                "options": [
                    {"name": "--", "value": 0},
                    {"name": "MBT (+2)", "value": 2},
                    {"name": "MBT/LBT (+4)", "value": 4}
                ]
            },
			{
				"label": "Armor Piercing",
				"type": "level",
				"initLevel": 2,
				"flag": "ap",
				"id": "ap",
				"min": 2,
				"costexp": "level",
				"checkexp": "level>=0 && level<=10",
				"update": "system.ap: @F[ap]*2"
			},
            {
                "type": "checkbox",
                "label": "Lethal",
                "id": "lethal",
                "cost": -1,
                "flag": "lethal"
            },
            {
                "type": "checkbox",
                "label": "Permanent",
                "id": "permanent",
                "cost": -2,
                "flag": "permanent"
            }
        ]
    },
	"dodge": {
    "baseCost": 0,
    "activePower": false,
    "fields": [
        {
            "type": "level",
            "label": "Level",
            "id": "level",
            "initLevel": 1,
            "costexp": "level",
            "checkexp": "level>0 && level<=5",
            "checkmsg": "Dodge must be 5 or less.",
            "flag": "level"
        },
        {
            "type": "select",
            "label": "Defender",
            "id": "defender",
            "flag": "defender",
            "costexp": "level",
            "options": [
                {
                    "name": "--",
                    "value": 0
                },
                {
                    "name": "MBT (+2)",
                    "value": 2
                },
                {
                    "name": "MBT/LBT (+4)",
                    "value": 4
                }
            ]
        },
        {
            "type": "checkbox",
            "label": "Requires Activation",
            "id": "requiresActivation",
            "cost": -1,
            "flag": "requiresActivation"
        },
        {
            "type": "checkbox",
            "label": "Deflect",
            "id": "deflect",
            "cost": 2,
            "flag": "deflect"
        }
    ],
    "effects": [
        {
            "name": "Dodge",
            "value": "-@F[level]"
        }
    ]
},

"energy-control": {
    "activePower": true,
    "fields": [
        {
            "type": "select",
            "label": "Power",
            "id": "damage",
            "flag": "damage",
            "costexp": "level",
            "options": [
                {
                    "name": "2d6 (+0)",
                    "value": 0,
                    "update": "system.damage:'2d6'"
                },
                {
                    "name": "4d6 (+5)",
                    "value": 5,
                    "update": "system.damage:'4d6'"
                }
            ]
        },
        {
            "type": "select",
            "label": "Area Effect",
            "id": "areaeffect",
            "flag": "areaeffect",
            "costexp": "level",
            "omitifzero": true,
            "options": [
                {
                    "name": "MBT",
                    "value": 0,
                    "grantupdate": {
                        "uuid": "grantuuid",
                        "update": "system.templates.medium: false; system.templates.large: false"
                    }
                },
                {
                    "name": "LBT (+2)",
                    "value": 2,
                    "grantupdate": {
                        "uuid": "grantuuid",
                        "update": "system.templates.medium: true; system.templates.large: false"
                    }
                }
            ]
        },
        {
            "label": "Additional Power Type",
            "type": "level",
            "flag": "addpowertype",
            "id": "addpowertype",
            "costexp": "level",
            "initLevel": 0,
            "checkexp": "level>=0",
            "checkmsg": "Additional power type must be zero or greater."
        },
        {
            "label": "Requires Material",
            "type": "checkbox",
            "flag": "requiresMaterial",
            "id": "requiresMaterial",
            "cost": -1
        }
    ],
    "baseCost": 5
},
	"entangle": {
        "baseCost": 3,
		"activePower": true,
        "fields": [
            {
                "type": "select",
                "label": "Area Effect",
                "id": "areaeffect",
                "flag": "areaeffect",
                "costexp": "level",
                "options": [
                    {"name": "--", "value": 0},
                    {"name": "MBT (+2)", "value": 2},
                    {"name": "MBT/LBT (+4)", "value": 4}
                ]
            },
            {
                "type": "select",
                "label": "Deadly",
                "id": "deadly",
                "flag": "deadly",
                "costexp": "level",
                "options": [
                    {"name": "No damage", "value": 0, "update": "system.damage:''"},
                    {"name": "2d6 (+2)", "value": 2, "update": "system.damage:'2d6'"},
                    {"name": "3d6 (+4)", "value": 4, "update": "system.damage:'3d6'"}
                ]
            },
            {
                "type": "select",
                "label": "Requires Material",
                "id": "requiresmaterial",
                "costexp": "level",
                "flag": "requiresmaterial",
                "options": [
                    {"name": "None", "value": 0},
                    {"name": "Common (-1)", "value": -1},
                    {"name": "Rare (-2)", "value": -2}
                ]
            },
            {
                "type": "checkbox",
                "label": "Requires Touch",
                "id": "requiresTouch",
                "cost": -2,
                "flag": "requiresTouch"
            },
            {
                "type": "checkbox",
                "label": "Strong",
                "id": "strong",
                "cost": 2,
                "flag": "strong"
            }
		]
	},
	"environmental-resistance": {
        "baseCost": 1,
		"activePower": true,
        "fields": [
            {
                "type": "level",
                "label": "Additional Power Type",
                "id": "additionalPowerType",
				"initLevel": 0,
                "costexp": "level",
				"checkexp": "level>=0",
                "flag": "additionalPowerType"
            },
            {
                "type": "select",
                "label": "Area Effect",
                "id": "areaeffect",
                "flag": "areaeffect",
                "costexp": "level",
                "options": [
                    {"name": "--", "value": 0},
                    {"name": "MBT (+2)", "value": 2},
                    {"name": "MBT/LBT (+4)", "value": 4}
                ]
            },
            {
                "type": "level",
                "label": "Immunity",
                "id": "immunity",
				"initLevel": 0,
                "costexp": "level*2",
				"checkexp": "level>=0",
                "flag": "immunity"
            },
            {
                "type": "checkbox",
                "label": "Requires Activation",
                "id": "requiresActivation",
                "cost": -1,
                "flag": "requiresActivation"
            }
		]
	},	
    'fear': {
        "baseCost": 3,
        "fields": [
            {
                "type": "select",
                "label": "Area Effect",
                "id": "areaeffect",
                "flag": "areaeffect",
                "costexp": "level",
                "options": [
                    {"name": "--", "value": 0},
                    {"name": "MBT (+2)", "value": 2},
                    {"name": "MBT/LBT (+4)", "value": 4}
                ]
            },
            {
                "type": "checkbox",
                "label": "Requires Touch",
                "id": "requiresTouch",
                "cost": -2,
                "flag": "requiresTouch"
            },
            {
                "type": "checkbox",
                "label": "Strong",
                "id": "strong",
                "cost": 1,
                "flag": "strong"
            }
            
        ]
    },
    
    "flight": {
        "fields": [
            {
                "type": "select",
                "label": "Speed",
                "id": "speed",
                "flag": "speed",
                "costexp": "level",
                "options": [
                    {"name": "Pace 6 (2)", "value": 2, "auxflags": "pace:6"},
                    {"name": "Pace 12 (4)", "value": 4, "auxflags": "pace:12"},
                    {"name": "Pace 24 (5)", "value": 4, "auxflags": "pace:24"},
                    {"name": "Pace 45 (6)", "value": 6, "auxflags": "pace:45"},
                    {"name": "Pace 90 (8)", "value": 8, "auxflags": "pace:90"},
                    {"name": "Pace 180 (10)", "value": 10, "auxflags": "pace:180"},
                    {"name": "Pace 360 (12)", "value": 12, "auxflags": "pace:360"},
                    {"name": "Sonic Speed (14)", "value": 14, "auxflags": "pace:1200"},
                    {"name": "Super Sonic Speed (16)", "value": 16, "auxflags": "pace:2400"},
                    {"name": "Near Light Speed (18)", "value": 18, "auxflags": "pace:48000"}
                ]
            },
            {
                "label": "FTL",
                "type": "checkbox",
                "flag": "ftl",
                "id": "ftl",
                "cost": 1
            },
            {
                "label": "Glider",
                "type": "checkbox",
                "flag": "glider",
                "id": "glider",
                "cost": -1
            },
            {
                "label": "Maneuverable",
                "type": "checkbox",
                "flag": "maneuverable",
                "id": "maneuverable",
                "cost": 1
            },
            {
                label: "Ungainly",
                type: "checkbox",
                flag: "ungainly",
                id: "ungainly",
                cost: -2
            }
        ],
        effects: [
            {
                name: "Pace",
                value: "@F[pace]"
            }
        ]
    },
	"force-field": {
        "baseCost": 1,
		"activePower": true,
        "fields": [
            {
                "type": "level",
                "label": "Level",
                "id": "level",
				"initLevel": 1,
                "costexp": "level",
				"checkexp": "level>0 && level<=10",
                "flag": "level"
            },
            {
                "type": "select",
                "label": "Area Effect",
                "id": "areaeffect",
                "flag": "areaeffect",
                "costexp": "level",
                "options": [
                    {"name": "--", "value": 0},
                    {"name": "MBT (+2)", "value": 2},
                    {"name": "MBT/LBT (+4)", "value": 4}
                ]
            },
            {
                "type": "checkbox",
                "label": "Requires Activation",
                "id": "requiresActivation",
                "cost": -1,
                "flag": "requiresActivation"
            },
            {
                "type": "checkbox",
                "label": "Mobile",
                "id": "mobile",
                "cost": 1,
                "flag": "mobile"
            },
            {
                "type": "checkbox",
                "label": "Life Support",
                "id": "lifeSupport",
                "cost": 2,
                "flag": "lifeSupport"
            }
		],
            "effects": [
			{
                "name": "Damage Reduction",
                "value": "-@F[level]"
			}
            ]
		
	},
	"growth":  {
        "fields": [
            {
                "label": "Level",
                "id": "level",
                "type": "level",
                "flag": "level",
                "costexp": "level*3",
				"checkexp": "level>0",
				"checkmsg": "Level must be 1+."
            }
        ],
        "effects": [
            {
                "name": "Size",
                "value": "@F[level]*2"
            },
            {
                "name": "Strength",
                "value": "@F[level]*2"
            },
            {
                "name": "Pace",
                "value": "[0, 2, 4, 6][Math.trunc(@F[level]/4)]"
            }
        ]
    },
	"hardy": {
        "baseCost": 2,
        "fields": [
            {
                "type": "dndtarget",
                "label": "Drop the Ability here",
                "descriptor": "Ability",
                "id": "ability",
                "dropType": "Item",
                "itemType": "ability",
                "flag": "grantuuid",
                "addToActor": true
            }
        ],
		"createActions": [
			{
				"type": "additem",
				"addUuid": "grantuuid",
				"uuid": "Compendium.swade-core-rules.swade-specialabilities.Item.0sxEdBfTBDKwpN5S"
			}
		],
        "deleteActions": [
            {
                "deleteUuid": "grantuuid"
            }
        ]
    },	
	"healing": {
        "baseCost": 3,
        "fields": [
            {
                "type": "checkbox",
                "label": "Cure",
                "id": "cure",
                "cost": 2,
                "flag": "cure"
            },
            {
                "type": "checkbox",
                "label": "Fatigue",
                "id": "fatigue",
                "cost": 2,
                "flag": "fatigue"
            },
            {
                "type": "checkbox",
                "label": "Refresh",
                "id": "refresh",
                "cost": 2,
                "flag": "refresh"
            },
            {
                "type": "checkbox",
                "label": "Requires Touch",
                "id": "requiresTouch",
                "cost": -2,
                "flag": "requiresTouch"
            },
            {
                "type": "checkbox",
                "label": "Restoration",
                "id": "restoration",
                "cost": 2,
                "flag": "restoration"
            },
            {
                "type": "checkbox",
                "label": "Resurrection",
                "id": "resurrection",
                "cost": 2,
                "flag": "resurrection"
            }
        ]
    },	
	"heightened-senses": {
        "baseCost": 0,
        "fields": [
            {
                "type": "checkbox",
                "label": "Eagle Eyes",
                "id": "eagleEyes",
                "cost": 1,
                "flag": "eagleEyes"
            },
            {
                "type": "checkbox",
                "label": "Hearing",
                "id": "hearing",
                "cost": 1,
                "flag": "hearing"
            },
            {
                "type": "checkbox",
                "label": "Infravision",
                "id": "infravision",
                "cost": 1,
                "flag": "infravision"
            },
            {
                "type": "checkbox",
                "label": "Low Light Vision",
                "id": "lowLightVision",
                "cost": 1,
                "flag": "lowLightVision"
            },
            {
                "type": "checkbox",
                "label": "Microscopic Vision",
                "id": "microscopicVision",
                "cost": 1,
                "flag": "microscopicVision"
            },
            {
                "type": "checkbox",
                "label": "Smell",
                "id": "smell",
                "cost": 1,
                "flag": "smell"
            },
            {
                "type": "checkbox",
                "label": "X-Ray Vision",
                "id": "xrayVision",
                "cost": 1,
                "flag": "xrayVision"
            }
		]
	},
	"illusion": {
        "baseCost": 1,
        "fields": [
            {
                "type": "checkbox",
                "label": "After Effects",
                "id": "afterEffects",
                "cost": 1,
                "flag": "afterEffects"
            },
            {
                "type": "checkbox",
                "label": "Area Effect",
                "id": "areaEffect",
                "cost": 2,
                "flag": "areaEffect"
            },
            {
                "type": "checkbox",
                "label": "Distraction",
                "id": "distraction",
                "cost": 1,
                "flag": "distraction"
            },
            {
                "type": "checkbox",
                "label": "Film Quality",
                "id": "filmQuality",
                "cost": 1,
                "flag": "filmQuality"
            },
            {
                "type": "checkbox",
                "label": "Obscurement",
                "id": "obscurement",
                "cost": 2,
                "flag": "obscurement"
            },
            {
                "type": "checkbox",
                "label": "System Shock",
                "id": "systemShock",
                "cost": 2,
                "flag": "systemShock"
            }
        ]
    },
	"immune-to-disease": {
        "baseCost": 1,
        "fields": [
            {
                "type": "checkbox",
                "label": "Cure Disease",
                "id": "cureDisease",
                "cost": 2,
                "flag": "cureDisease"
            }
        ]
    },
	"immune-to-poison": {
        "baseCost": 1,
        "fields": [
            {
                "type": "checkbox",
                "label": "Cure Poison",
                "id": "curePoison",
                "cost": 2,
                "flag": "curePoison"
            }
        ]
    },
	
	"leaping": {
    "fields": [
        {
            "type": "select",
            "label": "Vertical/Horizontal Distance",
            "id": "distance",
            "flag": "distance",
            "costexp": "level",
            "options": [
                {"name": "2\"/4\" (1)","value": 1},
                {"name": "4\"/8\" (2)","value": 2},
                {"name": "8\"/16\" (3)","value": 3},
                {"name": "16\"/32\" (4)","value": 4},
                {"name": "32\"/64\" (5)","value": 5},
                {"name": "Half Mile/Mile (8)","value": 8}
            ]
        },
        {
            "label": "Bounce",
            "type": "checkbox",
            "flag": "bounce",
            "id": "bounce",
            "cost": 1
        },
        {
            "label": "Death from Above",
            "type": "checkbox",
            "flag": "deathFromAbove",
            "id": "deathFromAbove",
            "cost": 1
        }
    ]
	},
    "malfunction": {
        "baseCost": 3,
        "fields": [
            {
                "type": "select",
                "label": "Area Effect",
                "id": "areaeffect",
                "flag": "areaeffect",
                "costexp": "level",
                "options": [
                    {"name": "--", "value": 0},
                    {"name": "MBT (+2)", "value": 2},
                    {"name": "MBT/LBT (+4)", "value": 4}
                ]
            },
            {
                "type": "checkbox",
                "label": "Requires Touch",
                "id": "requiresTouch",
                "cost": -2,
                "flag": "requiresTouch"
            }
        ]
    },
	
"melee-attack": {
    "activePower": true,
    "fields": [
        {
            "type": "select",
            "label": "Damage",
            "id": "damage",
            "flag": "damage",
            "costexp": "level",
            "callFunc": "createMeleeAttack(item, 'Unarmed', 'unarmeduuid', '@str')",
            "options": [
                {
                    "name": "Str (--)",
                    "value": 0,
                    "auxflags": "meleeDamage:''"
                },
                {
                    "name": "Str+d6 (2)",
                    "value": 2,
                    "auxflags": "meleeDamage:'d6'"
                },
                {
                    "name": "Str+2d6 (4)",
                    "value": 4,
                    "auxflags": "meleeDamage:'2d6'"
                },
                {
                    "name": "Str+3d6 (6)",
                    "value": 6,
                    "auxflags": "meleeDamage:'3d6'"
                }
            ]
        },
        {
            "type": "select",
            "label": "Claws",
            "id": "claws",
            "flag": "claws",
            "costexp": "level",
            "omitifzero": true,
            "options": [
                {
                    "name": "None (--)",
                    "value": 0
                },
                {
                    "name": "Str+d4 (2)",
                    "value": 2,
                    "callFunc": "createMeleeAttack(item, 'Claws', 'clawsuuid', '@str+d4')"
                },
                {
                    "name": "Str+d6 (3)",
                    "value": 3,
                    "callFunc": "createMeleeAttack(item, 'Claws', 'clawsuuid', '@str+d6')"
                },
                {
                    "name": "Str+2d6 (5)",
                    "value": 5,
                    "callFunc": "createMeleeAttack(item, 'Claws', 'clawsuuid', '@str+2d6')"
                }
            ]
        },
        {
            "type": "select",
            "label": "Bite",
            "id": "bite",
            "flag": "bite",
            "costexp": "level",
            "omitifzero": true,
            "options": [
                {
                    "name": "None (--)",
                    "value": 0
                },
                {
                    "name": "Str+d4 (1)",
                    "value": 1,
                    "callFunc": "createMeleeAttack(item, 'Bite', 'biteuuid', '@str+d4')"
                },
                {
                    "name": "Str+d6 (2)",
                    "value": 2,
                    "callFunc": "createMeleeAttack(item, 'Bite', 'biteuuid', '@str+d6')"
                },
                {
                    "name": "Str+2d6 (4)",
                    "value": 4,
                    "callFunc": "createMeleeAttack(item, 'Bite', 'biteuuid', '@str+2d6')"
                }
            ]
        },
        {
            "type": "select",
            "label": "Horns",
            "id": "horns",
            "flag": "horns",
            "costexp": "level",
            "omitifzero": true,
            "options": [
                {
                    "name": "None (--)",
                    "value": 0
                },
                {
                    "name": "Str+d4 (1)",
                    "value": 1,
                    "callFunc": "createMeleeAttack(item, 'Horns', 'hornsuuid', '@str+d4')"
                },
                {
                    "name": "Str+d6 (2)",
                    "value": 2,
                    "callFunc": "createMeleeAttack(item, 'Horns', 'hornsuuid', '@str+d6')"
                },
                {
                    "name": "Str+2d6 (4)",
                    "value": 4,
                    "callFunc": "createMeleeAttack(item, 'Horns', 'hornsuuid', '@str+2d6')"
                }
            ]
        },
        {
            "type": "select",
            "label": "Special Weapon",
            "id": "specialweapon",
            "flag": "specialweapon",
            "costexp": "level",
            "omitifzero": true,
            "options": [
                {
                    "name": "None (--)",
                    "value": 0
                },
                {
                    "name": "+d6 (2)",
                    "value": 2,
                    "callFunc": "specialWeapon(item, 'swuuid', 'd6')"
                },
                {
                    "name": "+2d6 (4)",
                    "value": 4,
                    "callFunc": "specialWeapon(item, 'swuuid', '2d6')"
                },
                {
                    "name": "+3d6 (6)",
                    "value": 6,
                    "callFunc": "specialWeapon(item, 'swuuid', '3d6')"
                },
                {
                    "name": "+4d6 (8)",
                    "value": 8,
                    "callFunc": "specialWeapon(item, 'swuuid', '4d6')"
                },
                {
                    "name": "+5d6 (10)",
                    "value": 10,
                    "callFunc": "specialWeapon(item, 'swuuid', '5d6')"
                }
            ]
        },
        {
            "type": "select-item",
            "label": "Select Special Weapon",
            "id": "swuuid",
            "flag": "swuuid",
            "omitifzero": true,
            "itemType": "weapon"
        },
        {
            "label": "Armor Piercing",
            "type": "level",
            "initLevel": 0,
            "flag": "ap",
            "id": "ap",
            "min": 0,
            "costexp": "level",
            "checkexp": "level>=0 && level<=10",
            "grantupdate": {"uuid": "apuuid", "update": "system.ap: @F[ap]*2"}
        },
        {
            "type": "select-item",
            "label": "Select AP Weapon",
            "id": "apuuid",
            "flag": "apuuid",
            "omitifzero": true,
            "itemType": "weapon"
        },
        {
            "label": "Charge",
            "type": "checkbox",
            "flag": "charge",
            "id": "charge",
            "cost": 1
        },
        {
            "label": "Smash",
            "type": "checkbox",
            "flag": "smash",
            "id": "smash",
            "cost": 3
        },
        {
            "label": "Thrown Weapons",
            "type": "checkbox",
            "flag": "thrownWeapons",
            "id": "thrownWeapons",
            "cost": 2
        },
        {
            "label": "Returnable",
            "type": "checkbox",
            "flag": "returnable",
            "id": "returnable",
            "cost": 1
        },
        {
            "label": "Matched Set",
            "type": "checkbox",
            "flag": "matchedset",
            "id": "matchedset",
            "cost": 1
        }
    ],
    "deleteActions": [
        {
            "deleteUuid": "unarmeduuid"
        },
        {
            "deleteUuid": "clawsuuid"
        },
        {
            "deleteUuid": "biteuuid"
        },
        {
            "deleteUuid": "hornssuuid"
        }
    ]
},
    'parry': {
        activePower: true,
        fields: [
            {
                label: 'Level',
                type: 'level',
                flag: 'level',
                id: 'level',
                costexp: "level",
                checkexp: "level > 0 && level <=5",
                checkmsg: "Parry must be 1-5."
            },
            {
                type: 'checkbox',
                label: 'Protect',
                id: 'protect',
                cost: 2,
                flag: 'protect'
            },
            {
                type: 'checkbox',
                label: 'Deflect',
                id: 'deflect',
                cost: 2,
                flag: 'deflect'
            }
        ],
        effects: [
            {
                name: "Parry",
                value: "@F[level]"
            }
        ]
    },
    'poison': {
        activePower: true,
        baseCost: 2,
        fields: [
            {
                type: 'select',
                label: 'Area Effect',
                id: 'areaeffect',
                flag: 'areaeffect',
                costexp: "level",
                options: [
                    {name: '--', value: 0},
                    {name: 'MBT (+2)', value: 2},
                    {name: 'MBT/LBT (+4)', value: 4}
                ]
            },
            {
                type: 'checkbox',
                label: 'Deadly',
                id: 'deadly',
                cost: 1,
                flag: 'deadly'
            },
            {
                type: 'checkbox',
                label: 'Strong',
                id: 'strong',
                cost: 1,
                flag: 'strong'
            }
        ]
    },
    'possession': {
        activePower: true,
        baseCost: 5,
        fields: [
            {
                type: 'checkbox',
                label: 'Forgetful',
                id: 'forgetful',
                cost: 2,
                flag: 'forgetful'
            },
            {
                type: 'checkbox',
                label: 'Memories',
                id: 'memories',
                cost: 2,
                flag: 'memories'
            },
            {
                type: 'checkbox',
                label: 'Requires Touch',
                id: 'requiresTouch',
                cost: -2,
                flag: 'requiresTouch'
            },
            {
                type: 'checkbox',
                label: 'Strong',
                id: 'strong',
                cost: 2,
                flag: 'strong'
            }
        ]
    },
	
"ranged-attack": {
    "activePower": true,
	"trackuuid": "grantuuid",
    "fields": [
        {
            "type": "select",
            "label": "Damage",
            "id": "damage",
            "flag": "damage",
            "costexp": "level",
            "options": [
                {
                    "name": "2d6 (3)",
                    "value": 3,
                    "grantupdate": {"uuid": "grantuuid", "update": "system.damage:'2d6'"}
                },
                {
                    "name": "3d6 (6)",
                    "value": 6,
                    "grantupdate": {"uuid": "grantuuid", "update": "system.damage:'3d6'"}
                },
                {
                    "name": "4d6 (9)",
                    "value": 9,
                    "grantupdate": {"uuid": "grantuuid", "update": "system.damage:'4d6'"}
                },
                {
                    "name": "5d6 (12)",
                    "value": 12,
                    "grantupdate": {"uuid": "grantuuid", "update": "system.damage:'5d6'"}
                },
                {
                    "name": "6d6 (15)",
                    "value": 15,
                    "grantupdate": {"uuid": "grantuuid", "update": "system.damage:'6d6'"}
                }
            ]
        },
        {
            "type": "select",
            "label": "Area Effect",
            "id": "areaeffect",
            "flag": "areaeffect",
            "costexp": "level",
            "omitifzero": true,
            "options": [
                {
                    "name": "--",
                    "value": 0,
					"grantupdate": {"uuid": "grantuuid", "update": "system.templates.medium: false; system.templates.large: false"}
                },
                {
                    "name": "MBT (+2)",
                    "value": 2,
					"grantupdate": {"uuid": "grantuuid", "update": "system.templates.medium: true; system.templates.large: false"}
                },
                {
                    "name": "MBT/LBT (+4)",
                    "value": 4,
					"grantupdate": {"uuid": "grantuuid", "update": "system.templates.medium: true; system.templates.large: true"}

                }
            ]
        },
        {
            "label": "Armor Piercing",
            "type": "level",
            "initLevel": 0,
            "flag": "ap",
            "id": "ap",
            "min": 0,
            "costexp": "level",
            "checkexp": "level>=0 && level<=5",
			"grantupdate": {"uuid": "grantuuid", "update": "system.ap: @F[ap]*2"}
        },
        {
            "label": "Cone Optional",
            "type": "checkbox",
            "flag": "coneoptional",
            "id": "coneoptional",
            "cost": 1
        },
        {
            "label": "Lethal",
            "type": "checkbox",
            "flag": "lethal",
            "id": "lethal",
            "cost": -1
        },
        {
            "type": "select",
            "label": "Rate of Fire",
            "id": "rof",
            "flag": "rof",
            "costexp": "level",
            "omitifzero": true,
            "options": [
                {
                    "name": "--",
                    "value": 0
                },
                {
                    "name": "RoF 2 (+3)",
                    "value": 3
                },
                {
                    "name": "RoF 3 (+6)",
                    "value": 6
                }
            ]
        },
        {
            "label": "Requires Material",
            "type": "checkbox",
            "flag": "requiresMaterial",
            "id": "requiresMaterial",
            "cost": -1
        },
        {
            "label": "Spread",
            "type": "checkbox",
            "flag": "spread",
            "id": "spread",
            "cost": 1,
            "grantupdate": {"uuid": "grantuuid", "update": "system.actions.traitMod: @F[spread]?2:0"}
        }
    ],
		"createActions": [
			{
				"type": "additem",
				"addUuid": "grantuuid",
				"uuid": "Compendium.super-noir.items.Item.sWyH2JBBNYtGiYjq"
			}
		],
		"deleteActions": [
			{
				"deleteUuid": "grantuuid"
			}
		]
	
}
	
    'ranged-attack': {
        activePower: true,
        fields: [
            {
                type: 'select',
                label: 'Damage',
                id: 'damage',
                flag: 'damage',
                costexp: 'level',
                options: [
                    {name: '2d6 (3)', value: 3, "grantupdate": {"uuid": "grantuuid", "update": "system.damage:'2d6'"}},
                    {name: '3d6 (6)', value: 6, update: "system.damage:'3d6'"},
                    {name: '4d6 (9)', value: 9, update: "system.damage:'4d6'"},
                    {name: '5d6 (12)', value: 12, update: "system.damage:'5d6'"},
                    {name: '6d6 (15)', value: 15, update: "system.damage:'6d6'"}
                ]
            },
            {
                type: 'select',
                label: 'Area Effect',
                id: 'areaeffect',
                flag: 'areaeffect',
                costexp: "level",
                omitifzero: true,
                options: [
                    {name: '--', value: 0},
                    {name: 'MBT (+2)', value: 2},
                    {name: 'MBT/LBT (+4)', value: 4}
                ]
            },
            {
                label: 'Armor Piercing',
                type: 'level',
                initLevel: 0,
                flag: 'ap',
                id: 'ap',
                min: 0,
                costexp: 'level',
                checkexp: 'level>=0 && level<=5',
                update: "system.ap: 2+@F[ap]*2"
            },
            {
                label: 'Cone Optional',
                type: 'checkbox',
                flag: 'coneoptional',
                id: 'coneoptional',
                cost: 1
            },
            {
                label: 'Lethal',
                type: 'checkbox',
                flag: 'lethal',
                id: 'lethal',
                cost: -1
            },
            {
                type: 'select',
                label: 'Rate of Fire',
                id: 'rof',
                flag: 'rof',
                costexp: 'level',
                omitifzero: true,
                options: [
                    {name: '--', value: 0},
                    {name: 'RoF 2 (+3)', value: 3},
                    {name: 'RoF 3 (+6)', value: 6}
                ]
            },
            {
                label: 'Requires Material',
                type: 'checkbox',
                flag: 'requiresMaterial',
                id: 'requiresMaterial',
                cost: -1
            },
            {
                label: 'Spread',
                type: 'checkbox',
                flag: 'spread',
                id: 'spread',
                cost: 1,
                update: "system.actions.traitMod: 2",
                undoUpdate: "system.actions.traitMod: 0"
            }
        ],
		"createActions": [
			{
				"type": "additem",
				"addUuid": "grantuuid",
				"uuid": "Compendium.super-noir.items.Item.sWyH2JBBNYtGiYjq"
			}
		],
		"deleteActions": [
			{
				"deleteUuid": "grantuuid"
			}
		]
		
    },
        
    'regeneration': {
        activePower: true,
        fields: [
            {
                type: 'select',
                label: 'Frequency',
                id: 'freqency',
                flag: 'frequency',
                costexp: 'level',
                options: [
                    {name: 'Daily (2)', value: 2},
                    {name: 'Hourly (5)', value: 5},
                    {name: 'Every Round (10)', value: 10}
                ]
            },
            {
                label: 'Destruction',
                type: 'checkbox',
                flag: 'destruction',
                id: 'destruction',
                cost: -1,
            },
            {
                label: 'Relief',
                type: 'checkbox',
                flag: 'relief',
                id: 'relief',
                cost: 2,
            },
            {
                label: 'Regrowth',
                type: 'checkbox',
                flag: 'regrowth',
                id: 'regrowth',
                cost: 2,
            }
        ],
    },
    'speed': {
    "fields": [
        {
            "type": "select",
            "label": "Speed",
            "id": "speed",
            "flag": "speed",
            "costexp": "level",
            "options": [
                {
                    "name": "Pace 12 (3)",
                    "value": 3,
                    "auxflags": "pace:12; attackPenalty:0"
                },
                {
                    "name": "Pace 24 (4)",
                    "value": 4,
                    "auxflags": "pace:24; attackPenalty:0"
                },
                {
                    "name": "Pace 45 (5)",
                    "value": 5,
                    "auxflags": "pace:45; attackPenalty:0"
                },
                {
                    "name": "Pace 90 (7)",
                    "value": 7,
                    "auxflags": "pace:90; attackPenalty:-1"
                },
                {
                    "name": "Pace 180 (9)",
                    "value": 9,
                    "auxflags": "pace:180; attackPenalty:-2"
                },
                {
                    "name": "Pace 360 (11)",
                    "value": 11,
                    "auxflags": "pace:360; attackPenalty:-4"
                },
                {
                    "name": "Sonic Speed (13)",
                    "value": 13,
                    "auxflags": "pace:1200; attackPenalty:-6"
                },
                {
                    "name": "Super Sonic Speed (15)",
                    "value": 15,
                    "auxflags": "pace:2400; attackPenalty:-8"
                },
                {
                    "name": "Near Light Speed (17)",
                    "value": 17,
                    "auxflags": "pace:48000; attackPenalty:-10"
                }
            ]
        },
        {
            "label": "Maneuverable",
            "type": "checkbox",
            "flag": "maneuverable",
            "id": "maneuverable",
            "cost": 1
        },
        {
            "label": "Pummel",
            "type": "checkbox",
            "flag": "pummel",
            "id": "pummel",
            "cost": 4
        },
        {
            "label": "Surface Tension",
            "type": "checkbox",
            "flag": "surfacetension",
            "id": "surfacetension",
            "cost": 1
        },
        {
            "label": "Vibrate",
            "type": "checkbox",
            "flag": "vibrate",
            "id": "vibrate",
            "cost": 5
        },
        {
            "label": "Ungainly",
            "type": "checkbox",
            "flag": "ungainly",
            "id": "ungainly",
            "cost": -2
        }
    ],
    "effects": [
        {
            "name": "Pace",
            "value": "@F[pace]"
        },
        {
            "name": "Pummel",
            "applyEffect": "pummel"
        },
        {
            "name": "Attack Penalty",
            "applyEffect": "attackPenalty"
        }
    ]
},
    'super-attribute': {
        fields: [
            {
                type: 'select',
                label: 'Attribute',
                id: 'attribute',
                flag: 'attribute',
                options: [
                    {name: 'Agility', value: 'agility'},
                    {name: 'Smarts', value: 'smarts'},
                    {name: 'Spirit', value: 'spirit'},
                    {name: 'Strength', value: 'strength'},
                    {name: 'Vigor', value: 'vigor'}
                ]
            },
            {
                label: 'Level',
                id: 'level',
                type: 'level',
                flag: 'level',
                costexp: "level*2",
            }
        ],
        effects: [
            {
                key: "system.attributes.@F[attribute].die.sides",
                name: "Attribute Bonus",
                value: "@F[level]*2"
            }
        ]
    },
    'super-edge': {
        "baseCost": 2,
        "fields": [
            {
                "type": "dndtarget",
                "label": "Drop the Edge here",
                "descriptor": "Edge",
                "id": "edge",
                "dropType": "Item",
                "itemType": "edge",
                "flag": "grantuuid",
                "addToActor": true
            }
        ],
        "deleteActions": [
            {
                "deleteUuid": "grantuuid"
            }
        ]
    },
    'super-skill': {
        fields: [
            {
                type: 'dndtarget',
                label: 'Drop the skill here',
                id: 'skill',
                descriptor: 'Skill',
                dropType: 'Item',
                itemType: 'skill',
                flag: 'grantuuid',
                nameflag: 'skillname',
                addIfMissing: true
            },
            {
                label: 'Level',
                type: 'level',
                flag: 'level',
                id: 'level',
                costexp: "superSkillCost(dialog, item, level)",
                checkexp: "level > 0",
                checkmsg: "Level must be greater than zero."
            }
        ],
		"requirements": [
			{
				"expression": "superSkillTotal(actor)",
				"message": "`Points in all Super Skills must not exceed the Power Limit (${game.settings.get(moduleId, 'powerlimit')})`"
			}
		],
        deleteActions: [
            {
                deleteUuid: 'grantuuid'
            }
        ],
        effects: [
            {
                key: "@Skill{@F[skillname]}[system.die.sides]",
                name: "Skill Bonus",
                value: "@F[level]*2"
            }
        ]
        
    },
	"swinging": {
		"baseCost": 2,
		"fields": [
			{
				"type": "checkbox",
				"label": "Strong Line",
				"cost": 1,
				"flag": "strongline",
				"id": "strongline"
			}
		]
	},
	
    'telekinesis': {
        "baseCost": 3,
        "fields": [
            {
                "type": "checkbox",
                "label": "Fine Control",
                "id": "finecontrol",
                "cost": 3,
                "flag": "finecontrol"
            },
            {
                "type": "checkbox",
                "label": "Flight",
                "id": "flight",
                "cost": 2,
                "flag": "flight"
            },
            {
                "type": "level",
                "label": "Power",
                "id": "power",
                "costexp": "level*2",
				"checkexp": "level>0",
				"checkmsg": "Power level can't be negative.",
				"initLevel": 0,
				"labelexp": "`Power (Strength ${displayDie(6+level+2)})`",
                "flag": "power"
            }
		]
	},
	
	"telepathy": {
        "baseCost": 2,
        "fields": [
            {
                "type": "checkbox",
                "label": "Range",
                "id": "range",
                "cost": 2,
                "flag": "range"
            },
            {
                "type": "checkbox",
                "label": "Mind Rider",
                "id": "mindrider",
                "cost": 3,
                "flag": "mindrider"
            },
            {
                "type": "checkbox",
                "label": "Switchboard",
                "id": "switchboard",
                "cost": 2,
                "flag": "switchboard"
            }
		]
	},
	"teleport": {
        "baseCost": 2,
        "fields": [
            {
                "type": "checkbox",
                "label": "Portal",
                "id": "portal",
                "cost": 2,
                "flag": "portal"
            },
            {
                "type": "checkbox",
                "label": "Rapid Teleport",
                "id": "rapidteleport",
                "cost": 1,
                "flag": "rapidteleport"
            },
            {
                "type": "select",
                "label": "Range",
                "id": "range",
                "flag": "range",
                "costexp": "level",
                "options": [
                    {"name": "--", "value": 0, "update": "system.range:12"},
                    {"name": "24 (+1)", "value": 1, "update": "system.range:24"},
                    {"name": "48 (+2)", "value": 2, "update": "system.range:48"}
                ]
            },
            {
                "type": "checkbox",
                "label": "Redirect",
                "id": "redirect",
                "cost": 4,
                "flag": "redirect"
            },
            {
                "type": "checkbox",
                "label": "Traverse",
                "id": "traverse",
                "cost": 1,
                "flag": "traverse"
            },
            {
                "type": "checkbox",
                "label": "Teleport Others",
                "id": "teleportothers",
                "cost": 5,
                "flag": "teleportothers"
            }
		]
	},
    'toughness': {
        fields: [
            {
                label: 'Level',
                type: 'level',
                flag: 'level',
                id: 'level',
                costexp: "level",
                checkexp: "level > 0",
                checkmsg: "Level must be greater than zero."
            }
        ],
        effects: [
            {
                name: "Toughness",
                value: "@F[level]"
            }
        ],
		"requirements": [
			{
				"expression": "toughArmorTotal(actor)<=game.settings.get(moduleId, 'powerlimit')",
				"message": "`Toughness and Armor (${toughArmorTotal(actor)}) exceed the Power Limit (${game.settings.get(moduleId, 'powerlimit')}).`"
			}
		]
    },

};