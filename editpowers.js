const moduleId = 'super-noir';
const powerPackName = moduleId + ".powers";
const definitionsHelpUuid = "Compendium.super-noir.help.JournalEntry.yx22lV9rdD5YhbBH";
const detailsHelpUuid = "Compendium.super-noir.help.JournalEntry.TF7eJaXpyM4BKEab";
const maxMeleeDamageDice = 5;

let dialogIds = {
};

const powerList = {

};

function stripHTML(str) {
	return str.replace(/<[^>]+>/g, '');
}

function addDice(base, additional, maxDice) {
	function replacer(match, p1, p2, offset, string) {
		p1 = parseInt(p1);
		if (!p1)
			p1 = 1;
		p1 += n;
		if (maxDice)
			p1 = Math.min(p1, maxDice);
		return p1 + 'd' + p2;
	}

	if (!additional)
		return base;
	if (!base)
		return additional;

	let amatch = additional.match(/([0-9]*)d([0-9]+)/);
	if (!amatch)
		return base + '+' + additional;
	
	let n = parseInt(amatch[1]);
	if (!n)
		n = 1;
	let sides = parseInt(amatch[2]);
	if (![4, 6, 8, 10, 12].includes(sides))
		return base + '+' + additional;
	
	if (base.match('d' + sides)) {
		const str = `([0-9]*)d(${sides})`;
		const re = new RegExp(str);
		return base.replace(re, replacer);
	}
	return base + '+' + additional;
}

async function getPackItem(packName, swid) {
		const pack = game.packs.get(packName);

		if (!pack) {
			ui.notifications.error(`Pack not found: ${packName}`);
			return null;
		}

		const index = await pack.getIndex();
		const entry = index.find(i => i.system.swid === swid);

		if (!entry)
		  return null;

		// Get the full document from the compendium
		return await pack.getDocument(entry._id);
}


async function createMeleeAttack(power, attackName, uuidFlag, damage) {
	let attackUuid = power.getFlag(moduleId, uuidFlag);
	let attack;
	if (attackUuid) {
		// Attack was already added. Get its ID and make
		// sure that it still exists.
		attack = await getItem(power.parent, attackUuid);
		if (!attack) {
			// Check for an item with the name on the character.
			// This could happen if the character is duplicated.
			attack = power.parent.items.find(it => it.name == attackName && it.type == 'weapon');
			if (attack) {
				attackUuid = attack.getFlag(moduleId, 'ID');
				await power.setFlag(moduleId, uuidFlag, attackUuid);
			}
		}
		// Reset base damage to new value
		if (attack)
			await attack.setFlag(moduleId, 'baseDamage', damage);
	}
	if (!attack) {
		// Don't have an item by that name. Create it from the
		// item in the pack.
		const weaponsPack = "super-noir.items";

		const pack = game.packs.get(weaponsPack);

		if (!pack) {
			ui.notifications.error(`Pack not found: ${weaponsPack}`);
			return;
		}

		const index = await pack.getIndex();
		const entry = index.find(i => i.name === attackName);

		if (!entry) {
		  ui.notifications.error(`Attack not found: ${attackName}`);
		  return;
		}

		// Get the full document from the compendium
		const itemDoc = await pack.getDocument(entry._id);

		if (!itemDoc) {
		  ui.notifications.error(`Failed to load ${attackName} document.`);
		  return;
		}

		let result = await power.actor.createEmbeddedDocuments("Item", [
		  itemDoc.toObject()
		]);
		if (!result) {
			ui.notifications.error(`Unable to create ${attackName}.`);
			return;
		}
		attack = result[0];
		await attack.setFlag(moduleId, 'baseDamage', damage);
		attackUuid = attack._id;
		attack.setFlag(moduleId, 'ID', attackUuid);
		await power.setFlag(moduleId, uuidFlag, attackUuid);
	}
	let bonusDamage = attack.getFlag(moduleId, 'bonusDamage');

	if (['Unarmed', 'Claws'].includes(attackName)) {
		// Calculate bonus damage from combat edges and set it on
		// unarmed and claws.
		const edges = power.actor.items.filter(it =>
			['brawler', 'bruiser', 'martial-artist', 'martial-warrior'].includes(it.system.swid)
		);
		if (edges.length > 0) {
			let bd = `d${2+edges.length * 2}`;
			if (bonusDamage != bd) {
				bonusDamage = bd;
				await attack.setFlag(moduleId, 'bonusDamage', bonusDamage);
			}
		}
	}

	if (bonusDamage)
		damage = addDice(damage, bonusDamage, maxMeleeDamageDice);
	let meleeDamage = getMeleeDamage(power);
	if (meleeDamage)
		damage = addDice(damage, meleeDamage, maxMeleeDamageDice);
	await applyMeleeUpdate(attack, power, damage);
	await addMeleeDamage(power);
}

function getMeleeDamage(meleePower) {
	let meleeDamage = meleePower.getFlag(moduleId, 'meleeDamage');	
	if (!meleeDamage)
		return null;
	try {
		meleeDamage = eval(meleeDamage);
	} catch (e) {
		ui.notifications.error(`An error occurred evaluating ${meleeDamage}: ${e}`);
		return null;
	}
	return meleeDamage;
}

/**	Add the melee damage bonus to all melee weapons
 *	that don't already have it because they've been
 *	added by the above function.
 */

async function addMeleeDamage(meleePower) {
	let actor = meleePower.parent;
	if (!actor)
		return;
	let weapons = [];
	for (let weapon of actor.items) {
		if (weapon.type != 'weapon' || weapon.system.rangeType != 0)
			continue;
		if (weapon.getFlag(moduleId, 'baseDamage'))
			continue;
		weapons.push(weapon);
	}
	setMeleeDamage(meleePower, weapons);
}

async function setMeleeDamage(meleePower, weapons) {
	const meleeDamage = getMeleeDamage(meleePower);	
	for (const weapon of weapons) {
		let originalDamage = weapon.getFlag(moduleId, 'originalDamage');
		if (!originalDamage) {
			originalDamage = weapon.system.damage;
			await weapon.setFlag(moduleId, 'originalDamage', originalDamage);
		}
		let damage = originalDamage;
		const bonusDamage = weapon.getFlag(moduleId, 'bonusDamage');
		if (bonusDamage)
			damage = addDice(damage, bonusDamage, maxMeleeDamageDice);
		if (meleeDamage)
			damage = addDice(damage, meleeDamage, maxMeleeDamageDice);
		if (damage != weapon.system.damage)
			await weapon.update({"system.damage": damage});
	}
}

/**	Call this after the item details for a melee are changed.
 *	It applies the extra damage from the melee attack power.
 */

async function updateMeleeDamage(weapon) {
	const meleePower = await weapon.parent.items.find((it) => it.system.swid == 'melee-attack');
	if (!meleePower)
		return;
	let damage = weapon.getFlag(moduleId, 'baseDamage');
	if (!damage)
		damage = weapon.getFlag(moduleId, 'originalDamage');
	if (!damage)
		return;
	const meleeDamage = getMeleeDamage(meleePower);	
	const bonusDamage = weapon.getFlag(moduleId, 'bonusDamage');
	if (bonusDamage)
		damage = addDice(damage, bonusDamage, maxMeleeDamageDice);
	if (meleeDamage)
		damage = addDice(damage, meleeDamage, maxMeleeDamageDice);
	if (damage != weapon.system.damage)
		await weapon.update({"system.damage": damage});
}

/**	Called when the melee power is deleted.
 */

async function removeMeleeDamage(actor) {
	for (let weapon of actor.items) {
		if (weapon.type != 'weapon' || weapon.system.rangeType != 0)
			continue;
		let originalDamage = weapon.getFlag(moduleId, 'originalDamage');
		if (!originalDamage)
			continue;
		await weapon.update({"system.damage": originalDamage});
	}
}

async function applyMeleeUpdate(attack, power, damage) {
	let changes = {"system.damage": damage};
	changes["system.isHeavyWeapon"] = power.getFlag(moduleId, 'heavyWeapon') ? true : false;
	await attack.update(changes);	
}

async function specialWeapon(item, swuuidFlag, extraDamage) {
	const swuuid = item.getFlag(moduleId, swuuidFlag);
	if (!swuuid) {
		if (!extraDamage)
			return;
		ui.notifications.error("No weapon selected for the Special Weapon.");
		return;
	}
	let weapon = await getItem(item.parent, swuuid);
	if (!weapon) {
		ui.notifications.error("The selected weapon is not in the Gear list.");
		return;
	}

	let totalDamage = extraDamage;

	let meleeDamage = item.getFlag(moduleId, 'meleeDamage');
	try {
		meleeDamage = eval(meleeDamage);
	} catch (e) {
		ui.notifications.error(`An error occurred evaluating ${meleeDamage}: ${e}`);
	}
	
	if (meleeDamage)
		totalDamage = addDice(totalDamage, meleeDamage, maxMeleeDamageDice);

	let baseDamage = weapon.getFlag(moduleId, 'baseDamage');
	if (!baseDamage) {
		baseDamage = weapon.getFlag(moduleId, 'originalDamage');
		if (!baseDamage) {
			baseDamage = weapon.system.damage;
		}
		weapon.setFlag(moduleId, 'baseDamage', baseDamage);
	}
	totalDamage = addDice(baseDamage, totalDamage, maxMeleeDamageDice);
	try {
		await applyMeleeUpdate(weapon, item, totalDamage);
	} catch (e) {
		ui.notifications.error(`The damage for ${weapon.name} is incorrectly formatted: ${totalDamage}`);
	}
}


const universalGearModifiers = {
	'weapon': {
		fields: [
			{
				type: 'text-input',
				label: 'Bonus Damage',
				id: 'bonusDamage',
				cost: 0,
				flag: 'bonusDamage'
			},
			{
				type: 'text-input',
				label: 'Original Damage',
				id: 'originalDamage',
				cost: 0,
				flag: 'originalDamage'
			},
			{
				type: 'text-input',
				label: 'Base Damage',
				id: 'baseDamage',
				cost: 0,
				flag: 'baseDamage'
			}
		]
	}
};

const universalModifiers = {
	/*
	"power-type": {
		fields: [
			{
				"powerType": true,
				"label": "Power Type",
				"type": "text-input",
				"flag": "powerType",
				"id": "powerType"
			}
		]
	},
	*/
	'alternate-trait': {
		fields: [
			{
				type: 'checkbox',
				label: 'Alternate Trait',
				id: 'alternateTrait',
				cost: 1,
				flag: 'alternateTrait',
				description: "<p>The power uses a different Trait than the one listed in its description.</p>"
			}
		]
	},
	'contingent': {
		fields: [
			{
				type: 'checkbox',
				label: 'Contingent',
				id: 'contingent',
				cost: 0,
				flag: 'contingent',
				description: "<p>Contingent and Linked powers are triggered by a primary power. Contingent powers can only be used with a primary power.</p>"
			}
		]
	},
	"forceful": {
		fields: [
			{
				activePower: true,
				"label": "Forceful",
				"type": "checkbox",
				"flag": "forceful",
				"id": "forceful",
				"cost": 1,
				description: "<p>Knockback distance is increased by +1d6.</p>",
			}
		]
	},
	'linked': {
		fields: [
			{
				type: 'checkbox',
				label: 'Linked',
				id: 'linked',
				cost: 2,
				flag: 'linked',
				description: "<p>Contingent and Linked powers are triggered by a primary power. Contingent powers can only be used with a primary power.</p>"
			}
		]
	},
	'heavy-weapon': {
		fields: [
			{
				activePower: true,
				type: "checkbox",
				label: "Heavy Weapon",
				id: 'heavyWeapon',
				cost: 1,
				flag: 'heavyWeapon',
				description: "<p>The attack can harm those protected by Heavy Armor.</p>",
				additionalstat: {name: "isHeavyWeapon", value: "@F[heavyWeapon]"},
				grantupdate: {uuid: "grantuuid", update: "system.isHeavyWeapon: @F[heavyWeapon]?true:false"}
			}
		]
	},
	'limitation': {
		fields: [
			{
				type: "select",
				label: "Limitation",
				id: 'limitation',
				flag: 'limitation',
				costexp: "level",
				initLevel: 0,
				omitifzero: true,
                "options": [
                    {"name": "None", "value": 0},
                    {"name": "Rare (-1)", "value": -1},
                    {"name": "Common (-2)", "value": -2}
                ],
				description: "<p>A rare Limitation that prohibits the power from being used reduces its cost by 1 point. A common Limitation (works about half the time) reduces its cost by 2.</p>"
			}
		]
	},
	'selective': {
		fields: [
			{
				activePower: true,
				type: 'checkbox',
				label: 'Selective',
				id: 'selective',
				cost: 1,
				flag: 'selective',
				description: "<p>The super can choose which targets in her area effect power are affected by it.</p>"
			}
		]
	},
	"special": {
		"fields": [
			{
				"type": "level",
				"label": "Special",
				"id": "special",
				"costexp": "level",
				"checkexp": "true",
				"initLevel": 0,
				"omitifzero": true,
				"flag": "special"
			}
		]
	},
	"switchable": {
		"fields": [
			{
				"activePower": true,
				"type": "level",
				"label": "Switchable",
				"id": "switchable",
				"costexp": "level",
				"checkexp": "level>=0",
				"initLevel": 0,
				"flag": "switchable"
			}
		]
	},
	"device": {
		"fields": [
			{
				"type": "select",
				"label": "Device",
				"id": "device",
				"flag": "device",
                "costexp": "level",
				"omitifzero": true,
                "options": [
                    {"name": "No", "value": 0},
                    {"name": "Hard to Lose (-1)", "value": -1},
                    {"name": "Easier to Lose (-2)", "value": -2}
                ]
            }
		]
	},
	"range": {
		"fields": [
			{
				"type": "select",
				"label": "Increased Range",
				"id": "increasedRange",
				"flag": "increasedRange",
                "costexp": "level",
				"omitifzero": true,
                "options": [
                    {"name": "--", "value": 0, "update": "system.range: multiplyRange(item, 1, '@F[baseRange]')"},
                    {"name": "Double (+2)", "value": 2, "update": "system.range: multiplyRange(item, 2, '@F[baseRange]')"},
                    {"name": "Triple (+4)", "value": 4, "update": "system.range: multiplyRange(item, 3, '@F[baseRange]')"}
                ]
            }
		]
	}
	
/*
  forceful: {
	name: "Forceful",
	img: "modules/swade-supers-companion/assets/icons/Supers_Icons_Power.webp",
	description: "<p>Knockback distance is increased by +1d6.</p>",
	system: {
	  cost: 1
	}
  },
*/

};

class EditPowerData extends foundry.applications.api.DialogV2 {

	editOptions = null;

    async _onRender(context, options) {
		await super._onRender(context, options);
		this.element.querySelector("form.dialog-form").classList.add("power-details");
		//this.element.querySelector("div.dialog-content").classList.add("power-details");

		if (this?.editOptions?.item) {
			dialogIds[this.editOptions.item._id] = this;
		}
		calcCosts(this);
		const inputs = this.element.querySelectorAll('.change');
		for (let input of inputs) {
		  input.addEventListener("change", (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			calcCosts(this);
		  });
		}

		const helpButton = this.element.querySelector(`button[data-action="help"]`);
		if (helpButton) {
			helpButton.addEventListener("click", async (e) => {			
				e.preventDefault();
				e.stopImmediatePropagation();
				openJournalEntry(detailsHelpUuid);
			});
		}

		async function onDrop(event) {
            const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);

			if (!this?.element) {
				console.warn("Dialog has no rendered element yet.");
				return;
			}
			const html = this.element;
			const input = html.querySelector(".dnd");

            if (input) {
				let source = await fromUuid(data.uuid);
				if (!source) {
					ui.notifications.warn(`Item for UUID ${data.uuid} not found.`);
					return;
				}

				if (this.editOptions.itemType && this.editOptions.itemType != source.type) {
					ui.notifications.warn(`${source.name} is of type ${source.type}. Type ${this.editOptions.itemType} is required.`);
					return;
				}
				dropFunction(this, event, source)				
			}
		}

		// Drop macro
		const dnd = new foundry.applications.ux.DragDrop.implementation({
            dragSelector: null,
            dropSelector: null,
			permissions: {
				dragstart: false,
				drop: true,
			},
			callbacks: {
				drop: onDrop.bind(this)
			}		  

		});
		dnd.bind(this.element);		
	}

	/**
	 *	editOptions: {
	 *		item: item being edited.
	 *		dndDrop(editOptions, itemDropped): function to call when item dropped.
	 *		dataType: "Item", "Actor"
	 *		itemType: "edge", "skill"
	 *		dndSelector: class of input text control
	 *		finish(editOptions): function to call when dialog closed.
	 *		changeClass: input class on inputs that should do a callback when changed.
	 */
	 
	constructor(args, editOptions) {
		super(args);
		this.editOptions = editOptions;
	}

	_onClose() {
		if (this.editOptions?.finish)
			this.editOptions.finish(this.editOptions);
		if (dialogIds[this?.editOptions?.item._id])
			delete dialogIds[this.editOptions.item._id];
		super.close();
	}
	
}

/**	Insert the text at the beginning of the description.
 */
 
async function insertDescription(item, insert) {
	let description = "";
	if (item.system.description)
		description = item.system.description.replace(/^.+\<hr class="sp-rule"[^>]*\>/, "");
	await item.update({"system.description": insert + '<hr class="sp-rule">' + description});
}

function sign(number) {
	if (number < 0)
		return number;
	return '+' + number;
}

function multiplyRange(item, multiplier, range) {
	// If the base range isn't set, try to get it from
	// the current range value.
	if (!range || range == "0") {
		range = item.system.range;
		if (range)
			item.setFlag(moduleId, 'baseRange', range);
	}
	if (range != '' && range != 0) {
		let ranges = range.split('/');
		range = '';
		for (let r of ranges) {
			if (range)
				range += '/';
			range += multiplier * parseInt(r);
		}
	}
	return range;
}

function indexValues(index, ...values) {
	if (index >= values.length)
		return values[values.length - 1];
	if (index < 0)
		return values[0];
	return values[index];
}

function getUpdates(item, update, itemUpdates, targetItem = null) {
	// So the actor can be referenced in the expression.
	const actor = item.parent;

	let updates = update.split(/ *; */);
	for (const u of updates) {
		//let [f, v] = u.split(/ *: */);
		let colon = u.indexOf(':');
		let f = u.substring(0, colon);
		let v = u.substring(colon+1);
		if (f != undefined && v != undefined) {
			v = flagReplace(item, v);
			try {
				v = eval(v);
			} catch (e) {
				ui.notifications.error(`Error evaluating ${v}: ${e}`);
				v = 0;
			}
			itemUpdates[f] = v;
		}
	}
}


async function savePowerDetails(event, button, dialog) {
	const editOptions = dialog.editOptions;
	const pd = editOptions.powerDetails;
	const item = editOptions.item;
	const actor = item.actor;
	let totalWeight = pd.baseWeight ? pd.baseWeight : 0;
	
	let html = dialog.element;
	
	let details = "";
	let itemUpdates = {};
	let grantUpdates = {};
	let callFuncs = [];
	let actorUpdates = {};
	let addItems = [];
	let deleteItems = [];
	
	for (let f of editOptions.fields) {
		let cost = editOptions.costs[f.id];
		let elt;
		let data = '';
		let auxflags = f.auxflags;
		let update = undefined;
		let callFunc = undefined;
		let actorUpdate = f.actorUpdate;
		let itemToAdd = undefined;
		let itemToDelete = undefined;
		
		switch (f.type) {
		case 'checkbox':
			elt = html.querySelector(`input[id="${f.id}"]`);
			if (!elt)
				continue;
			await item.setFlag(moduleId, f.flag, elt.checked);
			if (elt.checked) {
				data = `<b>${f.label}:</b> ${sign(f.cost)}`;
				update = f.update;
				if (f.weight)
					totalWeight += f.weight;
				if (f.additem)
					itemToAdd = f.additem;
			} else {
				update = f.undoUpdate;
				if (f.additem)
					itemToDelete = f.additem;
			}
			callFunc = f.callFunc;
			break;
		case 'text-input':
			elt = html.querySelector(`input[id="${f.id}"]`);
			if (!elt)
				continue;
			await item.setFlag(moduleId, f.flag, elt.value);
			if (elt.value) {
				data = `<b>${f.label}:</b> ${elt.value}`;
			}
			update = f.update;
			callFunc = f.callFunc;
			break;
		case 'dndtarget':
			elt = html.querySelector(`input[id="${f.id}"]`);
			if (!elt)
				continue;
			let uuid = item.getFlag(moduleId, f.flag);
			let dontDelete = false;

			if (editOptions?.itemDropped) {
				let oldUuid = item.getFlag(moduleId, f.flag);
				let addIt = true;

				if (f.addIfMissing) {
					// Only add this item if there isn't already
					// an item by this name in the actor.
					const it = actor.items.find((i) => 
						i.type == f.itemType && i.name == editOptions.itemDropped.name
					);
					if (it) {
						// Assign an ID if one isn't present.
						// This ID stays consistent if the actor is duplicated.
						addIt = false;
						uuid = it.getFlag(moduleId, 'ID');
						if (!uuid) {
							uuid = it._id;
							await it.setFlag(moduleId, 'ID', uuid);
						}
						dontDelete = true;
					}
				}
				if (addIt) {
					const itemData = editOptions.itemDropped.toObject();
					delete itemData._id;
					let newItems = await actor.createEmbeddedDocuments("Item", [itemData]);

					if (newItems && f.flag) {
						// Record the item added for this power.
						uuid = newItems[0]._id;
						newItems[0].setFlag(moduleId, 'ID', uuid);
					}
				}
				if (oldUuid) {
					// Delete the old item.
					const oldItem = await getItem(actor, oldUuid);
					if (oldItem && !item.getFlag(moduleId, 'dontDelete'))
						await actor.deleteEmbeddedDocuments("Item", [oldItem._id]);
				}
				editOptions.dontDelete = dontDelete;
				await item.setFlag(moduleId, f.flag, uuid);
				await item.setFlag(moduleId, 'dontDelete', dontDelete);					
			}
			let childItem = await getItem(actor, uuid);
			if (childItem) {
				if (f.descriptor)
					data = `<b>${f.descriptor}:</b> `;
				data += childItem.name;
				if (f.nameflag)
					await item.setFlag(moduleId, f.nameflag, childItem.name);
			}
			break;
		case 'level':
			elt = html.querySelector(`input[id="${f.id}"]`);
			if (!elt)
				continue;
			let level = parseInt(elt.value);
			await item.setFlag(moduleId, f.flag, level);

			let labelText = f.label;
			if (f.labelexp) {
				const label = html.querySelector(`label[for="${f.id}"]`);
				if (label)
					labelText = label.innerText;
			}
			let dispLevel = level;
			if (f.dispexp) {
				try {
					dispLevel = eval(f.dispexp);
				} catch (e) {
					ui.notifications.error(`Error evaluating ${f.dispexp}`);
				}
			}
			if (cost || f.labelexp)
				if (!f.omitifzero || cost)
					data = `<b>${labelText}:</b> ${dispLevel} (${sign(cost)})`;
			update = f.update;
			callFunc = f.callFunc;
			break;
		case 'select':
			elt = html.querySelector(`select[id="${f.id}"]`);
			if (!elt)
				continue;
			await item.setFlag(moduleId, f.flag, elt.value);
			if (cost || !f.omitifzero) {
				let text = elt.options[elt.selectedIndex].text;
				data = `<b>${f.label}:</b> ${text}`;
			}
			auxflags = f.options[elt.selectedIndex]?.auxflags;
			update = f.options[elt.selectedIndex]?.update;
			actorUpdate = f.options[elt.selectedIndex]?.actorUpdate;
			callFunc = f.options[elt.selectedIndex]?.callFunc;
			let gup = f.options[elt.selectedIndex]?.grantupdate;
			if (!gup)
				gup = f.grantupdate;
			if (gup) {
				let uuid = item.getFlag(moduleId, gup.uuid);
				if (uuid) {
					if (!grantUpdates[uuid])
						grantUpdates[uuid] = {};
					getUpdates(item, gup.update, grantUpdates[uuid]);
				}
			}
			// If no option had a callFunc, try the base object.
			if (!callFunc)
				callFunc = f.callFunc;
			break;
		case 'multiselect': {
			elt = html.querySelector(`select[id="${f.id}"]`);
			if (!elt)
				continue;
			let values = [];
			data = "";
			for (const opt of elt.selectedOptions) {
				// If it's a numeric string, convert it to a number.
				const v = opt.value - 0;
				if (isNaN(v))
					values.push(opt.value);
				else
					values.push(v);
				if (data)
					data += ", ";
				data += opt.text;
			}
			await item.setFlag(moduleId, f.flag, values);
			if (data)
				data = `<b>${f.label}:</b> ` + data;
			break;
		}
		case 'select-item':
			elt = html.querySelector(`select[id="${f.id}"]`);
			if (!elt)
				continue;
			if (elt.value && elt.value != '--') {
				data = `<b>${f.label}:</b> ${elt.options[elt.selectedIndex].text}`;
				let selItem = await fromUuid(elt.value);
				if (selItem) {
					// Assign an ID to item if it doesn't already have one.
					let ID = selItem.getFlag(moduleId, 'ID');
					if (!ID) {
						ID = selItem._id;
						await selItem.setFlag(moduleId, 'ID', ID);
					}
					await item.setFlag(moduleId, f.flag, ID);
					callFunc = f.callFunc;
					if (f.nameflag) {
						await item.setFlag(moduleId, f.nameflag, elt.options[elt.selectedIndex].text);
					}
				} else {
					ui.notifications.error(`Item ${elt.options[elt.selectedIndex].text} does not exist.`);
				}
			} else
				await item.setFlag(moduleId, f.flag, null);
			break;
		}
		if (data) {
			if (details)
				details += ", ";
			details += data;
		}
		
		if (update)
			getUpdates(item, update, itemUpdates);
		if (actorUpdate)
			getUpdates(item, actorUpdate, actorUpdates);
		if (f.grantupdate && f.grantupdate.uuid && f.grantupdate.update) {
			let uuid = item.getFlag(moduleId, f.grantupdate.uuid);
			if (uuid) {
				let targetItem = await getItem(actor, uuid);
				if (f.grantupdate.saveflag) {
					// If the grant indicates a value on the target item should
					// be saved (so that it can be referenced in the update expression)
					// check to see if it's already saved and do so if not.
					let save = item.getFlag(moduleId, f.grantupdate.saveflag);
					if (save == undefined) {
						if (targetItem) {
							const value = targetItem.system[f.grantupdate.savevalue];
							await item.setFlag(moduleId, f.grantupdate.saveflag, value);
						}
					}
				}
				if (!grantUpdates[uuid])
					grantUpdates[uuid] = {};
				getUpdates(item, f.grantupdate.update, grantUpdates[uuid], targetItem);
			}
		}

		if (auxflags) {
			let flags = auxflags.split(/ *; */);
			for (const flag of flags) {
				let [f, v] = flag.split(/ *: */);
				if (f != undefined && v != undefined) {
					await item.setFlag(moduleId, f, v);
				}
			}
		}
		if (callFunc) {
			callFuncs.push(callFunc);
		}
		if (itemToAdd)
			addItems.push(itemToAdd);
		if (itemToDelete)
			deleteItems.push(itemToDelete);

		if (f.additionalstat) {
			try {
				let stat = item.system.additionalStats[f.additionalstat.name];
				if (stat) {
					let v = flagReplace(item, f.additionalstat.value);
					try {
						v = eval(v);
					} catch (e) {
						ui.notifications.error(`An error occurred evaluating ${v}: ${e}`);
					}
					switch (stat.dtype) {
					case "Boolean":
						v = v ? true : false;
						break;
					case "Number":
						if (typeof v == 'boolean')
							v = v ? 1 : 0;
						else if (typeof v == 'string')
							v = parseInt(v);
						break;
					}
					itemUpdates[`system.additionalStats.${f.additionalstat.name}.value`] = v;
				}
			} catch (e) {
				ui.notifications.error(`Error evaluating additional stat ${f.additionalstat.name} for ${item.name}`);
			}
		}
	}

	if (pd.callFunc)
		callFuncs.push(pd.callFunc);
	
	if (callFuncs.length > 0) {
		// Defer calling these until after all the
		// flags are set so that references to flags
		// are all current.
		for (let callFunc of callFuncs) {
			try {
				await eval(callFunc);
			} catch (e) {
				ui.notifications.error(`Error evaluating ${callFunc}: ${e}`);
			}
		}
	}	
	
	if (pd.baseCost) {
		details = `<b>Base Cost:</b> ${pd.baseCost}` + (details ? ', ' : '') + details;
	}
	if (item.type == 'power') {	
		itemUpdates["system.pp"] = editOptions.powerCost;
	} else if (isGear(item)) {
		itemUpdates["system.price"] = editOptions.powerCost;
		itemUpdates["system.weight"] = totalWeight;
		const difference = editOptions.powerCost - editOptions.itemPrice;
		if (difference != 0) {
			const newTotal = actor.system.details.currency - difference;
			if (newTotal < 0)
				ui.notifications.warn(`The cost of ${item.name} is ${editOptions.powerCost}, more than your current balance: ${actor.system.details.currency}.`);
			actorUpdates["system.details.currency"] = newTotal;
		}
	}
	await item.update(itemUpdates);
	if (Object.keys(actorUpdates).length > 0)
		await actor.update(actorUpdates);

	await item.setFlag(moduleId, "Modifiers", details);
	insertDescription(item, details);
	await setEffects(item);

	if (pd.grantupdate) {
		const gup = pd.grantupdate;
		let uuid = item.getFlag(moduleId, gup.uuid);
		if (uuid) {
			if (!grantUpdates[uuid])
				grantUpdates[uuid] = {};
			let targetItem = await getItem(actor, uuid);
			getUpdates(item, gup.update, grantUpdates[uuid], targetItem);
		}
	}

	for (let uuid in grantUpdates) {
		let updateItem = await getItem(actor, uuid);
		if (updateItem)
			await updateItem.update(grantUpdates[uuid]);
		else
			ui.notifications.notify(`The update item for ${item.name} is missing.`);
	}

	if (item.type == 'power') {
		await retotalPowerPoints(item.parent, 0);
		checkTotals(item);
		checkLimits(item, pd);
	}
	for (let addit of addItems)
		await addItem(item, addit.flag, addit.uuid);
	for (let deleteit of deleteItems) {
		const uuid = item.getFlag(moduleId, deleteit.flag);
		if (uuid) {
			let granted = await getItem(actor, uuid);
			if (granted) {
				await actor.deleteEmbeddedDocuments("Item", [granted._id]);
			}
			await item.setFlag(moduleId, deleteit.flag, null);
		}
	}
	if (item.type == 'weapon' && item.system.rangeType == 0)
		await updateMeleeDamage(item);
}

function isGear(item) {
	return ['weapon', 'armor', 'gear'].includes(item.type);
}

function formatRow(left, right, ralign = "right") {
	if (!right)
		return `<div style="display: table-row;">${left}</div>`;

	return `<div style="display: table-row;">
		<div style="display: table-cell; text-align: left;">
			${left}
		</div>
		<div style="display: table-cell; text-align: ${ralign};">
			${right}
		</div>
	</div>`;
}


async function createContent(item, powerDetails, editOptions) {
	let superPowerPoints = await getSPP(item.actor);
	let powerLimit = getPowerLimit(item.actor);
	let content;
	if (item.type == 'power')
		content = `<p>Build Cost: <span id="buildcost">${editOptions.powerCost}</span>/${powerLimit}, Total Powers Cost: <span id="totalPowersCost">${editOptions.otherPowersTotal+editOptions.powerCost}</span>/${superPowerPoints}</p>`;
	else
		content = `<p>Item Cost: <span id="buildcost">${editOptions.powerCost}</span>, Total Gear Cost: <span id="totalPowersCost">${editOptions.otherPowersTotal+editOptions.powerCost}</span></p>`;
	
	content += `<div style="display: table; width: 450px; font-size: 10pt;">
		<div style="display: table-row-group;">`;
		
	if (powerDetails.baseCost)
		content += formatRow(`<b>Base Cost:</b> ${powerDetails.baseCost}`);
		
	for (let f of editOptions.fields) {
		switch (f.type) {
		case 'checkbox':
			let checked = item.getFlag(moduleId, f.flag) ? ' checked' : '';
			content += formatRow(
				`<label for="${f.id}">${f.label} [${f.cost}]</label>`,
				`<input class="change" type="checkbox" id="${f.id}" name="${f.id}" value="${f.cost}"${checked}>`
			);
			break;
		case 'text-input':
			let textVal = item.getFlag(moduleId, f.flag);
			if (textVal == undefined)
				textVal = "";
			content += formatRow(
				`<label for="${f.id}">${f.label}</label>`,
				`<input class="change" type="text" id="${f.id}" name="${f.id}" value="${textVal}">`
			);
			break;
		case 'text':
			content += formatRow(f.label);
			break;
		case 'dndtarget':
			editOptions.itemType = f.itemType;
			editOptions.dropType = f.dropType;
			editOptions.dontDelete = item.getFlag(moduleId, 'dontDelete');
			let uuid = item.getFlag(moduleId, f.flag);
			let value = '';
			if (uuid) {
				const it = await getItem(item.actor, uuid);
				if (it)
					value = it.name;
			}
			content += formatRow(
				`<label for="${f.id}">${f.label}</label>`,
				`<input class="dnd" type="text" id="${f.id}" name="f.id" size="20" readonly=true value="${value}">`
			);
			break;
		case 'level':
			let level = item.getFlag(moduleId, f.flag);
			let min = (f.min != undefined) ? ' min="${f.min}"' : '';
			if (level == undefined) {
				if (f.initLevel != undefined)
					level = f.initLevel;
				else
					level = 1;
			} else {
				if (!level && f.min != undefined)
					level = f.min;
			}
			content += formatRow(
				`<label for="${f.id}">${f.label}</label>`,
				`<input class="change" type="number" id="${f.id}" name="${f.id}" maxlength="2" size="2" value="${level}"${min}>`
			);
			break;
		case 'select':
			let selVal = item.getFlag(moduleId, f.flag);
			let select = `<select class="change" id="${f.id}" name="${f.id}">`
			for (let i = 0; i < f.options.length; i++) {
				const selected = f.options[i].value == selVal ? " selected" : "";
				select += `<option value="${f.options[i].value}"${selected}>${f.options[i].name}</option>`;
			}
			select += `</select>`;
			content += formatRow(
				`<label for="${f.id}">${f.label}</label>`,
				select
			);
			break;
		case 'multiselect': {
			// FIX: this code doesn't work. Options that are selected
			// in the flag value aren't highlighted once the dialog is
			// displayed. The user would have to reselect them every
			// time, defeating the purpose.
			let values = item.getFlag(moduleId, f.flag);
			if (!values)
				values = [];
			let select = `<select class="change" id="${f.id}" name="${f.id}" multiple size="4">`
			for (let i = 0; i < f.options.length; i++) {
				const selected = values.includes(f.options[i].value) ? " selected" : "";
				select += `<option value="${f.options[i].value}"${selected}>${f.options[i].name}</option>`;
			}
			select += `</select>`;
			content += formatRow(
				`<label for="${f.id}">${f.label}</label>`,
				select
			);
			break;
		}
		case 'select-item': {
				let items = item.actor.items.filter((i) => {
					return i.type == f.itemType
				});
				let itemUuid = item.getFlag(moduleId, f.flag);
				let select = `<select class="change" id="${f.id}" name="${f.id}">
					<option value="">--</option>`
				for (let i = 0; i < items.length; i++) {
					const selected = itemUuid && items[i].getFlag(moduleId, 'ID') == itemUuid ? " selected" : "";
					select += `<option value="${items[i].uuid}"${selected}>${items[i].name}</option>`;
				}
				select += `</select>`;
				content += formatRow(
					`<label for="${f.id}">${f.label}</label>`,
					select
				);
				
				break;
			}
		}
	}

	content += `</div></div>`;

	return content;
}

// Functions for checking requirements on powers.

function superSkillCost(dialog, item, level) {
	// Check to see if the skill is being
	// added by the Edge. Charge extra if so.
	return level + (dialog.editOptions.dontDelete ? 0 : 1);
}



function evaluateExpression(dialog, costexp, level, item) {
	try {
		let result = eval(costexp);
		return result;
	} catch (e) {
		ui.notifications.error(`An error occurred evaluating ${costexp}: ${e}`);
	}
	return 0;
}

function displayDie(value) {
	if (value < 4)
		return value;
	if (value < 14)
		return 'd' + 2*Math.trunc(value/2);
	return 'd12+' + Math.trunc((value - 12)/ 2);
}


function calcCost(dialog, f) {
	const editOptions = dialog.editOptions;
	const pd = editOptions.powerDetails;

	let html = dialog.element;
	let cost = 0;

	let elt;
	switch (f.type) {
	case 'checkbox':
		elt = html.querySelector(`input[id="${f.id}"]`);
		if (elt && elt.checked)
			cost = f.cost;
		editOptions.costs[f.id] = cost;
		break;
	case 'level':
		elt = html.querySelector(`input[id="${f.id}"]`);
		let level = parseInt(elt.value);
		cost = evaluateExpression(dialog, f.costexp, level, dialog.editOptions.item);
		editOptions.costs[f.id] = cost;
		
		if (f.checkexp) {
			const ok = evaluateExpression(dialog, f.checkexp, level, dialog.editOptions.item);
			if (!ok) {
				let msg = ''
				if (f.checkmsg) {
					if (f.checkmsg[0] == '`')
						msg = evaluateExpression(dialog, f.checkmsg, level, dialog.editOptions.item);
					else
						msg = f.checkmsg;
				}
				if (!msg)
					msg = `The value for ${f.label} is invalid.`;
				ui.notifications.warn(msg);
			}
		}
		if (f.labelexp) {
			const label = html.querySelector(`label[for="${f.id}"]`);
			if (label) {
				let txt;
				try {
					txt = evaluateExpression(dialog, f.labelexp, level, dialog.editOptions.item);
				} catch (e) {
					ui.notifications.error(`Error label expression: ${e} (${f.labelexp})`);
				}
				if (txt)
					label.innerText = txt;
			}
		}
		break;
	case 'select':
		elt = html.querySelector(`select[id="${f.id}"]`);
		if (f.costexp) {
			cost =  evaluateExpression(dialog, f.costexp, elt.value, dialog.editOptions.item);
			cost = parseInt(cost);
			editOptions.costs[f.id] = cost;
		}
		break;
	case 'multiselect':
		elt = html.querySelector(`select[id="${f.id}"]`);
		cost = 0;
		for (const opt of elt.selectedOptions) {
			const v = opt.value - 0;
			if (isNaN(v))
				v = opt.value;
			const o = f.options.find((o) => o.value == v);
			if (o && o.cost != undefined)
				cost += o.cost;
		}
		break;
	}

	return cost;
}


function calcCosts(dialog) {
	const editOptions = dialog.editOptions;
	const pd = editOptions.powerDetails;

	let totalCost = pd.baseCost;
	if (totalCost == undefined)
		totalCost = 0;
	
	let html = dialog.element;
	let cost;

	for (let f of editOptions.fields) {
		cost = calcCost(dialog, f);
		totalCost += cost;
		editOptions.costs[f.id] = cost;
	}
	
	editOptions.powerCost = totalCost;

	const bc = $(dialog.element).find("#buildcost");
	bc.text(totalCost);
	const tc = $(dialog.element).find("#totalPowersCost");
	if (tc)
		tc.text(editOptions.otherPowersTotal + totalCost);
}

function dropFunction(dialog, event, itemDropped) {
	if (!dialog)
		return;
	let eo = dialog.editOptions;
	eo.dontDelete = eo.item.actor.items.find((i) => i.type == eo.itemType && i.name == itemDropped.name) != null;
	eo.itemDropped = itemDropped;
	const input = dialog.element.querySelector(".dnd");
	input.value = itemDropped.name;
	calcCosts(dialog);
}


async function editPower(item, powerDetails) {

	let otherPowersTotal = 0;
	if (item.type == 'power')
		otherPowersTotal = item.actor.system.powerPoints.general.value - item.system.pp;
	else {
		for (const it of item.parent.items) {
			if (isGear(it))
				otherPowersTotal += it.system.price;
		}
		otherPowersTotal -= item.system.price;
	}
	let editOptions = {
		item: item,
		powerDetails: powerDetails,
		itemPrice: item.system.price ? item.system.price : 0,
		fields: [],
		powerCost: item.system.pp,
		otherPowersTotal: otherPowersTotal,
		costs: {
		}
	};

	if (powerDetails.fields)
		for (let f of powerDetails.fields)
			editOptions.fields.push(f);
	let mods = [];
	if (item.type == 'power') {
		for (let m in universalModifiers) {
			for (let f of universalModifiers[m].fields) {
				if (f.activePower) {
					if (powerDetails.activePower)
						mods.push(f);
				} else
					mods.push(f);
			}
		}
	}

	if (isGear(item)) {
		for (let m in universalGearModifiers) {
			if (item.type == m) {
				for (let f of universalGearModifiers[m].fields)
					mods.push(f);
			}
		}
	}

	if (mods.length > 0) {
		if (editOptions.fields.length > 0)
			editOptions.fields.push({type: "text", label: "______________"});
		editOptions.fields.push(...mods);
	}

	// If this power has no options just exit.

	if (editOptions.fields.length == 0)
		return ui.notifications.notify(`${item.name} has no item details to edit. The definition has no fields.`);

	let content = await createContent(item, powerDetails, editOptions);

	try {
		let dlg = await new EditPowerData({
			window: {
				title: `${item.name} Details`
			},
			content: content,
			buttons: [
				{
					action: "ok",
					label: "OK",
					default: true,
					callback: async (event, button, dialog) => {
						await savePowerDetails(event, button, dialog);
					}
				},
				{
					// The click handler executes this
					// to avoid closing the dialog when
					// the button is pressed.
					action: "help",
					label: "Help"
				},
				{
					action: "cancel",
					label: "Cancel"
				}
			],
			submit: result => {
			}
		}, editOptions);
		dlg.render({ force: true });
	} catch (msg) {
		ui.notifications.notify(msg);
	}

}


function toughArmorTotal(actor) {
	const toughness = actor.items.find(it => it.type == 'power' && it.system.swid == 'toughness');
	const armor = actor.items.find(it => it.type == 'power' && it.system.swid == 'armor');
	let t = 0;
	let a = 0;
	if (toughness) {
		t = toughness?.getFlag(moduleId, 'level');
		if (isNaN(t))
			t = 0;
	}
	if (armor) {
		a = armor?.getFlag(moduleId, 'level') * 2;
		if (isNaN(a))
			a = 0;
	}
	return t + a;
}

function requireItem(actor, type, name) {
	return !!actor.items.find(item => item.type == type && item.name == name);
}


function superSkillTotal(actor) {
	const superSkills = actor.items.filter((item) => {
		const retval = item.type == 'power' && item.system.swid == 'super-skill';
		return retval;
	});
	let total = 0;
	for (let p of superSkills)
		total += p.system.pp;
	return testPowerLimit(actor, total);
}

/**	Return true if the total is within the power limit.
 */
 
function testPowerLimit(actor, total) {
	let spp = actor.system.powerPoints.general.max;
	let powerLimit = Math.floor(spp / 3);
	if (total > powerLimit) {
		if (actor.items.find((i) => i.system.swid == 'the-best-there-is'))
			powerLimit = Math.trunc(spp / 2);
	}
	return total <= powerLimit;
}

function getPowerLimit(actor) {
	const powerSet = actor.items.find(it => it.system.swid == 'power-sets');
	if (powerSet) {
		const limit = powerSet.getFlag(moduleId, 'limit');
		if (limit)
			return parseInt(limit);
	}
	const spp = actor.system.powerPoints.general.max;
	if (actor.items.find((i) => i.system.swid == 'the-best-there-is'))
		return Math.floor(spp / 2);
	return Math.floor(spp / 3);
}

function skillBonusTotal(actor) {
	const skillBonuses = actor.items.filter((item) => {
		const retval = item.type == 'power' && item.system.swid == 'skill-bonus';
		return retval;
	});
	let total = 0;
	for (let p of skillBonuses)
		total += p.system.pp;
	return testPowerLimit(actor, total);
}



function flagReplace(item, string) {
	return string.replaceAll(/@F\[[^\]]+\]/g, function (x) {
		const match = x.match(/\[(.+)\]/);
		if (match) {
			let value = item.getFlag(moduleId, match[1]);
			if (value === undefined)
				value = 0;
			return value;
		} else
			return "0";
	});
}

async function setEffects(item) {
	let definition = item.getFlag(moduleId, 'definition');
	if (!definition)
		definition = powerList[item.system.swid];
	
	if (!definition?.effects)
		return;
	
	for (let effect of definition.effects) {
		let e = item.effects.find((eff) => eff.name == effect.name);

		if (!e)
			continue;

		try {
			let updates = {};
			if (effect.value || effect.key) {
				if (e.changes.length > 0) {
					let changes = foundry.utils.duplicate(e.changes);
					if (effect.value) {
						let value = flagReplace(item, effect.value);
						try {
							const actor = item.parent;
							changes[0].value = eval(value);
						} catch (e) {
							ui.notifications.error(`An error occurred evaluating ${value}: ${e}`);
						}
						
					}
					if (effect.key) {
						// Create the key based on the pattern.
						let key = flagReplace(item, effect.key);
						changes[0].key = key;
					}
					updates.changes = changes;
				}
			}
			if (effect.applyEffect) {
				updates.disabled = !item.getFlag(moduleId, effect.applyEffect);
			}
			await e.update(updates);
		} catch (error) {
			ui.notifications.error(error);
		}
		
	}
}


async function retotalPowerPoints(actor, adjustment) {
	let total = adjustment;
	actor.items.forEach((it) => {
		if (it.type == "power")
			total += it.system.pp;
	});
	await actor.update({
		"system.powerPoints.general.value": total
	});
}


async function addItem(item, flagUuid, uuid) {
		// Add the item specified in the uuid, record it in the
		// addUuid flag.
		let addUuid = item.getFlag(moduleId, flagUuid);
		if (addUuid) {
			let it = await fromUuid(addUuid);
			if (it)
				// Already added somehow.
				return;
		}
		let it = await fromUuid(uuid);
		if (!it) {
			ui.notifications.error(`Item to add doesn't exist (${uuid})`);
			return;
		}
		const itemData = it.toObject();
		delete itemData._id;
		let items = await item.actor.createEmbeddedDocuments("Item", [itemData]);
		if (items) {
			item.setFlag(moduleId, flagUuid, items[0]._id);
			await items[0].setFlag(moduleId, 'ID', items[0]._id);
		} else
			ui.notifications.error(`Unable to add ${it.name} for ${item.name}.`);
}

async function getItem(actor, ID) {
	return actor.items.find(it => ID == it.getFlag(moduleId, 'ID'));
}

async function createAction(item, action) {
	switch (action.type) {
	case 'additem':
		await addItem(item, action.addUuid, action.uuid);
		break;
	}
}

async function createItem(item, action, id) {
	// Record the initial power points so that we can check
	// that they don't reduce the cost below the minimum for
	// power.
	await item.setFlag(moduleId, 'baseCost', item.system.pp);
	await item.setFlag(moduleId, 'baseRange', item.system.range);
	await retotalPowerPoints(item.parent, 0);
	if (item.actor) {
		// Only run create actions on a power in an actor.
		let definition = item.getFlag(moduleId, 'definition');
		if (definition) {
			checkLimits(item, definition);
			if (definition.createActions) {
				for (let action of definition.createActions)
					createAction(item, action);
			}
		}
	}
}

async function getSPP(actor) {
	let spp = actor.system.powerPoints.general.max;
	const sysSpp = game.settings.get(moduleId, 'superpowerpoints');
	if (!spp || actor.type == 'character' && spp < sysSpp) {
		// Set the power points to the game total if not already set.
		// Or if the SPP in the system has been increased.
		spp = sysSpp;
		await actor.update({
			"system.powerPoints.general.max": spp
		});
	}
	return spp;
}

async function checkTotals(item) {
	const spp = item.actor.system.powerPoints.general.max;

	if (item.system.pp < 0) {
		ui.notifications.warn(`${item.name} cannot have negative cost.`);
		await item.update({"system.pp": 0});
	}
	const baseCost = item.getFlag(moduleId, 'baseCost');
	if (baseCost > 0 && item.system.pp == 0)
		ui.notifications.warn(`${item.name} has a non-zero base cost. The cost can't be reduced to zero.`);
		
	if (item.actor.system.powerPoints.general.value > spp)
		ui.notifications.warn(`The limit on super power points is ${spp}. The total is now ${item.actor.system.powerPoints.general.value}`);
	if (!testPowerLimit(item.actor, item.system.pp))
		ui.notifications.warn(`The cost of ${item.name} (${item.system.pp}) exceeds the Power Limit.`);
}

function checkMinSkill(actor, skillName, dieType) {
	const skill = actor.items.find((i) => i.name == skillName);
	if (!skill)
		return false;
	dieType = dieType.replace('d', '');
	return skill.system.die.sides >= parseInt(dieType);
	
}

function checkLimits(item, powerDefinition) {
	if (!powerDefinition.requirements)
		return;

	for (const check of powerDefinition.requirements) {
		// Set variables that can be checked in the expressions.

		let actor = item.actor;
		let cost = item.system.pp;

		try {
			if (!eval(check.expression))
				ui.notifications.warn(eval(check.message));
		} catch (e) {
			ui.notifications.error(`An error occurred evaluating ${check.expression}: ${e}`);
		}
	}
}


async function updateItem(item, action) {
	
	let definition = item.getFlag(moduleId, 'definition');
	if (definition) {
		// If the granted item's name tracks the power, rename it.
		const trackUuid = definition.trackuuid;
		if (trackUuid) {
			const uuid = item.getFlag(moduleId, trackUuid);
			if (uuid) {
				let grantItem = await getItem(item.parent, uuid);
				if (grantItem && grantItem.name != item.name) {
					await grantItem.update({"name": item.name});
				}
			}
		}
	}
}


async function deleteItem(item, action, id) {
	if (item.type == 'power') {
		await retotalPowerPoints(item.parent, 0);
		checkTotals(item);
	}
	let actorUpdates = {};
	
	// Delete any granted item associated with this item.

	let pi = item.getFlag(moduleId, 'definition');
	if (!pi)
		pi = powerList[item.system.swid];
	if (pi && pi.deleteActions) {
		for (let d of pi.deleteActions) {
			let deleteUuid = item.getFlag(moduleId, d.deleteUuid);
			let dontDelete = item.getFlag(moduleId, 'dontDelete');
			if (deleteUuid && !dontDelete) {
				let granted = await getItem(item.actor, deleteUuid);
				if (granted)
					await item.actor.deleteEmbeddedDocuments("Item", [granted._id]);
			}
			if (d.actorUpdate) {
				getUpdates(item, d.actorUpdate, actorUpdates);				
			}
			if (d.callFunc) {
				try {
					const actor = item.parent;
					eval(d.callFunc);
				} catch (e) {
					ui.notifications.error(`Error evaluating ${d.callFunc} in delete action.`);
				}
			}
		}
	}
	if (Object.keys(actorUpdates).length > 0)
		actor.update(actorUpdates);
}

function openPowerDialog(item) {
	let powerDetails = item.getFlag(moduleId, 'definition');
	if (powerDetails) {
		editPower(item, powerDetails);
		return;
	}

	powerDetails = powerList[item.system.swid];
	if (powerDetails)
		editPower(item, powerDetails);
	else {
		// Power is undefined. 
		let baseCost = item.getFlag(moduleId, 'baseCost');
		if (baseCost == undefined) {
			baseCost = item.system.pp;
			item.setFlag(moduleId, 'baseCost', baseCost);
		}
		// Assume the power's active since we know nothing.
		powerDetails = {
			activePower: true,
			baseCost: baseCost,
			fields: [
			]
		};
		editPower(item, powerDetails);
	}
}


Hooks.on("createItem", async (item, action, id) => {
	if (!processThis(item) || id != game.user.id || !item.parent)
		return;
	
	await createItem(item, action, id);
});


/**	Add melee damage to new melee weapons if the melee attack
 *	power is found.
 */

Hooks.on("createItem", async (item, action, id) => {
	if (item.type != 'weapon' || item.system.rangeType != 0 || id != game.user.id || !item.parent)
		return;
	const meleePower = item.parent.items.find(i => 
		i.type == 'power' && i.system.swid == 'melee-attack' && i.getFlag(moduleId, 'meleeDamage')
	);

	if (meleePower)
		setMeleeDamage(meleePower, [item]);
});



function isPurchase(item, action, id) {
	const actor = item.parent;
	if (id != game.user.id || !actor)
		return false;
	if (actor.type != 'character')
		return false;
	if (!['weapon', 'armor', 'consumable', 'gear'].includes(item.type))
		return false;
	if (item.system.price <= 0)
		return false;
	return true;
}


Hooks.on("createItem", async (item, action, id) => {
	if (!isPurchase(item, action, id))
		return;
	if (!game.settings.get(moduleId, 'deductgearcost'))
		return;
	if (item.getFlag('item-piles', 'item'))
		return;
	if (item.getFlag('trans-char', 'syncUuid'))
		return;
	if (game.keyboard.isModifierActive("Control"))
		return;
	const actor = item.parent;

	// Buy an item.

	let pay = true;

	if (item.system.price > actor.system.details.currency) {
		await new foundry.applications.api.DialogV2({
			window: {
				title: "Insufficient Funds"
			},
			modal: true,
			content: `${item.name} costs ${item.system.price}. You only have ${actor.system.details.currency}.`,
			buttons: [
				{
					action: "add",
					label: "Add Anyway",
					default: true,
					callback: (event, button, dialog) => {
						pay = false;
					}
				},
				{
					action: "cancel",
					label: "Cancel",
					callback: () => {
						item.delete();
					}
				}
			]
		}).render({ force: true });
	}
	if (pay) {
		actor.update({"system.details.currency": actor.system.details.currency - item.system.price});
		item.setFlag(moduleId, 'Purchased', true);
	}
});

Hooks.on("item-piles-preTransferItems", async (srcChar, srcArgs, dstChar, dstArgs, unknown) => {
	if (srcArgs.itemsToDelete.length > 0) {
		for (const itemId of srcArgs.itemsToDelete) {
			let item = srcChar.items.get(itemId);
			await item.setFlag(moduleId, 'DroppedOnPile', true);
		}
	}
});

Hooks.on("deleteItem", async (item, action, id) => {
	if (!game.settings.get(moduleId, 'deductgearcost'))
		return;
	if (!isPurchase(item, action, id))
		return;
	if (!item.getFlag(moduleId, 'Purchased'))
		return;
	if (item.getFlag(moduleId, 'DroppedOnPile'))
		return;
	// Refund purchase price.
	const actor = item.parent;
	actor.update({"system.details.currency": actor.system.details.currency + item.system.price});
});

Hooks.on("deleteItem", async (item, action, id) => {
	if (!processThis(item) || id != game.user.id || !item.parent)
		return;
	
	await deleteItem(item, action, id);
});


Hooks.on("updateItem", async (item, change, action) => {
	if (!processThis(item) || !item.parent)
		return;
	
	await updateItem(item, action);
});


Hooks.on("closeSwadeItemSheetV2", (sheet) => {
	if (!sheet.item || !sheet.item.parent)
		return;

	if (processThis(sheet.item)) {
		let dialog = dialogIds[sheet.item._id];

		if (dialog) {
			dialog.editOptions.cancel = true;
			dialog.close();
			delete dialogIds[sheet.item._id];
		}
	}
});

function processThis(item) {
	const itemTypes = ['power', 'weapon', 'armor', 'gear'];

	return itemTypes.includes(item.type);
}

Hooks.on("renderSwadeItemSheetV2", (app, html) => {
	
	if (!app.item)
		return;

	if (!processThis(app.item))
		return;

	// Find the left panel/sidebar area
	const leftPanel = html.querySelector(".sheet-sidebar");

	if (!leftPanel) return;
	
	// Add a button for the power definition. This can be on
	// items in the compendium.

	if (html.querySelector(".edit-definition-button")) return;
	
	// Create the button for editing the power definition
	let button = document.createElement("button");
	button.classList.add("edit-definition-button");
	if (app.item.type == "power")
		button.innerHTML = `<i class="fas fa-gear"></i> Power Definition`;
	else
		button.innerHTML = `<i class="fas fa-gear"></i> Item Definition`;

	// Add click handler
	button.addEventListener("click", async (event) => {
		event.preventDefault();

		editDefinition(app.item);
	});

	// Add button to panel
	leftPanel.prepend(button);

	// The items details button should only be added
	// to items that are on characters.

	if (!app.item.parent)
		return;
	
	// Avoid adding the button multiple times
	if (html.querySelector(".power-detail-button")) return;

	// Create the button
	button = document.createElement("button");
	button.classList.add("power-detail-button");
	if (app.item.type == 'power')
		button.innerHTML = `<i class="fas fa-bolt-lightning"></i> Power Details`;
	else
		button.innerHTML = `<i class="fas fa-bolt-lightning"></i> Item Details`;

	// Add click handler
	button.addEventListener("click", async (event) => {
		event.preventDefault();

		openPowerDialog(app.item);
	});

	// Add button to panel
	leftPanel.prepend(button);
});


async function openJournalEntry(uuid) {
	let journal = await fromUuid(uuid);
	if (journal) {
		journal.sheet.render(true);
		return;
	}
}

class DefinitionDialog extends foundry.applications.api.DialogV2 {

	item = null;

	// This click handler checks the syntax on the definition and
	// prevents closing the dialog if it has an error. Otherwise
	// it saves the new definition and allows normal exit.

    async _onRender(context, options) {
		await super._onRender(context, options);
		const okButton = this.element.querySelector(`button[data-action="ok"]`);
		if (okButton) {
			okButton.addEventListener("click", async (e) => {
				let def = this.element.querySelector(`textarea[id="definition"]`);
				if (def) {
					const text  = def.value;
					try {
						let definition;
						if (text == "") {
							// Get the definition from the original item.
							const source = this.item._stats?.compendiumSource;
							let sourceItem;
							if (source)
								sourceItem = await fromUuid(source);
							if (!sourceItem)
								sourceItem = await getPackItem(powerPackName, this.item.system.swid);
							const def = sourceItem.getFlag(moduleId, 'definition');
							if (!def)
								throw `There is no power with SWID ${this.item.system.swid}. Cannot copy definition.`;
							definition = foundry.utils.duplicate(def);
						} else
							definition = JSON.parse(text);
						// Unless the definition is removed first, it's not updated
						// properly. Properties of the previous version of the
						// definition that were deleted in the edit "come back".
						// That's because setFlag isn't really a set: it's an update.
						await this.item.setFlag(moduleId, 'definition', null);
						await this.item.setFlag(moduleId, 'definition', definition);
					} catch (err) {
						e.preventDefault();
						e.stopImmediatePropagation();
						const proceed = await foundry.applications.api.DialogV2.prompt({
						  window: { title: "Error" },
						  content: `Error in definition:<br>${err}`,
						  rejectClose: true,
						  modal: true
						});
					}
				}
			});
		}
		const helpButton = this.element.querySelector(`button[data-action="help"]`);
		if (helpButton) {
			helpButton.addEventListener("click", async (e) => {			
				e.preventDefault();
				e.stopImmediatePropagation();
				openJournalEntry(definitionsHelpUuid);
			});
		}
		
	}	 

	constructor(args, item) {
		super(args);
		this.item = item;
	}
}


async function editDefinition(item) {
	let content = "";
	let dlg;

	let definition = item.getFlag(moduleId, 'definition');
	if (!definition) {
		// If not defined on the item get it from
		// the global definitions.
		const sourceItem = await getPackItem(powerPackName, item.system.swid);
		if (sourceItem) {
			const def = sourceItem.getFlag(moduleId, 'definition');
			if (def) {
				definition = foundry.utils.duplicate(def);
			} else if (powerList[item.system.swid]) {
				definition = foundry.utils.duplicate(powerList[item.system.swid]);
			}
		}
		if (!definition)
			definition = {};
	}
	let text = JSON.stringify(definition, null, 4);
	let lines = 1;
	for (let j = 0; j < text.length; j++)
		if (text[j] == '\n')
			lines++;
	content += `<p>Enter the power definition in JSON format.</p><textarea field-sizing: content; id="definition" name="definition" cols="60" rows="${lines<20?20:lines}">${text}</textarea></p>\n`;

	content = `<div style="display: flex; flex-flow: column; overflow: scroll; height: 400px">` + content + `</div>`;

	try {
		dlg = await new DefinitionDialog({
		  window: {
			title: `Power Definition: ${item.name}`,
			resizable: true
		  },
		  content: content,
		  buttons: [
			{
				action: "ok",
				label: "OK",
				default: true,
				callback: async (event, button, dialog) => {
					// The text is compiled and saved to the object
					// in the click handler in the class definition.
					// An error can be detected and prevent the
					// dialog closing.
				}
			},
			{
				action: "help",
				label: "Help",
				callback: (event, button, dialog) => {
					// This is handled in the click handler
					// to avoid closing the dialog when the
					// button is clicked.
				}
			},
			{
				action: "cancel",
				label: "Cancel"
			}
		  ]
		}, item);
		dlg.render({ force: true });
	} catch (msg) {
		ui.notifications.notify(msg);
	}
}


Hooks.once('init', async function () {
	game.settings.register(moduleId, 'superpowerpoints', {
	  name: 'Super Power Points',
	  hint: 'The total number of points available for buying super powers.',
	  scope: 'world',     // "world" = sync to db, "client" = local storage
	  config: true,       // false if you dont want it to show in module config
	  type: Number,       // Number, Boolean, String, Object
	  default: 30
	});
	game.settings.register(moduleId, 'deductgearcost', {
	  name: 'Deduct Gear Cost',
	  hint: `When items are added to Gear deduct the price from the character's currency.`,
	  scope: 'world',     // "world" = sync to db, "client" = local storage
	  config: true,       // false if you dont want it to show in module config
	  type: Boolean,       // Number, Boolean, String, Object
	  default: true
	});
	
	game.PowerHandlers = {
		toggleEffects: toggleEffects,
		knockback: knockback,
		copyPowers: copyPowers,
		remakeCharacter: remakeCharacter,
		stockVendor: stockVendor,
		shrink: shrink,
		growth: growth,
		absorb: absorb,
		negation: negation
	}	
});

async function shrink(item) {
	let actor = item.parent;
	let content = `<p>Select the size for ${actor.name} to shrink to.</p>`;
	const level = item.getFlag(moduleId, 'smaller');
	if (level === undefined)
		return ui.notifications.warn(`This macro must be run from the Shrink power or chat card after Shrink details have been set.`);
	const microscopic = item.getFlag(moduleId, 'microscopic');
	const density = item.getFlag(moduleId, 'density');
	let curSize = item.getFlag(moduleId, 'curSize');
	if (curSize === undefined)
		curSize = 0;
	
	content += `<select name="size" id="size">
		<option value="0">Size 0</option>
		<option value="-1">Size -1</option>
		<option value="-2">Size -2</option>`;
	if (level >= 8)
		content += `<option value="-3">Size -3</option>`;
	if (level >= 16)
		content += `<option value="-4">Size -4</option>`;
	if (level >= 16 && microscopic)
		content += `<option value="Microscopic">Microscopic</option>`;
	content += `</select>`;

	let newSize = await foundry.applications.api.DialogV2.wait({
		window: { 
			title: "Shrink",
			width: 300
		},
		content: content,
		buttons: [
			{
				label: "Shrink",
				action: "ok",
				default: true,
				callback: async (event, button, dialog) => {
					return button.form.elements.size.value;
				}
			},
			{
				action: "cancel",
				label: "Cancel",
				callback: (event, button, dialog) => { return false; }
			}
		]
	});
	if (size === false)
		return;

	// Remove current shrink effect.

	const effect = actor.effects.find(e => e.name.startsWith('Shrink'));
	if (effect)
		actor.deleteEmbeddedDocuments("ActiveEffect", [effect._id]);
	
	let shrinkEffect = {
		name: `Shrink ${newSize}`,
		icon: "modules/succ/assets/icons/m-shrink.svg",
		origin: null,
		disabled: false,
		description: "<p>Shrink</p>",
		system: {
			favorite: true
		},
		changes: []
	};

	if (newSize == 'Microscopic') {
		// Nothing can affect the character from the normal world,
		// but the character's stats are otherwise normal for that size.
		shrinkEffect.changes.push({
			key: "ATL.width",
			mode: 5,
			priority: 50,
			value: ".5"
		});
		shrinkEffect.changes.push({
			key: "ATL.height",
			mode: 5,
			priority: 50,
			value: ".5"
		});

		let result = await actor.createEmbeddedDocuments("ActiveEffect", [shrinkEffect]);

		let chatData = {
			speaker: {actor: actor},
			content: `${actor.name} is now Microscopic.`
		};
		await ChatMessage.create(chatData);
		return;
	}

	newSize = parseInt(newSize);
	if (newSize == 0) {
		await ChatMessage.create({
			speaker: {actor: actor}, 
			content: `${actor.name} has returned to normal size.`
		});
		return;
	}

	shrinkEffect.changes.push({
		key: "system.stats.size",
		mode: 2,
		priority: 50,
		value: newSize
	});
	shrinkEffect.changes.push({
		key: "ATL.width",
		mode: 5,
		priority: 50,
		value: newSize < -1 ? ".5" : ".75"
	});
	shrinkEffect.changes.push({
		key: "ATL.height",
		mode: 5,
		priority: 50,
		value: newSize < -1 ? ".5" : ".75"
	});

	// If density mod selected Toughness and Strength are not affected.
	if (density)
		shrinkEffect.changes.push({
			key: "system.stats.toughness.value",
			mode: 2,
			priority: 50,
			value: -newSize
		});
	else
		shrinkEffect.changes.push({
			key: "system.attributes.strength.die.modifier",
			mode: 2,
			priority: 50,
			value: newSize
		});
		
	let result = await actor.createEmbeddedDocuments("ActiveEffect", [shrinkEffect]);
	await ChatMessage.create({
		speaker: {actor: actor}, 
		content: `${actor.name} is now size ${newSize}.`
	});
}

async function growth(item) {
	let actor = item.parent;
	let content = `<p>Select the size for ${actor.name} to grow to.</p>`;
	const level = item.getFlag(moduleId, 'level');
	const permanent = item.getFlag(moduleId, 'permanent');

	if (level === undefined)
		return ui.notifications.warn(`This macro must be run from the Growth power or chat card after Growth details have been set.`);
	
	content += `<select name="size" id="size">`;
	if (permanent)
		content += `<option value="${level}">Size ${level}</option>`;
	else {
		for (let i = 0; i <= level; i++)
			content += `<option value="${i}">Size ${i}</option>`;
	}
	content += `</select>`;

	let newSize = await foundry.applications.api.DialogV2.wait({
		window: { 
			title: "Growth",
			width: 300
		},
		content: content,
		buttons: [
			{
				label: "Grow",
				action: "ok",
				default: true,
				callback: async (event, button, dialog) => {
					return button.form.elements.size.value;
				}
			},
			{
				action: "cancel",
				label: "Cancel",
				callback: (event, button, dialog) => { return false; }
			}
		]
	});
	if (newSize === false)
		return;

	// Remove current growth effect.

	const effect = actor.effects.find(e => e.name.startsWith('Growth'));
	if (effect)
		actor.deleteEmbeddedDocuments("ActiveEffect", [effect._id]);
	
	let growthEffect = {
		name: `Growth ${newSize}`,
		icon: "modules/succ/assets/icons/m-growth.svg",
		origin: null,
		disabled: false,
		description: "<p>Growth</p>",
		system: {
			favorite: true
		},
		changes: []
	};

	newSize = parseInt(newSize);
	if (newSize == 0) {
		await ChatMessage.create({
			speaker: {actor: actor},
			content: `${actor.name} has returned to normal size.`
		});
		return;
	}

	growthEffect.changes.push({
		key: "system.stats.size",
		mode: 2,
		priority: 50,
		value: newSize
	});

	const tokSize = Math.min(2, 1 + newSize / 4.0);
	growthEffect.changes.push({
		key: "ATL.width",
		mode: 5,
		priority: 50,
		value: tokSize
	});
	growthEffect.changes.push({
		key: "ATL.height",
		mode: 5,
		priority: 50,
		value: tokSize
	});

	growthEffect.changes.push({
		key: "system.attributes.strength.die.sides",
		mode: 2,
		priority: 50,
		value: newSize*2
	});

	if (newSize >= 4) {
		growthEffect.changes.push({
			key: "system.wounds.max",
			mode: 2,
			priority: 50,
			value: Math.floor(newSize / 4)
		});
		growthEffect.changes.push({
			key: "system.pace.ground",
			mode: 2,
			priority: 50,
			value: Math.floor(newSize / 4)
		});
	}

	let result = await actor.createEmbeddedDocuments("ActiveEffect", [growthEffect]);
	await ChatMessage.create({
		speaker: {actor: actor},
		content: `${actor.name} is now size ${newSize}.`
	});
}

async function absorb(item) {
	const effectName = 'Absorption Size Increase';
	const transferName = 'Absorption Transference';
	
	let actor = item.parent;

	const growth = item.getFlag(moduleId, 'growth');
	const transference = item.getFlag(moduleId, 'transference');

	let content = `<div style="display: table; width: 300px; font-size: 10pt;">
		<div style="display: table-row-group;">`;

	content += formatRow(`<label for="wounds"> Wounds Absorbed</label>`,
		`<input type="number" id="wounds" name="wounds" value="1">`);
	content += formatRow(`<label for="unshake">Unshake</label>`,
		`<input type="checkbox" id="unshake" name="unshake">`, 'left');


	const attributes = {
		Agility: 'agility',
		Smarts: 'smarts',
		Spirit: 'spirit',
		Strength: 'strength', 
		Vigor: 'vigor'
	};

	if (transference) {
		// Limit increases to 4 die types by not including an
		// attribute if the limit has been reached.
		let attrIncEffects = actor.effects.filter(e => e.name.startsWith(transferName));
		let increases = [];
		for (let e of attrIncEffects) {
			let key = e.changes[0].key.split('.');
			const aname = key[2];
			if (increases[aname])
				increases[aname]++;
			else
				increases[aname] = 1;
		}
		let select = `<select id="attribute" name="attribute">`;
		for (const a in attributes) {
			let inc = increases[attributes[a]];
			if (inc == undefined) inc = 0;
			if (inc < 4)
				select += `<option value="${attributes[a]}">${a}</option>`;
		}
		select += `</select>`;
		content += formatRow("Attribute", select);
	}

	content += `</div></div>`

	let wounds;
	let attribute;
	let Attribute;
	let unshake;

	let result = await foundry.applications.api.DialogV2.wait({
		window: { 
			title: "Absorb",
			width: 400
		},
		content: content,
		buttons: [
			{
				label: "Absorb",
				action: "ok",
				callback: async (event, button, dialog) => {
					wounds =  button.form.elements.wounds.valueAsNumber;
					if (transference) {
						const elt = button.form.elements.attribute;
						attribute = elt.value;
						Attribute = elt[elt.selectedIndex].text;
					}
					unshake = button.form.elements.unshake.checked;
					return 'absorb';
				}
			},
			{
				label: "Remove Effects",
				action: "remove",
				callck: async (event, button, dialog) => {
					wounds =  button.form.elements.wounds.valueAsNumber;
					if (transference)
						attribute = button.form.elements.attribute.value;
					unshake = button.form.elements.unshake.checked;
					return 'remove';
				}
			},
			{
				action: "cancel",
				label: "Cancel",
				callback: (event, button, dialog) => { return 'cancel'; }
			}
		]
	});
	if (result == 'cancel')
		return;
	wounds = parseInt(wounds);

	// Remove the current effect.

	let sizeIncrease = 0;
	const effect = actor.effects.find(e => e.name == effectName);
	if (effect) {
		sizeIncrease = parseInt(effect.changes[0].value);
		actor.deleteEmbeddedDocuments("ActiveEffect", [effect._id]);
	}

	if (result == 'remove') {
		// Also remove any attribute increases.
		const increases = actor.effects.filter(e => e.name.startsWith(transferName));
		if (increases.length > 0) {
			const remove = increases.map(e => e._id)
			actor.deleteEmbeddedDocuments("ActiveEffect", remove);
		}
		return;
	}

	function appendMsg(msg, text) {
		if (msg)
			msg += ', ';
		return msg + text;
	}

	// Remove wounds and shaken
	const currentWounds = actor.system.wounds.value;
	const newWounds = Math.max(currentWounds - wounds, 0);
	let updates = {};
	let msg = ``;
	if (newWounds <= actor.system.wounds.max) {
		if (actor.system.status.isIncapacitated) {
			const incap = game.swade.util.getStatusEffectDataById('incapacitated', {active: false});
			actor.toggleActiveEffect(incap)
		}
		updates["system.wounds.value"] = newWounds;
		msg = appendMsg(msg, ` absorbed ${wounds} wound(s)`);
	}

	if (unshake) {
		if (actor.system.status.isShaken) {
			const shaken = game.swade.util.getStatusEffectDataById('shaken', {active: false});
			actor.toggleActiveEffect(shaken);
		}
		msg = appendMsg(msg, `is not shaken`);
	}

	await actor.update(updates);
	
	if (growth) {
		let absorbEffect = {
			name: effectName,
			icon: "modules/succ/assets/icons/m-boost.svg",
			origin: null,
			disabled: false,
			description: "<p>Size increase from the absorption power.</p>",
			system: {
				favorite: true
			},
			changes: []
		};

		sizeIncrease += wounds;

		absorbEffect.changes.push({
			key: "system.stats.size",
			mode: 2,
			priority: 50,
			value: sizeIncrease
		});
		// Limit token size increase to double.
		let tokenSize = Math.min(1, sizeIncrease / 4);
		absorbEffect.changes.push({
			key: "ATL.width",
			mode: 2,
			priority: 50,
			value: tokenSize
		});
		absorbEffect.changes.push({
			key: "ATL.height",
			mode: 2,
			priority: 50,
			value: tokenSize
		});
		absorbEffect.changes.push({
			key: "system.attributes.strength.die.sides",
			mode: 2,
			priority: 50,
			value: sizeIncrease*2
		});
		let result = await actor.createEmbeddedDocuments("ActiveEffect", [absorbEffect]);
		msg = appendMsg(msg, `size increased by ${wounds}`);
	}
	
	if (transference && attribute) {
		let increaseAttribute = {
			name: `${transferName} (${Attribute})`,
			icon: "modules/succ/assets/icons/m-boost.svg",
			origin: null,
			disabled: false,
			description: `<p>Attribute increased by Absorption.</p>`,
			changes: [
				{
					key: `system.attributes.${attribute}.die.sides`,
					mode: 2,
					priority: 50,
					value: 2
				}				
			],
			duration: {
			  seconds: 30,
			  rounds: 5,
  			  startTime: game.time.worldTime,
			  startRound: game?.combat?.current?.round
			},
			system: {
				expiration: 2
			}
		};
		let result = await actor.createEmbeddedDocuments("ActiveEffect", [increaseAttribute]);
		msg = appendMsg(msg, `increased ${Attribute}`);
	}

	await ChatMessage.create({
		speaker: {actor: actor},
		content: `${actor.name} ${msg}.`
	});
}

function toggleEffects(item) {
	if (!item)
		return;

	for (let e of item.effects) {
		e.update({"disabled": !e.disabled});
	}	
}

async function negation(token) {
	const actor = token.actor;
	const targets = Array.from(game.user.targets);
	if (targets.length != 1)
		return ui.notifications.notify("Target the token to negate powers on.");

	const target = targets[0].actor;
	let npowers = 0;
	let powers = "";
	let powerNames = [];
	for (const p of target.items) {
		if (p.type != 'power')
			continue;
		npowers++;
		powerNames[npowers] = p.name;
		const id = `p${npowers}`;
		powers += `<div style="display: table-row;">
			<div style="display: table-cell">
				<input type="checkbox" id="${id}" name="${id}" data-uuid="${p.uuid}">
			</div>
			<div style="display: table-cell">
				<label for="${id}">${p.name} (${p.system.pp})</label>
			</div>
		</div>`
	}

	const content = `<p>Select powers to negate on ${target.name}.</p>
		<div style="display: table; width: 300px;">
			<div style="display: table-row-group">
				<div style="display: table-row;">
					${powers}
				</div>
			</div>
		</div>`;

	const dlg = new foundry.applications.api.DialogV2({
		window: { title: "Negation" },
		content: content,
		buttons: [
			{
				label: "OK",
				action: "ok",
				default: true,
				callback: async (event, button, dialog) => {
					let chosenPowers = [];
					for (let i = 1; i <= npowers; i++) {
						const id = `p${i}`;
						if (!button.form.elements[id].checked)
							continue;
						
						chosenPowers.push(powerNames[i]);
					}
					negate(chosenPowers.join(', '));
				}
			},
			{
				action: "cancel",
				label: "Cancel",
				callback: (event, button, dialog) => { return false; }
			}
		]
	}).render(true);
	
	async function negate(powers) {
		let negation = {
			name: `Negation: ${powers}`,
			icon: "modules/super-noir/assets/images/negation.webp",
			origin: null,
			disabled: false,
			description: `<p>Roll Spirit each round to shake off negation.</p>`,
			duration: {
			  seconds: 6000,
			  rounds: 1000,
			  startTime: game.time.worldTime,
			  startRound: game?.combat?.current?.round
			},
			system: {
				favorite: true,
				expiration: 2
			}
		};
		let result = await target.createEmbeddedDocuments("ActiveEffect", [negation]);
		await ChatMessage.create({
			speaker: {actor: token.actor},
			content: `Power(s) negated on ${targets[0].name}: ${powers}. Roll Spirit each round to recover. Each success and raise restores one power.`
		});
	}
}

function copyPowers() {
	const targets = Array.from(game.user.targets);
	if (targets.length != 1)
		return ui.notifications.notify("Target the token to copy powers from.");
	if (canvas.tokens.controlled.length != 1)
		return ui.notifications.notify("Select the actor who is copying powers.");

	const target = targets[0].actor;
	const actor = canvas.tokens.controlled[0].actor;
	
	let powers = "";

	let npowers = 0;
	const copycat = actor.items.find(p => p.system.swid == "copycat");
	let points = copycat ? copycat.getFlag(moduleId, 'level') : "--";

	for (const p of target.items) {
		if (p.type != 'power')
			continue;
		npowers++;
		const id = `p${npowers}`;
		powers += `<div style="display: table-row;">
			<div style="display: table-cell">
				<input type="checkbox" id="${id}" name="${id}" data-uuid="${p.uuid}">
			</div>
			<div style="display: table-cell">
				<label for="damage">${p.name} (${p.system.pp})</label>
			</div>
		</div>`
	}

	const content = `<p>Select powers to copy from ${target.name}. Power Points: ${points}</p>
		<div style="display: table; width: 300px;">
			<div style="display: table-row-group">
				<div style="display: table-row;">
					${powers}
				</div>
			</div>
		</div>`;

	const dlg = new foundry.applications.api.DialogV2({
		window: { title: "Copycat" },
		content: content,
		buttons: [
			{
				label: "OK",
				action: "ok",
				default: true,
				callback: async (event, button, dialog) => {
					let chosenPowers = [];
					for (let i = 1; i <= npowers; i++) {
						const id = `p${i}`;
						if (!button.form.elements[id].checked)
							continue;
						const chkbox = dialog.element.querySelector(`input[id="${id}"]`);
						const uuid = chkbox.getAttribute(`data-uuid`);
						let power = await fromUuid(uuid);
						power = power.toObject();
						delete power._id;
						power.name = `Copy: ${power.name}`;
						chosenPowers.push(power);
					}
					if (chosenPowers.length > 0) {
						const result = await actor.createEmbeddedDocuments("Item", chosenPowers);
						for (const power of result)
							power.setFlag(moduleId, 'copiedPower', true);
					}
				}
			},
			{
				action: "delete",
				label: "Delete Copied Powers",
				callback: async (event, button, dialog) => {
					let deleteThese = [];
					let deleted = [];
					for (const p of actor.items) {
						if (p.getFlag(moduleId, 'copiedPower')) {
							deleteThese.push(p.id);
							deleted.push(p.name);
						}
					}
					if (deleteThese.length > 0) {
						await actor.deleteEmbeddedDocuments("Item", deleteThese);
						ui.notifications.notify(`Deleted power(s): ${deleted.join(', ')}`);
					}
				}
			},
			{
				action: "cancel",
				label: "Cancel",
				callback: (event, button, dialog) => { return false; }
			}
		]
	}).render(true);
}

async function knockback() {

	async function applyKnockback(damage, collision) {
		const dt = [10, 20, 30, 40, 50];
		let noKnockback = "";
		let knockbacks = "";

		for (const token of targets) {
			const index = Math.floor((token.actor.system.stats.size + 4) / 4);

			if (index < 0) index = 0;
			else if (index >= dt.length) index = dt.length - 1;
			const n = dt[index];
			if (damage >= n) {
				const C = damage - n, g = 1 + Math.floor(C / 10), b = Roll.create(`${g}d6`);
				await b.evaluate();
				const w = b.total;
				
				let u = `<strong>${token.name}</strong> knocked back ${w}" (${g}d6)`;
				if (collision) {
					u += `Applying collision damage: 2d6 + ${w}<br>`;
					try {
						await new CONFIG.Dice.DamageRoll(`2d6 + ${w}`).toMessage({
						  speaker: ChatMessage.getSpeaker({ token: token }),
						  flavor: `Collision Damage from Knockback (${w} inches)`
						});
					} catch (E) {
						console.error("Error rolling collision damage:", E), ui.notifications.error("Failed to roll collision damage.");
					}
				} else {
					if (knockbacks)
						knockbacks += "<br>";
					knockbacks += u;
				}					
			} else {
				if (noKnockback)
					noKnockback += ", ";
				noKnockback += token.name;
			}
		}
		if (knockbacks)
			knockbacks = `<p><b>Knockback!</b></p><p>` + knockbacks + `<br>Reminder: roll Athletics at −2 or fall Prone.</p>`;
		if (noKnockback)
			knockbacks += `<p>No knockback: ${noKnockback}</p>`;
		
		if (knockbacks) {
			await ChatMessage.create({
				content: knockbacks
			});
		}			
	}
	
	const targets = Array.from(game.user.targets);
	if (targets.length == 0)
		return ui.notifications.notify("Target one or more tokens.");
	
	const content = `<p>Enter damage for Knockback.</p>
		<div style="display: table; width: 300px;">
			<div style="display: table-row-group">
				<div style="display: table-row;">
					<div style="display: table-cell">
						<label for="damage">Damage</label>
					</div>
					<div style="display: table-cell">
						<input type="number" id="damage" name="damage" maxlength="2" size="2">
					</div>
				</div>
				<div style="display: table-row;">
					<div style="display: table-cell">
						<label for="collision">Collision?</label>
					</div>
					<div style="display: table-cell">
						<input type="checkbox" id="collision" name="collision">
					</div>
				</div>
			</div>
		</div>`;

	const dlg = new foundry.applications.api.DialogV2({
		window: { title: "Knockback Calculator" },
		content: content,
		buttons: [
			{
				label: "Apply Knockback",
				action: "ok",
				default: true,
				callback: async (event, button, dialog) => {
					applyKnockback(button.form.elements.damage.valueAsNumber,
						button.form.elements.collision.checked);
					return true;
				}
			},
			{
				action: "cancel",
				label: "Cancel",
				callback: (event, buton, dialog) => { return false; }
			}
		]
	}).render(true);
}


async function Q(m) {
  const t = Array.from(game.user.targets);
  if (!m)
    return ui.notifications.warn("Select a token to determine knockback direction.");
  if (!t.length)
    return ui.notifications.warn("You must target at least one actor.");
  const e = [
    { value: 10, label: "Small or Tiny" },
    { value: 20, label: "Normal" },
    { value: 30, label: "Large" },
    { value: 40, label: "Huge" },
    { value: 50, label: "Gargantuan" }
  ], { createCheckboxInput: o, createFormGroup: i, createSelectInput: a, createNumberInput: r } = foundry.applications.fields, c = document.createElement("div"), s = i({
    label: "Damage Dealt",
    input: r({ name: "damage", value: 30 })
  }), l = i({
    label: "Target Scale",
    input: a({
      name: "threshold",
      options: e,
      value: 10,
      dataset: { dtype: "Number" }
    })
  }), f = i({
    label: "Hit Obstacle?",
    input: o({ name: "obstacle" })
  });
  c.append(s, l, f);
  const { damage: d, threshold: n, obstacle: p } = await foundry.applications.api.DialogV2.input({
    window: { title: "Knockback Calculator" },
    content: c,
    ok: {
      label: "Apply Knockback",
      icon: "fa-solid fa-person-running"
    }
  });
  if (d < n)
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: m }),
      content: `Not enough damage to trigger knockback (Threshold: ${n}).`
    });
  let u = "<strong>Knockback Results</strong><br>";
  u += `Damage: ${d} vs Threshold for ${e.find((h) => h.value === n).label} (${n})<br><br>`;
  const y = [];
  for (const h of t) {
    const C = d - n, g = 1 + Math.floor(C / 10), b = Roll.create(`${g}d6`);
    await b.evaluate();
    const w = b.total;
    if (y.push(b), u += `<strong>${h.name}</strong> is knocked back ${w}" (${g}d6)<br>`, p) {
      u += `Applying collision damage: 2d6 + ${w}<br>`;
      try {
        await new CONFIG.Dice.DamageRoll(`2d6 + ${w}`).toMessage({
          speaker: ChatMessage.getSpeaker({ actor: h.actor }),
          flavor: `Collision Damage from Knockback (${w} inches)`
        });
      } catch (E) {
        console.error("Error rolling collision damage:", E), ui.notifications.error("Failed to roll collision damage.");
      }
    }
    u += `Reminder: ${h.name} must roll Athletics at −2 or fall Prone.<br><br>`;
  }
  await ChatMessage.create({
    rolls: y,
    speaker: ChatMessage.getSpeaker({ actor: m }),
    content: u
  });
}


async function remakeCharacter() {
	// Create a new SWADE character

	new foundry.applications.api.DialogV2({
		window: {
			title: "Remake SWADE Character"
		},
		content: `
			<div class="form-group" width="400px">
			  <label>UUID:</label>
			  <input type="text" id="uuid" value="">
			</div>
			`,
		buttons: [
			{
				action: "ok",
				label: "OK",
				callback: async (event, button, dialog) => {
					 let uuid = button.form.elements.uuid.value;
					if (!uuid) return;
					await remake(uuid);
				}
			},
			{
				action: "cancel",
				label: "Cancel",
				callback: (event, button, dialog) => null
			}
		]
	}).render(true);

	async function remake(uuid) {
		const oldActor = await fromUuid(uuid);
		if (!oldActor)
			return ui.notifications.notify(`Can't find ${uuid}`);

		const newActor = await Actor.create({
		  name: oldActor.name + ' (Copy)',
		  type: oldActor.type
		});

		newActor.sheet.render(true);
		await newActor.update({
			"system": oldActor.system,
			"img": oldActor.img,
			"prototypeToken": oldActor.prototypeToken
		});
		if (oldActor.system.wildcard)
			await newActor.update({"prototypeToken.actorLink": true});
		await newActor.update({
			"system.details.autoCalcToughness": true,
			"system.details.autoCalcParry": true
		});

		let addItems = [];

		for (let item of oldActor.items) {
			switch (item.type) {
			case 'power':
				let power = await getPackItem(powerPackName, item.system.swid);
				if (!power) {
					ui.notifications.warn(`Can't find ${item.system.swid} in compendium`);
					let np = {
						type: 'power',
						name: item.name,
						system: { trapping: item.system.trapping}
					};
					addItems.push(np);
				} else {
					const p = power.toObject();
					delete p._id;
					p.system.trapping = item.system.trapping;
					addItems.push(p);
				}
				break;
			default:
				const itemData = item.toObject();
				delete itemData._id;
				addItems.push(itemData);
				break;
			}
		}
		
		newActor.createEmbeddedDocuments("Item", addItems);
	}
}

async function stockVendor() {
	const token = canvas.tokens.controlled[0];
	if (!token)
		return ui.notifications.warn("No vendor token selected.");
	const actor = token.actor;
	if (!actor)
		return ui.notifications.warn("Token has no actor assigned.");
	if (actor.type != 'npc')
		return ui.notifications.warn("Vendor tokens must be NPCs.");
	
	new foundry.applications.api.DialogV2({
		window: {
			title: "Restock Vendor"
		},
		content: `
			<div class="form-group" width="300">
			  <label>Compendium:</label>
			  <input type="text" id="gearPack" value="super-noir.items">
			</div>
			`,
		buttons: [
			{
				action: "ok",
				label: "OK",
				callback: async (event, button, dialog) => {
					 let gearPack = button.form.elements.gearPack.value;
					if (!gearPack) return;
					await stock(gearPack);
				}
			},
			{
				action: "cancel",
				label: "Cancel",
				callback: (event, button, dialog) => null
			}
		]
	}).render(true);	
	
	
	async function stock(gearPack) {
		const pack = game.packs.get(gearPack);

		if (!pack)
			return ui.notifications.error(`Pack not found: ${gearPack}`);

		const index = await pack.getIndex();

		if (!index)
		  return ui.notications.error(`Unable to get compendium index for ${gearPack}`);
		let addItems = [];
		for (const entry of index) {
			const item = await fromUuid(entry.uuid);
			if (item.system.price > 0) {
				const itemData = item.toObject();
				addItems.push(itemData);
			}
		}
		actor.createEmbeddedDocuments("Item", addItems);
	}

}