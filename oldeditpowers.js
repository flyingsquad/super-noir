const moduleId = 'super-noir';

let dialogIds = {
};

const powerList = {
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
	'armor': {
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
				name: "Armor",
				value: "@F[level]*2"
			}
		]
	},
	'parry': {
		fields: [
			{
				label: 'Level',
				type: 'level',
				flag: 'level',
				id: 'level',
				costexp: "level",
				checkexp: "level > 0 && level <=5",
				checkmsg: "Parry must be 1-5."
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
					{name: 'MBT', value: 2},
					{name: 'MBT/LBT', value: 4}
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
		baseCost: 2,
		fields: [
			{
				type: 'dndtarget',
				label: 'Drop the Edge here',
				descriptor: 'Edge',
				id: 'edge',
				dropType: 'Item',
				itemType: 'edge',
				flag: 'grantuuid',
				addToActor: true
			}
		],
		deleteActions: [
			{
				deleteUuid: 'grantuuid'
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
		]
	},

};

const universalModifiers = {
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
				cost: 1,
				flag: 'contingent',
				description: "<p>Contingent and Linked powers are triggered by a primary power. Contingent powers can only be used with a primary power.</p>"
			}
		]
	},
	'selective': {
		fields: [
			{
				type: 'checkbox',
				label: 'Contingent',
				id: 'selective',
				cost: 1,
				flag: 'selective',
				description: "<p>The super can choose which targets in her area effect power are affected by it.</p>"
			}
		]
	}
/*
  linked: {
	name: "Linked",
	img: "modules/swade-supers-companion/assets/icons/Supers_Icons_Power.webp",
	description: "<p>Contingent and Linked powers are triggered by a primary power. Linked powers may be used separately if desired.</p>",
	system: {
	  cost: 2
	}
  },
  device: {
	name: "Device",
	img: "modules/swade-supers-companion/assets/icons/Supers_Icons_Power.webp",
	description: "<p>The power is a device that can be removed or lost, such as a suit of armor or helmet, for 1 point. For 2 points, the item is a hand-held device that can more easily be dropped or taken from the hero</p>",
	system: {
	  cost: -1,
	  limit: 2
	}
  },
  forceful: {
	name: "Forceful",
	img: "modules/swade-supers-companion/assets/icons/Supers_Icons_Power.webp",
	description: "<p>Knockback distance is increased by +1d6.</p>",
	system: {
	  cost: 1
	}
  },
  heavyWeapon: {
	name: "Heavy Weapon",
	img: "modules/swade-supers-companion/assets/icons/Supers_Icons_Power.webp",
	description: "<p>The attack can harm those protected by Heavy Armor.</p>",
	system: {
	  cost: 1
	}
  },
  limitation: {
	name: "Limitation",
	img: "modules/swade-supers-companion/assets/icons/Supers_Icons_Power.webp",
	description: "<p>A rare Limitation that prohibits the power from being used reduces its cost by 1 point. A common Limitation (works about half the time) reduces its cost by 2.</p>",
	system: {
	  cost: -1,
	  limit: 2
	}
  },
  range: {
	name: "Range",
	img: "modules/swade-supers-companion/assets/icons/Supers_Icons_Power.webp",
	description: "<p>Double a power’s Range for 2 points, or triple it for +4.</p>",
	system: {
	  cost: 1
	}
  },
  switchable: {
	name: "Switchable",
	img: "modules/swade-supers-companion/assets/icons/Supers_Icons_Power.webp",
	description: "<p>The hero has one or more different versions of a power (at the same base cost in Super Power Points)</p>",
	system: {
	  cost: 1
	}
  }
*/

};

class EditPowerData extends foundry.applications.api.DialogV2 {

	editOptions = null;

    async _onRender(context, options) {
		await super._onRender(context, options);
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
	 *		changeFunction(editOptions, event): function to call when an input changes.
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
		description = item.system.description.replace(/^.+\<hr class="sp-rule" \/\>/, "");
	await item.update({"system.description": insert + '<hr class="sp-rule" />' + description});
}

function sign(number) {
	if (number < 0)
		return number;
	return '+' + number;
}

async function savePowerDetails(event, button, dialog) {
	const editOptions = dialog.editOptions;
	const pd = editOptions.powerDetails;
	const item = editOptions.item;
	const actor = item.actor;
	
	let html = dialog.element;
	
	let details = "";

	for (let f of pd.fields) {
		let cost = editOptions.costs[f.id];
		let elt;
		let data = '';

		switch (f.type) {
		case 'checkbox':
			elt = html.querySelector(`input[id="${f.id}"]`);
			if (!elt)
				continue;
			await item.setFlag(moduleId, f.flag, elt.checked);
			if (elt.checked) {
				data = `<b>${f.label}:</b> ${sign(f.cost)}`;
			}
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
						addIt = false;
						uuid = it.uuid;
						dontDelete = true;
					}
				}
				if (addIt) {
					const itemData = editOptions.itemDropped.toObject();
					delete itemData._id;
					let newItems = await actor.createEmbeddedDocuments("Item", [itemData]);

					if (newItems && f.flag) {
						// Record the item added for this power.
						uuid = newItems[0].uuid;
					}
				}
				if (oldUuid) {
					// Delete the old item.
					const oldItem = await fromUuid(oldUuid);
					if (oldItem && !item.getFlag(moduleId, 'dontDelete'))
						await actor.deleteEmbeddedDocuments("Item", [oldItem._id]);
				}
				editOptions.dontDelete = dontDelete;
				await item.setFlag(moduleId, f.flag, uuid);
				await item.setFlag(moduleId, 'dontDelete', dontDelete);					
			}
			let childItem = await fromUuid(uuid);
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
			data = `<b>${f.label}:</b> ${level} (${sign(cost)})`;
			break;
		case 'select':
			elt = html.querySelector(`select[id="${f.id}"]`);
			if (!elt)
				continue;
			await item.setFlag(moduleId, f.flag, elt.value);
			let text = elt.options[elt.selectedIndex].text;
			if (cost != undefined) {
				if (f.costexp) {
					if (cost > 0)
						data = `<b>${f.label}:</b> ${text} ${sign(cost)}`;
				} else
					data = `<b>${f.label}:</b> ${text}`;
			} else
				data = `<b>${f.label}:</b> ${text}`;
			break;
		}
		if (data) {
			if (details)
				details += ", ";
			details += data;
		}
	}
	
	if (pd.baseCost) {
		details = `<b>Base Cost:</b> ${pd.baseCost}` + (details ? ', ' : '') + details;
	}

	await item.update(
		{"system.pp": editOptions.powerCost}
	);
	insertDescription(item, details);
	await setEffects(item);
	checkTotals(item);
	checkLimits(item);	
}


function formatRow(left, right) {
	if (!right)
		return `<div style="display: table-row;">${left}</div>`;

	return `<div style="display: table-row;">
		<div style="display: table-cell; text-align: left;">
			${left}
		</div>
		<div style="display: table-cell; text-align: right;">
			${right}
		</div>
	</div>`;
}


async function createContent(item, powerDetails, editOptions) {
	let content = `<p>Build Cost: <span id="buildcost">${editOptions.powerCost}</span>/${game.settings.get(moduleId, 'powerlimit')}, Total Powers Cost: <span id="totalPowersCost">${editOptions.otherPowersTotal+editOptions.powerCost}</span>/${game.settings.get(moduleId, 'superpowerpoints')}</p>`;
	content += `<div style="display: table; width: 300px; font-size: 10pt;">
		<div style="display: table-row-group">`;
		
	for (let f of powerDetails.fields) {
		switch (f.type) {
		case 'checkbox':
			let checked = item.getFlag(moduleId, f.flag) ? ' checked' : '';
			content += formatRow(
				`<label for="${f.id}">${f.label} [${f.cost}]</label>`,
				`<input class="change" type="checkbox" id="${f.id}" name="${f.id}" value="${f.cost}"${checked}>`
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
			const it = await fromUuid(uuid);
			let value = '';
			if (it)
				value = it.name;
			content += formatRow(
				`<label for="${f.id}">${f.label}</label>`,
				`<input class="dnd" type="text" id="${f.id}" name="f.id" size="20" readonly=true value="${value}">`
			);
			break;
		case 'level':
			let level = item.getFlag(moduleId, f.flag);
			if (!level)
				level = 1;
			let min = (f.min != undefined) ? ' min="${f.min}"' : '';
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
		}
	}

	content += `</div></div>`;

	return content;
}


function superSkillCost(dialog, item, level) {
	// Check to see if the skill is being
	// added by the Edge. Charge extra if so.
	return level + (dialog.editOptions.dontDelete ? 0 : 1);
}

function evaluateExpression(dialog, costexp, level, item) {
	let result = eval(costexp);
	return result;
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
				if (f.checkmsg[0] == '`')
					msg = evaluateExpression(dialog, f.checkmsg, level, dialog.editOptions.item);
				else
					msg = f.checkmsg;
				ui.notifications.warn(msg);
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

	for (let f of pd.fields) {
		cost = calcCost(dialog, f);
		totalCost += cost;
		editOptions.costs[f.id] = cost;
	}
	
	editOptions.powerCost = totalCost;

	const bc = $(dialog.element).find("#buildcost");
	bc.text(totalCost);
	const tc = $(dialog.element).find("#totalPowersCost");
	tc.text(editOptions.otherPowersTotal + totalCost);
}

/**	Retotal the cost of the user's selections.
 */
/*
function changeFunction(dialog, e) {
	const editOptions = dialog.editOptions;
	const pd = editOptions.powerDetails;

	let totalCost = pd.baseCost;
	if (totalCost == undefined)
		totalCost = 0;
	
	let html = dialog.element;
	let cost;

	for (let f of pd.fields) {
		let elt;
		switch (f.type) {
		case 'checkbox':
			elt = html.querySelector(`input[id="${f.id}"]`);
			if (elt && elt.checked)
				totalCost += f.cost;
			editOptions.costs[f.id] = elt.checked ? f.cost : 0;
			break;
		case 'level':
			elt = html.querySelector(`input[id="${f.id}"]`);
			let level = parseInt(elt.value);
			cost = evaluateExpression(dialog, f.costexp, level, dialog.editOptions.item);
			totalCost += cost;
			editOptions.costs[f.id] = cost;
			
			if (f.checkexp) {
				const ok = evaluateExpression(dialog, f.checkexp, level, dialog.editOptions.item);
				if (!ok) {
					let msg = ''
					if (f.checkmsg[0] == '`')
						msg = evaluateExpression(dialog, f.checkmsg, level, dialog.editOptions.item);
					else
						msg = f.checkmsg;
					ui.notifications.warn(msg);
				}
			}
			break;
		case 'select':
			elt = html.querySelector(`select[id="${f.id}"]`);
			if (f.costexp) {
				cost =  evaluateExpression(dialog, f.costexp, elt.value, dialog.editOptions.item);
				cost = parseInt(cost);
				totalCost += cost;
				editOptions.costs[f.id] = cost;
			}
			break;
		}
	}
	
	editOptions.powerCost = totalCost;

	const bc = $(dialog.element).find("#buildcost");
	bc.text(totalCost);
	const tc = $(dialog.element).find("#totalPowersCost");
	tc.text(editOptions.otherPowersTotal + totalCost);
	
}
*/

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

	let editOptions = {
		item: item,
		powerDetails: powerDetails,
		fields: [],
		powerCost: item.system.pp,
		otherPowersTotal: item.actor.system.powerPoints.general.value - item.system.pp,
		costs: {
		}
	};

	for (let f of powerDetails.fields)
		editOptions.fields.push(f);
	for (let m in universalModifiers) {
		for (let f of universalModifiers[m].fields)
			editOptions.fields.push(f);
	}
	

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



async function getSuperEdge(item) {
	function dropFunction(options, itemDropped) {
		dropItem = itemDropped;
		if (dlg) {
			const input = dlg.element.querySelector(editOptions.dndSelector);
			input.value = itemDropped.name;
		}
	}
	
	function finish(editOptions) {
	}
	
	async function saveData(editOptions) {
		if (!dropItem)
			return;
		// Add the selected Edge to the actor.
		const itemData = dropItem.toObject();
		delete itemData._id;
		let newEdge = await item.actor.createEmbeddedDocuments("Item", [itemData]);

		if (newEdge) {
			if (superEdgeUuid) {
				// Delete the old Edge.
				const oldEdge = await fromUuid(superEdgeUuid);
				if (oldEdge)
					await item.actor.deleteEmbeddedDocuments("Item", [oldEdge._id]);
			}
			// Record the Edge added for this power.
			item.setFlag(moduleId, 'superedgeuuid', newEdge[0].uuid);

			// Remember that this Edge should be deleted when this item is deleted.
			item.setFlag(moduleId, 'grantuuid', newEdge[0].uuid);

			insertDescription(item, `<p><b>Edge:</b> ${itemData.name}</p>`);
		}
	}

	let dlg = null;
	let dropItem = null;

	let editOptions = {
		itemType: "edge",
		dataType: "Item",
		dndSelector: '.dnd',
		item: item,
		dndDrop: dropFunction,
		finish: finish
	};

	let superEdgeUuid = item.getFlag(moduleId, 'superedgeuuid')
	let value;

	if (superEdgeUuid) {
		const edge = await fromUuid(superEdgeUuid);
		if (edge)
			value = edge.name;
	}
	if (!value)
		value = "(Drop Edge here)";

	let content = `<p>Drag and drop the Edge for ${item.name} in this dialog.</p>
		<input class="dnd" type="text" id="edge" name="edge" size="20" readonly=true value="${value}">`;

	try {
		dlg = await new EditPowerData({
			window: {
				title: item.name
			},
			content: content,
			buttons: [
				{
					action: "ok",
					label: "OK",
					default: true,
					callback: async (event, button, dialog) => {
						saveData(editOptions);
						finish(editOptions);
					}
				},
				{
					action: "cancel",
					label: "Cancel"
				}
			],
			submit: result => {
				finish(editOptions);
			}
		}, editOptions);
		dlg.render({ force: true });
	} catch (msg) {
		ui.notifications.notify(msg);
	}
}


async function getSuperSkill(item) {
	function dropFunction(options, itemDropped) {
		dropItem = itemDropped;
		if (dlg) {
			const input = dlg.element.querySelector(editOptions.dndSelector);
			input.value = itemDropped.name;
			superSkillName = itemDropped.name;
		}
	}
	
	function finish(editOptions) {
	}
	
	async function saveData(editOptions) {
		if (!dropItem)
			return;
		let skill = item.actor.items.find((it) => it.type == 'skill' && it.name == superSkillName);
		
		let newSkillUuid = undefined;

		if (!skill) {
			// Add the selected Skill to the actor.
			const itemData = dropItem.toObject();
			delete itemData._id;
			const skills = await item.actor.createEmbeddedDocuments("Item", [itemData]);
			if (skills) {
				skill = skills[0];
				newSkillUuid = skill.uuid;
			}
		}

		if (superSkillUuid) {
			// Delete the old skill if it was added by the power.
			const oldSkill = await fromUuid(superSkillUuid);
			if (oldSkill)
				await item.actor.deleteEmbeddedDocuments("Item", [oldSkill._id]);
		}

		// Record the skill added for this power.

		item.setFlag(moduleId, 'superskillname', skill.name);

		// Remember that this skill should be deleted when this item is deleted
		// if it was just added.
		item.setFlag(moduleId, 'grantuuid', newSkillUuid);

		insertDescription(item, `<p><b>Skill:</b> ${skill.name}</p>`);
	}

	let dlg = null;
	let dropItem = null;

	let editOptions = {
		itemType: "skill",
		dataType: "Item",
		dndSelector: '.dnd',
		item: item,
		dndDrop: dropFunction,
		finish: finish
	};

	// If the power added the super skill the uuid will recorded
	// so that it can be deleted if the power is deleted.

	let superSkillUuid = item.getFlag(moduleId, 'grantuuid');
	let superSkillName = item.getFlag(moduleId, 'superskillname');

	if (!superSkillName)
		superSkillName = "(Drop Skill here)";

	let content = `<p>Drag and drop the skill for ${item.name} in this dialog.</p>
		<input class="dnd" type="text" id="skill" name="skill" size="20" readonly=true value="${superSkillName}">`;

	try {
		dlg = await new EditPowerData({
			window: {
				title: item.name
			},
			content: content,
			buttons: [
				{
					action: "ok",
					label: "OK",
					default: true,
					callback: async (event, button, dialog) => {
						saveData(editOptions);
						finish(editOptions);
					}
				},
				{
					action: "cancel",
					label: "Cancel"
				}
			],
			submit: result => {
				finish(editOptions);
			}
		}, editOptions);
		dlg.render({ force: true });
	} catch (msg) {
		ui.notifications.notify(msg);
	}
}

async function getSuperAttribute(item) {
	let dlg = null;

	let editOptions = {
		item: item
	};

	let attribute = item.getFlag(moduleId, 'attribute');
	let notToday = item.getFlag(moduleId, 'notToday');

	let content = `<p>Select the Super Attribute.</p>
		<select id="attribute" name="attribute">`;
	const attributes = [
		{name: 'Agility', value: 'agility'},
		{name: 'Smarts', value: 'smarts'},
		{name: 'Spirit', value: 'spirit'},
		{name: 'Strength', value: 'strength'},
		{name: 'Vigor', value: 'vigor'}
	];
	
	for (let a of attributes) {
		let selected = attribute == a.value ? ' selected' : '';
		content += `<option value="${a.value}"${selected}>${a.name}</option>`;
	}
	
	content += `</select>\n`;
	content += `<label><input id="notToday" name="notToday" type="checkbox"${notToday ? ' checked' : ''}/> Not Today</label>`;

	try {
		dlg = await new EditPowerData({
			window: {
				title: item.name
			},
			content: content,
			buttons: [
				{
					action: "ok",
					label: "OK",
					default: true,
					callback: async (event, button, dialog) => {
						const select = button.form.elements.attribute;
						item.setFlag(moduleId, 'attribute', select.value);
						const text = select.options[select.selectedIndex].text;

						notToday = button.form.elements.notToday.checked;
						item.setFlag(moduleId, 'notToday', notToday);
						insertDescription(item, `<p><b>Attribute:</b> ${text}${notToday ? ", Not Today: +2" : ""}</p>`);
					}
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
	let total = 0;
	for (const entry of actor.system.stats.toughness.sources) {
		switch (entry.label) {
		case 'Toughness': 
		case 'Armor':
			total += entry.value;
			break;
		}
	}
	return total;	
}

function requireItem(actor, type, name) {
	return !!actor.items.find(item => item.type == type && item.name == name);
}

const powerChecks = [
	{
		powers: ['armor', 'toughness'],
		expression: "toughArmorTotal(actor)<=game.settings.get(moduleId, 'powerlimit')",
		message: "`Toughness and Armor (${toughArmorTotal(actor)}) exceed the Power Limit (${game.settings.get(moduleId, 'powerlimit')}).`"
	},
	{
		powers: ['reflect'],
		expression: "requireItem(actor, 'power', 'Parry')",
		message: "`Reflect requires the Parry power.`"
	},
	{
		powers: ['parry'],
		expression: "cost>0 && cost<=5",
		message: "`The maximum cost of Parry is 5.`"
	},
	{
		powers: ['regeneration'],
		expression: "cost == 2 || cost == 5 || cost == 10",
		message: "`The cost of Regeneration must be 2, 5 or 10.`"
	},
	{
		powers: ['super-skill'],
		expression: "superSkillTotal(actor)",
		message: "`Points in all Super Skills must not exceed the Power Limit (${game.settings.get(moduleId, 'powerlimit')})`"
	}
];

function superSkillTotal(actor) {
	const superSkills = actor.items.filter((item) => {
		const retval = item.type == 'power' && item.system.swid == 'super-skill';
		return retval;
	});
	let total = 0;
	for (let p of superSkills)
		total += p.system.pp;

	return total <= game.settings.get(moduleId, 'powerlimit');
}

const powerEffects = {
	'toughness': [
		{
			effectName: "Toughness",
			value: "cost"
		}
	],
	'armor': [
		{
			effectName: "Armor",
			value: "cost*2"
		}
	],
	'parry': [
		{
			effectName: "Parry",
			value: "cost"
		}
	],
	'super-skill': [
		{
			effectName: "Skill Bonus",
			key: "``",
			value: "setSkillBonus(item, changes, cost)"
		}
	],
	'super-attribute': [
		{
			effectName: "Attribute",
			key: "``",
			value: "setAttributeBonus(item, changes, cost)"
		}
	]
};

// Functions to call when the item is opened.

const dataDialogs = {
	'super-attribute': getSuperAttribute,
	'super-edge': getSuperEdge,
	'super-skill': getSuperSkill
};

function setSkillBonus(item, changes, cost) {
	const skillName = item.getFlag(moduleId, 'superskillname');
	if (!skillName)
		return undefined;

	changes[0].key = `@Skill{${skillName}}[system.die.sides]`;
	
	// If the power added the skill reduce the die type by 1.
	if (item.getFlag(moduleId, 'grantuuid'))
		cost--;
	return cost * 2;
}

function setAttributeBonus(item, changes, cost) {
	const attribute = item.getFlag(moduleId, 'attribute');
	const notToday = item.getFlag(moduleId, 'notToday');
	if (!attribute)
		return undefined;

	changes[0].key = `system.attributes.${attribute}.die.sides`;
	if (notToday)
		cost -= 2;
	
	return Math.trunc(cost/2)*2;
}

async function setEffects(item) {
	// If there's an effect on the item with the same name
	// as the power, set the value of the effect to the
	// cost of the power times the multiplier. This is
	// to allow powers like Toughness, Armor and Parry
	// to modify the effect by changing the cost.

	function flagReplace(item, string) {
		return string.replaceAll(/@F\[[^\]]+\]/g, function (x) {
			const match = x.match(/\[(.+)\]/);
			if (match) {
				return item.getFlag(moduleId, match[1]);
			} else
				return "0";
		});
	}
	
	let power = powerList[item.system.swid];
	if (!power?.effects)
		return;
	
	for (let effect of power.effects) {
		let e = item.effects.find((eff) => eff.name == effect.name);

		if (!e)
			continue;

		try {
			let updates = {};
			if (effect.value || effect.key) {
				let changes = foundry.utils.duplicate(e.changes);
				if (effect.value) {
					let value = flagReplace(item, effect.value);
					changes[0].value = eval(value);
				}
				if (effect.key) {
					// Create the key based on the pattern.
					let key = flagReplace(item, effect.key);
					changes[0].key = key;
				}
				updates.changes = changes;
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
		"system.powerPoints.general.value": total,
		"system.powerPoints.general.max": total
	});
}

async function createItem(item, action, id) {
	// Record the initial power points so that we can check
	// that they don't reduce the cost below the minimum for
	// power.
	await item.setFlag(moduleId, 'baseCost', item.system.pp);
	await retotalPowerPoints(item.parent, 0);
	// Totals are checked via updateItem.
}

function checkTotals(item) {
	let baseCost = item.getFlag(moduleId, 'baseCost');
	if (baseCost < 1)
		baseCost = 1;
	const spp = game.settings.get(moduleId, 'superpowerpoints');
	const powerLimit = Math.trunc(spp / 3);

	if (item.system.pp < baseCost) {
		ui.notifications.warn(`The minimum cost for ${item.name} is ${baseCost}.`);
		item.update({"system.pp": baseCost});
	}
	if (item.actor.system.powerPoints.general.value > spp)
		ui.notifications.warn(`The limit on super power points is ${spp}. The total is now ${item.actor.system.powerPoints.general.value}`);
	if (item.system.pp > powerLimit)
		ui.notifications.warn(`The power limit is ${powerLimit}. ${item.name} costs ${item.system.pp}.`);
}

function checkLimits(item) {
	let checks = powerChecks.filter(entry => entry.powers.includes(item.system.swid));
	for (const check of checks) {

		// Set variables that can be checked in the expressions.

		let actor = item.actor;
		let cost = item.system.pp;
		
		if (!eval(check.expression))
			ui.notifications.warn(eval(check.message));
	}
}



async function updateItem(item, action) {
	await retotalPowerPoints(item.parent, 0);
}

async function deleteItem(item, action, id) {
	await retotalPowerPoints(item.parent, 0);
	checkTotals(item);
	
	// Delete any granted item associated with this item.

	let pi = powerList[item.system.swid];
	if (pi.deleteActions) {
		for (let d of pi.deleteActions) {
			let deleteUuid = item.getFlag(moduleId, d.deleteUuid);
			let dontDelete = item.getFlag(moduleId, 'dontDelete');
			if (deleteUuid && !dontDelete) {
				let granted = await fromUuid(deleteUuid);
				if (granted)
					await item.actor.deleteEmbeddedDocuments("Item", [granted._id]);
			}
		}
	}
}

function openPowerDialog(item) {
	let powerDetails = powerList[item.system.swid];
	if (powerDetails)
		editPower(item, powerDetails);
}


Hooks.on("createItem", async (item, action, id) => {
	if (item.type != "power" || id != game.user.id || !item.parent)
		return;
	
	await createItem(item, action, id);
});

Hooks.on("deleteItem", async (item, action, id) => {
	if (item.type != "power" || id != game.user.id || !item.parent)
		return;
	
	await deleteItem(item, action, id);
});

Hooks.on("updateItem", async (item, change, action) => {
	if (item.type != "power" || !item.parent)
		return;
	
	await updateItem(item, action);
});

Hooks.on("getHeaderControlsApplicationV2", (sheet, buttonArray) => {
	if (!sheet.item || !sheet.item.parent)
		return;

	if (sheet.item.type == 'power') {
		openPowerDialog(sheet.item);

		let button = {
			label: "Power Details",
			class: 'edit-power',
			icon: 'fas fa-bolt-lightning',
			onClick: () => {
				let dlg = dialogIds[sheet.item._id];
				if (dlg) {
					dlg.render(true);
					return false;
				}
				openPowerDialog(sheet.item);
			}
		}
		buttonArray.unshift(button);
		
	}
});

Hooks.on("closeSwadeItemSheetV2", (sheet) => {
	if (!sheet.item || !sheet.item.parent)
		return;

	if (sheet.item.type == 'power') {
		let dialog = dialogIds[sheet.item._id];

		if (dialog) {
			dialog.editOptions.cancel = true;
			dialog.close();
			delete dialogIds[sheet.item._id];
		}
	}
});


