
Hooks.once('ready', () => {
	const BETTER_ROLLS_GLOBAL_ACTIONS = [
		{
			"id": "CONVICTION",
			"name": "Conviction",
			"button_name": "Conviction",
			"selector_type": "all",
			"attrMod": "+1d6x",
			"dmgMod": "+1d6x",
			"skillMod": "+1d6x",
			"group": "BRSW.SituationalModifiers",
			"defaultChecked": "off"
		},
		{
			"id": "PUMMEL",
			"name": "Pummel",
			"button_name": "Pummel",
			"skillMod": "+4",
			"and_selector": [
				{
					"selector_type": "actor_has_effect",
					"selector_value": "Pummel"
				},
				{
					"selector_type": "skill",
					"selector_value": "Fighting"
				}
			],
			"group": "BRSW.AttackOption",
			"defaultChecked": "off"
		},
		{
			"id": "IRONJAWABSORPTION",
			"name": "Iron Jaw",
			"button_name": "Iron Jaw",
			"skillMod": "+2",
			"and_selector": [
				{
					"selector_type": "actor_has_edge",
					"selector_value": "Iron Jaw"
				},
				{
					"selector_type": "item_name",
					"selector_value": "Absorption"
				}
			],
			"group": "Power Modifiers",
			"defaultChecked": "on"
		},
		{
			id: "HEAVYWEAPONSupers",
			name: "BRSW.PowerModifiersGenericHeavyWeaponModifier",
			button_name: "BRSW.PowerModifiersGenericHeavyWeaponModifier",
			isHeavyWeapon: true,
			selector_type: "item_additional_stat_isHeavyWeapon",
			selector_value: 1,
			group: "Super Powers",
			"defaultChecked": "on"
		},
		{
			"id": "TARGETHASCAPE",
			"name": "Target Has Cape",
			"button_name": "has Cape",
			"skillMod": "+2",
			"and_selector": [
				{
					"selector_type": "item_name",
					"selector_value": "Grapple"
				},
				{
					"selector_type": "target_has_effect",
					"selector_value": "Cape"
				}
			],
			"group": "BRSW.Target",
			"defaultChecked": "on"
		},
		{
			"id": "AWARENESSS",
			"name": "Awareness",
			"button_name": "Awareness",
			"skillMod": 0,
			"and_selector": [
				{
					"or_selector": [
						{
							"selector_type": "skill",
							"selector_value": "Focus"
						},
						{
							"selector_type": "skill",
							"selector_value": "Fighting"
						},
						{
							"selector_type": "skill",
							"selector_value": "Shooting"
						}						
					]
				},
				{
					"selector_type": "actor_has_effect",
					"selector_value": "Awareness"
				}
			],
			"group": "Details",
			"defaultChecked": "on"
		},
		{
			"id": "TARGETHASJINX",
			"name": "Has Jinx",
			"button_name": "has Jinx",
			"selector_type": "target_has_effect",
			"selector_value": "Jinx",
			"group": "BRSW.Target",
			"defaultChecked": "on"
		}
	];

	if (game.modules.get("betterrolls-swade2")?.active) {
	  game.brsw.add_actions(BETTER_ROLLS_GLOBAL_ACTIONS);
	} else {
	  ui.notifications.error("Activate Better Rolls module for custom actions.");
	}  
});

