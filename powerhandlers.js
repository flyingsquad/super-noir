import {
	moduleId,
	formatRow
} from "./editpowers.js";


export async function absorb(item) {
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
		`<input type="checkbox" id="unshake" name="unshake">`, {ralign: 'left'});


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
	if (result == 'cancel' || !result)
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
			img: "modules/succ/assets/icons/m-boost.svg",
			origin: null,
			disabled: false,
			description: "<p>Size increase from the absorption power.</p>",
			duration: {
			  seconds: 6000,
			  rounds: 1000,
  			  startTime: game.time.worldTime,
			  startRound: game?.combat?.current?.round
			},
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
			key: "token.texture.scaleX",
			mode: 2,
			priority: 50,
			value: tokenSize
		});
		absorbEffect.changes.push({
			key: "token.texture.scaleY",
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
			img: "modules/succ/assets/icons/m-boost.svg",
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

export async function boostLowerTrait(item, actor) {

	if (game.user.targets.size <= 0)
		return ui.notifications.notify(`No tokens are targeted to be boosted/lowered.`);

	let targets = [];
	for (let t of game.user.targets)
		targets.push(t.actor);

	// Ask user to select trait.
	const attrlang={
		agility: "AttrAgi",
		spirit:"AttrSpr",
		strength: "AttrStr",
		smarts:  "AttrSma",
		vigor: "AttrVig"
	};
	const attributes=['agility','smarts','spirit','strength','vigor']

	let skillList=[]
	
	let content = `<div>Select the Action and the Trait boost/lower.</div>`;
	content += `<div style="table">`;

	content += formatRow(
		`<label for="action">Action</label>`,
		`<select id="action">
			<option value="boost">Boost</option>
			<option value="lower">Lower</option>
		</select>`,
		{ralign: "left", lstyle: "width: 30%"}
	);
	
	let selTrait = `<select id="trait">`;

	selTrait += `<optgroup label="${game.i18n.localize('SWADE.Attributes')}">\n`;
	attributes.map(att=>{
		selTrait += `<option value="att-${att}">${game.i18n.localize('SWADE.'+attrlang[att])}</option>\n`;
	})

	selTrait += `</optgroup>
	<optgroup label="${game.i18n.localize('SWADE.Skills')}">`;

	for (const a of targets) {
		a.items.filter(el => el.type == 'skill').map(skill => {
			if (!skillList.includes(skill.name)){
				selTrait += `<option value="${skill.name}">${skill.name}</option>\n`;
				skillList.push(skill.name);
			}
		});
	}

	selTrait += `</select>`
	
	content += formatRow(
		`<label>${game.i18n.localize('SWADE.Trait')}</label>`,
		selTrait,
		{ralign: "left", lstyle: "width: 30%"}
	);

	const canLeech = item.getFlag(moduleId, 'leech');
	if (canLeech) {
		content += formatRow(`<label for="leech">Leech</label>`,
			`<input type="checkbox" id="leech" name="leech" checked>`,
			{ralign: "left", lstyle: "width: 30%"}
		);
	}
	content += formatRow(
		`<label for="raise">Raise</label>`,
		`<input type="checkbox" id="raise" name="raise">`,
		{ralign: "left", lstyle: "width: 30%"}
	);

	content += `</div>`;
	
	let trait = '';
	let leech = undefined;
	let action = undefined;
	let raise = undefined;

	await foundry.applications.api.DialogV2.wait({
		window: {
			title: "Select Trait for Boost/Lower",
		  position: {
			  width: 200,
			  height: 300
		  }
			
		},
		modal: true,
		content: content,
		buttons: [
			{
				action: "choice",
				label: "OK",
				callback: async (event, button, dialog) => {
					trait = button.form.elements.trait.value;
					if (canLeech)
						leech = button.form.elements.leech.checked;
					raise = button.form.elements.raise.checked;
					action = button.form.elements.action.value;
				}
			},
			{
				action: "cancel",
				label: "Cancel",
				callback: (event, button, dialog) => {
					trait = null;
				}
			}
		]
	});
	
	if (!trait)
		return;
	trait = trait.replace('att-', '');
	let key;
	if (attributes.includes(trait)) {
		key = `system.attributes.${trait}.die.sides`;
	} else {
		key = `@Skill{${trait}}[system.die.sides]`;
	}

	let value = raise ? 4 : 2;

	let boost = {
		changes: [
			{
				key: key,
				mode: 2,
				value: value
			}
		],
		name: `Boost ${trait}`,
		img: "modules/succ/assets/icons/m-boost.svg",
		origin: actor.uuid,
		disabled: false,
		description: `<p>${trait} boosted for one round.</p>`,
		duration: {
		  seconds: 6,
		  rounds: 1,
		  startTime: game.time.worldTime,
		  startRound: game?.combat?.current?.round
		},
		system: {
			favorite: true,
			expiration: 2
		}
	};

	if (action == 'boost') {
		if (leech)
			ui.notifications.notify(`Leech isn't compatible with Boost Trait; ignoring it...`);
		await addEffect(targets, boost);
	} else {
		let lower = {
			name: `Lower ${trait}`,
			changes: [
				{
					key: key,
					mode: 2,
					value: -value
				}
			],
			img: "modules/succ/assets/icons/m-lower.svg",
			origin: actor.uuid,
			disabled: false,
			description: `<p>${trait} lowered for one round.</p>`,
			duration: {
			  seconds: 6,
			  rounds: 1,
			  startTime: game.time.worldTime,
			  startRound: game?.combat?.current?.round
			},
			system: {
				favorite: true,
				expiration: 2
			}
		};
		addEffect(targets, lower);
		if (leech) {
			// Maximum of 2 die types can be added to trait.
			if (targets.length > 1)
				boost.changes[0].value = 4;
			await addEffect([actor], boost);
		}
	}

	async function addEffect(targets, effect) {
		for (const a of targets)
			await a.createEmbeddedDocuments("ActiveEffect", [effect]);
	}
	
}


export async function growth(item) {
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
		img: "modules/succ/assets/icons/m-growth.svg",
		origin: null,
		disabled: false,
		description: "<p>Growth</p>",
		duration: {
		  seconds: 60000,
		  rounds: 10000,
		  startTime: game.time.worldTime,
		  startRound: game?.combat?.current?.round
		},
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
		key: "token.texture.scaleX",
		mode: 5,
		priority: 50,
		value: tokSize
	});
	growthEffect.changes.push({
		key: "token.texture.scaleY",
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



export async function shrink(item) {
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
		img: "modules/succ/assets/icons/m-shrink.svg",
		origin: null,
		disabled: false,
		description: "<p>Shrink</p>",
		duration: {
		  seconds: 60000,
		  rounds: 10000,
		  startTime: game.time.worldTime,
		  startRound: game?.combat?.current?.round
		},
		system: {
			favorite: true
		},
		changes: []
	};

	if (newSize == 'Microscopic') {
		// Nothing can affect the character from the normal world,
		// but the character's stats are otherwise normal for that size.
		shrinkEffect.changes.push({
			key: "token.texture.scaleX",
			mode: 5,
			priority: 50,
			value: "0.5"
		});
		shrinkEffect.changes.push({
			key: "token.texture.scaleX",
			mode: 5,
			priority: 50,
			value: "0.5"
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
		key: "token.texture.scaleX",
		mode: 5,
		priority: 50,
		value: newSize < -1 ? "0.5" : "0.75"
	});
	shrinkEffect.changes.push({
		key: "token.texture.scaleY",
		mode: 5,
		priority: 50,
		value: newSize < -1 ? "0.5" : "0.75"
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


/*	Hook roll item and issue a chat message if the
 *	power has been marked as negated. If no effect
 *	linking to the power is found, remove the flag
 *	so the check isn't made anymore.
 */

Hooks.on("BRSW-RollItem", async (card, id) => {
	if (!card.item.getFlag(moduleId, 'negated'))
		return;
	let negateEffect = card.actor.effects.find((e) => {
		const powers = e.getFlag(moduleId, "negatedPowers");
		if (powers)
			if (powers.includes(card.item._id))
				return true;
		return false;
	});
	if (negateEffect && !negateEffect.disabled) {
		await ChatMessage.create({
			speaker: {actor: card.actor},
			content: `${card.item.name} is negated and cannot be used.`
		});
		return;
	}
	// Clear this flag since there's no effect saying the
	// power is negated.
	card.item.setFlag(moduleId, 'negated', null);
});


export async function negation(token) {
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
						const chkbox = dialog.element.querySelector(`input[id="${id}"]`);
						if (!chkbox.checked)
							continue;
						const uuid = chkbox.getAttribute(`data-uuid`);
						let power = await fromUuid(uuid);
						if (power)
							chosenPowers.push(power);
					}
					if (chosenPowers.length > 0)
						negate(chosenPowers);
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
		let names = [];
		let IDs = [];
		// Make a list of the powers that should be marked
		// as negated and any child items, such as ranged
		// and melee attacks in the Gear tab. The item
		// ids for these powers are put on the effect so
		// we can check to see if the power is still negated
		// when the item is rolled (see above).
		for (const p of powers) {
			names.push(p.name);
			IDs.push(p._id);
			await p.setFlag(moduleId, 'negated', true);
			// Also set the negated flag on any items that this power grants.
			for (const flag of ['grantuuid', 'horns', 'claws', 'bite', 'swuuid', 'unarmeduuid']) {
				let ID = p.getFlag(moduleId, flag);
				if (ID) {
					const w = await getItem(p.parent, ID);
					if (w) {
						IDs.push(w._id);
						await w.setFlag(moduleId, 'negated', true);
					}
				}
			}
		}
		let negation = {
			name: `Negation: ${names.join(', ')}`,
			img: "modules/super-noir/assets/images/negation.webp",
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
		if (result) {
			let effect = result[0];
			effect.setFlag(moduleId, 'negatedPowers', IDs);
		}
		await ChatMessage.create({
			speaker: {actor: token.actor},
			content: `Power negated on ${targets[0].name}: ${names.join(', ')}.<br>Roll Spirit each round to recover. Each success and raise restores one power.`
		});
	}
}

export async function copyPowers() {
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
				<label for="${id}">${p.name} (${p.system.pp})</label>
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

